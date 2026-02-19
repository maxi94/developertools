type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
export type ModelLanguage = 'typescript' | 'csharp' | 'java'

interface GeneratorOptions {
  rootName?: string
}

function isRecord(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toPascalCase(raw: string): string {
  return raw
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function toCamelCase(raw: string): string {
  const pascal = toPascalCase(raw)
  return pascal ? `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}` : 'value'
}

function inferTypeScriptType(value: JsonValue): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'unknown[]'
    }
    return `${inferTypeScriptType(value[0])}[]`
  }

  if (value === null) {
    return 'null'
  }

  switch (typeof value) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    default:
      return 'Record<string, unknown>'
  }
}

function inferCSharpType(value: JsonValue): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'List<object>'
    }
    return `List<${inferCSharpType(value[0])}>`
  }

  if (value === null) {
    return 'object?'
  }

  switch (typeof value) {
    case 'string':
      return 'string'
    case 'number':
      return Number.isInteger(value) ? 'int' : 'double'
    case 'boolean':
      return 'bool'
    default:
      return 'object'
  }
}

function inferJavaType(value: JsonValue): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'List<Object>'
    }
    return `List<${inferJavaType(value[0])}>`
  }

  if (value === null) {
    return 'Object'
  }

  switch (typeof value) {
    case 'string':
      return 'String'
    case 'number':
      return Number.isInteger(value) ? 'Integer' : 'Double'
    case 'boolean':
      return 'Boolean'
    default:
      return 'Object'
  }
}

function buildTypeScriptModel(rootName: string, value: JsonValue): string {
  if (!isRecord(value)) {
    return `type ${toPascalCase(rootName)} = ${inferTypeScriptType(value)}\n`
  }

  const lines = Object.entries(value).map(
    ([key, child]) => `  ${toCamelCase(key)}: ${inferTypeScriptType(child)}`,
  )

  return [`export interface ${toPascalCase(rootName)} {`, ...lines, '}'].join('\n')
}

function buildCSharpModel(rootName: string, value: JsonValue): string {
  if (!isRecord(value)) {
    return `public class ${toPascalCase(rootName)}\n{\n  public ${inferCSharpType(value)} Value { get; set; }\n}`
  }

  const lines = Object.entries(value).map(
    ([key, child]) => `  public ${inferCSharpType(child)} ${toPascalCase(key)} { get; set; }`,
  )

  return [
    'using System.Collections.Generic;',
    '',
    `public class ${toPascalCase(rootName)}`,
    '{',
    ...lines,
    '}',
  ].join('\n')
}

function buildJavaModel(rootName: string, value: JsonValue): string {
  if (!isRecord(value)) {
    return [
      'import java.util.List;',
      '',
      `public class ${toPascalCase(rootName)} {`,
      `  private ${inferJavaType(value)} value;`,
      '}',
    ].join('\n')
  }

  const fields = Object.entries(value).map(
    ([key, child]) => `  private ${inferJavaType(child)} ${toCamelCase(key)};`,
  )

  return [
    'import java.util.List;',
    '',
    `public class ${toPascalCase(rootName)} {`,
    ...fields,
    '}',
  ].join('\n')
}

export function parseJsonInput(rawValue: string): JsonValue {
  return JSON.parse(rawValue) as JsonValue
}

export function generateModelFromJson(
  rawValue: string,
  language: ModelLanguage,
  options?: GeneratorOptions,
): string {
  const parsedValue = parseJsonInput(rawValue)
  const rootName = options?.rootName?.trim() || 'RootModel'

  switch (language) {
    case 'typescript':
      return buildTypeScriptModel(rootName, parsedValue)
    case 'csharp':
      return buildCSharpModel(rootName, parsedValue)
    case 'java':
      return buildJavaModel(rootName, parsedValue)
    default:
      return buildTypeScriptModel(rootName, parsedValue)
  }
}
