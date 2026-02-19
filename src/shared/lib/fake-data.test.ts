import { describe, expect, it } from 'vitest'
import { generateFakeData } from '@/shared/lib/fake-data'

describe('fake data', () => {
  it('genera registros con campos esperados', () => {
    const rows = generateFakeData(3)
    expect(rows).toHaveLength(3)
    expect(rows[0]).toHaveProperty('id')
    expect(rows[0]).toHaveProperty('email')
    expect(rows[0]).toHaveProperty('date')
  })
})
