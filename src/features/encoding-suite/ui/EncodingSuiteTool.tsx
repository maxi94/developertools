import { useMemo, useState } from 'react'
import { ArrowLeftRight, Binary, Copy } from 'lucide-react'
import { decodeValue, encodeValue, type EncodingMode } from '@/shared/lib/encoding-suite'
import { useToast } from '@/shared/ui/toast/ToastProvider'

const modeOptions: Array<{ id: EncodingMode; label: string }> = [
  { id: 'html', label: 'HTML' },
  { id: 'unicode', label: 'Unicode' },
  { id: 'hex', label: 'Hex' },
  { id: 'base64url', label: 'URL-safe Base64' },
]

export function EncodingSuiteTool() {
  const { showToast } = useToast()
  const [mode, setMode] = useState<EncodingMode>('html')
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('')

  const output = useMemo(() => {
    if (!input) {
      return { status: 'empty' as const, value: '' }
    }

    try {
      const value = direction === 'encode' ? encodeValue(mode, input) : decodeValue(mode, input)
      return { status: 'success' as const, value }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo procesar el contenido.'
      return { status: 'error' as const, value: message }
    }
  }, [direction, input, mode])

  const copyOutput = async () => {
    if (output.status === 'success') {
      await navigator.clipboard.writeText(output.value)
      showToast('Salida copiada', { tone: 'success' })
    }
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <Binary className="size-5" />
        Encoder/Decoder extra
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Codifica o decodifica HTML, Unicode escapes, Hex y URL-safe Base64.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {modeOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
              mode === option.id
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'
            }`}
            onClick={() => setMode(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
            direction === 'encode'
              ? 'border-blue-500 bg-blue-600 text-white'
              : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'
          }`}
          onClick={() => setDirection('encode')}
        >
          Codificar
        </button>
        <button
          type="button"
          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
            direction === 'decode'
              ? 'border-blue-500 bg-blue-600 text-white'
              : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'
          }`}
          onClick={() => setDirection('decode')}
        >
          Decodificar
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          onClick={() => {
            setInput(output.status === 'success' ? output.value : '')
            setDirection((current) => (current === 'encode' ? 'decode' : 'encode'))
            showToast('Entrada y modo intercambiados', { tone: 'info' })
          }}
        >
          <ArrowLeftRight className="size-3.5" /> Intercambiar
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          onClick={copyOutput}
        >
          <Copy className="size-3.5" /> Copiar
        </button>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <textarea
          className="min-h-[240px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
        />
        <textarea
          className="min-h-[240px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none data-[status=error]:border-rose-500 data-[status=error]:text-rose-600 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:data-[status=error]:text-rose-300"
          value={output.value}
          readOnly
          spellCheck={false}
          data-status={output.status}
        />
      </div>
    </section>
  )
}

