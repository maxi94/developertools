import { describe, expect, it } from 'vitest'
import { decodeBase64, encodeBase64 } from '@/shared/lib/base64'

describe('base64', () => {
  it('codifica y decodifica texto unicode', () => {
    const encoded = encodeBase64('Hola ñandú')
    const decoded = decodeBase64(encoded)

    expect(decoded).toBe('Hola ñandú')
  })
})
