import { useMemo, useState } from 'react'
import { Clock3 } from 'lucide-react'
import { convertDateTime } from '@/shared/lib/datetime'

const timezoneOptions = [
  'UTC',
  'America/Argentina/Buenos_Aires',
  'America/New_York',
  'Europe/Madrid',
  'Asia/Tokyo',
]

export function DateTimeTools() {
  const [value, setValue] = useState('')
  const [fromTimeZone, setFromTimeZone] = useState('UTC')
  const [toTimeZone, setToTimeZone] = useState('America/Argentina/Buenos_Aires')

  const result = useMemo(() => {
    try {
      return { status: 'success' as const, value: convertDateTime(value, fromTimeZone, toTimeZone) }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo convertir la fecha.'
      return { status: 'error' as const, value: message }
    }
  }, [fromTimeZone, toTimeZone, value])

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <Clock3 className="size-5" />
        DateTime tools
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Conversor de timezone, Unix timestamp e ISO formatter.
      </p>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <input
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          placeholder="YYYY-MM-DDTHH:mm:ssZ (vacío = ahora)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck={false}
        />
        <select
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          value={fromTimeZone}
          onChange={(e) => setFromTimeZone(e.target.value)}
        >
          {timezoneOptions.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          value={toTimeZone}
          onChange={(e) => setToTimeZone(e.target.value)}
        >
          {timezoneOptions.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {result.status === 'success' ? (
        <div className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-200">
          <p>
            <strong>ISO:</strong> {result.value.iso}
          </p>
          <p>
            <strong>UNIX (s):</strong> {result.value.unixSeconds}
          </p>
          <p>
            <strong>UNIX (ms):</strong> {result.value.unixMilliseconds}
          </p>
          <p>
            <strong>{fromTimeZone}:</strong> {result.value.formattedFrom}
          </p>
          <p>
            <strong>{toTimeZone}:</strong> {result.value.formattedTo}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold text-rose-600 dark:text-rose-300">
          {result.value}
        </p>
      )}
    </section>
  )
}
