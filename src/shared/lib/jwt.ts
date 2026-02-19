import { decodeBase64 } from '@/shared/lib/base64'

interface JwtPayload {
  header: unknown
  payload: unknown
  signature: string
  signingInput: string
}

interface JwtHeader {
  alg?: string
  typ?: string
  [key: string]: unknown
}

const HMAC_ALGORITHMS = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
} as const

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeHeader(header: unknown): JwtHeader {
  if (!header || typeof header !== 'object' || Array.isArray(header)) {
    return {}
  }

  return header as JwtHeader
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
  return decodeBase64(`${normalized}${padding}`)
}

export function decodeJwt(rawToken: string): JwtPayload {
  const token = rawToken.trim()
  const segments = token.split('.')

  if (segments.length < 2) {
    throw new Error('JWT invalido: se esperan al menos header.payload')
  }

  const [headerSegment, payloadSegment, signature = ''] = segments
  const header = JSON.parse(decodeBase64Url(headerSegment))
  const payload = JSON.parse(decodeBase64Url(payloadSegment))
  const signingInput = `${headerSegment}.${payloadSegment}`

  return { header, payload, signature, signingInput }
}

export async function verifyJwtSignatureWithSecret(
  rawToken: string,
  secret: string,
): Promise<{ valid: boolean; reason?: string }> {
  const token = decodeJwt(rawToken)
  const header = decodeHeader(token.header)
  const algorithmName = header.alg

  if (typeof algorithmName !== 'string') {
    return { valid: false, reason: 'El JWT no define algoritmo (alg).' }
  }

  const hmacHash = HMAC_ALGORITHMS[algorithmName as keyof typeof HMAC_ALGORITHMS]
  if (!hmacHash) {
    return {
      valid: false,
      reason: `Algoritmo no soportado para validacion con clave: ${algorithmName}.`,
    }
  }

  if (!token.signature) {
    return { valid: false, reason: 'El JWT no contiene firma para validar.' }
  }

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: { name: hmacHash } },
    false,
    ['sign'],
  )

  const signatureBuffer = await crypto.subtle.sign(
    { name: 'HMAC' },
    cryptoKey,
    new TextEncoder().encode(token.signingInput),
  )

  const expected = bytesToBase64Url(new Uint8Array(signatureBuffer))
  return {
    valid: expected === token.signature,
    reason: expected === token.signature ? undefined : 'La firma no coincide con la clave.',
  }
}
