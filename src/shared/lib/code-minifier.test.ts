import { describe, expect, it } from 'vitest'
import {
  getDownloadFileName,
  transformCode,
  type CodeLanguage,
  type TransformMode,
} from '@/shared/lib/code-minifier'

describe('code-minifier', () => {
  it('minifica javascript', async () => {
    const source = `
      const add = (a, b) => {
        return a + b
      }
    `

    const output = await transformCode(source, 'javascript', 'minify')

    expect(output).toContain('const add=')
    expect(output).toContain('return a+b')
  })

  it('expande javascript', async () => {
    const source = 'const x={a:1,b:2};'

    const output = await transformCode(source, 'javascript', 'expand')

    expect(output).toContain('const x = {')
    expect(output).toContain('a: 1')
  })

  it('minifica css', async () => {
    const source = `
      .card {
        color: #ffffff;
        margin: 0 16px;
      }
    `

    const output = await transformCode(source, 'css', 'minify')

    expect(output).toContain('.card{')
    expect(output).toContain('margin:0 16px')
  })

  it('expande css', async () => {
    const source = '.card{color:#fff;margin:0 16px}'

    const output = await transformCode(source, 'css', 'expand')

    expect(output).toContain('.card {')
    expect(output).toContain('color: #fff;')
  })

  it('devuelve nombre de archivo coherente', () => {
    const matrix: Array<[CodeLanguage, TransformMode, string]> = [
      ['javascript', 'minify', 'input.min.js'],
      ['javascript', 'expand', 'input.pretty.js'],
      ['css', 'minify', 'input.min.css'],
      ['css', 'expand', 'input.pretty.css'],
    ]

    for (const [language, mode, expected] of matrix) {
      expect(getDownloadFileName(language, mode)).toBe(expected)
    }
  })
})
