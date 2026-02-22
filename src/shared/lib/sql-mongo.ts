export type MongoOutputMode = 'mongosh' | 'compass' | 'powershell' | 'csharp'

export interface MongoQueryParts {
  collection: string
  filter: string
  projection: string
  sort: string
  limit: number | null
  skip: number | null
  distinctField: string | null
}

type WhereNode =
  | { type: 'leaf'; value: string }
  | { type: 'and'; children: WhereNode[] }
  | { type: 'or'; children: WhereNode[] }
  | { type: 'not'; child: WhereNode }

function toMongoField(fieldRaw: string): string {
  return fieldRaw.trim().replaceAll('`', '').replaceAll('[', '').replaceAll(']', '')
}

function toMongoLiteral(value: string): string {
  const trimmed = value.trim()
  if (/^null$/i.test(trimmed)) {
    return 'null'
  }

  if (/^'.*'$/.test(trimmed)) {
    const raw = trimmed.slice(1, -1)
    if (/^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z)?)?$/.test(raw)) {
      const normalized = raw.includes(' ') ? raw.replace(' ', 'T') : raw
      return `ISODate("${normalized}")`
    }
    return `"${raw}"`
  }

  if (/^(true|false)$/i.test(trimmed)) {
    return trimmed.toLowerCase()
  }

  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return trimmed
  }

  return `"${trimmed.replace(/"/g, '\\"')}"`
}

function parseInValues(valuesRaw: string): string {
  return valuesRaw
    .split(',')
    .map((value) => toMongoLiteral(value.trim()))
    .join(', ')
}

function parseCondition(condition: string): string {
  const trimmed = condition.trim()
  const fieldPattern = '([\\w.\\[\\]`]+)'

  const notInMatch = trimmed.match(new RegExp(`^${fieldPattern}\\s+NOT\\s+IN\\s+\\((.+)\\)$`, 'i'))
  if (notInMatch) {
    const [, fieldRaw, valuesRaw] = notInMatch
    const field = toMongoField(fieldRaw)
    const values = parseInValues(valuesRaw)
    return `${field}: { $nin: [${values}] }`
  }

  const inMatch = trimmed.match(new RegExp(`^${fieldPattern}\\s+IN\\s+\\((.+)\\)$`, 'i'))
  if (inMatch) {
    const [, fieldRaw, valuesRaw] = inMatch
    const field = toMongoField(fieldRaw)
    const values = parseInValues(valuesRaw)
    return `${field}: { $in: [${values}] }`
  }

  const notLikeMatch = trimmed.match(new RegExp(`^${fieldPattern}\\s+NOT\\s+LIKE\\s+'(.+)'$`, 'i'))
  if (notLikeMatch) {
    const [, fieldRaw, value] = notLikeMatch
    const field = toMongoField(fieldRaw)
    const regex = value.replace(/%/g, '.*').replace(/_/g, '.')
    return `${field}: { $not: { $regex: "${regex}", $options: "i" } }`
  }

  const likeMatch = trimmed.match(new RegExp(`^${fieldPattern}\\s+LIKE\\s+'(.+)'$`, 'i'))
  if (likeMatch) {
    const [, fieldRaw, value] = likeMatch
    const field = toMongoField(fieldRaw)
    const regex = value.replace(/%/g, '.*').replace(/_/g, '.')
    return `${field}: { $regex: "${regex}", $options: "i" }`
  }

  const betweenMatch = trimmed.match(new RegExp(`^${fieldPattern}\\s+BETWEEN\\s+(.+)\\s+AND\\s+(.+)$`, 'i'))
  if (betweenMatch) {
    const [, fieldRaw, min, max] = betweenMatch
    const field = toMongoField(fieldRaw)
    return `${field}: { $gte: ${toMongoLiteral(min)}, $lte: ${toMongoLiteral(max)} }`
  }

  const isNullMatch = trimmed.match(new RegExp(`^${fieldPattern}\\s+IS\\s+NULL$`, 'i'))
  if (isNullMatch) {
    const [, fieldRaw] = isNullMatch
    const field = toMongoField(fieldRaw)
    return `${field}: null`
  }

  const isNotNullMatch = trimmed.match(new RegExp(`^${fieldPattern}\\s+IS\\s+NOT\\s+NULL$`, 'i'))
  if (isNotNullMatch) {
    const [, fieldRaw] = isNotNullMatch
    const field = toMongoField(fieldRaw)
    return `${field}: { $ne: null }`
  }

  const notComparatorMatch = trimmed.match(new RegExp(`^NOT\\s+${fieldPattern}\\s*(=|!=|<>|>=|<=|>|<)\\s*(.+)$`, 'i'))
  if (notComparatorMatch) {
    const [, fieldRaw, operator, value] = notComparatorMatch
    const field = toMongoField(fieldRaw)
    const literal = toMongoLiteral(value)
    const map: Record<string, string> = {
      '=': `{ $ne: ${literal} }`,
      '!=': literal,
      '<>': literal,
      '>': `{ $not: { $gt: ${literal} } }`,
      '>=': `{ $not: { $gte: ${literal} } }`,
      '<': `{ $not: { $lt: ${literal} } }`,
      '<=': `{ $not: { $lte: ${literal} } }`,
    }
    return `${field}: ${map[operator]}`
  }

  const comparatorMatch = trimmed.match(new RegExp(`^${fieldPattern}\\s*(=|!=|<>|>=|<=|>|<)\\s*(.+)$`, 'i'))
  if (comparatorMatch) {
    const [, fieldRaw, operator, value] = comparatorMatch
    const field = toMongoField(fieldRaw)
    const literal = toMongoLiteral(value)
    const map: Record<string, string> = {
      '=': literal,
      '!=': `{ $ne: ${literal} }`,
      '<>': `{ $ne: ${literal} }`,
      '>': `{ $gt: ${literal} }`,
      '>=': `{ $gte: ${literal} }`,
      '<': `{ $lt: ${literal} }`,
      '<=': `{ $lte: ${literal} }`,
    }
    return `${field}: ${map[operator]}`
  }

  return `/* TODO: ${condition} */`
}

