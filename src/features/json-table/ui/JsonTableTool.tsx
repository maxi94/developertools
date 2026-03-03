import { useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import { Copy, Database, FileSpreadsheet, FileText, Loader2, Sparkles } from 'lucide-react'

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
type CopyState = 'idle' | 'copied' | 'error'

interface ReferenceInfo {
  refCount: number
  idCount: number
  refPaths: string[]
}

interface ParsedTableResult {
  status: 'success' | 'error'
  message: string
  parsed: unknown | null
  flatRows: FlatRow[]
  flatColumns: string[]
  nestedRows: unknown[]
  references: ReferenceInfo
}

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

function xmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function rowsToExcelXml(rows: FlatRow[], columns: string[]): string {
  const headerXml = columns
    .map((column) => `<Cell><Data ss:Type="String">${xmlEscape(column)}</Data></Cell>`)
    .join('')

  const dataRowsXml = rows
    .map((row) => {
      const cells = columns
        .map((column) => `<Cell><Data ss:Type="String">${xmlEscape(row[column] ?? '')}</Data></Cell>`)
        .join('')
      return `<Row>${cells}</Row>`
    })
    .join('')

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="JSON Table">
    <Table>
      <Row>${headerXml}</Row>
      ${dataRowsXml}
    </Table>
  </Worksheet>
</Workbook>`
}

function downloadText(content: string, filename: string, mime: string, addBom = false) {
  const payload = addBom ? ['\uFEFF', content] : [content]
  const blob = new Blob(payload, { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function extractReferenceInfo(value: unknown): ReferenceInfo {
  const refPaths: string[] = []
  let idCount = 0
  const visited = new WeakSet<object>()

  const walk = (node: unknown, path: string) => {
    if (node === null || typeof node !== 'object') {
      return
    }

    if (visited.has(node)) {
      return
    }
    visited.add(node)

    if (Array.isArray(node)) {
      node.forEach((entry, index) => {
        const nextPath = path ? `${path}[${index}]` : `[${index}]`
        walk(entry, nextPath)
      })
      return
    }

    const record = node as Record<string, unknown>
    if (typeof record.$ref === 'string') {
      refPaths.push(path || '$')
    }
    if (typeof record.$id === 'string') {
      idCount += 1
    }

    for (const [key, child] of Object.entries(record)) {
      const nextPath = path ? `${path}.${key}` : key
      walk(child, nextPath)
    }
  }

  walk(value, '')

  return {
    refCount: refPaths.length,
    idCount,
    refPaths: refPaths.slice(0, 5),
  }
}

function parseSource(source: string): ParsedTableResult {
  try {
    const parsed = JSON.parse(source) as unknown
    const flatRows = jsonToFlatRows(parsed)
    const flatColumns = Array.from(new Set(flatRows.flatMap((row) => Object.keys(row))))
    const nestedRows = Array.isArray(parsed) ? parsed : [parsed]
    const references = extractReferenceInfo(parsed)

    return {
      status: 'success',
      message: '',
      parsed,
      flatRows,
      flatColumns,
      nestedRows,
      references,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON invalido.'
    return {
      status: 'error',
      message,
      parsed: null,
      flatRows: [],
      flatColumns: [],
      nestedRows: [],
      references: { refCount: 0, idCount: 0, refPaths: [] },
    }
  }
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fallback below
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  const success = document.execCommand('copy')
  document.body.removeChild(textarea)
  return success
}

function renderNestedValue(value: unknown): ReactNode {
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
          <table className="min-w-max border-collapse text-[11px]">
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
      <table className="min-w-max border-collapse text-[11px]">
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
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const deferredSource = useDeferredValue(source)
  const isProcessing = deferredSource !== source
  const parsedResult = useMemo<ParsedTableResult>(() => parseSource(deferredSource), [deferredSource])

  const flat = useMemo(
    () => ({ rows: parsedResult.flatRows, columns: parsedResult.flatColumns }),
    [parsedResult.flatColumns, parsedResult.flatRows],
  )

  const exportCsv = () => {
    if (flat.rows.length === 0) {
      return
    }
    const csv = rowsToCsv(flat.rows, flat.columns)
    downloadText(csv, 'json-table.csv', 'text/csv;charset=utf-8', true)
  }

  const exportExcel = () => {
    if (flat.rows.length === 0) {
      return
    }
    const excelXml = rowsToExcelXml(flat.rows, flat.columns)
    downloadText(excelXml, 'json-table.xls', 'application/vnd.ms-excel;charset=utf-8', true)
  }

  const copyFlatTable = async () => {
    if (flat.rows.length === 0) {
      return
    }

    const tsv = rowsToTsv(flat.rows, flat.columns)
    const success = await copyTextToClipboard(tsv)
    setCopyState(success ? 'copied' : 'error')
    window.setTimeout(() => setCopyState('idle'), 1800)
  }

  const nestedRows = parsedResult.nestedRows

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
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
          onClick={copyFlatTable}
          disabled={flat.rows.length === 0 || isProcessing}
        >
          <Copy className="size-3.5" />
          {copyState === 'copied'
            ? 'Copiado'
            : copyState === 'error'
              ? 'Error al copiar'
              : 'Copiar tabla'}
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
          onClick={exportCsv}
          disabled={flat.rows.length === 0 || isProcessing}
        >
          <FileText className="size-3.5" />
          Exportar CSV
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
          onClick={exportExcel}
          disabled={flat.rows.length === 0 || isProcessing}
        >
          <FileSpreadsheet className="size-3.5" />
          Exportar Excel
        </button>
        {parsedResult.status === 'success' ? (
          <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            refs: {parsedResult.references.refCount} · ids: {parsedResult.references.idCount}
          </span>
        ) : null}
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

        {isProcessing ? (
          <div className="flex items-center gap-2 rounded-2xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-sky-700/60 dark:bg-sky-950/30 dark:text-sky-300">
            <Loader2 className="size-4 animate-spin" />
            Procesando JSON y generando vista...
          </div>
        ) : null}

        {parsedResult.status === 'error' ? (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-700/60 dark:bg-rose-950/30 dark:text-rose-300">
            {parsedResult.message}
          </div>
        ) : mode === 'flat' ? (
          <div className="rounded-2xl border border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/70">
            <div className="border-b border-slate-300 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {flat.rows.length} fila(s) · {flat.columns.length} columna(s)
            </div>
            <div className="max-h-[55vh] overflow-x-auto overflow-y-auto overscroll-contain">
              <table className="min-w-max border-collapse text-xs">
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
            <div className="max-h-[55vh] overflow-x-auto overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white/60 dark:border-slate-700 dark:bg-slate-900/40">
              <table className="min-w-max border-collapse text-xs">
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
        Exportacion CSV/Excel y copiado usan el modo plano para mantener una matriz tabular compatible.
        {parsedResult.status === 'success' && parsedResult.references.refCount > 0
          ? ` Se detectaron referencias en: ${parsedResult.references.refPaths.join(', ')}.`
          : ''}
      </div>
    </section>
  )
}

