type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
export type ModelLanguage = 'typescript' | 'csharp' | 'java' | 'python' | 'kotlin' | 'go'

interface GeneratorOptions {
  rootName?: string
}

type PrimitiveKind = 'string' | 'integer' | 'number' | 'boolean' | 'null' | 'unknown'

interface PrimitiveTypeNode {
  kind: 'primitive'
  primitive: PrimitiveKind
}

interface ArrayTypeNode {
  kind: 'array'
  element: TypeNode
}

interface ObjectRefTypeNode {
  kind: 'objectRef'
  name: string
}

interface UnionTypeNode {
  kind: 'union'
  options: TypeNode[]
}

type TypeNode = PrimitiveTypeNode | ArrayTypeNode | ObjectRefTypeNode | UnionTypeNode

interface ObjectField {
  jsonKey: string
  name: string
  type: TypeNode
}

interface ObjectDefinition {
  name: string
  fields: ObjectField[]
}

function toPascalCase(raw: string): string {
  const value = raw
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  return value || 'Model'
}

function toCamelCase(raw: string): string {
  const pascal = toPascalCase(raw)
  return pascal ? `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}` : 'value'
}

function toSnakeCase(raw: string): string {
  const value = raw
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
  return value || 'value'
}

function toGoFieldName(raw: string): string {
  const pascal = toPascalCase(raw)
  return pascal || 'Value'
}

function makeUniqueName(base: string, used: Set<string>): string {
  const normalized = toPascalCase(base)
  if (!used.has(normalized)) {
    used.add(normalized)
    return normalized
  }

  let suffix = 2
  while (used.has(`${normalized}${suffix}`)) {
    suffix += 1
  }
  const unique = `${normalized}${suffix}`
  used.add(unique)
  return unique
}

function mergeTypeNodes(left: TypeNode, right: TypeNode): TypeNode {
  if (getTypeSignature(left) === getTypeSignature(right)) {
    return left
  }

  if (left.kind === 'union') {
    return mergeUnion(left.options, right)
  }

  if (right.kind === 'union') {
    return mergeUnion(right.options, left)
  }

  return mergeUnion([left], right)
}

function mergeUnion(existing: TypeNode[], incoming: TypeNode): TypeNode {
  const incomingOptions = incoming.kind === 'union' ? incoming.options : [incoming]
  const signatures = new Set(existing.map(getTypeSignature))
  const options = [...existing]

  for (const option of incomingOptions) {
    const signature = getTypeSignature(option)
    if (!signatures.has(signature)) {
      signatures.add(signature)
      options.push(option)
    }
  }

  return options.length === 1 ? options[0] : { kind: 'union', options }
}

function getTypeSignature(node: TypeNode): string {
  switch (node.kind) {
    case 'primitive':
      return `primitive:${node.primitive}`
    case 'array':
      return `array:${getTypeSignature(node.element)}`
    case 'objectRef':
      return `object:${node.name}`
    case 'union':
      return `union:${node.options.map(getTypeSignature).toSorted().join('|')}`
    default:
      return 'primitive:unknown'
  }
}

function buildSchema(value: JsonValue, rootName: string): { rootType: TypeNode; defs: ObjectDefinition[] } {
  const defs: ObjectDefinition[] = []
  const usedNames = new Set<string>()

  const visit = (node: JsonValue, suggestedName: string): TypeNode => {
    if (node === null) {
      return { kind: 'primitive', primitive: 'null' }
    }

    if (Array.isArray(node)) {
      if (node.length === 0) {
        return { kind: 'array', element: { kind: 'primitive', primitive: 'unknown' } }
      }

      let current = visit(node[0], `${suggestedName}Item`)
      for (let index = 1; index < node.length; index += 1) {
        const nextType = visit(node[index], `${suggestedName}Item`)
        current = mergeTypeNodes(current, nextType)
      }
      return { kind: 'array', element: current }
    }

    if (typeof node === 'object') {
      const className = makeUniqueName(suggestedName, usedNames)
      const fields: ObjectField[] = []
      const def: ObjectDefinition = { name: className, fields }
      defs.push(def)

      for (const [key, child] of Object.entries(node)) {
        fields.push({
          jsonKey: key,
          name: toCamelCase(key),
          type: visit(child, `${className}${toPascalCase(key)}`),
        })
      }

      return { kind: 'objectRef', name: className }
    }

    if (typeof node === 'string') {
      return { kind: 'primitive', primitive: 'string' }
    }
    if (typeof node === 'boolean') {
      return { kind: 'primitive', primitive: 'boolean' }
    }
    if (typeof node === 'number') {
      return { kind: 'primitive', primitive: Number.isInteger(node) ? 'integer' : 'number' }
    }
    return { kind: 'primitive', primitive: 'unknown' }
  }

  return { rootType: visit(value, rootName), defs }
}

