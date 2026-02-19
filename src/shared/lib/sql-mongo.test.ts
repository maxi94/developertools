import { describe, expect, it } from 'vitest'
import { convertSqlToMongo } from '@/shared/lib/sql-mongo'

describe('sql to mongo', () => {
  it('convierte select simple', () => {
    const output = convertSqlToMongo('SELECT id, name FROM users WHERE active = 1 LIMIT 5')

    expect(output).toContain('db.users.find')
    expect(output).toContain('active: 1')
    expect(output).toContain('.limit(5)')
  })
})
