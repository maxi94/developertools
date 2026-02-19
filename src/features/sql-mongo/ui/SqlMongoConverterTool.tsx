import { useMemo, useState } from 'react'
import { DatabaseZap, Sparkles } from 'lucide-react'
import {
  convertSqlToMongoDetailed,
  formatMongoQuery,
  type MongoOutputMode,
  type MongoQueryParts,
} from '@/shared/lib/sql-mongo'

const sqlTemplates = [
  {
    name: 'Filtro basico',
    value:
      "SELECT id, name FROM users WHERE active = 1 AND name LIKE 'mat%' ORDER BY id DESC LIMIT 20",
  },
  {
    name: 'IN + orden',
    value:
      'SELECT id, total FROM orders WHERE status IN (1, 2, 3) ORDER BY created_at DESC LIMIT 10',
  },
  {
    name: 'Comparadores',
    value: 'SELECT id, email FROM users WHERE score >= 80 AND attempts < 3',
  },
]

const outputModes: Array<{ value: MongoOutputMode; label: string }> = [
  { value: 'mongosh', label: 'mongosh' },
  { value: 'compass', label: 'MongoDB Compass' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'csharp', label: 'C# Driver' },
]

type BuilderMode = 'sql' | 'compass-filter'

export function SqlMongoConverterTool() {
  const [builderMode, setBuilderMode] = useState<BuilderMode>('sql')
  const [mode, setMode] = useState<MongoOutputMode>('compass')
  const [source, setSource] = useState(sqlTemplates[0].value)

  const [collection, setCollection] = useState('users')
  const [filter, setFilter] = useState('{ "active": true }')
  const [projection, setProjection] = useState('{ "name": 1, "email": 1 }')
  const [sort, setSort] = useState('{ "createdAt": -1 }')
  const [limit, setLimit] = useState('25')

  const result = useMemo(() => {
    try {
      if (builderMode === 'sql') {
        return { status: 'success' as const, value: convertSqlToMongoDetailed(source, mode).output }
      }

      const parts: MongoQueryParts = {
        collection: collection.trim() || 'collection',
        filter: filter.trim() || '{}',
        projection: projection.trim() || '{}',
        sort: sort.trim() || '{}',
        limit: limit.trim() ? Number.parseInt(limit.trim(), 10) : null,
      }

      return { status: 'success' as const, value: formatMongoQuery(parts, mode) }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo convertir SQL a Mongo.'
      return { status: 'error' as const, value: message }
    }
  }, [builderMode, collection, filter, limit, mode, projection, sort, source])

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <DatabaseZap className="size-5" />
        SQL a MongoDB
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Convierte SQL, o arma filtros estilo Compass, y exporta para distintos targets.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Modo de armado
          </span>
          <select
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            value={builderMode}
            onChange={(event) => setBuilderMode(event.target.value as BuilderMode)}
          >
            <option value="sql">Desde SQL</option>
            <option value="compass-filter">Filtro tipo Compass</option>
          </select>
        </label>

        <label className="grid gap-1.5 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Salida
          </span>
          <select
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            value={mode}
            onChange={(event) => setMode(event.target.value as MongoOutputMode)}
          >
            {outputModes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {builderMode === 'sql' ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {sqlTemplates.map((template) => (
              <button
                key={template.name}
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
                onClick={() => setSource(template.value)}
              >
                <Sparkles className="size-3.5" />
                {template.name}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <textarea
              className="min-h-[240px] rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              spellCheck={false}
            />
            <textarea
              className="min-h-[240px] rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none data-[status=error]:border-rose-500 data-[status=error]:text-rose-600 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:data-[status=error]:text-rose-300"
              value={result.value}
              readOnly
              spellCheck={false}
              data-status={result.status}
            />
          </div>
        </>
      ) : (
        <div className="mt-3 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Collection
              </span>
              <input
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
                value={collection}
                onChange={(event) => setCollection(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Limit
              </span>
              <input
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Filter (JSON)
              </span>
              <textarea
                className="min-h-[140px] rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                spellCheck={false}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Project (JSON)
              </span>
              <textarea
                className="min-h-[140px] rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
                value={projection}
                onChange={(event) => setProjection(event.target.value)}
                spellCheck={false}
              />
            </label>
          </div>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Sort (JSON)
            </span>
            <textarea
              className="min-h-[120px] rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              spellCheck={false}
            />
          </label>

          <textarea
            className="min-h-[220px] rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none data-[status=error]:border-rose-500 data-[status=error]:text-rose-600 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:data-[status=error]:text-rose-300"
            value={result.value}
            readOnly
            spellCheck={false}
            data-status={result.status}
          />
        </div>
      )}
    </section>
  )
}
