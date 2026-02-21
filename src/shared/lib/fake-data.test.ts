import { describe, expect, it } from 'vitest'
import { generateFakeData } from '@/shared/lib/fake-data'

describe('fake data', () => {
  it('genera registros con esquema por defecto', () => {
    const rows = generateFakeData(3)
    expect(rows).toHaveLength(3)
    expect(rows[0]).toHaveProperty('id')
    expect(rows[0]).toHaveProperty('email')
    expect(rows[0]).toHaveProperty('createdAt')
  })

  it('genera registros con esquema personalizado', () => {
    const rows = generateFakeData(2, [
      { key: 'firstName', type: 'firstName' },
      { key: 'country', type: 'country' },
      { key: 'isActive', type: 'boolean' },
    ])

    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveProperty('firstName')
    expect(rows[0]).toHaveProperty('country')
    expect(rows[0]).toHaveProperty('isActive')
    expect(rows[0]).not.toHaveProperty('email')
  })
})
