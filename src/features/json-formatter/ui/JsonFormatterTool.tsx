import { useMemo, useState } from 'react'
import { Eraser, Network, Sparkles } from 'lucide-react'
import { formatJson, parseAndFormatJson } from '@/shared/lib/json'
import { JsonTreeViewer } from '@/shared/ui/JsonTreeViewer'

const sample = `{
  "definiciones": {
    "usuarioBase": {
      "nombre": "Matti",
      "rol": "developer",
      "permisos": ["read", "write"]
    }
  },
  "usuario": {
    "ref": "#/definiciones/usuarioBase",
    "equipo": "tools"
  }
}`

export function JsonFormatterTool() {
  const [source, setSource] = useState(sample)
  const [resolveRefs, setResolveRefs] = useState(true)

  const output = useMemo(() => {
    try {
      const parsed = parseAndFormatJson(source, { resolveRefs })
      return {
        status: 'success' as const,
        formatted: formatJson(source, { resolveRefs }),
        parsed,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'JSON invalido.'
      return {
        status: 'error' as const,
        formatted: message,
        parsed: null,
      }
    }
  }, [source, resolveRefs])

  return (
    <section className="grid gap-3">
      <section
        className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40"
        aria-label="Formateador JSON"
      >
        <div className="mb-3">
          <h2 className="m-0 text-xl font-semibold">Formateador JSON</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            La entrada y salida permanecen en tu navegador.
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
            onClick={() => setSource(sample)}
          >
            <Sparkles className="size-3.5" />
            Usar ejemplo
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-rose-400 dark:hover:text-rose-300"
            onClick={() => setSource('')}
          >
            <Eraser className="size-3.5" />
            Limpiar
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              resolveRefs
                ? 'border-blue-500 bg-blue-600 text-white dark:border-sky-400 dark:bg-sky-500 dark:text-slate-950'
                : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
            }`}
            onClick={() => setResolveRefs((state) => !state)}
          >
            <Network className="size-3.5" />
            Resolver ref/$ref: {resolveRefs ? 'Activo' : 'Inactivo'}
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Entrada
            </span>
            <textarea
              className="min-h-[320px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              spellCheck={false}
              aria-label="Entrada JSON"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Salida
            </span>
            <textarea
              className="min-h-[320px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 data-[status=error]:border-rose-500 data-[status=error]:text-rose-600 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/30 dark:data-[status=error]:text-rose-300"
              value={output.formatted}
              readOnly
              spellCheck={false}
              aria-label="Salida JSON"
              data-status={output.status}
            />
          </label>
        </div>
      </section>

      {output.status === 'success' ? (
        <JsonTreeViewer
          data={output.parsed}
          title={`Visualizador JSON (${resolveRefs ? 'refs resueltas' : 'refs sin resolver'})`}
        />
      ) : null}
    </section>
  )
}
