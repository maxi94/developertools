import { useMemo } from 'react'

interface JsonCodeViewerProps {
  value: string
  status: 'success' | 'error'
  wrapLines?: boolean
  showLineNumbers?: boolean
  className?: string
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

function tokenizeLine(line: string): Array<{ value: string; type: string }> {
  const tokens: Array<{ value: string; type: string }> = []
  const pattern =
    /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|\b(?:true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}\[\],:]/g

  let lastIndex = 0
  let match = pattern.exec(line)
  while (match) {
    if (match.index > lastIndex) {
      tokens.push({ value: line.slice(lastIndex, match.index), type: 'plain' })
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

    tokens.push({ value: matchedValue, type })
    lastIndex = match.index + matchedValue.length
    match = pattern.exec(line)
  }

  if (lastIndex < line.length) {
    tokens.push({ value: line.slice(lastIndex), type: 'plain' })
  }

  return tokens
}

export function JsonCodeViewer({
  value,
  status,
  wrapLines = false,
  showLineNumbers = true,
  className = '',
}: JsonCodeViewerProps) {
  const lines = useMemo(() => value.split('\n'), [value])

  if (status === 'error') {
    return (
      <pre
        className={`m-0 h-full overflow-auto bg-rose-50/80 p-3 font-mono text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 ${className}`}
      >
        {value}
      </pre>
    )
  }

  return (
    <pre
      className={`m-0 h-full overflow-auto bg-slate-50/80 p-3 font-mono text-xs text-slate-800 dark:bg-slate-950/60 dark:text-slate-100 ${wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'} ${className}`}
    >
      {lines.map((line, lineIndex) => (
        <div key={`line-${lineIndex}`} className="grid grid-cols-[auto_1fr] gap-3">
          {showLineNumbers ? (
            <span className="select-none pr-1 text-right text-[10px] text-slate-400 dark:text-slate-500">
              {lineIndex + 1}
            </span>
          ) : (
            <span className="hidden" />
          )}
          <span>
            {tokenizeLine(line).map((token, tokenIndex) => (
              <span
                key={`line-${lineIndex}-token-${tokenIndex}`}
                className={getTokenClass(token.type)}
              >
                {token.value}
              </span>
            ))}
          </span>
        </div>
      ))}
    </pre>
  )
}
