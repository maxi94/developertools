import { describe, expect, it } from 'vitest'
import { formatJson } from '@/shared/lib/json'

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
})
