import { useMemo, useState } from 'react'
import { Copy, Eraser, Sparkles, TextCursorInput } from 'lucide-react'
import { convertCases } from '@/shared/lib/case-converter'
import { useToast } from '@/shared/ui/toast/ToastProvider'

const sampleInput = 'mi_texto-ejemplo HTTPServer'

export function CaseConverterTool() {
  const { showToast } = useToast()
  const [input, setInput] = useState(sampleInput)
  const output = useMemo(() => convertCases(input), [input])

  const copyValue = async (value: string) => {
    if (!value) {
      return
    }
    await navigator.clipboard.writeText(value)
    showToast('Copiado al portapapeles', { tone: 'success' })
  }

  const entries = Object.entries(output)

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <div className="mb-3">
        <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
          <TextCursorInput className="size-5" />
          Case Converter
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Convierte texto a camelCase, PascalCase, snake_case, kebab-case y otros formatos.
        </p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          onClick={() => setInput(sampleInput)}
        >
          <Sparkles className="size-3.5" />
          Usar ejemplo
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          onClick={() => setInput('')}
        >
          <Eraser className="size-3.5" />
          Limpiar
        </button>
      </div>

      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Entrada
        </span>
        <textarea
          className="min-h-[180px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
        />
      </label>

      <div className="mt-4 grid gap-2">
        {entries.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/70 md:grid-cols-[150px_minmax(0,1fr)_auto]"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <input
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 font-mono text-sm text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-950/70 dark:text-slate-100"
              readOnly
              value={value}
            />
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              onClick={() => void copyValue(value)}
            >
              <Copy className="size-3.5" />
              Copiar
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
