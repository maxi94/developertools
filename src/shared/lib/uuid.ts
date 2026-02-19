const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function generateUuidV4(): string {
  return crypto.randomUUID()
}

export function isValidUuidV4(rawValue: string): boolean {
  return UUID_V4_REGEX.test(rawValue.trim())
}
