const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ULID_REGEX = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/
const KSUID_REGEX = /^[0-9A-Za-z]{27}$/
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function randomBytes(size: number): Uint8Array {
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  return bytes
}

export function generateUuidV4(): string {
  return crypto.randomUUID()
}

export function generateUlid(): string {
  const time = Date.now()
  let timePart = ''
  let value = time
  for (let i = 0; i < 10; i += 1) {
    timePart = CROCKFORD[value % 32] + timePart
    value = Math.floor(value / 32)
  }

  const randomness = randomBytes(16)
  let randomPart = ''
  for (let i = 0; i < 16; i += 1) {
    randomPart += CROCKFORD[randomness[i] % 32]
  }

  return `${timePart}${randomPart}`
}

export function generateKsuid(): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let output = ''
  const bytes = randomBytes(27)
  for (let i = 0; i < 27; i += 1) {
    output += alphabet[bytes[i] % alphabet.length]
  }
  return output
}

export function validateId(type: 'uuid' | 'ulid' | 'ksuid', value: string): boolean {
  const trimmed = value.trim()
  switch (type) {
    case 'uuid':
      return UUID_V4_REGEX.test(trimmed)
    case 'ulid':
      return ULID_REGEX.test(trimmed)
    case 'ksuid':
      return KSUID_REGEX.test(trimmed)
    default:
      return false
  }
}

export function generateBatch(type: 'uuid' | 'ulid' | 'ksuid', count: number): string[] {
  const safeCount = Math.max(1, Math.min(count, 500))
  const items: string[] = []

  for (let i = 0; i < safeCount; i += 1) {
    if (type === 'uuid') {
      items.push(generateUuidV4())
    } else if (type === 'ulid') {
      items.push(generateUlid())
    } else {
      items.push(generateKsuid())
    }
  }

  return items
}
