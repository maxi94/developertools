import { useMemo, useState } from 'react'
import { Database, FileSpreadsheet, FileText, Sparkles } from 'lucide-react'

const sampleJson = `[
  {
    "id": 101,
    "name": "Matti",
    "active": true,
    "profile": {
      "country": "AR",
      "address": {
        "city": "Cordoba",
        "zip": 5000
      }
    },
    "tags": ["dev", "tools"],
    "projects": [
      { "name": "Developer Tools", "status": "active" },
      { "name": "API Toolkit", "status": "paused" }
    ]
  },
  {
    "id": 102,
    "name": "Ana",
    "active": false,
    "profile": {
      "country": "UY",
      "address": {
        "city": "Montevideo",
        "zip": 11000
      }
    },
    "tags": ["qa"],
    "projects": [
      { "name": "DataLab", "status": "active" }
    ]
  }
]`

type FlatRow = Record<string, string>
type TableMode = 'flat' | 'nested'

function flattenValue(value: unknown, prefix = '', row: FlatRow = {}): FlatRow {
  if (value === null || value === undefined) {
    row[prefix || 'value'] = ''
    return row
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      row[prefix || 'value'] = ''
      return row
    }
    value.forEach((child, index) => {
      const childPath = prefix ? `${prefix}[${index}]` : `[${index}]`
      flattenValue(child, childPath, row)
    })
    return row
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) {
      row[prefix || 'value'] = ''
      return row
    }
    entries.forEach(([key, child]) => {
      const childPath = prefix ? `${prefix}.${key}` : key
      flattenValue(child, childPath, row)
    })
    return row
  }

  row[prefix || 'value'] = String(value)
  return row
}

function jsonToFlatRows(value: unknown): FlatRow[] {
  if (Array.isArray(value)) {
    return value.map((entry) => flattenValue(entry))
  }
  if (value && typeof value === 'object') {
    return [flattenValue(value)]
  }
  return [{ value: String(value ?? '') }]
}

