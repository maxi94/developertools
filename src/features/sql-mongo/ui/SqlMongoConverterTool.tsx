import { useMemo, useState } from 'react'
import { DatabaseZap } from 'lucide-react'
import { convertSqlToMongo } from '@/shared/lib/sql-mongo'

const sample =
  "SELECT id, name FROM users WHERE active = 1 AND name LIKE 'mat%' ORDER BY id DESC LIMIT 20"

export function SqlMongoConverterTool() {
  const [source, setSource] = useState(sample)

  const result = useMemo(() => {
    try {
      return { status: 'success' as const, value: convertSqlToMongo(source) }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo convertir SQL a Mongo.'
      return { status: 'error' as const, value: message }
    }
  }, [source])

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <DatabaseZap className="size-5" />
        SQL a MongoDB
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Convierte SELECT simples de SQL a query MongoDB.
      </p>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <textarea
          className="min-h-[220px] rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
        />
        <textarea
          className="min-h-[220px] rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none data-[status=error]:border-rose-500 data-[status=error]:text-rose-600 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:data-[status=error]:text-rose-300"
          value={result.value}
          readOnly
          spellCheck={false}
          data-status={result.status}
        />
      </div>
    </section>
  )
}