function protectBetween(whereClause: string): string {
  return whereClause.replace(
    /BETWEEN\s+(.+?)\s+AND\s+(.+?)(?=\s+(?:AND|OR)\s+|$|\))/gi,
    (_match, min, max) => `BETWEEN ${min} @@BETWEEN_AND@@ ${max}`,
  )
}

function tokenizeWhere(whereClause: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inQuote = false

  for (let index = 0; index < whereClause.length; index += 1) {
    const char = whereClause[index]

    if (char === "'") {
      current += char
      inQuote = !inQuote
      continue
    }

    if (!inQuote && (char === '(' || char === ')')) {
      if (current.trim()) {
        tokens.push(current.trim())
      }
      tokens.push(char)
      current = ''
      continue
    }

    if (!inQuote && /\s/.test(char)) {
      if (current.trim()) {
        tokens.push(current.trim())
        current = ''
      }
      continue
    }

    current += char
  }

  if (current.trim()) {
    tokens.push(current.trim())
  }

  return tokens
}

function parseWhereAst(tokens: string[]): WhereNode {
  let index = 0

  function peek(): string | undefined {
    return tokens[index]
  }

  function consume(): string {
    const token = tokens[index]
    index += 1
    return token
  }

  function parseExpression(): WhereNode {
    return parseOr()
  }

  function parseOr(): WhereNode {
    const children: WhereNode[] = [parseAnd()]
    while (peek()?.toUpperCase() === 'OR') {
      consume()
      children.push(parseAnd())
    }
    return children.length === 1 ? children[0] : { type: 'or', children }
  }

  function parseAnd(): WhereNode {
    const children: WhereNode[] = [parseFactor()]
    while (peek()?.toUpperCase() === 'AND') {
      consume()
      children.push(parseFactor())
    }
    return children.length === 1 ? children[0] : { type: 'and', children }
  }

  function parseFactor(): WhereNode {
    if (peek()?.toUpperCase() === 'NOT' && tokens[index + 1] === '(') {
      consume()
      consume()
      const expression = parseExpression()
      if (peek() !== ')') {
        throw new Error('Parentesis desbalanceados en WHERE.')
      }
      consume()
      return { type: 'not', child: expression }
    }

    if (peek() === '(') {
      consume()
      const expression = parseExpression()
      if (peek() !== ')') {
        throw new Error('Parentesis desbalanceados en WHERE.')
      }
      consume()
      return expression
    }

    const conditionTokens: string[] = []
    while (peek() && peek() !== ')' && !['AND', 'OR'].includes(peek()!.toUpperCase())) {
      conditionTokens.push(consume())
    }

    if (conditionTokens.length === 0) {
      throw new Error('Condicion SQL invalida en WHERE.')
    }

    const condition = conditionTokens.join(' ').replace('@@BETWEEN_AND@@', 'AND')
    return { type: 'leaf', value: parseCondition(condition) }
  }

  const ast = parseExpression()
  if (index < tokens.length) {
    throw new Error('No se pudo parsear completamente el WHERE SQL.')
  }

  return ast
}

