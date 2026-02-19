import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Copy,
  Download,
  Eraser,
  Expand,
  FileSpreadsheet,
  FileText,
  Minimize2,
  Network,
  Sparkles,
  WrapText,
  ListOrdered,
  X,
} from 'lucide-react'
import { parseAndFormatJson, sortJsonKeysDeep } from '@/shared/lib/json'
import { JsonCodeViewer } from '@/shared/ui/JsonCodeViewer'
import { JsonTreeViewer } from '@/shared/ui/JsonTreeViewer'
import { useToast } from '@/shared/ui/toast/ToastProvider'

const sample = `{
  "definiciones": {
    "usuarioBase": {
      "$id": "UsuarioBase",
      "nombre": "Matti",
      "rol": "developer",
      "permisos": ["read", "write"]
    }
  },
  "usuario": {
    "$ref": "UsuarioBase",
    "equipo": "tools"
  }
}`

function flattenToRow(value: unknown, prefix = '', row: Record<string, string> = {}): Record<string, string> {
  if (value === null || value === undefined) {
    row[prefix || 'value'] = ''
    return row
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      row[prefix || 'value'] = ''
      return row
    }

    value.forEach((item, index) => {
      const path = prefix ? `${prefix}[${index}]` : `[${index}]`
      flattenToRow(item, path, row)
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
      const path = prefix ? `${prefix}.${key}` : key
      flattenToRow(child, path, row)
    })
    return row
  }

  row[prefix || 'value'] = String(value)
  return row
}

function jsonToRows(data: unknown): Array<Record<string, string>> {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return []
    }
    return data.map((item) => flattenToRow(item))
  }

  if (data && typeof data === 'object') {
    return [flattenToRow(data)]
  }

  return [{ value: String(data ?? '') }]
}

function escapeCsvCell(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

function rowsToCsv(rows: Array<Record<string, string>>): string {
  if (rows.length === 0) {
    return ''
  }

  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
  const lines = [headers.join(',')]

  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsvCell(row[header] ?? '')).join(','))
  }

  return lines.join('\n')
}

function rowsToTsv(rows: Array<Record<string, string>>): string {
  if (rows.length === 0) {
    return ''
  }

  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
  const lines = [headers.join('\t')]

  for (const row of rows) {
    lines.push(headers.map((header) => (row[header] ?? '').replaceAll('\t', ' ')).join('\t'))
  }

  return lines.join('\n')
}

function downloadTextFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function JsonFormatterTool() {
  const { showToast } = useToast()
  const [source, setSource] = useState(sample)
  const [resolveRefs, setResolveRefs] = useState(true)
  const [isOutputMinified, setIsOutputMinified] = useState(false)
  const [isOutputFullscreen, setIsOutputFullscreen] = useState(false)
  const [wrapLines, setWrapLines] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const deferredSource = useDeferredValue(source)
  const isProcessing = deferredSource !== source

  const parseErrorDetails = (raw: string, message: string) => {
    const match = message.match(/position\s+(\d+)/i)
    if (!match) {
      return null
    }

    const position = Number(match[1])
    if (!Number.isFinite(position) || position < 0) {
      return null
    }

    const before = raw.slice(0, position)
    const line = before.split('\n').length
    const column = position - before.lastIndexOf('\n')
    const lines = raw.split('\n')
    const lineContent = lines[line - 1] ?? ''
    const pointer = `${' '.repeat(Math.max(0, column - 1))}^`
    return { line, column, preview: `${lineContent}\n${pointer}` }
  }

  const output = useMemo(() => {
    try {
      const parsed = parseAndFormatJson(deferredSource, { resolveRefs })
      return {
        status: 'success' as const,
        formatted: JSON.stringify(parsed, null, isOutputMinified ? 0 : 2),
        parsed,
        errorDetails: null,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'JSON invalido.'
      const errorDetails = parseErrorDetails(deferredSource, message)
      return {
        status: 'error' as const,
        formatted: message,
        parsed: null,
        errorDetails,
      }
    }
  }, [deferredSource, isOutputMinified, resolveRefs])

  const notify = (tone: 'success' | 'error', message: string) => {
    showToast(message, { tone })
  }

  useEffect(() => {
    if (!isOutputFullscreen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOutputFullscreen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOutputFullscreen])

  const copyOutput = async () => {
    if (!output.formatted.trim()) {
      return
    }
    await navigator.clipboard.writeText(output.formatted)
    notify('success', 'Salida copiada')
  }

  const downloadOutput = () => {
    if (!output.formatted.trim()) {
      return
    }
    downloadTextFile(output.formatted, 'json-output.json', 'application/json;charset=utf-8')
    notify('success', 'Archivo JSON descargado')
  }

  const exportCsv = () => {
    if (output.status !== 'success' || output.parsed === null) {
      notify('error', 'No hay JSON valido para exportar')
      return
    }

    const rows = jsonToRows(output.parsed)
    if (rows.length === 0) {
      notify('error', 'No hay filas para exportar')
      return
    }

    const csv = rowsToCsv(rows)
    downloadTextFile(csv, 'json-export.csv', 'text/csv;charset=utf-8')
    notify('success', 'CSV exportado')
  }

  const exportExcel = () => {
    if (output.status !== 'success' || output.parsed === null) {
      notify('error', 'No hay JSON valido para exportar')
      return
    }

    const rows = jsonToRows(output.parsed)
    if (rows.length === 0) {
      notify('error', 'No hay filas para exportar')
      return
    }

    const tsv = rowsToTsv(rows)
    downloadTextFile(tsv, 'json-export.xls', 'application/vnd.ms-excel;charset=utf-8')
    notify('success', 'Archivo Excel exportado')
  }

  const minifySource = () => {
    try {
      const parsed = parseAndFormatJson(source, { resolveRefs: false })
      setSource(JSON.stringify(parsed))
      notify('success', 'Entrada minificada')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'No se pudo minificar entrada')
    }
  }

  const sortSourceKeys = () => {
    try {
      const parsed = parseAndFormatJson(source, { resolveRefs: false })
      setSource(JSON.stringify(sortJsonKeysDeep(parsed), null, 2))
      notify('success', 'Claves ordenadas')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'No se pudo ordenar')
    }
  }

  const validateSource = () => {
    try {
      parseAndFormatJson(source, { resolveRefs: false })
      notify('success', 'JSON valido')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'JSON invalido')
    }
  }

  return (
    <section className="grid gap-3">
      <section
        className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40"
        aria-label="Formateador JSON"
      >
        <div className="mb-3">
          <h2 className="m-0 text-xl font-semibold">Formateador JSON</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            La entrada y salida permanecen en tu navegador. Soporta ref/$ref y referencias por $id.
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
            Resolver referencias (ref/$ref/$id): {resolveRefs ? 'Activo' : 'Inactivo'}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
            onClick={validateSource}
          >
            <CheckCircle2 className="size-3.5" />
            Validar
          </button>
        </div>

        {isProcessing ? (
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Procesando JSON...</p>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-2">
          <label className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Entrada
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                  onClick={sortSourceKeys}
                >
                  <Sparkles className="size-3.5" />
                  Ordenar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-violet-400 hover:text-violet-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-400 dark:hover:text-violet-300"
                  onClick={minifySource}
                >
                  <Minimize2 className="size-3.5" />
                  Minificar
                </button>
              </div>
            </div>
            <textarea
              className="min-h-[320px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              spellCheck={false}
              aria-label="Entrada JSON"
            />
          </label>

          <label className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Salida
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-violet-400 hover:text-violet-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-400 dark:hover:text-violet-300"
                  onClick={() => setIsOutputMinified((value) => !value)}
                >
                  <Minimize2 className="size-3.5" />
                  {isOutputMinified ? 'Expandir' : 'Minificar'}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                  onClick={() => setWrapLines((value) => !value)}
                >
                  <WrapText className="size-3.5" />
                  {wrapLines ? 'No wrap' : 'Wrap'}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                  onClick={() => setShowLineNumbers((value) => !value)}
                >
                  <ListOrdered className="size-3.5" />
                  {showLineNumbers ? 'Sin lineas' : 'Lineas'}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
                  onClick={copyOutput}
                >
                  <Copy className="size-3.5" />
                  Copiar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
                  onClick={downloadOutput}
                >
                  <Download className="size-3.5" />
                  Descargar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
                  onClick={() => setIsOutputFullscreen(true)}
                >
                  <Expand className="size-3.5" />
                  Expandir
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                  onClick={exportCsv}
                >
                  <FileText className="size-3.5" />
                  CSV
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                  onClick={exportExcel}
                >
                  <FileSpreadsheet className="size-3.5" />
                  Excel
                </button>
              </div>
            </div>
            <div className="min-h-[320px] overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-600">
              <JsonCodeViewer
                value={output.formatted}
                status={output.status}
                wrapLines={wrapLines}
                showLineNumbers={showLineNumbers}
              />
            </div>
          </label>
        </div>
        {output.status === 'error' && output.errorDetails ? (
          <section className="mt-3 rounded-xl border border-rose-300/70 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-700/60 dark:bg-rose-950/30 dark:text-rose-300">
            <p>
              Error en linea {output.errorDetails.line}, columna {output.errorDetails.column}
            </p>
            <pre className="mt-2 overflow-x-auto rounded-md bg-white/70 p-2 font-mono text-[11px] dark:bg-black/20">
              {output.errorDetails.preview}
            </pre>
          </section>
        ) : null}
      </section>

      {output.status === 'success' ? (
        <JsonTreeViewer
          data={output.parsed}
          title={`Visualizador JSON (${resolveRefs ? 'refs resueltas' : 'refs sin resolver'})`}
        />
      ) : null}

      {isOutputFullscreen ? (
        <div className="fixed inset-0 z-[130] bg-slate-950/70 p-3 backdrop-blur-sm md:p-6">
          <section className="grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Salida JSON ampliada
              </p>
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                  onClick={() => setWrapLines((value) => !value)}
                >
                  <WrapText className="size-3.5" />
                  {wrapLines ? 'No wrap' : 'Wrap'}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                  onClick={() => setShowLineNumbers((value) => !value)}
                >
                  <ListOrdered className="size-3.5" />
                  {showLineNumbers ? 'Sin lineas' : 'Lineas'}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
                  onClick={copyOutput}
                >
                  <Copy className="size-3.5" />
                  Copiar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
                  onClick={() => setIsOutputFullscreen(false)}
                >
                  <X className="size-3.5" />
                  Cerrar
                </button>
              </div>
            </header>
            <div className="min-h-0">
              <JsonCodeViewer
                value={output.formatted}
                status={output.status}
                wrapLines={wrapLines}
                showLineNumbers={showLineNumbers}
                className="h-full"
              />
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}