function csvEscape(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

function rowsToCsv(rows: FlatRow[], columns: string[]): string {
  const lines = [columns.join(',')]
  for (const row of rows) {
    lines.push(columns.map((column) => csvEscape(row[column] ?? '')).join(','))
  }
  return lines.join('\n')
}

function rowsToTsv(rows: FlatRow[], columns: string[]): string {
  const lines = [columns.join('\t')]
  for (const row of rows) {
    lines.push(columns.map((column) => (row[column] ?? '').replaceAll('\t', ' ')).join('\t'))
  }
  return lines.join('\n')
}

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function renderNestedValue(value: unknown): JSX.Element {
  if (value === null || value === undefined) {
    return <span className="text-slate-500 dark:text-slate-400">null</span>
  }

  if (typeof value !== 'object') {
    return <span className="font-mono text-[11px]">{String(value)}</span>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-slate-500 dark:text-slate-400">[]</span>
    }

    const allObjects = value.every(
      (entry) => typeof entry === 'object' && entry !== null && !Array.isArray(entry),
    )
    if (allObjects) {
      const rows = value as Array<Record<string, unknown>>
      const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
      return (
        <div className="max-h-44 overflow-auto rounded-lg border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-900/60">
          <table className="min-w-full border-collapse text-[11px]">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="border-b border-r border-slate-300 px-2 py-1 text-left font-semibold last:border-r-0 dark:border-slate-700"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`nested-row-${rowIndex}`} className="odd:bg-white/50 dark:odd:bg-slate-900/50">
                  {columns.map((column) => (
                    <td
                      key={`nested-cell-${rowIndex}-${column}`}
                      className="border-b border-r border-slate-200 px-2 py-1 align-top last:border-r-0 dark:border-slate-700"
                    >
                      {renderNestedValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return (
      <div className="grid gap-1">
        {value.map((entry, index) => (
          <div key={`arr-${index}`} className="rounded-md border border-slate-200 bg-white/60 px-2 py-1 dark:border-slate-700 dark:bg-slate-900/50">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Item {index}
            </p>
            {renderNestedValue(entry)}
          </div>
        ))}
      </div>
    )
  }

  const entries = Object.entries(value as Record<string, unknown>)
  return (
    <div className="max-h-44 overflow-auto rounded-lg border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-900/60">
      <table className="min-w-full border-collapse text-[11px]">
        <tbody>
          {entries.map(([key, child]) => (
            <tr key={key} className="odd:bg-white/50 dark:odd:bg-slate-900/50">
              <th className="w-36 border-b border-r border-slate-300 px-2 py-1 text-left font-semibold dark:border-slate-700">
                {key}
              </th>
              <td className="border-b border-slate-200 px-2 py-1 align-top dark:border-slate-700">
                {renderNestedValue(child)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function JsonTableTool() {
  const [source, setSource] = useState(sampleJson)
  const [mode, setMode] = useState<TableMode>('flat')

  const parsedResult = useMemo(() => {
    try {
      const parsed = JSON.parse(source) as unknown
      return { status: 'success' as const, parsed, message: '' }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'JSON invalido.'
      return { status: 'error' as const, parsed: null, message }
    }
  }, [source])

  const flat = useMemo(() => {
    if (parsedResult.status !== 'success') {
      return { rows: [] as FlatRow[], columns: [] as string[] }
    }
    const rows = jsonToFlatRows(parsedResult.parsed)
    const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
    return { rows, columns }
  }, [parsedResult])

  const nestedRows = useMemo(() => {
    if (parsedResult.status !== 'success') {
      return [] as unknown[]
    }
    const root = parsedResult.parsed
    if (Array.isArray(root)) {
      return root
    }
    return [root]
  }, [parsedResult])

  const exportCsv = () => {
    if (flat.rows.length === 0) {
      return
    }
    const csv = rowsToCsv(flat.rows, flat.columns)
    downloadText(csv, 'json-table.csv', 'text/csv;charset=utf-8')
  }

  const exportExcel = () => {
    if (flat.rows.length === 0) {
      return
    }
    const tsv = rowsToTsv(flat.rows, flat.columns)
    downloadText(tsv, 'json-table.xls', 'application/vnd.ms-excel;charset=utf-8')
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <div className="mb-3">
        <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
          <Database className="size-5" />
          JSON a tabla
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Modo plano (default) o modo anidado con subtablas para listas y objetos complejos.
        </p>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
          onClick={() => setSource(sampleJson)}
        >
          <Sparkles className="size-3.5" />
          Usar ejemplo
        </button>
        <select
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          value={mode}
          onChange={(event) => setMode(event.target.value as TableMode)}
        >
          <option value="flat">Tabla plana (default)</option>
          <option value="nested">Tabla anidada (subtablas)</option>
        </select>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
          onClick={exportCsv}
          disabled={flat.rows.length === 0}
        >
          <FileText className="size-3.5" />
          Exportar CSV
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
          onClick={exportExcel}
          disabled={flat.rows.length === 0}
        >
          <FileSpreadsheet className="size-3.5" />
          Exportar Excel
        </button>
      </div>

      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          JSON de entrada
        </span>
        <textarea
          className="min-h-[240px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          value={source}
          onChange={(event) => setSource(event.target.value)}
          spellCheck={false}
        />
      </label>

      <section className="mt-3 grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Preview tabla
        </span>
        {parsedResult.status === 'error' ? (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-700/60 dark:bg-rose-950/30 dark:text-rose-300">
            {parsedResult.message}
          </div>
        ) : mode === 'flat' ? (
          <div className="rounded-2xl border border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/70">
            <div className="border-b border-slate-300 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {flat.rows.length} fila(s) · {flat.columns.length} columna(s)
            </div>
            <div className="max-h-[55vh] overflow-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800">
                  <tr>
                    {flat.columns.map((column) => (
                      <th
                        key={column}
                        className="border-b border-r border-slate-300 px-2 py-1.5 text-left font-semibold text-slate-700 last:border-r-0 dark:border-slate-700 dark:text-slate-200"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {flat.rows.map((row, rowIndex) => (
                    <tr key={`row-${rowIndex}`} className="odd:bg-white/50 dark:odd:bg-slate-900/40">
                      {flat.columns.map((column) => (
                        <td
                          key={`${rowIndex}-${column}`}
                          className="border-b border-r border-slate-200 px-2 py-1.5 align-top font-mono text-[11px] text-slate-700 last:border-r-0 dark:border-slate-700 dark:text-slate-300"
                        >
                          {row[column] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-300 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-900/70">
            <div className="mb-2 px-1 text-xs text-slate-600 dark:text-slate-300">
              {nestedRows.length} fila(s) raiz con render anidado
            </div>
            <div className="max-h-[55vh] overflow-auto rounded-lg border border-slate-200 bg-white/60 dark:border-slate-700 dark:bg-slate-900/40">
              <table className="min-w-full border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="w-20 border-b border-r border-slate-300 px-2 py-1.5 text-left font-semibold dark:border-slate-700">
                      Fila
                    </th>
                    <th className="border-b border-slate-300 px-2 py-1.5 text-left font-semibold dark:border-slate-700">
                      Estructura
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nestedRows.map((entry, index) => (
                    <tr key={`nested-root-${index}`} className="odd:bg-white/50 dark:odd:bg-slate-900/30">
                      <td className="border-b border-r border-slate-200 px-2 py-1.5 align-top font-mono text-[11px] dark:border-slate-700">
                        {index}
                      </td>
                      <td className="border-b border-slate-200 px-2 py-1.5 align-top dark:border-slate-700">
                        {renderNestedValue(entry)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <div className="mt-3 rounded-xl border border-slate-300/70 bg-slate-50/80 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/45 dark:text-slate-300">
        Exportacion CSV/Excel usa el modo plano para mantener una matriz tabular compatible.
      </div>
    </section>
  )
}
