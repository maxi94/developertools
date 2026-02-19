import { useMemo, useState } from 'react'
import { Copy, Database, Sparkles } from 'lucide-react'
import { formatSql, type SqlDialect } from '@/shared/lib/sql'

const sampleSql =
  'select top 50 id, full_name, created_at from users where active = 1 order by created_at desc'

const dialectOptions: Array<{ value: SqlDialect; label: string }> = [
  { value: 'sqlserver', label: 'SQL Server (default)' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'oracle', label: 'Oracle' },
]

export function SqlFormatterTool() {
  const [source, setSource] = useState(sampleSql)
  const [dialect, setDialect] = useState<SqlDialect>('sqlserver')

  const output = useMemo(() => formatSql(source, dialect), [source, dialect])

  const copyOutput = async () => {
    if (output.trim()) {
      await navigator.clipboard.writeText(output)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
          <Database className="size-5" />
          Formateador SQL
        </h2>
        <div className="inline-flex items-center gap-2">
          <select
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
            value={dialect}
            onChange={(event) => setDialect(event.target.value as SqlDialect)}
          >
            {dialectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          onClick={() => setSource(sampleSql)}
        >
          <Sparkles className="size-3.5" />
          Usar ejemplo
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          onClick={copyOutput}
        >
          <Copy className="size-3.5" />
          Copiar salida
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Entrada SQL
          </span>
          <textarea
            className="min-h-[300px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            SQL formateado
          </span>
          <textarea
            className="min-h-[300px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            value={output}
            readOnly
            spellCheck={false}
          />
        </label>
      </div>
    </section>
  )
}
