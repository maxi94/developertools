import { useMemo, useState } from 'react'
import { Copy, Download, FileCode2 } from 'lucide-react'
import { getI18nCopy } from '@/shared/i18n/catalog'
import { useI18n } from '@/shared/i18n/useI18n'

function minifySvg(raw: string): string {
  return raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function isValidSvg(raw: string): boolean {
  if (!raw.includes('<svg')) {
    return false
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(raw, 'image/svg+xml')
  return !doc.querySelector('parsererror') && !!doc.querySelector('svg')
}

export function SvgOptimizerTool() {
  const { language } = useI18n()
  const ui = getI18nCopy(language, 'svgOptimizer')
  const [input, setInput] = useState('')

  const result = useMemo(() => {
    if (!input.trim()) {
      return { status: 'empty' as const, minified: '', bytesSaved: 0 }
    }

    const minified = minifySvg(input)
    if (!isValidSvg(minified)) {
      return { status: 'error' as const, minified: '', bytesSaved: 0 }
    }

    return {
      status: 'success' as const,
      minified,
      bytesSaved: Math.max(0, input.length - minified.length),
    }
  }, [input])

  const previewSrc = useMemo(() => {
    if (result.status !== 'success') {
      return null
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(result.minified)}`
  }, [result])

  const downloadMinified = () => {
    if (result.status !== 'success') {
      return
    }
    const blob = new Blob([result.minified], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'optimized.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <FileCode2 className="size-5" />
        {ui.title}
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{ui.description}</p>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {ui.svgInput}
            </span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-[300px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            placeholder="<svg viewBox='0 0 24 24'>...</svg>"
            spellCheck={false}
          />
        </label>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {ui.result}
            </span>
            {result.status === 'success' ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                {result.bytesSaved} {ui.fewerChars}
              </span>
            ) : null}
          </div>

          {result.status === 'success' ? (
            <>
              <div className="rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-950/40">
                <img src={previewSrc ?? ''} alt={ui.previewAlt} className="mx-auto max-h-40 object-contain" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(result.minified)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
                >
                  <Copy className="size-3.5" />
                  {ui.copyMinified}
                </button>
                <button
                  type="button"
                  onClick={downloadMinified}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                >
                  <Download className="size-3.5" />
                  {ui.download}
                </button>
              </div>
              <textarea
                readOnly
                value={result.minified}
                className="min-h-[180px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
              />
            </>
          ) : (
            <div className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300">
              {result.status === 'error' ? ui.invalidSvg : ui.emptyState}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
