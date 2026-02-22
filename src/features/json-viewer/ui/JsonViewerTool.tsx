import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Braces, Expand, Minimize2, Network, Sparkles, X } from 'lucide-react'
import { parseAndFormatJson } from '@/shared/lib/json'
import type { AppLanguage } from '@/shared/i18n/config'
import { useI18n } from '@/shared/i18n/useI18n'
import { JsonCodeViewer } from '@/shared/ui/JsonCodeViewer'
import { JsonTreeViewer } from '@/shared/ui/JsonTreeViewer'

type UiCopy = {
  useSwaggerSample: string
  clear: string
  refs: string
  refsOn: string
  refsOff: string
  input: string
  normalized: string
  processing: string
  parseError: string
  stats: string
  nodeCount: string
  maxDepth: string
  fullscreen: string
  exitFullscreen: string
  fullscreenTitle: string
}

const uiCopy: Record<AppLanguage, UiCopy> = {
  es: {
    useSwaggerSample: 'Usar ejemplo Swagger',
    clear: 'Limpiar',
    refs: 'Refs',
    refsOn: 'ON',
    refsOff: 'OFF',
    input: 'Entrada JSON',
    normalized: 'JSON normalizado',
    processing: 'Procesando JSON...',
    parseError: 'Error al parsear JSON',
    stats: 'Resumen',
    nodeCount: 'Nodos',
    maxDepth: 'Profundidad max',
    fullscreen: 'Pantalla completa',
    exitFullscreen: 'Salir pantalla completa',
    fullscreenTitle: 'JSON normalizado ampliado',
  },
  en: {
    useSwaggerSample: 'Use Swagger sample',
    clear: 'Clear',
    refs: 'Refs',
    refsOn: 'ON',
    refsOff: 'OFF',
    input: 'JSON input',
    normalized: 'Normalized JSON',
    processing: 'Processing JSON...',
    parseError: 'JSON parse error',
    stats: 'Summary',
    nodeCount: 'Nodes',
    maxDepth: 'Max depth',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen',
    fullscreenTitle: 'Expanded normalized JSON',
  },
  pt: {
    useSwaggerSample: 'Usar exemplo Swagger',
    clear: 'Limpar',
    refs: 'Refs',
    refsOn: 'ON',
    refsOff: 'OFF',
    input: 'Entrada JSON',
    normalized: 'JSON normalizado',
    processing: 'Processando JSON...',
    parseError: 'Erro ao processar JSON',
    stats: 'Resumo',
    nodeCount: 'Nos',
    maxDepth: 'Profundidade max',
    fullscreen: 'Tela cheia',
    exitFullscreen: 'Sair tela cheia',
    fullscreenTitle: 'JSON normalizado ampliado',
  },
}

const swaggerSample = `{
  "openapi": "3.0.3",
  "info": {
    "title": "Developer Tools API",
    "version": "1.2.0"
  },
  "servers": [{ "url": "https://api.example.dev" }],
  "paths": {
    "/users": {
      "get": {
        "summary": "List users",
        "parameters": [
          { "name": "page", "in": "query", "schema": { "type": "integer", "minimum": 1 } }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/UserList" }
              }
            }
          }
        }
      }
    },
    "/users/{id}": {
      "get": {
        "summary": "Get user",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/User" }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "UserList": {
        "type": "object",
        "properties": {
          "items": {
            "type": "array",
            "items": { "$ref": "#/components/schemas/User" }
          },
          "total": { "type": "integer" }
        }
      },
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "active": { "type": "boolean" },
          "roles": {
            "type": "array",
            "items": { "type": "string" }
          },
          "profile": { "$ref": "#/components/schemas/Profile" }
        }
      },
      "Profile": {
        "$id": "Profile",
        "type": "object",
        "properties": {
          "age": { "type": "integer" },
          "country": { "type": "string" }
        }
      }
    }
  }
}`

function collectNodeStats(value: unknown, depth = 0): { nodeCount: number; maxDepth: number } {
  if (value === null || typeof value !== 'object') {
    return { nodeCount: 1, maxDepth: depth }
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { nodeCount: 1, maxDepth: depth }
    }
    return value.reduce(
      (acc, item) => {
        const child = collectNodeStats(item, depth + 1)
        return {
          nodeCount: acc.nodeCount + child.nodeCount,
          maxDepth: Math.max(acc.maxDepth, child.maxDepth),
        }
      },
      { nodeCount: 1, maxDepth: depth },
    )
  }
  const entries = Object.values(value as Record<string, unknown>)
  if (entries.length === 0) {
    return { nodeCount: 1, maxDepth: depth }
  }
  return entries.reduce<{ nodeCount: number; maxDepth: number }>(
    (acc, item) => {
      const child = collectNodeStats(item, depth + 1)
      return {
        nodeCount: acc.nodeCount + child.nodeCount,
        maxDepth: Math.max(acc.maxDepth, child.maxDepth),
      }
    },
    { nodeCount: 1, maxDepth: depth },
  )
}

