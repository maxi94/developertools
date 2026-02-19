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
  if (/\(\?:/.test(pattern)) {
    explanations.push('(?:...) : Grupo no capturante.')
  }
  if (/\(\?=/.test(pattern)) {
    explanations.push('(?=...) : Lookahead positivo.')
  }
  if (/\(\?!/.test(pattern)) {
    explanations.push('(?!...) : Lookahead negativo.')
  }
  if (/\\b/.test(pattern)) {
    explanations.push('\\b : Limite de palabra.')
  }
  if (/[*+?]\?/.test(pattern)) {
    explanations.push('*?, +?, ?? : Cuantificador lazy (minimo).')
  }

  return explanations.length > 0
    ? explanations
    : ['No se detectaron tokens conocidos en el explicador rapido.']
}

function splitTopLevelAlternation(pattern: string): string[] {
  const branches: string[] = []
  let current = ''
  let depth = 0
  let inClass = false
  let escaped = false

  for (let i = 0; i < pattern.length; i += 1) {
    const char = pattern[i]

    if (escaped) {
      current += char
      escaped = false
      continue
    }

    if (char === '\\') {
      current += char
      escaped = true
      continue
    }

    if (char === '[' && !inClass) {
      inClass = true
      current += char
      continue
    }

    if (char === ']' && inClass) {
      inClass = false
      current += char
      continue
    }

    if (!inClass) {
      if (char === '(') {
        depth += 1
      } else if (char === ')' && depth > 0) {
        depth -= 1
      } else if (char === '|' && depth === 0) {
        branches.push(current)
        current = ''
        continue
      }
    }

    current += char
  }

  branches.push(current)
  return branches
}

function extractQuantifier(pattern: string, startIndex: number): { quantifier: string; length: number } {
  const char = pattern[startIndex]
  if (char === '*' || char === '+' || char === '?') {
    return { quantifier: char, length: 1 }
  }

  if (char !== '{') {
    return { quantifier: '', length: 0 }
  }

  const endIndex = pattern.indexOf('}', startIndex)
  if (endIndex === -1) {
    return { quantifier: '', length: 0 }
  }

  return {
    quantifier: pattern.slice(startIndex, endIndex + 1),
    length: endIndex - startIndex + 1,
  }
}

function tokenizeSequence(pattern: string): string[] {
  const tokens: string[] = []
  let i = 0

  while (i < pattern.length) {
    let token = ''
    const char = pattern[i]

    if (char === '\\') {
      token = pattern.slice(i, i + 2)
      i += Math.min(2, pattern.length - i)
    } else if (char === '[') {
      let end = i + 1
      let escaped = false
      while (end < pattern.length) {
        const nextChar = pattern[end]
        if (!escaped && nextChar === ']') {
          end += 1
          break
        }
        escaped = !escaped && nextChar === '\\'
        if (nextChar !== '\\') {
          escaped = false
        }
        end += 1
      }
      token = pattern.slice(i, end)
      i = end
    } else if (char === '(') {
      let end = i + 1
      let depth = 1
      let inClass = false
      let escaped = false

      while (end < pattern.length && depth > 0) {
        const nextChar = pattern[end]
        if (escaped) {
          escaped = false
        } else if (nextChar === '\\') {
          escaped = true
        } else if (nextChar === '[' && !inClass) {
          inClass = true
        } else if (nextChar === ']' && inClass) {
          inClass = false
        } else if (!inClass && nextChar === '(') {
          depth += 1
        } else if (!inClass && nextChar === ')') {
          depth -= 1
        }
        end += 1
      }

      token = pattern.slice(i, end)
      i = end
    } else {
      token = char
      i += 1
    }

    const { quantifier, length } = extractQuantifier(pattern, i)
    if (quantifier) {
      token = `${token}${quantifier}`
      i += length
    }

    if (token.trim()) {
      tokens.push(token)
    }
  }

  return tokens
}

function isOptionalToken(token: string): boolean {
  if (token.endsWith('*') || token.endsWith('?')) {
    return true
  }

  const quantifierMatch = token.match(/\{(\d+),(\d*)\}$/)
  if (!quantifierMatch) {
    return false
  }

  return Number(quantifierMatch[1]) === 0
}

function hasRepetition(token: string): boolean {
  return token.endsWith('*') || token.endsWith('+') || /\{\d+,?\d*\}$/.test(token)
}

export function buildRegexGraph(pattern: string): RegexGraph {
  const nodes: RegexGraphNode[] = [{ id: 'start', label: 'START' }]
  const edges: RegexGraphEdge[] = []
  const branches = splitTopLevelAlternation(pattern)
  let nodeIndex = 0

  for (let branchIndex = 0; branchIndex < branches.length; branchIndex += 1) {
    const branch = branches[branchIndex]
    const tokens = tokenizeSequence(branch)
    let previousNodeId = 'start'
    let previousNodeBeforeCurrent = 'start'

    if (tokens.length === 0) {
      edges.push({ from: 'start', to: 'end', label: 'epsilon' })
      continue
    }

    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
      const token = tokens[tokenIndex]
      const nodeId = `n${nodeIndex}`
      nodeIndex += 1

      nodes.push({ id: nodeId, label: token })

      const isFirstNodeInBranch = tokenIndex === 0
      const edgeLabel = isFirstNodeInBranch && branches.length > 1 ? `alt ${branchIndex + 1}` : 'consume'
      edges.push({ from: previousNodeId, to: nodeId, label: edgeLabel })

      if (hasRepetition(token)) {
        const quantifierMatch = token.match(/(\*|\+|\{\d+,?\d*\})$/)
        edges.push({ from: nodeId, to: nodeId, label: quantifierMatch?.[1] ?? 'repeat' })
      }

      if (isOptionalToken(token)) {
        edges.push({ from: previousNodeBeforeCurrent, to: nodeId, label: 'epsilon?' })
      }

      previousNodeBeforeCurrent = previousNodeId
      previousNodeId = nodeId
    }

    edges.push({
      from: previousNodeId,
      to: 'end',
      label: branches.length > 1 ? `accept ${branchIndex + 1}` : 'accept',
    })
  }

  nodes.push({ id: 'end', label: 'END' })

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
