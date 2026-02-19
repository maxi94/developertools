import { useMemo, useState } from 'react'
import { Copy, FlaskConical } from 'lucide-react'
import { generateFakeData } from '@/shared/lib/fake-data'

export function FakeDataTool() {
  const [count, setCount] = useState(20)

  const payload = useMemo(() => JSON.stringify(generateFakeData(count), null, 2), [count])

  const copyPayload = async () => {
    await navigator.clipboard.writeText(payload)
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <FlaskConical className="size-5" />
        Generador de datos fake
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Genera JSON de prueba con nombres, emails, UUID y fechas.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={200}
          className="w-28 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
        />
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          onClick={copyPayload}
        >
          <Copy className="size-3.5" /> Copiar JSON
        </button>
      </div>

      <textarea
        className="mt-3 min-h-[320px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
        readOnly
        value={payload}
        spellCheck={false}
      />
    </section>
  )
}
