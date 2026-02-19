import { describe, expect, it } from 'vitest'
import { evaluateRegex, exportRegexSnippet } from '@/shared/lib/regex'

describe('regex tool', () => {
  it('evalua matches y grupos', () => {
    const result = evaluateRegex('(\\w+)-(\\d+)', 'g', 'user-12 admin-34')

    expect(result.isMatch).toBe(true)
    expect(result.matches).toHaveLength(2)
    expect(result.matches[0].groups).toEqual([
      { key: '1', value: 'user' },
      { key: '2', value: '12' },
    ])
  })

  it('aplica reemplazo', () => {
    const result = evaluateRegex('\\d+', 'g', 'a1b2', '#')

    expect(result.replacedText).toBe('a#b#')
  })

  it('exporta snippets', () => {
    const js = exportRegexSnippet('\\d+', 'gi', 'javascript')
    const csharp = exportRegexSnippet('\\d+', 'im', 'csharp')

    expect(js).toContain('new RegExp')
    expect(csharp).toContain('new Regex')
    expect(csharp).toContain('RegexOptions.IgnoreCase')
  })
})
