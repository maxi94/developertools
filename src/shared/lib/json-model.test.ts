import { describe, expect, it } from 'vitest'
import { generateModelFromJson } from '@/shared/lib/json-model'

const sample = '{"name":"Matti","age":30,"active":true}'
const nestedSample = `{
  "id": 1,
  "profile": {
    "country": "AR",
    "address": {
      "city": "Cordoba"
    }
  },
  "projects": [
    {
      "name": "Developer Tools"
    }
  ]
}`

describe('generateModelFromJson', () => {
  it('genera interface TypeScript', () => {
    const output = generateModelFromJson(sample, 'typescript', { rootName: 'Usuario' })

    expect(output).toContain('export interface Usuario')
    expect(output).toContain('name: string')
    expect(output).toContain('age: number')
  })

  it('genera clases anidadas en TypeScript para objetos dentro de objetos', () => {
    const output = generateModelFromJson(nestedSample, 'typescript', { rootName: 'Usuario' })

    expect(output).toContain('export interface Usuario')
    expect(output).toContain('profile: UsuarioProfile')
    expect(output).toContain('export interface UsuarioProfile')
    expect(output).toContain('address: UsuarioProfileAddress')
    expect(output).toContain('export interface UsuarioProfileAddress')
  })

  it('genera clase C#', () => {
    const output = generateModelFromJson(sample, 'csharp', { rootName: 'Usuario' })

    expect(output).toContain('public class Usuario')
    expect(output).toContain('public string Name')
    expect(output).toContain('public int Age')
  })

  it('genera clase Java', () => {
    const output = generateModelFromJson(sample, 'java', { rootName: 'Usuario' })

    expect(output).toContain('public class Usuario')
    expect(output).toContain('private String name;')
    expect(output).toContain('private Integer age;')
  })

  it('genera dataclasses en Python', () => {
    const output = generateModelFromJson(nestedSample, 'python', { rootName: 'Usuario' })

    expect(output).toContain('class Usuario:')
    expect(output).toContain('class UsuarioProfile:')
  })

  it('genera data class en Kotlin', () => {
    const output = generateModelFromJson(nestedSample, 'kotlin', { rootName: 'Usuario' })

    expect(output).toContain('data class Usuario(')
    expect(output).toContain('val profile: UsuarioProfile')
  })

  it('genera struct en Go', () => {
    const output = generateModelFromJson(nestedSample, 'go', { rootName: 'Usuario' })

    expect(output).toContain('type Usuario struct {')
    expect(output).toContain('Profile UsuarioProfile `json:"profile"`')
  })
})
