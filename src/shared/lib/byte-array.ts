export interface ByteArrayParseResult {
  bytes: Uint8Array
  normalized: string
}

export interface DetectedFileType {
  mime: string
  extension: string
  category: 'image' | 'pdf' | 'binary' | 'text'
}

function toUnsignedByte(value: number): number {
  if (value >= 0 && value <= 255) {
    return value
  }
  if (value >= -128 && value < 0) {
    return 256 + value
  }
  throw new Error(`Valor fuera de rango byte: ${value}`)
}

export function parseByteArrayInput(raw: string): ByteArrayParseResult {
  const trimmed = raw.trim()
  if (!trimmed) {
    throw new Error('Entrada vacia.')
  }

  const sanitized = trimmed
    .replace(/\/\/.*$/gm, ' ')
    .replace(/new\s+byte\s*\[\s*\]\s*\{/gi, ' ')
    .replace(/byte\s*\[\s*\]\s*\{/gi, ' ')
    .replace(/[\[\]{}()]/g, ' ')

  const tokenMatches = sanitized.match(/-?0x[0-9a-fA-F]+|-?\d+/g)
  if (!tokenMatches || tokenMatches.length === 0) {
    throw new Error('No se encontraron valores byte.')
  }

  const firstHexIndex = tokenMatches.findIndex((token) => /^-?0x/i.test(token))
  const effectiveTokens = firstHexIndex >= 0 ? tokenMatches.slice(firstHexIndex) : tokenMatches

  const values = effectiveTokens.map((token) => {
    if (/^-?0x/i.test(token)) {
      const sign = token.startsWith('-') ? -1 : 1
      const normalized = token.replace(/^-?0x/i, '')
      return toUnsignedByte(sign * Number.parseInt(normalized, 16))
    }
    return toUnsignedByte(Number.parseInt(token, 10))
  })

  return {
    bytes: Uint8Array.from(values),
    normalized: values.join(', '),
  }
}

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((value, index) => bytes[index] === value)
}

function includesAt(bytes: Uint8Array, offset: number, signature: number[]): boolean {
  return signature.every((value, index) => bytes[offset + index] === value)
}

function isMostlyText(bytes: Uint8Array): boolean {
  if (bytes.length === 0) {
    return false
  }

  let printable = 0
  for (const byte of bytes) {
    if (byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126)) {
      printable += 1
    }
  }

  return printable / bytes.length >= 0.9
}

export function detectFileType(bytes: Uint8Array): DetectedFileType {
  if (bytes.length >= 8 && startsWith(bytes, [137, 80, 78, 71, 13, 10, 26, 10])) {
    return { mime: 'image/png', extension: 'png', category: 'image' }
  }

  if (bytes.length >= 3 && startsWith(bytes, [255, 216, 255])) {
    return { mime: 'image/jpeg', extension: 'jpg', category: 'image' }
  }

  if (bytes.length >= 4 && startsWith(bytes, [71, 73, 70, 56])) {
    return { mime: 'image/gif', extension: 'gif', category: 'image' }
  }

  if (
    bytes.length >= 12 &&
    startsWith(bytes, [82, 73, 70, 70]) &&
    includesAt(bytes, 8, [87, 69, 66, 80])
  ) {
    return { mime: 'image/webp', extension: 'webp', category: 'image' }
  }

  if (bytes.length >= 4 && startsWith(bytes, [37, 80, 68, 70])) {
    return { mime: 'application/pdf', extension: 'pdf', category: 'pdf' }
  }

  if (bytes.length >= 2 && startsWith(bytes, [66, 77])) {
    return { mime: 'image/bmp', extension: 'bmp', category: 'image' }
  }

  if (bytes.length >= 4 && startsWith(bytes, [80, 75, 3, 4])) {
    return { mime: 'application/zip', extension: 'zip', category: 'binary' }
  }

  if (isMostlyText(bytes)) {
    return { mime: 'text/plain;charset=utf-8', extension: 'txt', category: 'text' }
  }

  return { mime: 'application/octet-stream', extension: 'bin', category: 'binary' }
}
