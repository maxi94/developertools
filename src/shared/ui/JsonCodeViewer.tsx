import { useEffect, useMemo, useState, type ReactNode } from 'react'

interface JsonCodeViewerProps {
  value: string
  status: 'success' | 'error'
  wrapLines?: boolean
  showLineNumbers?: boolean
  className?: string
}

interface FoldRange {
  start: number
  end: number
}

interface BracketPairMap {
  pairByPosition: Map<string, string>
}

function getTokenClass(tokenType: string): string {
  switch (tokenType) {
    case 'key':
      return 'text-sky-700 dark:text-sky-300'
    case 'string':
      return 'text-emerald-700 dark:text-emerald-300'
    case 'number':
      return 'text-violet-700 dark:text-violet-300'
    case 'boolean':
      return 'text-amber-700 dark:text-amber-300'
    case 'null':
      return 'text-rose-700 dark:text-rose-300'
    case 'punctuation':
      return 'text-slate-500 dark:text-slate-400'
    default:
      return 'text-slate-800 dark:text-slate-100'
  }
}

function tokenizeLine(line: string): Array<{ value: string; type: string; start: number }> {
  const tokens: Array<{ value: string; type: string; start: number }> = []
  const pattern =
    /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|\b(?:true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}\[\],:]/g

  let lastIndex = 0
  let match = pattern.exec(line)
  while (match) {
    if (match.index > lastIndex) {
      tokens.push({ value: line.slice(lastIndex, match.index), type: 'plain', start: lastIndex })
    }

    const matchedValue = match[0]
    let type = 'plain'

    if (matchedValue.startsWith('"') && match[1]) {
      type = 'key'
    } else if (matchedValue.startsWith('"')) {
      type = 'string'
    } else if (matchedValue === 'true' || matchedValue === 'false') {
      type = 'boolean'
    } else if (matchedValue === 'null') {
      type = 'null'
    } else if (/^-?\d/.test(matchedValue)) {
      type = 'number'
    } else {
      type = 'punctuation'
    }

    tokens.push({ value: matchedValue, type, start: match.index })
    lastIndex = match.index + matchedValue.length
    match = pattern.exec(line)
  }

  if (lastIndex < line.length) {
    tokens.push({ value: line.slice(lastIndex), type: 'plain', start: lastIndex })
  }

  return tokens
}

function isOpeningBracket(char: string): char is '{' | '[' {
  return char === '{' || char === '['
}

function isClosingBracket(char: string): char is '}' | ']' {
  return char === '}' || char === ']'
}

function matchesBracket(open: '{' | '[', close: '}' | ']'): boolean {
  return (open === '{' && close === '}') || (open === '[' && close === ']')
}

function buildFoldRanges(lines: string[]): Map<number, FoldRange> {
  const stack: Array<{ bracket: '{' | '['; line: number }> = []
  const ranges = new Map<number, FoldRange>()

  let inString = false
  let escaped = false

  lines.forEach((line, lineIndex) => {
    for (const char of line) {
      if (inString) {
        if (escaped) {
          escaped = false
          continue
        }
        if (char === '\\') {
          escaped = true
          continue
        }
        if (char === '"') {
          inString = false
        }
        continue
      }

      if (char === '"') {
        inString = true
        continue
      }

      if (isOpeningBracket(char)) {
        stack.push({ bracket: char, line: lineIndex })
        continue
      }

      if (isClosingBracket(char)) {
        const open = stack.pop()
        if (!open || !matchesBracket(open.bracket, char)) {
          continue
        }
        if (lineIndex > open.line && !ranges.has(open.line)) {
          ranges.set(open.line, { start: open.line, end: lineIndex })
        }
      }
    }
  })

  return ranges
}

function buildBracketPairs(lines: string[]): BracketPairMap {
  const stack: Array<{ bracket: '{' | '['; line: number; char: number }> = []
  const pairByPosition = new Map<string, string>()

  let inString = false
  let escaped = false

  lines.forEach((line, lineIndex) => {
    for (let charIndex = 0; charIndex < line.length; charIndex += 1) {
      const char = line[charIndex]
      if (inString) {
        if (escaped) {
          escaped = false
          continue
        }
        if (char === '\\') {
          escaped = true
          continue
        }
        if (char === '"') {
          inString = false
        }
        continue
      }

      if (char === '"') {
        inString = true
        continue
      }

      if (isOpeningBracket(char)) {
        stack.push({ bracket: char, line: lineIndex, char: charIndex })
        continue
      }

      if (isClosingBracket(char)) {
        const open = stack.pop()
        if (!open || !matchesBracket(open.bracket, char)) {
          continue
        }
        const openKey = `${open.line}:${open.char}`
        const closeKey = `${lineIndex}:${charIndex}`
        pairByPosition.set(openKey, closeKey)
        pairByPosition.set(closeKey, openKey)
      }
    }
  })

  return { pairByPosition }
}

