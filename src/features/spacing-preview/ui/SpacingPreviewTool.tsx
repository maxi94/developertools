import { useMemo, useState } from 'react'
import { Copy, Ruler } from 'lucide-react'
import { getI18nCopy } from '@/shared/i18n/catalog'
import { useI18n } from '@/shared/i18n/useI18n'

export function SpacingPreviewTool() {
  const { language } = useI18n()
  const ui = getI18nCopy(language, 'spacingPreview')
  const [radius, setRadius] = useState(16)
  const [padding, setPadding] = useState(20)
  const [margin, setMargin] = useState(24)
  const [gap, setGap] = useState(12)

  const safeMargin = Math.min(48, margin)

  const cssOutput = useMemo(
    () =>
      [
        `border-radius: ${radius}px;`,
        `padding: ${padding}px;`,
        `margin: ${margin}px;`,
        `gap: ${gap}px;`,
      ].join('\n'),
    [gap, margin, padding, radius],
  )

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <Ruler className="size-5" />
        {ui.title}
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{ui.description}</p>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <section className="grid gap-3 rounded-2xl border border-slate-300/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
          {[
            { label: 'Border radius', value: radius, set: setRadius, min: 0, max: 72 },
            { label: 'Padding', value: padding, set: setPadding, min: 0, max: 72 },
            { label: 'Margin', value: margin, set: setMargin, min: 0, max: 80 },
            { label: 'Gap', value: gap, set: setGap, min: 0, max: 48 },
          ].map((item) => (
            <label key={item.label} className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {item.label}: {item.value}px
              </span>
              <input
                type="range"
                min={item.min}
                max={item.max}
                value={item.value}
                onChange={(event) => item.set(Number(event.target.value))}
              />
            </label>
          ))}
        </section>

        <section className="grid gap-3 rounded-2xl border border-slate-300/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="rounded-xl border border-slate-300/80 bg-slate-100 p-3 sm:p-4 dark:border-slate-700 dark:bg-slate-950/45">
            <div className="grid min-h-[240px] place-items-center rounded-xl border border-dashed border-slate-300 bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:20px_20px] p-3 sm:min-h-[360px] sm:p-6 dark:border-slate-700">
              <div className="w-full max-w-[620px]">
                <div
                  className="rounded-2xl border border-cyan-300/70 bg-cyan-50/60 p-3 dark:border-cyan-500/35 dark:bg-cyan-950/20"
                  style={{ padding: `${safeMargin}px` }}
                >
                  <div
                    className="mx-auto border border-cyan-300/70 bg-white/95 shadow-sm dark:border-cyan-500/40 dark:bg-slate-900/85"
                    style={{ borderRadius: `${radius}px`, padding: `${padding}px` }}
                  >
                    <div className="grid" style={{ gap: `${gap}px` }}>
                      <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                        {ui.headerBlock}
                      </div>
                      <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                        {ui.contentBlock}
                      </div>
                      <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                        {ui.footerBlock}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start">
            <textarea
              readOnly
              value={cssOutput}
              className="min-h-24 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(cssOutput)}
              className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 sm:w-auto dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
            >
              <Copy className="size-3.5" />
              {ui.copy}
            </button>
          </div>
        </section>
      </div>
    </section>
  )
}
