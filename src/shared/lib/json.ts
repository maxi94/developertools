type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

interface FormatJsonOptions {
  resolveRefs?: boolean
}

const REF_KEYS = ['$ref', 'ref'] as const
const REF_KEY_SET = new Set<string>(REF_KEYS)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parsePointer(pointer: string): string[] {
  if (pointer === '#') {
    return []
  }

  if (!pointer.startsWith('#/')) {
    throw new Error('Solo se soportan referencias locales tipo #/ruta')
  }

  return pointer
    .slice(2)
    .split('/')
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
}

function resolvePointer(root: unknown, pointer: string): unknown {
  return parsePointer(pointer).reduce<unknown>((current, segment) => {
    if (isRecord(current) && segment in current) {
      return current[segment]
    }

    if (Array.isArray(current)) {
      const index = Number(segment)
      if (!Number.isNaN(index) && index >= 0 && index < current.length) {
        return current[index]
      }
    }

    throw new Error(`Referencia no encontrada: ${pointer}`)
  }, root)
}

function resolveRefs(value: unknown, root: unknown, stack: Set<string>): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => resolveRefs(item, root, stack)) as JsonValue
  }

  if (!isRecord(value)) {
    return value as JsonValue
  }

  const refKey = REF_KEYS.find((key) => typeof value[key] === 'string')
  if (!refKey) {
    const output: Record<string, JsonValue> = {}
    for (const [key, child] of Object.entries(value)) {
      output[key] = resolveRefs(child, root, stack)
    }
    return output
  }

  const pointer = value[refKey] as string
  if (stack.has(pointer)) {
    throw new Error(`Referencia circular detectada: ${pointer}`)
  }

  stack.add(pointer)
  const target = resolvePointer(root, pointer)
  const resolvedTarget = resolveRefs(target, root, stack)
  stack.delete(pointer)

  const inlineEntries = Object.entries(value).filter(([key]) => !REF_KEY_SET.has(key))
  if (inlineEntries.length === 0) {
    return resolvedTarget
  }

  if (!isRecord(resolvedTarget)) {
    throw new Error(`La referencia ${pointer} no apunta a un objeto para combinar valores`)
  }

  const inlineObject: Record<string, JsonValue> = {}
  for (const [key, child] of inlineEntries) {
    inlineObject[key] = resolveRefs(child, root, stack)
  }

  return { ...resolvedTarget, ...inlineObject }
}

export function parseAndFormatJson(rawValue: string, options?: FormatJsonOptions): JsonValue {
  const parsedValue = JSON.parse(rawValue)
  return options?.resolveRefs
    ? resolveRefs(parsedValue, parsedValue, new Set())
    : (parsedValue as JsonValue)
}

export function formatJson(rawValue: string, options?: FormatJsonOptions): string {
  const parsedValue = parseAndFormatJson(rawValue, options)

  return JSON.stringify(parsedValue, null, 2)
}
