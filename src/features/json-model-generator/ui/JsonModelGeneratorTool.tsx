import { useMemo, useState } from 'react'
import { Copy, FileCode2, Sparkles } from 'lucide-react'
import { generateModelFromJson, type ModelLanguage } from '@/shared/lib/json-model'

const sampleJson = `{
  "id": 1,
  "name": "Matti",
  "active": true,
  "tags": ["dev", "tools"],
  "profile": {
    "country": "AR"
  }
}`

const languageOptions: Array<{ value: ModelLanguage; label: string }> = [
  { value: 'csharp', label: 'C#' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
]

export function JsonModelGeneratorTool() {
  const [source, setSource] = useState(sampleJson)
  const [language, setLanguage] = useState<ModelLanguage>('csharp')
  const [rootName, setRootName] = useState('RootModel')

  const result = useMemo(() => {
    if (!source.trim()) {
      return { status: 'empty' as const, value: '' }
    }

    try {
      return {
        status: 'success' as const,
        value: generateModelFromJson(source, language, { rootName }),
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'JSON invalido.'
      return { status: 'error' as const, value: message }
    }
  }, [source, language, rootName])

  const copyOutput = async () => {
    if (result.status === 'success' && result.value) {
      await navigator.clipboard.writeText(result.value)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
          <FileCode2 className="size-5" />
          JSON a clases
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
            value={rootName}
            onChange={(event) => setRootName(event.target.value)}
            placeholder="Nombre raiz"
          />
          <select
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
            value={language}
            onChange={(event) => setLanguage(event.target.value as ModelLanguage)}
          >
            {languageOptions.map((option) => (
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
          onClick={() => setSource(sampleJson)}
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
            JSON de entrada
          </span>
          <textarea
            className="min-h-[320px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Clase generada
          </span>
          <textarea
            className="min-h-[320px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none data-[status=error]:border-rose-500 data-[status=error]:text-rose-600 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:data-[status=error]:text-rose-300"
            value={result.value}
            readOnly
            spellCheck={false}
            data-status={result.status}
          />
        </label>
      </div>
    </section>
  )
}
