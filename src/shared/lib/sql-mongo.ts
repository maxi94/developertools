export type MongoOutputMode = 'mongosh' | 'compass' | 'powershell' | 'csharp'

export interface MongoQueryParts {
  collection: string
  filter: string
  projection: string
  sort: string
  limit: number | null
}

function toMongoLiteral(value: string): string {
  const trimmed = value.trim()
  if (/^'.*'$/.test(trimmed)) {
    return `"${trimmed.slice(1, -1)}"`
  }

  if (/^(true|false)$/i.test(trimmed)) {
    return trimmed.toLowerCase()
  }

  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return trimmed
  }

  return `"${trimmed.replace(/"/g, '\\"')}"`
}

function parseCondition(condition: string): string {
  const inMatch = condition.match(/^(\w+)\s+IN\s+\((.+)\)$/i)
  if (inMatch) {
    const [, field, valuesRaw] = inMatch
    const values = valuesRaw
      .split(',')
      .map((value) => toMongoLiteral(value.trim()))
      .join(', ')
    return `${field}: { $in: [${values}] }`
  }

  const likeMatch = condition.match(/^(\w+)\s+LIKE\s+'(.+)'$/i)
  if (likeMatch) {
    const [, field, value] = likeMatch
    const regex = value.replace(/%/g, '.*').replace(/_/g, '.')
    return `${field}: { $regex: "${regex}", $options: "i" }`
  }

  const betweenMatch = condition.match(/^(\w+)\s+BETWEEN\s+(.+)\s+AND\s+(.+)$/i)
  if (betweenMatch) {
    const [, field, min, max] = betweenMatch
    return `${field}: { $gte: ${toMongoLiteral(min)}, $lte: ${toMongoLiteral(max)} }`
  }

  const comparatorMatch = condition.match(/^(\w+)\s*(=|!=|<>|>=|<=|>|<)\s*(.+)$/i)
  if (comparatorMatch) {
    const [, field, operator, value] = comparatorMatch
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

  const conditions = whereClause
    .split(/\s+AND\s+/i)
    .map((condition) => condition.trim())
    .filter(Boolean)

  const mapped = conditions.map(parseCondition)
  return `{ ${mapped.join(', ')} }`
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

  const projection =
    fields === '*'
      ? '{}'
      : `{ ${fields
          .split(',')
          .map((field) => field.trim())
          .filter(Boolean)
          .map((field) => `${field}: 1`)
          .join(', ')} }`

  const filter = parseSqlWhere(whereRaw)
  const sort = orderRaw
    ? `{ ${orderRaw
        .split(',')
        .map((part) => part.trim())
        .map((part) => {
          const [field, dir] = part.split(/\s+/)
          const direction = dir?.toUpperCase() === 'DESC' ? -1 : 1
          return `${field}: ${direction}`
        })
        .join(', ')} }`
    : '{}'

  return {
    collection: table,
    filter,
    projection,
    sort,
    limit: limitRaw ? Number.parseInt(limitRaw, 10) : null,
  }
}

export function formatMongoQuery(parts: MongoQueryParts, mode: MongoOutputMode): string {
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
      `var find = collection.Find(filter).Project<BsonDocument>(projection);`,
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