function astToMongo(node: WhereNode): string {
  if (node.type === 'leaf') {
    return `{ ${node.value} }`
  }

  if (node.type === 'not') {
    return `{ $nor: [${astToMongo(node.child)}] }`
  }

  if (node.type === 'or') {
    return `{ $or: [${node.children.map((child) => astToMongo(child)).join(', ')}] }`
  }

  const allLeaf = node.children.every((child) => child.type === 'leaf')
  if (allLeaf) {
    return `{ ${node.children.map((child) => (child as { type: 'leaf'; value: string }).value).join(', ')} }`
  }

  return `{ $and: [${node.children.map((child) => astToMongo(child)).join(', ')}] }`
}

function parseSqlWhere(whereClause: string): string {
  if (!whereClause.trim()) {
    return '{}'
  }

  const protectedWhere = protectBetween(whereClause)
  const tokens = tokenizeWhere(protectedWhere)
  const ast = parseWhereAst(tokens)
  return astToMongo(ast)
}

function parseSqlToParts(sql: string): MongoQueryParts {
  const compact = sql.replace(/\s+/g, ' ').trim()
  const selectMatch = compact.match(
    /^SELECT\s+(.+?)\s+FROM\s+([\w.\[\]`]+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?(?:\s+OFFSET\s+(\d+))?;?$/i,
  )

  if (!selectMatch) {
    throw new Error('SQL no soportado. Usa un SELECT simple para convertir a MongoDB.')
  }

  const [, fieldsRaw, table, whereRaw = '', orderRaw = '', limitRaw = '', offsetRaw = ''] = selectMatch

  const topMatch = fieldsRaw.trim().match(/^TOP\s+(\d+)\s+(.+)$/i)
  const topLimit = topMatch ? Number.parseInt(topMatch[1], 10) : null
  const fields = topMatch ? topMatch[2].trim() : fieldsRaw.trim()

  const distinctMatch = fields.match(/^DISTINCT\s+(.+)$/i)
  const distinctField = distinctMatch ? toMongoField(distinctMatch[1].trim()) : null

  const projection =
    fields === '*' || distinctField
      ? '{}'
      : `{ ${fields
          .split(',')
          .map((field) => field.trim())
          .filter(Boolean)
          .map((field) => `${toMongoField(field)}: 1`)
          .join(', ')} }`

  const filter = parseSqlWhere(whereRaw)
  const sort = orderRaw
    ? `{ ${orderRaw
        .split(',')
        .map((part) => part.trim())
        .map((part) => {
          const [field, dir] = part.split(/\s+/)
          const direction = dir?.toUpperCase() === 'DESC' ? -1 : 1
          return `${toMongoField(field)}: ${direction}`
        })
        .join(', ')} }`
    : '{}'

  return {
    collection: toMongoField(table),
    filter,
    projection,
    sort,
    limit: limitRaw ? Number.parseInt(limitRaw, 10) : topLimit,
    skip: offsetRaw ? Number.parseInt(offsetRaw, 10) : null,
    distinctField,
  }
}

export function formatMongoQuery(parts: MongoQueryParts, mode: MongoOutputMode): string {
  if (parts.distinctField) {
    if (mode === 'compass') {
      return [
        `Collection: ${parts.collection}`,
        'Operation: distinct',
        `Field: ${parts.distinctField}`,
        `Filter: ${parts.filter}`,
      ].join('\n')
    }

    if (mode === 'powershell') {
      return [
        `$filter = '${parts.filter}'`,
        `$result = db.${parts.collection}.Distinct('${parts.distinctField}', $filter)`,
      ].join('\n')
    }

    if (mode === 'csharp') {
      return [
        'using MongoDB.Bson;',
        'using MongoDB.Driver;',
        '',
        `var filter = BsonDocument.Parse(@"${parts.filter.replace(/"/g, '""')}");`,
        `var result = await collection.Distinct<BsonValue>("${parts.distinctField}", filter).ToListAsync();`,
      ].join('\n')
    }

    return `db.${parts.collection}.distinct("${parts.distinctField}", ${parts.filter})`
  }

  const sortSection = parts.sort !== '{}' ? `.sort(${parts.sort})` : ''
  const skipSection = parts.skip ? `.skip(${parts.skip})` : ''
  const limitSection = parts.limit ? `.limit(${parts.limit})` : ''

  if (mode === 'compass') {
    return [
      `Collection: ${parts.collection}`,
      `Filter: ${parts.filter}`,
      `Project: ${parts.projection}`,
      `Sort: ${parts.sort}`,
      `Skip: ${parts.skip ?? ''}`,
      `Limit: ${parts.limit ?? ''}`,
    ].join('\n')
  }

  if (mode === 'powershell') {
    return [
      `$filter = '${parts.filter}'`,
      `$project = '${parts.projection}'`,
      `$sort = '${parts.sort}'`,
      `$cursor = db.${parts.collection}.Find($filter, $project)`,
      parts.sort !== '{}' ? `$cursor = $cursor.Sort($sort)` : '',
      parts.skip ? `$cursor = $cursor.Skip(${parts.skip})` : '',
      parts.limit ? `$cursor = $cursor.Limit(${parts.limit})` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  if (mode === 'csharp') {
    return [
      'using MongoDB.Bson;',
      'using MongoDB.Driver;',
      '',
      `var filter = BsonDocument.Parse(@"${parts.filter.replace(/"/g, '""')}");`,
      `var projection = BsonDocument.Parse(@"${parts.projection.replace(/"/g, '""')}");`,
      `var sort = BsonDocument.Parse(@"${parts.sort.replace(/"/g, '""')}");`,
      'var find = collection.Find(filter).Project<BsonDocument>(projection);',
      parts.sort !== '{}' ? 'find = find.Sort(sort);' : '',
      parts.skip ? `find = find.Skip(${parts.skip});` : '',
      parts.limit ? `find = find.Limit(${parts.limit});` : '',
      'var result = await find.ToListAsync();',
    ]
      .filter(Boolean)
      .join('\n')
  }

  return `db.${parts.collection}.find(${parts.filter}, ${parts.projection})${sortSection}${skipSection}${limitSection}`
}

export function convertSqlToMongoDetailed(
  sql: string,
  mode: MongoOutputMode = 'mongosh',
): { parts: MongoQueryParts; output: string } {
  const parts = parseSqlToParts(sql)
  return { parts, output: formatMongoQuery(parts, mode) }
}

export function convertSqlToMongo(sql: string): string {
  return convertSqlToMongoDetailed(sql, 'mongosh').output
}
