import { useEffect, useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import { base64ToBlob, parseBase64Entries } from '@/shared/lib/base64'

interface PdfItem {
  id: string
  url: string
  filename: string
}

function toPdfItems(rawInput: string): {
  status: 'empty' | 'error' | 'success'
  message?: string
  items: PdfItem[]
} {
  if (!rawInput.trim()) {
    return { status: 'empty', items: [] }
  }

  try {
    const entries = parseBase64Entries(rawInput)
    if (entries.length === 0) {
      return { status: 'empty', items: [] }
    }

    const items = entries.map((entry, index) => {
      const blob = base64ToBlob(entry.value, 'application/pdf')

      return {
        id: `pdf-${index + 1}`,
        url: URL.createObjectURL(blob),
        filename: `archivo-${index + 1}.pdf`,
      }
    })

    return { status: 'success', items }
  } catch {
    return {
      status: 'error',
      message: 'Entrada invalida. Usa string unico, data URL, una por linea, o array JSON.',
      items: [],
    }
  }
}

export function Base64PdfTool() {
  const [input, setInput] = useState('')

  const result = useMemo(() => toPdfItems(input), [input])

  useEffect(() => {
    if (result.status !== 'success') {
      return
    }

    return () => {
      result.items.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [result])

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <FileText className="size-5" />
        Base64 a PDF
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Soporta un PDF o multiples. Formatos: una cadena por linea, data URL o array JSON.
      </p>

      <textarea
        className="mt-3 min-h-[180px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        spellCheck={false}
        placeholder='Ejemplo: ["data:application/pdf;base64,...", "..."]'
      />

      {result.status === 'error' ? (
        <p className="mt-3 rounded-xl border border-rose-400/40 bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
          {result.message}
        </p>
      ) : null}

      {result.status === 'success' ? (
        <div className="mt-4 grid gap-3">
          {result.items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-300/70 bg-white p-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <iframe
                src={item.url}
                title={item.filename}
                className="h-[52vh] min-h-[260px] w-full rounded-md border-0 sm:h-[360px]"
              />
              <a
                href={item.url}
                download={item.filename}
                className="mt-2 inline-block text-xs font-semibold text-blue-700 hover:underline dark:text-sky-300"
              >
                Descargar {item.filename}
              </a>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
