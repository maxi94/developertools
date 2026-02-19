export type EncodingMode = 'html' | 'unicode' | 'hex' | 'base64url'

function textToHex(value: string): string {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function hexToText(value: string): string {
  const clean = value.replace(/\s+/g, '')
  if (clean.length % 2 !== 0) {
    throw new Error('Hex invalido: cantidad impar de caracteres.')
  }

  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = Number.parseInt(clean.slice(i, i + 2), 16)
  }

  return new TextDecoder().decode(bytes)
}

function textToUnicodeEscapes(value: string): string {
  return Array.from(value)
    .map((char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`)
    .join('')
}

function unicodeEscapesToText(value: string): string {
  return value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  )
}

function textToBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  const base64 = btoa(binary)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlToText(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
  const binary = atob(`${normalized}${padding}`)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

export function encodeValue(mode: EncodingMode, value: string): string {
  switch (mode) {
    case 'html':
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    case 'unicode':
      return textToUnicodeEscapes(value)
    case 'hex':
      return textToHex(value)
    case 'base64url':
      return textToBase64Url(value)
    default:
      return value
  }
}

export function decodeValue(mode: EncodingMode, value: string): string {
  switch (mode) {
    case 'html':
      return value
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
    case 'unicode':
      return unicodeEscapesToText(value)
    case 'hex':
      return hexToText(value)
    case 'base64url':
      return base64UrlToText(value)
    default:
      return value
  }
}
