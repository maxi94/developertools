export type SqlDialect = 'sqlserver' | 'postgresql' | 'mysql' | 'sqlite' | 'oracle'

const CLAUSE_KEYWORDS = [
  'WITH',
  'SELECT',
  'FROM',
  'WHERE',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'INSERT INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE FROM',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'FULL JOIN',
  'CROSS JOIN',
  'JOIN',
  'ON',
  'UNION',
  'UNION ALL',
  'CONVERT',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
] as const

const DIALECT_KEYWORDS: Record<SqlDialect, string[]> = {
  sqlserver: ['TOP', 'NVARCHAR', 'GETDATE', 'GO', 'TRY_CONVERT', 'DATEADD', 'DATEDIFF', 'ISNULL'],
  postgresql: ['RETURNING', 'ILIKE', 'SERIAL', 'JSONB'],
  mysql: ['AUTO_INCREMENT', 'ENGINE', 'SHOW', 'DESCRIBE'],
  sqlite: ['AUTOINCREMENT', 'PRAGMA', 'WITHOUT ROWID'],
  oracle: ['DUAL', 'ROWNUM', 'SYSDATE', 'NVL'],
}

function normalizeWhitespace(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim()
}

function uppercaseKnownKeywords(sql: string, keywords: string[]): string {
  return keywords.reduce((output, keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
    return output.replace(regex, keyword)
  }, sql)
}

function breakIntoLines(sql: string): string {
  let output = sql

  for (const keyword of CLAUSE_KEYWORDS) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
    const regex = new RegExp(`\\s+${escaped}\\b`, 'gi')
    output = output.replace(regex, `\n${keyword}`)
  }

  output = output
    .replace(/,\s*/g, ',\n  ')
    .replace(/\(\s*/g, '(\n  ')
    .replace(/\s*\)/g, '\n)')
    .replace(/\n{3,}/g, '\n\n')

  return output
}

function indentSql(raw: string): string {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  let indent = 0

  return lines
    .map((line) => {
      const closes = line.startsWith(')')
      if (closes) {
        indent = Math.max(indent - 1, 0)
      }

      const formatted = `${'  '.repeat(indent)}${line}`

      const opens = line.includes('(') && !line.endsWith(')')
      if (opens) {
        indent += 1
      }

      return formatted
    })
    .join('\n')
}

export function formatSql(rawValue: string, dialect: SqlDialect = 'sqlserver'): string {
  const compactSql = normalizeWhitespace(rawValue)
  if (!compactSql) {
    return ''
  }

  const supportedKeywords = [...CLAUSE_KEYWORDS, ...DIALECT_KEYWORDS[dialect]].map((keyword) =>
    keyword.toUpperCase(),
  )

  const upperSql = uppercaseKnownKeywords(compactSql, supportedKeywords)
  const lineSql = breakIntoLines(upperSql)
  return indentSql(lineSql)
}
