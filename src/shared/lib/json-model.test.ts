import { describe, expect, it } from 'vitest'
import { generateModelFromJson } from '@/shared/lib/json-model'

const sample = '{"name":"Matti","age":30,"active":true}'

describe('generateModelFromJson', () => {
  it('genera interface TypeScript', () => {
    const output = generateModelFromJson(sample, 'typescript', { rootName: 'Usuario' })

    expect(output).toContain('export interface Usuario')
    expect(output).toContain('name: string')
    expect(output).toContain('age: number')
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
})
