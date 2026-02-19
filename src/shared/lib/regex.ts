export type RegexExportLanguage = 'javascript' | 'csharp'

export interface RegexMatchGroup {
  key: string
  value: string
}

export interface RegexMatchResult {
  value: string
  index: number
  length: number
  groups: RegexMatchGroup[]
}

export interface RegexEvaluationResult {
  isMatch: boolean
  matches: RegexMatchResult[]
  replacedText: string
}

function ensureGlobalFlag(flags: string): string {
  return flags.includes('g') ? flags : `${flags}g`
}

function uniqueFlags(rawFlags: string): string {
  return Array.from(new Set(rawFlags.split(''))).join('')
}

function escapeForJsString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`')
}

function escapeForCSharpString(value: string): string {
  return value.replace(/"/g, '""')
}

function toCSharpRegexOptions(flags: string): string {
  const options: string[] = []

  if (flags.includes('i')) {
    options.push('RegexOptions.IgnoreCase')
  }
  if (flags.includes('m')) {
    options.push('RegexOptions.Multiline')
  }
  if (flags.includes('s')) {
    options.push('RegexOptions.Singleline')
  }

  return options.length > 0 ? options.join(' | ') : 'RegexOptions.None'
}

export function evaluateRegex(
  pattern: string,
  flags: string,
  input: string,
  replaceTemplate = '',
): RegexEvaluationResult {
  const normalizedFlags = uniqueFlags(flags)
  const testRegex = new RegExp(pattern, normalizedFlags)
  const matchRegex = new RegExp(pattern, ensureGlobalFlag(normalizedFlags))

  const matches = Array.from(input.matchAll(matchRegex)).map((match) => {
    const groups: RegexMatchGroup[] = []

    if (Array.isArray(match)) {
      match.slice(1).forEach((groupValue, groupIndex) => {
        if (groupValue !== undefined) {
          groups.push({ key: String(groupIndex + 1), value: groupValue })
        }
      })
    }

    if (match.groups) {
      Object.entries(match.groups).forEach(([groupName, groupValue]) => {
        if (typeof groupValue === 'string') {
          groups.push({ key: groupName, value: groupValue })
        }
      })
    }

    return {
      value: match[0] ?? '',
      index: match.index ?? 0,
      length: (match[0] ?? '').length,
      groups,
    }
  })

  const replacedText = replaceTemplate
    ? input.replace(new RegExp(pattern, normalizedFlags), replaceTemplate)
    : input

  return {
    isMatch: testRegex.test(input),
    matches,
    replacedText,
  }
}

export function exportRegexSnippet(
  pattern: string,
  flags: string,
  language: RegexExportLanguage,
): string {
  const normalizedFlags = uniqueFlags(flags)

  if (language === 'javascript') {
    return [
      `const pattern = new RegExp(\`${escapeForJsString(pattern)}\`, '${normalizedFlags}')`,
      'const input = "texto a evaluar"',
      "const matches = Array.from(input.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)))",
    ].join('\n')
  }

  return [
    'using System.Text.RegularExpressions;',
    '',
    `var regex = new Regex(@"${escapeForCSharpString(pattern)}", ${toCSharpRegexOptions(normalizedFlags)});`,
    'var input = "texto a evaluar";',
    'var matches = regex.Matches(input);',
  ].join('\n')
}
