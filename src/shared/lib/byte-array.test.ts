import { describe, expect, it } from 'vitest'
import { detectFileType, parseByteArrayInput } from '@/shared/lib/byte-array'

describe('byte-array parser', () => {
  it('parsea formato C# new byte[]', () => {
    const result = parseByteArrayInput('new byte[] { 255, 216, 255, 224 }')
    expect(Array.from(result.bytes)).toEqual([255, 216, 255, 224])
  })

  it('si hay hex, ignora valores previos aunque sean negativos', () => {
    const result = parseByteArrayInput('[-1, -128, 0x7F, 0xFF]')
    expect(Array.from(result.bytes)).toEqual([127, 255])
  })

  it('si hay 0x, toma solo desde el primer 0x en adelante', () => {
    const result = parseByteArrayInput('byte[4] data = { 4, 5, 0x89, 0x50, 0x4E, 0x47 }')
    expect(Array.from(result.bytes)).toEqual([137, 80, 78, 71])
  })

  it('soporta blob SQL en un solo token 0x...', () => {
    const result = parseByteArrayInput('INSERT ... 0x89504E470D0A1A0A')
    expect(Array.from(result.bytes)).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
  })

  it('falla si el blob hex 0x tiene longitud impar', () => {
    expect(() => parseByteArrayInput('0xABC')).toThrow(/Hex invalido/)
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
