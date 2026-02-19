import { describe, expect, it } from 'vitest'
import { convertSqlToMongo } from '@/shared/lib/sql-mongo'

describe('sql to mongo', () => {
  it('convierte select simple', () => {
    const output = convertSqlToMongo('SELECT id, name FROM users WHERE active = 1 LIMIT 5')

    expect(output).toContain('db.users.find')
    expect(output).toContain('active: 1')
    expect(output).toContain('.limit(5)')
  })

  it('soporta operadores IN y desigualdad', () => {
    const output = convertSqlToMongo(
      "SELECT id FROM orders WHERE status IN (1, 2, 3) AND country != 'US'",
    )

    expect(output).toContain('status: { $in: [1, 2, 3] }')
    expect(output).toContain('country: { $ne: "US" }')
  })

  it('soporta operador <> y NOT LIKE', () => {
    const output = convertSqlToMongo(
      "SELECT id FROM users WHERE role <> 'admin' AND email NOT LIKE '%test%'",
    )

    expect(output).toContain('role: { $ne: "admin" }')
    expect(output).toContain('email: { $not: { $regex: ".*test.*", $options: "i" } }')
  })

  it('convierte fechas SQL a ISODate', () => {
    const output = convertSqlToMongo(
      "SELECT id FROM orders WHERE created_at BETWEEN '2026-02-01' AND '2026-02-29'",
    )

    expect(output).toContain('ISODate("2026-02-01")')
    expect(output).toContain('ISODate("2026-02-29")')
  })

  it('soporta DISTINCT', () => {
    const output = convertSqlToMongo("SELECT DISTINCT status FROM orders WHERE active = true")

    expect(output).toContain('db.orders.distinct("status"')
    expect(output).toContain('active: true')
  })
})
