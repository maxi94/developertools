import { describe, expect, it } from 'vitest'
import { detectFileType, parseByteArrayInput } from '@/shared/lib/byte-array'

describe('byte-array parser', () => {
  it('parsea formato C# new byte[]', () => {
    const result = parseByteArrayInput('new byte[] { 255, 216, 255, 224 }')
    expect(Array.from(result.bytes)).toEqual([255, 216, 255, 224])
  })

  it('soporta bytes negativos y hex', () => {
    const result = parseByteArrayInput('[-1, -128, 0x7F, 0xFF]')
    expect(Array.from(result.bytes)).toEqual([255, 128, 127, 255])
  })

  it('si hay 0x, toma solo desde el primer 0x en adelante', () => {
    const result = parseByteArrayInput('byte[4] data = { 4, 5, 0x89, 0x50, 0x4E, 0x47 }')
    expect(Array.from(result.bytes)).toEqual([137, 80, 78, 71])
  })

  it('detecta PDF por magic bytes', () => {
    const type = detectFileType(Uint8Array.from([37, 80, 68, 70, 45]))
    expect(type.mime).toBe('application/pdf')
    expect(type.extension).toBe('pdf')
  })

  it('detecta PNG por magic bytes', () => {
    const type = detectFileType(Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]))
    expect(type.mime).toBe('image/png')
    expect(type.category).toBe('image')
  })
})
