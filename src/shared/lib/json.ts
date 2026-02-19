export function formatJson(rawValue: string): string {
  const parsedValue = JSON.parse(rawValue)

  return JSON.stringify(parsedValue, null, 2)
}
