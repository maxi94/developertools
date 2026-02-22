import { useMemo, useState } from 'react'
import { Copy, Layers } from 'lucide-react'
import { getI18nCopy } from '@/shared/i18n/catalog'
import { useI18n } from '@/shared/i18n/useI18n'

function toCssColor(hex: string, opacity: number): string {
  const clean = hex.replace('#', '')
  if (!/^[\da-f]{6}$/i.test(clean)) {
    return `rgba(15,23,42,${opacity})`
  }

  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function BoxShadowGeneratorTool() {
  const { language } = useI18n()
  const ui = getI18nCopy(language, 'boxShadowGenerator')
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(18)
  const [blur, setBlur] = useState(34)
  const [spread, setSpread] = useState(-10)
  const [opacity, setOpacity] = useState(0.24)
  const [radius, setRadius] = useState(20)
  const [colorHex, setColorHex] = useState('#0F172A')
  const [inset, setInset] = useState(false)

  const shadowValue = useMemo(() => {
    const color = toCssColor(colorHex, opacity)
    return `${inset ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`
  }, [blur, colorHex, inset, offsetX, offsetY, opacity, spread])

  const cssOutput = useMemo(
    () => [`box-shadow: ${shadowValue};`, `border-radius: ${radius}px;`].join('\n'),
    [radius, shadowValue],
  )

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <Layers className="size-5" />
        {ui.title}
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {ui.description}
      </p>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <section className="grid gap-3 rounded-2xl border border-slate-300/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
          {[
            { label: 'Offset X', value: offsetX, set: setOffsetX, min: -120, max: 120 },
            { label: 'Offset Y', value: offsetY, set: setOffsetY, min: -120, max: 120 },
            { label: 'Blur', value: blur, set: setBlur, min: 0, max: 220 },
            { label: 'Spread', value: spread, set: setSpread, min: -80, max: 120 },
            { label: 'Radius', value: radius, set: setRadius, min: 0, max: 64 },
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

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Opacity: {opacity.toFixed(2)}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={opacity}
              onChange={(event) => setOpacity(Number(event.target.value))}
            />
          </label>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
            <input
              type="color"
              value={colorHex}
              onChange={(event) => setColorHex(event.target.value.toUpperCase())}
              className="h-10 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-600 dark:bg-slate-900"
            />
            <input
              value={colorHex}
              onChange={(event) => setColorHex(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={inset}
              onChange={(event) => setInset(event.target.checked)}
            />
            {ui.inset}
          </label>
        </section>

        <section className="grid gap-3 rounded-2xl border border-slate-300/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="rounded-xl border border-slate-300/80 bg-slate-100 p-3 sm:p-4 dark:border-slate-700 dark:bg-slate-950/45">
            <div className="grid min-h-[240px] place-items-center rounded-xl border border-dashed border-slate-300 bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.18),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(148,163,184,0.15),transparent_42%)] p-4 sm:min-h-[360px] sm:p-12 dark:border-slate-700">
              <div className="flex w-full justify-center overflow-visible">
                <div
                  className="grid h-36 w-full max-w-[420px] place-items-center border border-white/70 bg-white px-2 text-center text-sm font-semibold text-slate-700 transition-all sm:h-44 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  style={{ boxShadow: shadowValue, borderRadius: `${radius}px` }}
                >
                  {ui.preview}
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
