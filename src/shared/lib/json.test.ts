import { describe, expect, it } from 'vitest'
import { formatJson, parseAndFormatJson, sortJsonKeysDeep } from '@/shared/lib/json'

describe('formatJson', () => {
  it('formats valid json with indentation', () => {
    const result = formatJson('{"name":"matti","role":"dev"}')

    expect(result).toContain('\n')
    expect(result).toContain('"name": "matti"')
  })

  it('throws for invalid json', () => {
    expect(() => formatJson('{bad json}')).toThrow()
  })

  it('resolves local references with ref key', () => {
    const rawJson = `{
      "definiciones": {
        "usuario": { "nombre": "Matti", "rol": "dev" }
      },
      "payload": { "ref": "#/definiciones/usuario" }
    }`

    const result = formatJson(rawJson, { resolveRefs: true })

    expect(result).toContain('"payload": {\n    "nombre": "Matti"')
    expect(result).not.toContain('"ref"')
  })

  it('resolves references by $id', () => {
    const rawJson = `{
      "catalogo": {
        "usuarioBase": { "$id": "UsuarioBase", "nombre": "Matti", "rol": "dev" }
      },
      "perfil": { "$ref": "UsuarioBase" }
    }`

    const result = formatJson(rawJson, { resolveRefs: true })

    expect(result).toContain('"perfil": {\n    "$id": "UsuarioBase"')
    expect(result).toContain('"nombre": "Matti"')
  })

  it('throws when $id is duplicated in different paths', () => {
    const rawJson = `{
      "uno": { "$id": "Entidad", "a": 1 },
      "dos": { "$id": "Entidad", "b": 2 }
    }`

    expect(() => parseAndFormatJson(rawJson, { resolveRefs: true })).toThrow(/\$id duplicado/)
  })

  it('throws when reference is missing', () => {
    const rawJson = `{
      "base": { "name": "Matti" },
      "payload": { "$ref": "#/inexistente" }
    }`

    expect(() => parseAndFormatJson(rawJson, { resolveRefs: true })).toThrow(
      /Referencia no encontrada/,
    )
  })

  it('throws for circular references with path context', () => {
    const rawJson = `{
      "a": { "$id": "A", "$ref": "B" },
      "b": { "$id": "B", "$ref": "A" },
      "root": { "$ref": "A" }
    }`

    expect(() => parseAndFormatJson(rawJson, { resolveRefs: true })).toThrow(
      /Referencia circular detectada/,
    )
  })

  it('sorts keys deeply without mutating shape', () => {
    const sorted = sortJsonKeysDeep({
      z: 1,
      a: { c: true, b: false },
      arr: [{ d: 1, a: 2 }],
    }) as Record<string, unknown>

    expect(Object.keys(sorted)).toEqual(['a', 'arr', 'z'])
    expect(Object.keys(sorted.a as Record<string, unknown>)).toEqual(['b', 'c'])
    expect(Object.keys((sorted.arr as Array<Record<string, unknown>>)[0])).toEqual(['a', 'd'])
  })
})
