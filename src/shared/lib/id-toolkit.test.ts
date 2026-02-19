import { describe, expect, it } from 'vitest'
import { generateBatch, validateId } from '@/shared/lib/id-toolkit'

describe('id toolkit', () => {
  it('genera batch', () => {
    const batch = generateBatch('ulid', 5)
    expect(batch).toHaveLength(5)
  })

  it('valida uuid', () => {
    expect(validateId('uuid', '550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    expect(validateId('uuid', 'invalid')).toBe(false)
  })
})