function hasNullOption(node: TypeNode): boolean {
  if (node.kind === 'primitive') {
    return node.primitive === 'null'
  }
  if (node.kind === 'union') {
    return node.options.some(hasNullOption)
  }
  return false
}

function withoutNull(node: TypeNode): TypeNode {
  if (node.kind !== 'union') {
    return node
  }
  const options = node.options.filter((option) => !hasNullOption(option))
  if (options.length === 0) {
    return { kind: 'primitive', primitive: 'unknown' }
  }
  if (options.length === 1) {
    return options[0]
  }
  return { kind: 'union', options }
}

function toTypeScriptType(node: TypeNode): string {
  switch (node.kind) {
    case 'primitive':
      switch (node.primitive) {
        case 'string':
          return 'string'
        case 'integer':
        case 'number':
          return 'number'
        case 'boolean':
          return 'boolean'
        case 'null':
          return 'null'
        default:
          return 'unknown'
      }
    case 'array': {
      const elementType = toTypeScriptType(node.element)
      return node.element.kind === 'union' ? `(${elementType})[]` : `${elementType}[]`
    }
    case 'objectRef':
      return node.name
    case 'union':
      return node.options.map((option) => toTypeScriptType(option)).join(' | ')
    default:
      return 'unknown'
  }
}

function toCSharpType(node: TypeNode): string {
  if (hasNullOption(node)) {
    const nonNull = withoutNull(node)
    const nonNullType = toCSharpType(nonNull)
    return nonNullType.endsWith('?') ? nonNullType : `${nonNullType}?`
  }

  switch (node.kind) {
    case 'primitive':
      switch (node.primitive) {
        case 'string':
          return 'string'
        case 'integer':
          return 'int'
        case 'number':
          return 'double'
        case 'boolean':
          return 'bool'
        default:
          return 'object'
      }
    case 'array':
      return `List<${toCSharpType(node.element)}>`
    case 'objectRef':
      return node.name
    case 'union':
      return 'object'
    default:
      return 'object'
  }
}

function toJavaType(node: TypeNode): string {
  if (hasNullOption(node)) {
    return toJavaType(withoutNull(node))
  }

  switch (node.kind) {
    case 'primitive':
      switch (node.primitive) {
        case 'string':
          return 'String'
        case 'integer':
          return 'Integer'
        case 'number':
          return 'Double'
        case 'boolean':
          return 'Boolean'
        default:
          return 'Object'
      }
    case 'array':
      return `List<${toJavaType(node.element)}>`
    case 'objectRef':
      return node.name
    case 'union':
      return 'Object'
    default:
      return 'Object'
  }
}

function toPythonType(node: TypeNode): string {
  switch (node.kind) {
    case 'primitive':
      switch (node.primitive) {
        case 'string':
          return 'str'
        case 'integer':
          return 'int'
        case 'number':
          return 'float'
        case 'boolean':
          return 'bool'
        case 'null':
          return 'None'
        default:
          return 'Any'
      }
    case 'array':
      return `list[${toPythonType(node.element)}]`
    case 'objectRef':
      return node.name
    case 'union':
      return `Union[${node.options.map((option) => toPythonType(option)).join(', ')}]`
    default:
      return 'Any'
  }
}

function toKotlinType(node: TypeNode): string {
  const isNullable = hasNullOption(node)
  const base = isNullable ? withoutNull(node) : node

  let typeName = 'Any'
  switch (base.kind) {
    case 'primitive':
      switch (base.primitive) {
        case 'string':
          typeName = 'String'
          break
        case 'integer':
          typeName = 'Int'
          break
        case 'number':
          typeName = 'Double'
          break
        case 'boolean':
          typeName = 'Boolean'
          break
        default:
          typeName = 'Any'
      }
      break
    case 'array':
      typeName = `List<${toKotlinType(base.element).replace(/\?$/, '')}>`
      break
    case 'objectRef':
      typeName = base.name
      break
    case 'union':
      typeName = 'Any'
      break
  }

  return isNullable ? `${typeName}?` : typeName
}

function toGoType(node: TypeNode): string {
  if (hasNullOption(node)) {
    const nonNull = withoutNull(node)
    const base = toGoType(nonNull)
    if (base.startsWith('*') || base === 'interface{}') {
      return base
    }
    return `*${base}`
  }

  switch (node.kind) {
    case 'primitive':
      switch (node.primitive) {
        case 'string':
          return 'string'
        case 'integer':
          return 'int'
        case 'number':
          return 'float64'
        case 'boolean':
          return 'bool'
        default:
          return 'interface{}'
      }
    case 'array':
      return `[]${toGoType(node.element)}`
    case 'objectRef':
      return node.name
    case 'union':
      return 'interface{}'
    default:
      return 'interface{}'
  }
}

