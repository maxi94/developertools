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

  const values: number[] = []
  for (const token of effectiveTokens) {
    if (/^-?0x/i.test(token)) {
      const negative = token.startsWith('-')
      const normalized = token.replace(/^-?0x/i, '')
      if (!negative && firstHexIndex >= 0 && normalized.length > 2) {
        if (normalized.length % 2 !== 0) {
          throw new Error(`Hex invalido (cantidad impar): 0x${normalized}`)
        }
        for (let index = 0; index < normalized.length; index += 2) {
          const chunk = normalized.slice(index, index + 2)
          values.push(toUnsignedByte(Number.parseInt(chunk, 16)))
        }
        continue
      }
      const sign = negative ? -1 : 1
      values.push(toUnsignedByte(sign * Number.parseInt(normalized, 16)))
      continue
    }
    values.push(toUnsignedByte(Number.parseInt(token, 10)))
  }

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

function looksLikeSvg(bytes: Uint8Array): boolean {
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false })
    const textHead = decoder.decode(bytes.slice(0, Math.min(bytes.length, 2048))).trimStart()
    if (!textHead) {
      return false
    }
    const normalized = textHead.replace(/^\uFEFF/, '')
    return /^<\?xml[\s\S]*?\?>\s*<svg[\s>]/i.test(normalized) || /^<svg[\s>]/i.test(normalized)
  } catch {
    return false
  }
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

  if (looksLikeSvg(bytes)) {
    return { mime: 'image/svg+xml', extension: 'svg', category: 'image' }
  }

  if (isMostlyText(bytes)) {
    return { mime: 'text/plain;charset=utf-8', extension: 'txt', category: 'text' }
  }

  return { mime: 'application/octet-stream', extension: 'bin', category: 'binary' }
}
