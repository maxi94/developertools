import { describe, expect, it } from 'vitest'
import { decodeUrl, encodeUrl } from '@/shared/lib/url'

describe('url codec', () => {
  it('codifica y decodifica texto unicode', () => {
    const encoded = encodeUrl('hola mundo/ñ')
    const decoded = decodeUrl(encoded)

    expect(encoded).toContain('%20')
    expect(decoded).toBe('hola mundo/ñ')
  })
})
