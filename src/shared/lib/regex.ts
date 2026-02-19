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

export interface RegexGraphNode {
  id: string
  label: string
}

export interface RegexGraphEdge {
  from: string
  to: string
  label: string
}

export interface RegexGraph {
  nodes: RegexGraphNode[]
  edges: RegexGraphEdge[]
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

export function explainRegex(pattern: string): string[] {
  const explanations: string[] = []

  if (!pattern.trim()) {
    return ['Patron vacio.']
  }

  if (pattern.includes('^')) {
    explanations.push('^ : Inicio de linea/cadena.')
  }
  if (pattern.includes('$')) {
    explanations.push('$ : Fin de linea/cadena.')
  }
  if (pattern.includes('\\d')) {
    explanations.push('\\d : Digito (0-9).')
  }
  if (pattern.includes('\\w')) {
    explanations.push('\\w : Caracter alfanumerico o _.')
  }
  if (pattern.includes('\\s')) {
    explanations.push('\\s : Espacio en blanco.')
  }
  if (pattern.includes('.*') || pattern.includes('.+')) {
    explanations.push('. / * / + : Comodines y cuantificadores.')
  }
  if (/\{\d+,?\d*\}/.test(pattern)) {
    explanations.push('{m,n} : Repeticion con rango.')
  }
  if (/\(\?<[^>]+>/.test(pattern)) {
    explanations.push('(?<name>...) : Grupo con nombre.')
  }
  if (/\([^?]/.test(pattern)) {
    explanations.push('(...) : Grupo de captura.')
  }
  if (pattern.includes('|')) {
    explanations.push('| : Alternativa OR.')
  }
  if (pattern.includes('[') && pattern.includes(']')) {
    explanations.push('[...] : Clase de caracteres.')
  }

  return explanations.length > 0
    ? explanations
    : ['No se detectaron tokens conocidos en el explicador rapido.']
}

export function buildRegexGraph(pattern: string): RegexGraph {
  const nodes: RegexGraphNode[] = [{ id: 'start', label: 'START' }]
  const edges: RegexGraphEdge[] = []

  let previous = 'start'
  const tokens =
    pattern.match(/\(\?<[^>]+>[^)]*\)|\([^)]*\)|\[[^\]]+\]|\\.|\{\d+,?\d*\}|\*|\+|\?|\||\.|\w+/g) ??
    []

  tokens.forEach((token, index) => {
    const nodeId = `n${index}`
    nodes.push({ id: nodeId, label: token })
    edges.push({ from: previous, to: nodeId, label: 'consume' })

    if (token === '|' && index > 0) {
      edges.push({ from: previous, to: nodeId, label: 'alt' })
    }

    previous = nodeId
  })

  nodes.push({ id: 'end', label: 'END' })
  edges.push({ from: previous, to: 'end', label: 'accept' })

  return { nodes, edges }
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
