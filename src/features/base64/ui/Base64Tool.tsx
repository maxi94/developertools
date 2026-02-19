import { useMemo, useState } from 'react'
import { ArrowLeftRight, Binary, Copy } from 'lucide-react'
import { decodeBase64, encodeBase64 } from '@/shared/lib/base64'

export function Base64Tool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const output = useMemo(() => {
    if (!input.trim()) {
      return { status: 'empty' as const, value: '' }
    }

    try {
      return {
        status: 'success' as const,
        value: mode === 'encode' ? encodeBase64(input) : decodeBase64(input),
      }
    } catch {
      return { status: 'error' as const, value: 'Entrada invalida para Base64.' }
    }
  }, [input, mode])

  const copyOutput = async () => {
    if (output.status === 'success' && output.value) {
      await navigator.clipboard.writeText(output.value)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
          <Binary className="size-5" />
          Base64 Texto
        </h2>
        <div className="inline-flex rounded-xl border border-slate-300 p-1 dark:border-slate-600">
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-xs font-semibold ${
              mode === 'encode' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
            onClick={() => setMode('encode')}
          >
            Codificar
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-xs font-semibold ${
              mode === 'decode' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
            onClick={() => setMode('decode')}
          >
            Decodificar
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          onClick={() => {
            setInput(output.status === 'success' ? output.value : '')
            setMode((current) => (current === 'encode' ? 'decode' : 'encode'))
          }}
        >
          <ArrowLeftRight className="size-3.5" />
          Intercambiar
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
            Entrada
          </span>
          <textarea
            className="min-h-[280px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Salida
          </span>
          <textarea
            className="min-h-[280px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none transition data-[status=error]:border-rose-500 data-[status=error]:text-rose-600 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:data-[status=error]:text-rose-300"
            value={output.value}
            readOnly
            spellCheck={false}
            data-status={output.status}
          />
        </label>
      </div>
    </section>
  )
}
