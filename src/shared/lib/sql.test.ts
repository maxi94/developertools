import { describe, expect, it } from 'vitest'
import { formatSql } from '@/shared/lib/sql'

describe('formatSql', () => {
  it('formatea SQL base y aplica keywords', () => {
    const sql = 'select id, name from users where active = 1 order by name'
    const result = formatSql(sql)

    expect(result).toContain('SELECT')
    expect(result).toContain('\nFROM')
    expect(result).toContain('\nWHERE')
    expect(result).toContain('\nORDER BY')
  })

  it('respeta dialecto especificado', () => {
    const sql = 'select top 10 id from users'
    const result = formatSql(sql, 'sqlserver')

    expect(result).toContain('TOP')
  })

  it('reconoce WITH y CONVERT como keywords', () => {
    const sql =
      'with base as (select convert(varchar, created_at) as fecha from users) select * from base'
    const result = formatSql(sql, 'sqlserver')

    expect(result).toContain('WITH')
    expect(result).toContain('CONVERT')
  })
})
