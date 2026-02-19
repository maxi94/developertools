import { useMemo, useState } from 'react'
import { Eraser, Sparkles } from 'lucide-react'
import { formatJson } from '@/shared/lib/json'

const sample = '{ "framework": "react", "clientSideOnly": true, "tools": ["json-formatter"] }'

export function JsonFormatterTool() {
  const [source, setSource] = useState(sample)

  const output = useMemo(() => {
    try {
      return {
        status: 'success' as const,
        value: formatJson(source),
      }
    } catch {
      return {
        status: 'error' as const,
        value: 'JSON invalido: revisa comillas, comas y llaves.',
      }
    }
  }, [source])

  return (
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

      <div className="mb-4 flex flex-wrap gap-2">
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
            value={output.value}
            readOnly
            spellCheck={false}
            aria-label="Salida JSON"
            data-status={output.status}
          />
        </label>
      </div>
    </section>
  )
}