function parseErrorDetails(raw: string, message: string) {
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

export function JsonViewerTool() {
  const { language } = useI18n()
  const t = uiCopy[language]
  const [source, setSource] = useState(swaggerSample)
  const [resolveRefs, setResolveRefs] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const deferredSource = useDeferredValue(source)
  const isProcessing = deferredSource !== source

  const output = useMemo(() => {
    try {
      const parsed = parseAndFormatJson(deferredSource, { resolveRefs })
      return {
        status: 'success' as const,
        parsed,
        formatted: JSON.stringify(parsed, null, 2),
        errorDetails: null,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t.parseError
      return {
        status: 'error' as const,
        parsed: null,
        formatted: message,
        errorDetails: parseErrorDetails(deferredSource, message),
      }
    }
  }, [deferredSource, resolveRefs, t.parseError])

  const stats = useMemo(() => {
    if (output.status !== 'success') {
      return null
    }
    return collectNodeStats(output.parsed)
  }, [output])

  useEffect(() => {
    if (!isFullscreen) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isFullscreen])

  return (
    <section className="grid gap-3">
      <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
        {isProcessing ? (
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{t.processing}</p>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-2">
          <label className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t.input}
              </span>
              <div className="inline-flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
                  onClick={() => setSource(swaggerSample)}
                >
                  <Sparkles className="size-3.5" />
                  {t.useSwaggerSample}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                  onClick={() => setSource('')}
                >
                  <X className="size-3.5" />
                  {t.clear}
                </button>
                <button
                  type="button"
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                    resolveRefs
                      ? 'border-blue-500 bg-blue-600 text-white dark:border-sky-400 dark:bg-sky-500 dark:text-slate-950'
                      : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                  onClick={() => setResolveRefs((state) => !state)}
                >
                  <Network className="size-3.5" />
                  {t.refs}
                  <span className="rounded bg-black/10 px-1.5 py-0.5 text-[10px] dark:bg-white/15">
                    {resolveRefs ? t.refsOn : t.refsOff}
                  </span>
                </button>
              </div>
            </div>
            <textarea
              className="min-h-[340px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 lg:min-h-[420px] dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              spellCheck={false}
            />
          </label>

          <section className="grid min-h-[340px] max-h-[68vh] grid-rows-[auto_1fr] gap-2 lg:min-h-[420px] lg:max-h-[72vh]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t.normalized}
              </span>
              <div className="inline-flex items-center gap-1.5">
                {output.status === 'success' && stats ? (
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                    <strong>{t.stats}:</strong> {t.nodeCount} {stats.nodeCount} | {t.maxDepth}{' '}
                    {stats.maxDepth}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
                  onClick={() => setIsFullscreen(true)}
                >
                  <Expand className="size-3.5" />
                  {t.fullscreen}
                </button>
              </div>
            </div>
            <div className="min-h-0 overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-600">
              <JsonCodeViewer
                value={output.formatted}
                status={output.status}
                showLineNumbers
                className="h-full"
              />
            </div>
          </section>
        </div>

        {output.status === 'error' && output.errorDetails ? (
          <section className="mt-3 rounded-xl border border-rose-300/70 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-700/60 dark:bg-rose-950/30 dark:text-rose-300">
            <p>
              {t.parseError}: linea {output.errorDetails.line}, columna {output.errorDetails.column}
            </p>
            <pre className="mt-2 overflow-x-auto rounded-md bg-white/70 p-2 font-mono text-[11px] dark:bg-black/20">
              {output.errorDetails.preview}
            </pre>
          </section>
        ) : null}
      </section>

      {output.status === 'success' ? (
        <section className="grid gap-2">
          <JsonTreeViewer
            data={output.parsed}
            title={`${t.refs}: ${resolveRefs ? t.refsOn : t.refsOff}`}
          />
        </section>
      ) : null}

      {isFullscreen ? (
        <div className="fixed inset-0 z-[130] bg-slate-950/70 p-3 backdrop-blur-sm md:p-6">
          <section className="grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Braces className="mr-1 inline size-4" />
                {t.fullscreenTitle}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
                onClick={() => setIsFullscreen(false)}
              >
                <Minimize2 className="size-3.5" />
                {t.exitFullscreen}
              </button>
            </header>
            <div className="min-h-0 overflow-hidden p-3">
              <JsonCodeViewer
                value={output.formatted}
                status={output.status}
                showLineNumbers
                className="h-full"
              />
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}
