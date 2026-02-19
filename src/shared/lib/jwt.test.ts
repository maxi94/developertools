import { describe, expect, it } from 'vitest'
import { decodeJwt, verifyJwtSignatureWithSecret } from '@/shared/lib/jwt'

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function signHs256(input: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign'],
  )

  const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input))
  const bytes = new Uint8Array(signed)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

describe('decodeJwt', () => {
  it('decodifica header y payload', () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiTWF0dGkifQ.firma'

    const decoded = decodeJwt(token)

    expect(decoded.header).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(decoded.payload).toEqual({ sub: '123', name: 'Matti' })
    expect(decoded.signature).toBe('firma')
    expect(decoded.signingInput).toBe(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiTWF0dGkifQ',
    )
  })

  it('valida firma con clave secreta', async () => {
    const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = toBase64Url(JSON.stringify({ sub: '123', name: 'Matti' }))
    const signingInput = `${header}.${payload}`
    const signature = await signHs256(signingInput, 'mi-clave')
    const token = `${signingInput}.${signature}`

    const valid = await verifyJwtSignatureWithSecret(token, 'mi-clave')
    const invalid = await verifyJwtSignatureWithSecret(token, 'otra-clave')

    expect(valid.valid).toBe(true)
    expect(invalid.valid).toBe(false)
  })
})
