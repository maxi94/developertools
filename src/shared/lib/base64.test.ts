import { describe, expect, it } from 'vitest'
import { base64ToBlob, decodeBase64, encodeBase64, parseBase64Entries } from '@/shared/lib/base64'

describe('base64', () => {
  it('codifica y decodifica texto unicode', () => {
    const encoded = encodeBase64('Hola ñandú')
    const decoded = decodeBase64(encoded)

    expect(decoded).toBe('Hola ñandú')
  })

  it('parsea array JSON de base64 y data URL', () => {
    const parsed = parseBase64Entries(
      JSON.stringify([
        'data:image/png;base64,QUJD',
        { base64: 'REVG', mimeType: 'application/pdf' },
      ]),
    )

    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toEqual({ value: 'QUJD', mimeType: 'image/png' })
    expect(parsed[1]).toEqual({ value: 'REVG', mimeType: 'application/pdf' })
  })

  it('convierte base64 a blob', () => {
    const blob = base64ToBlob('SG9sYQ==', 'text/plain')

    expect(blob.type).toBe('text/plain')
    expect(blob.size).toBeGreaterThan(0)
  })
})
