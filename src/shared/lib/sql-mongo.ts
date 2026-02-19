export type MongoOutputMode = 'mongosh' | 'compass' | 'powershell' | 'csharp'

export interface MongoQueryParts {
  collection: string
  filter: string
  projection: string
  sort: string
  limit: number | null
  distinctField: string | null
}

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

  const notInMatch = trimmed.match(/^(\w+)\s+NOT\s+IN\s+\((.+)\)$/i)
  if (notInMatch) {
    const [, fieldRaw, valuesRaw] = notInMatch
    const field = toMongoField(fieldRaw)
    const values = parseInValues(valuesRaw)
    return `${field}: { $nin: [${values}] }`
  }

  const inMatch = trimmed.match(/^(\w+)\s+IN\s+\((.+)\)$/i)
  if (inMatch) {
    const [, fieldRaw, valuesRaw] = inMatch
    const field = toMongoField(fieldRaw)
    const values = parseInValues(valuesRaw)
    return `${field}: { $in: [${values}] }`
  }

  const notLikeMatch = trimmed.match(/^(\w+)\s+NOT\s+LIKE\s+'(.+)'$/i)
  if (notLikeMatch) {
    const [, fieldRaw, value] = notLikeMatch
    const field = toMongoField(fieldRaw)
    const regex = value.replace(/%/g, '.*').replace(/_/g, '.')
    return `${field}: { $not: { $regex: "${regex}", $options: "i" } }`
  }

  const likeMatch = trimmed.match(/^(\w+)\s+LIKE\s+'(.+)'$/i)
  if (likeMatch) {
    const [, fieldRaw, value] = likeMatch
    const field = toMongoField(fieldRaw)
    const regex = value.replace(/%/g, '.*').replace(/_/g, '.')
    return `${field}: { $regex: "${regex}", $options: "i" }`
  }

  const betweenMatch = trimmed.match(/^(\w+)\s+BETWEEN\s+(.+)\s+AND\s+(.+)$/i)
  if (betweenMatch) {
    const [, fieldRaw, min, max] = betweenMatch
    const field = toMongoField(fieldRaw)
    return `${field}: { $gte: ${toMongoLiteral(min)}, $lte: ${toMongoLiteral(max)} }`
  }

  const isNullMatch = trimmed.match(/^(\w+)\s+IS\s+NULL$/i)
  if (isNullMatch) {
    const [, fieldRaw] = isNullMatch
    const field = toMongoField(fieldRaw)
    return `${field}: null`
  }

  const isNotNullMatch = trimmed.match(/^(\w+)\s+IS\s+NOT\s+NULL$/i)
  if (isNotNullMatch) {
    const [, fieldRaw] = isNotNullMatch
    const field = toMongoField(fieldRaw)
    return `${field}: { $ne: null }`
  }

  const notComparatorMatch = trimmed.match(/^NOT\s+(\w+)\s*(=|!=|<>|>=|<=|>|<)\s*(.+)$/i)
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

  const comparatorMatch = trimmed.match(/^(\w+)\s*(=|!=|<>|>=|<=|>|<)\s*(.+)$/i)
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

function parseSqlWhere(whereClause: string): string {
  if (!whereClause.trim()) {
    return '{}'
  }

  const protectedWhere = whereClause.replace(
    /BETWEEN\s+(.+?)\s+AND\s+(.+?)(?=\s+(?:AND|OR)\s+|$)/gi,
    (_match, min, max) => `BETWEEN ${min} @@BETWEEN_AND@@ ${max}`,
  )

  const tokens = protectedWhere
    .split(/\s+(AND|OR)\s+/i)
    .map((token) => token.replace('@@BETWEEN_AND@@', 'AND').trim())
    .filter(Boolean)
  const conditions = tokens.filter((_, index) => index % 2 === 0)
  const connectors = tokens.filter((_, index) => index % 2 === 1).map((token) => token.toUpperCase())

  const mapped = conditions.map(parseCondition)
  if (connectors.length === 0 || connectors.every((token) => token === 'AND')) {
    return `{ ${mapped.join(', ')} }`
  }

  if (connectors.every((token) => token === 'OR')) {
    return `{ $or: [${mapped.map((entry) => `{ ${entry} }`).join(', ')}] }`
  }

  throw new Error('SQL con mezcla de AND/OR no soportado aun. Usa grupos simples.')
}

function parseSqlToParts(sql: string): MongoQueryParts {
  const compact = sql.replace(/\s+/g, ' ').trim()
  const selectMatch = compact.match(
    /^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?;?$/i,
  )

  if (!selectMatch) {
    throw new Error('SQL no soportado. Usa un SELECT simple para convertir a MongoDB.')
  }

  const [, fieldsRaw, table, whereRaw = '', orderRaw = '', limitRaw = ''] = selectMatch
  const fields = fieldsRaw.trim()
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
    limit: limitRaw ? Number.parseInt(limitRaw, 10) : null,
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
  const limitSection = parts.limit ? `.limit(${parts.limit})` : ''

  if (mode === 'compass') {
    return [
      `Collection: ${parts.collection}`,
      `Filter: ${parts.filter}`,
      `Project: ${parts.projection}`,
      `Sort: ${parts.sort}`,
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
      parts.limit ? `find = find.Limit(${parts.limit});` : '',
      'var result = await find.ToListAsync();',
    ]
      .filter(Boolean)
      .join('\n')
  }

  return `db.${parts.collection}.find(${parts.filter}, ${parts.projection})${sortSection}${limitSection}`
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
