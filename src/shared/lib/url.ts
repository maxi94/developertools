export function encodeUrl(rawValue: string): string {
  return encodeURIComponent(rawValue)
}

export function decodeUrl(rawValue: string): string {
  return decodeURIComponent(rawValue)
}
