import { useMemo, useState } from 'react'
import { Copy, FileCode2, Regex } from 'lucide-react'
import {
  buildRegexGraph,
  evaluateRegex,
  explainRegex,
  exportRegexSnippet,
  type RegexExportLanguage,
} from '@/shared/lib/regex'

const sampleInput = `usuario: matti-123
email: matti@example.com
id: usr-987`

export function RegexTool() {
  const [pattern, setPattern] = useState('(?<key>\\w+):\\s(?<value>.+)')
  const [flags, setFlags] = useState('gm')
  const [input, setInput] = useState(sampleInput)
  const [replaceTemplate, setReplaceTemplate] = useState('[$<key>] => $<value>')
  const [exportLanguage, setExportLanguage] = useState<RegexExportLanguage>('javascript')

  const result = useMemo(() => {
    try {
      return {
        status: 'success' as const,
        value: evaluateRegex(pattern, flags, input, replaceTemplate),
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Expresion invalida.'
      return { status: 'error' as const, value: message }
    }
  }, [flags, input, pattern, replaceTemplate])

  const exportedSnippet = useMemo(() => {
    try {
      return exportRegexSnippet(pattern, flags, exportLanguage)
    } catch {
      return '// Expresion invalida para exportar.'
    }
  }, [exportLanguage, flags, pattern])
  const explanation = useMemo(() => explainRegex(pattern), [pattern])
  const graph = useMemo(() => buildRegexGraph(pattern), [pattern])
  const graphLayout = useMemo(() => {
    const horizontalGap = 150
    const positions = Object.fromEntries(
      graph.nodes.map((node, index) => [node.id, { x: 80 + index * horizontalGap, y: 96 }]),
    )

    return {
      width: Math.max(760, graph.nodes.length * horizontalGap + 40),
      height: 220,
      positions,
    }
  }, [graph])

  const copyExport = async () => {
    if (exportedSnippet.trim()) {
      await navigator.clipboard.writeText(exportedSnippet)
    }
  }

  return (
    <section className="grid gap-3">
      <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
        <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
          <Regex className="size-5" />
          Expresiones regulares
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Crea, prueba, debuggea y evalua regex con vista de matches/grupos y exportacion a C# o
          JavaScript.
        </p>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Patron
            </span>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              spellCheck={false}
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Flags
            </span>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
              value={flags}
              onChange={(event) => setFlags(event.target.value)}
              spellCheck={false}
              placeholder="gim"
            />
          </label>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Texto de prueba
            </span>
            <textarea
              className="min-h-[180px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              spellCheck={false}
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Plantilla de reemplazo
            </span>
            <textarea
              className="min-h-[180px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
              value={replaceTemplate}
              onChange={(event) => setReplaceTemplate(event.target.value)}
              spellCheck={false}
            />
          </label>
        </div>
      </section>

      {result.status === 'success' ? (
        <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Estado: {result.value.isMatch ? 'Match encontrado' : 'Sin coincidencias'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Matches: {result.value.matches.length}
          </p>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <article className="rounded-xl border border-slate-300/70 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
              <h3 className="text-sm font-semibold">Debug de matches</h3>
              <div className="mt-2 grid gap-2 text-xs">
                {result.value.matches.length > 0 ? (
                  result.value.matches.map((match, index) => (
                    <div
                      key={`${match.index}-${index}`}
                      className="rounded-md border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/70"
                    >
                      <p className="font-semibold">
                        #{index + 1} - "{match.value}" (index: {match.index}, len: {match.length})
                      </p>
                      {match.groups.length > 0 ? (
                        <div className="mt-1 grid gap-0.5 text-slate-600 dark:text-slate-300">
                          {match.groups.map((group) => (
                            <p key={`${index}-${group.key}`}>
                              Grupo {group.key}: <span className="font-mono">{group.value}</span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 text-slate-500 dark:text-slate-400">Sin grupos.</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">
                    No hay matches para el patron actual.
                  </p>
                )}
              </div>
            </article>

            <article className="rounded-xl border border-slate-300/70 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
              <h3 className="text-sm font-semibold">Resultado de reemplazo</h3>
              <textarea
                className="mt-2 min-h-[220px] w-full resize-y rounded-xl border border-slate-300 bg-white p-2 font-mono text-xs outline-none dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
                readOnly
                value={result.value.replacedText}
                spellCheck={false}
              />
            </article>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-rose-300/70 bg-rose-50/90 p-4 text-sm text-rose-700 dark:border-rose-700/70 dark:bg-rose-950/40 dark:text-rose-300">
          {result.value}
        </section>
      )}

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
          <h3 className="text-sm font-semibold">Explicador del patron</h3>
          <ul className="mt-2 grid gap-1 text-xs text-slate-600 dark:text-slate-300">
            {explanation.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
          <h3 className="text-sm font-semibold">Diagrama de estados (aproximado)</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Vista orientativa del flujo de evaluacion de la regex, con ramas y repeticiones.
          </p>
          <div className="mt-2 overflow-x-auto rounded-xl border border-slate-300/70 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
            <svg
              width={graphLayout.width}
              height={graphLayout.height}
              viewBox={`0 0 ${graphLayout.width} ${graphLayout.height}`}
              role="img"
              aria-label="Diagrama de estados de expresion regular"
            >
              <defs>
                <marker
                  id="regex-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>

              {graph.edges.map((edge, index) => {
                const from = graphLayout.positions[edge.from]
                const to = graphLayout.positions[edge.to]
                if (!from || !to) {
                  return null
                }

                if (edge.from === edge.to) {
                  const loopTop = from.y - 40
                  return (
                    <g key={`${edge.from}-${edge.to}-${edge.label}-${index}`} className="text-slate-500 dark:text-slate-300">
                      <path
                        d={`M ${from.x + 24} ${from.y} C ${from.x + 48} ${from.y}, ${from.x + 48} ${loopTop}, ${from.x} ${loopTop} C ${from.x - 36} ${loopTop}, ${from.x - 36} ${from.y}, ${from.x - 4} ${from.y}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        markerEnd="url(#regex-arrow)"
                      />
                      <text x={from.x + 4} y={loopTop - 8} className="fill-current text-[10px] font-medium">
                        {edge.label}
                      </text>
                    </g>
                  )
                }

                const isAlt = edge.label.startsWith('alt ')
                const controlY = isAlt ? Math.min(from.y, to.y) - 42 : from.y
                const midX = (from.x + to.x) / 2
                return (
                  <g key={`${edge.from}-${edge.to}-${edge.label}-${index}`} className="text-slate-500 dark:text-slate-300">
                    <path
                      d={`M ${from.x + 28} ${from.y} Q ${midX} ${controlY} ${to.x - 28} ${to.y}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      markerEnd="url(#regex-arrow)"
                    />
                    <text x={midX - 16} y={controlY - 6} className="fill-current text-[10px] font-medium">
                      {edge.label}
                    </text>
                  </g>
                )
              })}

              {graph.nodes.map((node) => {
                const position = graphLayout.positions[node.id]
                if (!position) {
                  return null
                }
                const isTerminal = node.id === 'start' || node.id === 'end'
                return (
                  <g key={node.id}>
                    <rect
                      x={position.x - 28}
                      y={position.y - 18}
                      width={56}
                      height={36}
                      rx={10}
                      className={
                        isTerminal
                          ? 'fill-cyan-100 stroke-cyan-400 dark:fill-cyan-900/50 dark:stroke-cyan-500'
                          : 'fill-white stroke-slate-400 dark:fill-slate-900 dark:stroke-slate-600'
                      }
                      strokeWidth={1.5}
                    />
                    <text
                      x={position.x}
                      y={position.y + 4}
                      textAnchor="middle"
                      className={`font-mono text-[10px] ${isTerminal ? 'fill-cyan-800 dark:fill-cyan-200' : 'fill-slate-700 dark:fill-slate-200'}`}
                    >
                      {node.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          <div className="mt-2 grid gap-1 text-xs">
            {graph.edges.map((edge, index) => (
              <p
                key={`${edge.from}-${edge.to}-${index}`}
                className="font-mono text-slate-700 dark:text-slate-200"
              >
                {edge.from} --[{edge.label}]--&gt; {edge.to}
              </p>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
            <FileCode2 className="size-4" />
            Exportar regex
          </h3>
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold outline-none dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              value={exportLanguage}
              onChange={(event) => setExportLanguage(event.target.value as RegexExportLanguage)}
            >
              <option value="javascript">JavaScript</option>
              <option value="csharp">C#</option>
            </select>
            <button
              type="button"
              onClick={copyExport}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            >
              <Copy className="size-3.5" /> Copiar
            </button>
          </div>
        </div>

        <textarea
          className="mt-3 min-h-[180px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          readOnly
          value={exportedSnippet}
          spellCheck={false}
        />
      </section>
    </section>
  )
}
