import { describe, expect, it } from 'vitest'
import { decodeValue, encodeValue } from '@/shared/lib/encoding-suite'

describe('encoding suite', () => {
  it('codifica y decodifica hex', () => {
    const encoded = encodeValue('hex', 'hola')
    const decoded = decodeValue('hex', encoded)

    expect(decoded).toBe('hola')
  })

  it('codifica y decodifica base64url', () => {
    const encoded = encodeValue('base64url', 'áéí')
    const decoded = decodeValue('base64url', encoded)

    expect(decoded).toBe('áéí')
  })
})
