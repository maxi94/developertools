function base64UrlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function hmacSha256Base64Url(content: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(content))
  const bytes = new Uint8Array(signature)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export async function buildJwtHs256(
  headerJson: string,
  payloadJson: string,
  secret: string,
): Promise<string> {
  const parsedHeader = JSON.parse(headerJson)
  const parsedPayload = JSON.parse(payloadJson)

  if (!parsedHeader.alg) {
    parsedHeader.alg = 'HS256'
  }
  if (!parsedHeader.typ) {
    parsedHeader.typ = 'JWT'
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(parsedHeader))
  const encodedPayload = base64UrlEncode(JSON.stringify(parsedPayload))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const signature = await hmacSha256Base64Url(signingInput, secret)

  return `${signingInput}.${signature}`
}
