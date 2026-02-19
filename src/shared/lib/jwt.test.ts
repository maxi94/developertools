import { describe, expect, it } from 'vitest'
import { decodeJwt } from '@/shared/lib/jwt'

describe('decodeJwt', () => {
  it('decodifica header y payload', () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiTWF0dGkifQ.firma'

    const decoded = decodeJwt(token)

    expect(decoded.header).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(decoded.payload).toEqual({ sub: '123', name: 'Matti' })
    expect(decoded.signature).toBe('firma')
  })
})
