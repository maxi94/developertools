import { describe, expect, it } from 'vitest'
import { generateUuidV4, isValidUuidV4 } from '@/shared/lib/uuid'

describe('uuid', () => {
  it('genera uuid v4 valido', () => {
    expect(isValidUuidV4(generateUuidV4())).toBe(true)
  })

  it('valida uuid invalido', () => {
    expect(isValidUuidV4('123')).toBe(false)
  })
})
