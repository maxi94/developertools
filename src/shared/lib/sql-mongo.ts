function parseSqlWhere(whereClause: string): string {
  if (!whereClause.trim()) {
    return '{}'
  }

  const conditions = whereClause
    .split(/\s+AND\s+/i)
    .map((condition) => condition.trim())
    .filter(Boolean)

  const mapped = conditions.map((condition) => {
    const eqMatch = condition.match(/^(\w+)\s*=\s*('?[^']+'?|\d+(?:\.\d+)?)$/i)
    if (eqMatch) {
      const [, field, value] = eqMatch
      return `${field}: ${value.startsWith("'") ? value : Number(value)}`
    }

    const likeMatch = condition.match(/^(\w+)\s+LIKE\s+'(.+)'$/i)
    if (likeMatch) {
      const [, field, value] = likeMatch
      const regex = value.replace(/%/g, '.*').replace(/_/g, '.')
      return `${field}: /${regex}/i`
    }

    return `/* TODO: ${condition} */`
  })

  return `{ ${mapped.join(', ')} }`
}

export function convertSqlToMongo(sql: string): string {
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
    ? `.sort({ ${orderRaw
        .split(',')
        .map((part) => part.trim())
        .map((part) => {
          const [field, dir] = part.split(/\s+/)
          const direction = dir?.toUpperCase() === 'DESC' ? -1 : 1
          return `${field}: ${direction}`
        })
        .join(', ')} })`
    : ''

  const limit = limitRaw ? `.limit(${Number.parseInt(limitRaw, 10)})` : ''

  return `db.${table}.find(${filter}, ${projection})${sort}${limit}`
}
