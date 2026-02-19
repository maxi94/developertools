import { useMemo, useState } from 'react'
import { Copy, Palette } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'

interface RgbColor {
  r: number
  g: number
  b: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function rgbToHex({ r, g, b }: RgbColor): string {
  return `#${[r, g, b].map((part) => part.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

function rgbToHsl({ r, g, b }: RgbColor): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case rn:
        h = ((gn - bn) / delta) % 6
        break
      case gn:
        h = (bn - rn) / delta + 2
        break
      default:
        h = (rn - gn) / delta + 4
        break
    }
  }

  return {
    h: Math.round((h * 60 + 360) % 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function hslToRgb(h: number, s: number, l: number): RgbColor {
  const hn = ((h % 360) + 360) % 360
  const sn = clamp(s, 0, 100) / 100
  const ln = clamp(l, 0, 100) / 100

  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1))
  const m = ln - c / 2

  let rn = 0
  let gn = 0
  let bn = 0

  if (hn < 60) {
    rn = c
    gn = x
  } else if (hn < 120) {
    rn = x
    gn = c
  } else if (hn < 180) {
    gn = c
    bn = x
  } else if (hn < 240) {
    gn = x
    bn = c
  } else if (hn < 300) {
    rn = x
    bn = c
  } else {
    rn = c
    bn = x
  }

  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  }
}

function parseColor(input: string): RgbColor | null {
  const value = input.trim()
  if (!value) {
    return null
  }

  const hex = value.replace('#', '')
  if (/^[\da-f]{3}$/i.test(hex)) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    }
  }
  if (/^[\da-f]{6}$/i.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    }
  }

  const rgbMatch = value.match(
    /^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})(?:\s*[,/]\s*(?:\d*\.?\d+))?\s*\)$/i,
  )
  if (rgbMatch) {
    return {
      r: clamp(Number(rgbMatch[1]), 0, 255),
      g: clamp(Number(rgbMatch[2]), 0, 255),
      b: clamp(Number(rgbMatch[3]), 0, 255),
    }
  }

  const hslMatch = value.match(
    /^hsla?\(\s*(-?\d*\.?\d+)\s*[, ]\s*(-?\d*\.?\d+)%\s*[, ]\s*(-?\d*\.?\d+)%(?:\s*[,/]\s*(?:\d*\.?\d+))?\s*\)$/i,
  )
  if (hslMatch) {
    return hslToRgb(Number(hslMatch[1]), Number(hslMatch[2]), Number(hslMatch[3]))
  }

  return null
}

function relativeLuminance(color: RgbColor): number {
  const toLinear = (channel: number) => {
    const v = channel / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * toLinear(color.r) + 0.7152 * toLinear(color.g) + 0.0722 * toLinear(color.b)
}

function contrastRatio(foreground: RgbColor, background: RgbColor): number {
  const l1 = relativeLuminance(foreground)
  const l2 = relativeLuminance(background)
  const light = Math.max(l1, l2)
  const dark = Math.min(l1, l2)
  return (light + 0.05) / (dark + 0.05)
}

function ColorField({
  label,
  value,
  onTextChange,
  onPickerChange,
}: {
  label: string
  value: string
  onTextChange: (value: string) => void
  onPickerChange: (hex: string) => void
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[\da-f]{6}$/i.test(value) ? value : '#000000'}
          onChange={(event) => onPickerChange(event.target.value.toUpperCase())}
          className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-600 dark:bg-slate-900"
        />
        <input
          value={value}
          onChange={(event) => onTextChange(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          spellCheck={false}
        />
      </div>
    </label>
  )
}

export function ColorToolsTool() {
  const { language } = useI18n()
  const isEnglish = language === 'en'
  const [colorInput, setColorInput] = useState('#22C55E')
  const [foregroundInput, setForegroundInput] = useState('#0F172A')
  const [backgroundInput, setBackgroundInput] = useState('#F8FAFC')

  const parsedColor = useMemo(() => parseColor(colorInput), [colorInput])
  const foreground = useMemo(() => parseColor(foregroundInput), [foregroundInput])
  const background = useMemo(() => parseColor(backgroundInput), [backgroundInput])
  const ratio = useMemo(
    () => (foreground && background ? contrastRatio(foreground, background) : null),
    [foreground, background],
  )

  const colorFormats = useMemo(() => {
    if (!parsedColor) {
      return null
    }
    const hsl = rgbToHsl(parsedColor)
    return {
      hex: rgbToHex(parsedColor),
      rgb: `rgb(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    }
  }, [parsedColor])

  const wcag = useMemo(() => {
    if (!ratio) {
      return null
    }
    return {
      normalAA: ratio >= 4.5,
      normalAAA: ratio >= 7,
      largeAA: ratio >= 3,
      largeAAA: ratio >= 4.5,
    }
  }, [ratio])

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <Palette className="size-5" />
        {isEnglish ? 'Color Tools' : 'Herramientas de color'}
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {isEnglish
          ? 'HEX/RGB/HSL conversion + WCAG contrast checker with live preview.'
          : 'Conversion HEX/RGB/HSL + contrast checker WCAG con preview real.'}
      </p>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <section className="grid gap-3 rounded-2xl border border-slate-300/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
          <ColorField
            label={isEnglish ? 'Base color (HEX/RGB/HSL)' : 'Color base (HEX/RGB/HSL)'}
            value={colorInput}
            onTextChange={setColorInput}
            onPickerChange={setColorInput}
          />

          <div
            className="h-28 rounded-xl border border-slate-300/70 shadow-inner dark:border-slate-600"
            style={{
              background: colorFormats?.hex
                ? `linear-gradient(135deg, ${colorFormats.hex}, rgba(255,255,255,0.25))`
                : 'repeating-linear-gradient(45deg,#f1f5f9,#f1f5f9 10px,#e2e8f0 10px,#e2e8f0 20px)',
            }}
          />

          {colorFormats ? (
            <div className="grid gap-2 text-xs">
              {Object.entries(colorFormats).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900"
                >
                  <span className="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {label}
                  </span>
                  <div className="inline-flex items-center gap-1.5">
                    <code className="font-mono text-slate-700 dark:text-slate-200">{value}</code>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(value)}
                      className="inline-flex size-6 items-center justify-center rounded border border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:text-slate-300 dark:hover:border-sky-400 dark:hover:text-sky-300"
                      aria-label={`Copiar ${label}`}
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">
              {isEnglish ? 'Invalid color. Use HEX, RGB or HSL.' : 'Color invalido. Usa HEX, RGB o HSL.'}
            </p>
          )}
        </section>

        <section className="grid gap-3 rounded-2xl border border-slate-300/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {isEnglish ? 'Contrast checker (WCAG)' : 'Validador de contraste (WCAG)'}
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <ColorField
              label={isEnglish ? 'Foreground' : 'Texto'}
              value={foregroundInput}
              onTextChange={setForegroundInput}
              onPickerChange={setForegroundInput}
            />
            <ColorField
              label={isEnglish ? 'Background' : 'Fondo'}
              value={backgroundInput}
              onTextChange={setBackgroundInput}
              onPickerChange={setBackgroundInput}
            />
          </div>

          <div
            className="grid min-h-[190px] place-items-center rounded-xl border border-slate-300/70 p-5 dark:border-slate-600"
            style={{
              color: foreground ? rgbToHex(foreground) : undefined,
              backgroundColor: background ? rgbToHex(background) : undefined,
            }}
          >
            <div className="max-w-md text-center">
              <p className="text-lg font-semibold">Aa</p>
              <p className="mt-1 text-sm font-semibold">
                {isEnglish
                  ? 'The quick brown fox jumps over the lazy dog.'
                  : 'Texto de prueba para validar legibilidad y contraste.'}
              </p>
              <p className="mt-1 text-xs">0123456789 !@#$%^&*</p>
            </div>
          </div>

          {ratio && wcag ? (
            <div className="grid gap-1.5 text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Ratio: {ratio.toFixed(2)}:1</p>
              <p className="text-slate-600 dark:text-slate-300">
                AA normal: {wcag.normalAA ? 'Pass' : 'Fail'} | AAA normal: {wcag.normalAAA ? 'Pass' : 'Fail'}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                AA large: {wcag.largeAA ? 'Pass' : 'Fail'} | AAA large: {wcag.largeAAA ? 'Pass' : 'Fail'}
              </p>
            </div>
          ) : (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">
              {isEnglish
                ? 'Enter valid colors to compute contrast.'
                : 'Ingresa colores validos para calcular contraste.'}
            </p>
          )}
        </section>
      </div>
    </section>
  )
}