export function JsonCodeViewer({
  value,
  status,
  wrapLines = false,
  showLineNumbers = true,
  className = '',
}: JsonCodeViewerProps) {
  const lines = useMemo(() => value.split('\n'), [value])
  const foldRanges = useMemo(() => buildFoldRanges(lines), [lines])
  const { pairByPosition } = useMemo(() => buildBracketPairs(lines), [lines])
  const [collapsedStarts, setCollapsedStarts] = useState<Set<number>>(new Set())
  const [hoveredBracketPosition, setHoveredBracketPosition] = useState<string | null>(null)

  useEffect(() => {
    setCollapsedStarts(new Set())
    setHoveredBracketPosition(null)
  }, [value])

  const toggleLineCollapse = (lineIndex: number) => {
    if (!foldRanges.has(lineIndex)) {
      return
    }
    setCollapsedStarts((current) => {
      const next = new Set(current)
      if (next.has(lineIndex)) {
        next.delete(lineIndex)
      } else {
        next.add(lineIndex)
      }
      return next
    })
  }

  if (status === 'error') {
    return (
      <pre
        className={`m-0 h-full overflow-auto bg-rose-50/80 p-3 font-mono text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 ${className}`}
      >
        {value}
      </pre>
    )
  }

  const renderedLines: ReactNode[] = []
  let lineIndex = 0

  while (lineIndex < lines.length) {
    const currentLineIndex = lineIndex
    const line = lines[currentLineIndex]
    const foldRange = foldRanges.get(currentLineIndex)
    const isCollapsed = foldRange ? collapsedStarts.has(currentLineIndex) : false

    renderedLines.push(
      <div
        key={`line-${currentLineIndex}`}
        className={`grid grid-cols-[auto_auto_1fr] gap-2 rounded-sm px-1 ${
          currentLineIndex % 2 === 0
            ? 'bg-slate-100/45 dark:bg-slate-900/35'
            : 'bg-slate-50/35 dark:bg-slate-950/20'
        }`}
      >
        {showLineNumbers ? (
          <span className="select-none pr-1 text-right text-[10px] text-slate-400 dark:text-slate-500">
            {currentLineIndex + 1}
          </span>
        ) : (
          <span className="hidden" />
        )}
        <span className="inline-flex h-4 w-4 items-center justify-center">
          {foldRange ? (
            <button
              type="button"
              className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded text-[11px] font-bold text-slate-500 hover:bg-slate-200/70 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              onClick={() => toggleLineCollapse(currentLineIndex)}
              aria-label={isCollapsed ? 'Expandir bloque' : 'Colapsar bloque'}
            >
              {isCollapsed ? '+' : '-'}
            </button>
          ) : null}
        </span>
        <span>
          {tokenizeLine(line).map((token, tokenIndex) => (
            (() => {
              const positionKey = `${currentLineIndex}:${token.start}`
              const isBracketToken =
                token.type === 'punctuation' &&
                (token.value === '{' || token.value === '}' || token.value === '[' || token.value === ']')
              const linkedPosition = hoveredBracketPosition
                ? pairByPosition.get(hoveredBracketPosition) ?? null
                : null
              const isActiveBracket =
                isBracketToken &&
                hoveredBracketPosition !== null &&
                (hoveredBracketPosition === positionKey || linkedPosition === positionKey)

              return (
                <span
                  key={`line-${currentLineIndex}-token-${tokenIndex}`}
                  className={`${getTokenClass(token.type)} ${
                    isActiveBracket
                      ? 'rounded bg-cyan-200/80 px-[1px] text-cyan-900 dark:bg-cyan-500/35 dark:text-cyan-100'
                      : ''
                  }`}
                  onMouseEnter={() => {
                    if (isBracketToken) {
                      setHoveredBracketPosition(positionKey)
                    }
                  }}
                  onMouseLeave={() => {
                    if (isBracketToken) {
                      setHoveredBracketPosition(null)
                    }
                  }}
                >
                  {token.value}
                </span>
              )
            })()
          ))}
        </span>
      </div>,
    )

    if (foldRange && isCollapsed) {
      const hiddenLines = foldRange.end - foldRange.start
      renderedLines.push(
        <div
          key={`collapsed-${currentLineIndex}`}
          className="ml-7 grid grid-cols-[auto_1fr] gap-2 rounded-sm bg-slate-100/50 px-1 text-[11px] text-slate-500 dark:bg-slate-900/35 dark:text-slate-400"
        >
          <span className="select-none">...</span>
          <button
            type="button"
            className="w-fit cursor-pointer rounded px-1 py-0.5 text-left hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            onClick={() => toggleLineCollapse(currentLineIndex)}
          >
            {hiddenLines} lineas colapsadas
          </button>
        </div>,
      )
      lineIndex = foldRange.end + 1
      continue
    }

    lineIndex += 1
  }

  return (
    <pre
      className={`m-0 h-full overflow-auto bg-slate-50/80 p-3 font-mono text-xs text-slate-800 dark:bg-slate-950/60 dark:text-slate-100 ${wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'} ${className}`}
    >
      {renderedLines}
    </pre>
  )
}
