import { decodeBase64 } from '@/shared/lib/base64'

interface JwtPayload {
  header: unknown
  payload: unknown
  signature: string
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

  return { header, payload, signature }
}