function buildTypeScriptModel(
  rootType: TypeNode,
  defs: ObjectDefinition[],
  rootName: string,
): string {
  if (defs.length === 0) {
    return `export type ${toPascalCase(rootName)} = ${toTypeScriptType(rootType)}`
  }

  const lines = defs.map((def) =>
    [
      `export interface ${def.name} {`,
      ...def.fields.map((field) => `  ${field.name}: ${toTypeScriptType(field.type)}`),
      '}',
    ].join('\n'),
  )

  return lines.join('\n\n')
}

function buildCSharpModel(
  rootType: TypeNode,
  defs: ObjectDefinition[],
  rootName: string,
): string {
  if (defs.length === 0) {
    return [
      'using System.Collections.Generic;',
      '',
      `public class ${toPascalCase(rootName)}`,
      '{',
      `  public ${toCSharpType(rootType)} Value { get; set; }`,
      '}',
    ].join('\n')
  }

  return [
    'using System.Collections.Generic;',
    '',
    ...defs.map((def) =>
      [
        `public class ${def.name}`,
        '{',
        ...def.fields.map(
          (field) => `  public ${toCSharpType(field.type)} ${toPascalCase(field.name)} { get; set; }`,
        ),
        '}',
      ].join('\n'),
    ),
  ].join('\n\n')
}

function buildJavaModel(rootType: TypeNode, defs: ObjectDefinition[], rootName: string): string {
  if (defs.length === 0) {
    return [
      'import java.util.List;',
      '',
      `public class ${toPascalCase(rootName)} {`,
      `  private ${toJavaType(rootType)} value;`,
      '}',
    ].join('\n')
  }

  return [
    'import java.util.List;',
    '',
    ...defs.map((def) =>
      [
        `public class ${def.name} {`,
        ...def.fields.map((field) => `  private ${toJavaType(field.type)} ${field.name};`),
        '}',
      ].join('\n'),
    ),
  ].join('\n\n')
}

function buildPythonModel(
  rootType: TypeNode,
  defs: ObjectDefinition[],
  rootName: string,
): string {
  if (defs.length === 0) {
    return [
      'from dataclasses import dataclass',
      'from typing import Any',
      '',
      '@dataclass',
      `class ${toPascalCase(rootName)}:`,
      `  value: ${toPythonType(rootType)}`,
    ].join('\n')
  }

  const usesUnion = defs.some((def) =>
    def.fields.some((field) => toPythonType(field.type).startsWith('Union[')),
  )

  return [
    'from dataclasses import dataclass',
    `from typing import ${usesUnion ? 'Any, Union' : 'Any'}`,
    '',
    ...defs.map((def) =>
      [
        '@dataclass',
        `class ${def.name}:`,
        ...(def.fields.length > 0
          ? def.fields.map((field) => `  ${toSnakeCase(field.name)}: ${toPythonType(field.type)}`)
          : ['  pass']),
      ].join('\n'),
    ),
  ].join('\n\n')
}

function buildKotlinModel(
  rootType: TypeNode,
  defs: ObjectDefinition[],
  rootName: string,
): string {
  if (defs.length === 0) {
    return `data class ${toPascalCase(rootName)}(\n  val value: ${toKotlinType(rootType)}\n)`
  }

  return defs
    .map((def) =>
      [
        `data class ${def.name}(`,
        ...def.fields.map((field, index) => {
          const suffix = index < def.fields.length - 1 ? ',' : ''
          return `  val ${field.name}: ${toKotlinType(field.type)}${suffix}`
        }),
        ')',
      ].join('\n'),
    )
    .join('\n\n')
}

function buildGoModel(rootType: TypeNode, defs: ObjectDefinition[], rootName: string): string {
  if (defs.length === 0) {
    return [
      'package model',
      '',
      `type ${toPascalCase(rootName)} struct {`,
      `  Value ${toGoType(rootType)} \`json:"value"\``,
      '}',
    ].join('\n')
  }

  return [
    'package model',
    '',
    ...defs.map((def) =>
      [
        `type ${def.name} struct {`,
        ...def.fields.map(
          (field) => `  ${toGoFieldName(field.name)} ${toGoType(field.type)} \`json:"${field.jsonKey}"\``,
        ),
        '}',
      ].join('\n'),
    ),
  ].join('\n\n')
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
  const schema = buildSchema(parsedValue, rootName)

  switch (language) {
    case 'typescript':
      return buildTypeScriptModel(schema.rootType, schema.defs, rootName)
    case 'csharp':
      return buildCSharpModel(schema.rootType, schema.defs, rootName)
    case 'java':
      return buildJavaModel(schema.rootType, schema.defs, rootName)
    case 'python':
      return buildPythonModel(schema.rootType, schema.defs, rootName)
    case 'kotlin':
      return buildKotlinModel(schema.rootType, schema.defs, rootName)
    case 'go':
      return buildGoModel(schema.rootType, schema.defs, rootName)
    default:
      return buildTypeScriptModel(schema.rootType, schema.defs, rootName)
  }
}
