import { useMemo, useState } from 'react'
import { Copy, FlaskConical, RotateCcw } from 'lucide-react'
import { fakeFieldCatalog, generateFakeData } from '@/shared/lib/fake-data'

const presets = [
  {
    id: 'basic',
    label: 'Basico',
    fields: ['id', 'name', 'email', 'createdAt'],
  },
  {
    id: 'crm',
    label: 'CRM',
    fields: ['id', 'firstName', 'lastName', 'email', 'company', 'phone', 'isActive'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    fields: ['id', 'country', 'score', 'isActive', 'createdAt'],
  },
] as const

function sanitizeCount(value: number): number {
  if (!Number.isFinite(value)) {
    return 1
  }
  return Math.max(1, Math.min(Math.trunc(value), 200))
}

export function FakeDataTool() {
  const [count, setCount] = useState(20)
  const [presetId, setPresetId] = useState<(typeof presets)[number]['id']>('basic')
  const [selectedKeys, setSelectedKeys] = useState<string[]>([...presets[0].fields])

  const schema = useMemo(() => {
    const byKey = new Map(fakeFieldCatalog.map((field) => [field.key, field]))
    return selectedKeys
      .map((key) => byKey.get(key))
      .filter((field): field is NonNullable<typeof field> => !!field)
      .map((field) => ({ key: field.key, type: field.type }))
  }, [selectedKeys])

  const payload = useMemo(
    () => JSON.stringify(generateFakeData(sanitizeCount(count), schema), null, 2),
    [count, schema],
  )

  const copyPayload = async () => {
    await navigator.clipboard.writeText(payload)
  }

  const applyPreset = (nextPresetId: (typeof presets)[number]['id']) => {
    const preset = presets.find((item) => item.id === nextPresetId)
    if (!preset) {
      return
    }
    setPresetId(nextPresetId)
    setSelectedKeys([...preset.fields])
  }

  const toggleField = (key: string) => {
    setPresetId('basic')
    setSelectedKeys((current) => {
      if (current.includes(key)) {
        const next = current.filter((item) => item !== key)
        return next.length > 0 ? next : current
      }
      return [...current, key]
    })
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <FlaskConical className="size-5" />
        Generador de datos fake
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Arma datasets de prueba por campos, sin depender de un JSON fijo.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-[auto_auto_1fr] sm:items-center">
        <input
          type="number"
          min={1}
          max={200}
          className="w-28 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          value={count}
          onChange={(event) => setCount(sanitizeCount(Number(event.target.value)))}
        />

        <select
          value={presetId}
          onChange={(event) => applyPreset(event.target.value as (typeof presets)[number]['id'])}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
        >
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              Preset: {preset.label}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            onClick={copyPayload}
          >
            <Copy className="size-3.5" /> Copiar JSON
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            onClick={() => applyPreset('basic')}
          >
            <RotateCcw className="size-3.5" /> Reset
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50 sm:grid-cols-2 lg:grid-cols-3">
        {fakeFieldCatalog.map((field) => (
          <label key={field.key} className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={selectedKeys.includes(field.key)}
              onChange={() => toggleField(field.key)}
              className="size-4 rounded border-slate-300 text-cyan-600 dark:border-slate-600"
            />
            <span>
              {field.label}
              <span className="ml-1 text-slate-500 dark:text-slate-400">({field.key})</span>
            </span>
          </label>
        ))}
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
