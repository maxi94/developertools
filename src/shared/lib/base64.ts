function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function encodeBase64(rawValue: string): string {
  return bytesToBase64(new TextEncoder().encode(rawValue))
}

export function decodeBase64(rawValue: string): string {
  return new TextDecoder().decode(base64ToBytes(rawValue.trim()))
}
