type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

interface FormatJsonOptions {
  resolveRefs?: boolean
}

const REF_KEYS = ['$ref', 'ref'] as const
const REF_KEY_SET = new Set<string>(REF_KEYS)
const ID_KEY = '$id'

interface IdTarget {
  value: unknown
  path: string
}

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

function collectIdTargets(root: unknown): Map<string, IdTarget> {
  const targets = new Map<string, IdTarget>()

  const setTarget = (id: string, target: IdTarget) => {
    const existing = targets.get(id)
    if (existing && existing.value !== target.value) {
      throw new Error(`$id duplicado "${id}" en ${existing.path} y ${target.path}`)
    }
    targets.set(id, target)
  }

  const visit = (value: unknown, path: string) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`))
      return
    }

    if (!isRecord(value)) {
      return
    }

    const id = value[ID_KEY]
    if (typeof id === 'string' && id.trim().length > 0) {
      const target: IdTarget = { value, path }
      setTarget(id, target)
      if (!id.startsWith('#')) {
        setTarget(`#${id}`, target)
      }
    }

    for (const [key, child] of Object.entries(value)) {
      const childPath = path === 'root' ? `root.${key}` : `${path}.${key}`
      visit(child, childPath)
    }
  }

  visit(root, 'root')

  return targets
}

function resolveReferenceTarget(
  root: unknown,
  idTargets: Map<string, IdTarget>,
  reference: string,
): unknown {
  if (reference === '#' || reference.startsWith('#/')) {
    return resolvePointer(root, reference)
  }

  const targetById = idTargets.get(reference) ?? idTargets.get(reference.replace(/^#/, ''))
  if (targetById !== undefined) {
    return targetById.value
  }

  throw new Error(`Referencia no encontrada: ${reference}`)
}

function resolveRefs(
  value: unknown,
  root: unknown,
  idTargets: Map<string, IdTarget>,
  stack: Set<string>,
  path: string,
): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item, index) => resolveRefs(item, root, idTargets, stack, `${path}[${index}]`)) as JsonValue
  }

  if (!isRecord(value)) {
    return value as JsonValue
  }

  const refKey = REF_KEYS.find((key) => typeof value[key] === 'string')
  if (!refKey) {
    const output: Record<string, JsonValue> = {}
    for (const [key, child] of Object.entries(value)) {
      output[key] = resolveRefs(
        child,
        root,
        idTargets,
        stack,
        path === 'root' ? `root.${key}` : `${path}.${key}`,
      )
    }
    return output
  }

  const pointer = value[refKey] as string
  if (stack.has(pointer)) {
    throw new Error(`Referencia circular detectada en ${path}: ${pointer}`)
  }

  stack.add(pointer)
  const target = resolveReferenceTarget(root, idTargets, pointer)
  const resolvedTarget = resolveRefs(target, root, idTargets, stack, `${path} -> ${pointer}`)
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
    inlineObject[key] = resolveRefs(
      child,
      root,
      idTargets,
      stack,
      path === 'root' ? `root.${key}` : `${path}.${key}`,
    )
  }

  return { ...resolvedTarget, ...inlineObject }
}

export function sortJsonKeysDeep(value: unknown): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => sortJsonKeysDeep(item)) as JsonValue
  }

  if (!isRecord(value)) {
    return value as JsonValue
  }

  const output: Record<string, JsonValue> = {}
  const keys = Object.keys(value).toSorted((a, b) => a.localeCompare(b))
  for (const key of keys) {
    output[key] = sortJsonKeysDeep(value[key])
  }
  return output
}

export function parseAndFormatJson(rawValue: string, options?: FormatJsonOptions): JsonValue {
  const parsedValue = JSON.parse(rawValue)
  const idTargets = collectIdTargets(parsedValue)
  return options?.resolveRefs
    ? resolveRefs(parsedValue, parsedValue, idTargets, new Set(), 'root')
    : (parsedValue as JsonValue)
}

export function formatJson(rawValue: string, options?: FormatJsonOptions): string {
  const parsedValue = parseAndFormatJson(rawValue, options)

  return JSON.stringify(parsedValue, null, 2)
}
