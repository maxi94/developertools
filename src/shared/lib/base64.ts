function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function normalizeBase64(rawValue: string): string {
  const normalized = rawValue.trim().replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
  const missingPadding = normalized.length % 4
  return missingPadding > 0 ? `${normalized}${'='.repeat(4 - missingPadding)}` : normalized
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(normalizeBase64(base64))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

interface ParsedBase64 {
  value: string
  mimeType?: string
}

function parseDataUrl(rawValue: string): ParsedBase64 {
  const match = rawValue.match(/^data:([^;]+);base64,(.+)$/s)
  if (!match) {
    return { value: rawValue.trim() }
  }

  return {
    mimeType: match[1].trim(),
    value: match[2].trim(),
  }
}

function parseJsonInput(rawValue: string): ParsedBase64[] {
  const parsed = JSON.parse(rawValue)
  if (typeof parsed === 'string') {
    return [parseDataUrl(parsed)]
  }

  if (!Array.isArray(parsed)) {
    return []
  }

  return parsed
    .map((item) => {
      if (typeof item === 'string') {
        return parseDataUrl(item)
      }

      if (item && typeof item === 'object') {
        const data =
          typeof item.base64 === 'string'
            ? item.base64
            : typeof item.data === 'string'
              ? item.data
              : ''
        const mimeType =
          typeof item.mimeType === 'string'
            ? item.mimeType
            : typeof item.type === 'string'
              ? item.type
              : undefined

        if (!data) {
          return null
        }

        return {
          ...parseDataUrl(data),
          mimeType: mimeType?.trim() || parseDataUrl(data).mimeType,
        }
      }

      return null
    })
    .filter((item): item is ParsedBase64 => Boolean(item))
}

export function encodeBase64(rawValue: string): string {
  return bytesToBase64(new TextEncoder().encode(rawValue))
}

export function decodeBase64(rawValue: string): string {
  return new TextDecoder().decode(base64ToBytes(rawValue.trim()))
}

export function parseBase64Entries(rawValue: string): ParsedBase64[] {
  const trimmed = rawValue.trim()
  if (!trimmed) {
    return []
  }

  if (trimmed.startsWith('[') || trimmed.startsWith('"') || trimmed.startsWith('{')) {
    try {
      return parseJsonInput(trimmed)
    } catch {
      // Ignore JSON parsing errors and fallback to line parsing.
    }
  }

  return trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => parseDataUrl(line))
}

export function base64ToBlob(rawValue: string, fallbackMimeType: string): Blob {
  const bytes = base64ToBytes(rawValue)
  const buffer = new ArrayBuffer(bytes.length)
  new Uint8Array(buffer).set(bytes)
  return new Blob([buffer], { type: fallbackMimeType })
}
