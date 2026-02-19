type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

interface FormatJsonOptions {
  resolveRefs?: boolean
}

const REF_KEYS = ['$ref', 'ref'] as const
const REF_KEY_SET = new Set<string>(REF_KEYS)
const ID_KEY = '$id'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parsePointer(pointer: string): string[] {
  if (pointer === '#') {
    return []
  }

  if (!pointer.startsWith('#/')) {
    throw new Error('Referencia invalida. Usa #/ruta para punteros JSON.')
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

function collectIdTargets(root: unknown): Map<string, unknown> {
  const targets = new Map<string, unknown>()

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }

    if (!isRecord(value)) {
      return
    }

    const id = value[ID_KEY]
    if (typeof id === 'string' && id.trim().length > 0) {
      targets.set(id, value)
      if (!id.startsWith('#')) {
        targets.set(`#${id}`, value)
      }
    }

    for (const child of Object.values(value)) {
      visit(child)
    }
  }

  visit(root)

  return targets
}

function resolveReferenceTarget(
  root: unknown,
  idTargets: Map<string, unknown>,
  reference: string,
): unknown {
  if (reference === '#' || reference.startsWith('#/')) {
    return resolvePointer(root, reference)
  }

  const targetById = idTargets.get(reference) ?? idTargets.get(reference.replace(/^#/, ''))
  if (targetById !== undefined) {
    return targetById
  }

  throw new Error(`Referencia no encontrada: ${reference}`)
}

function resolveRefs(
  value: unknown,
  root: unknown,
  idTargets: Map<string, unknown>,
  stack: Set<string>,
): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => resolveRefs(item, root, idTargets, stack)) as JsonValue
  }

  if (!isRecord(value)) {
    return value as JsonValue
  }

  const refKey = REF_KEYS.find((key) => typeof value[key] === 'string')
  if (!refKey) {
    const output: Record<string, JsonValue> = {}
    for (const [key, child] of Object.entries(value)) {
      output[key] = resolveRefs(child, root, idTargets, stack)
    }
    return output
  }

  const pointer = value[refKey] as string
  if (stack.has(pointer)) {
    throw new Error(`Referencia circular detectada: ${pointer}`)
  }

  stack.add(pointer)
  const target = resolveReferenceTarget(root, idTargets, pointer)
  const resolvedTarget = resolveRefs(target, root, idTargets, stack)
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
    inlineObject[key] = resolveRefs(child, root, idTargets, stack)
  }

  return { ...resolvedTarget, ...inlineObject }
}

export function parseAndFormatJson(rawValue: string, options?: FormatJsonOptions): JsonValue {
  const parsedValue = JSON.parse(rawValue)
  const idTargets = collectIdTargets(parsedValue)
  return options?.resolveRefs
    ? resolveRefs(parsedValue, parsedValue, idTargets, new Set())
    : (parsedValue as JsonValue)
}

export function formatJson(rawValue: string, options?: FormatJsonOptions): string {
  const parsedValue = parseAndFormatJson(rawValue, options)

  return JSON.stringify(parsedValue, null, 2)
}
