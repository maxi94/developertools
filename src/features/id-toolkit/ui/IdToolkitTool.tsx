import { useMemo, useState } from 'react'
import { Copy, Fingerprint, RefreshCw } from 'lucide-react'
import {
  generateBatch,
  generateKsuid,
  generateUlid,
  generateUuidV4,
  validateId,
} from '@/shared/lib/id-toolkit'

type IdKind = 'uuid' | 'ulid' | 'ksuid'

export function IdToolkitTool() {
  const [kind, setKind] = useState<IdKind>('uuid')
  const [count, setCount] = useState(10)
  const [single, setSingle] = useState(generateUuidV4())
  const [candidate, setCandidate] = useState('')

  const batch = useMemo(() => generateBatch(kind, count), [kind, count])
  const isValid = candidate.trim() ? validateId(kind, candidate) : null

  const regenerate = () => {
    if (kind === 'uuid') setSingle(generateUuidV4())
    if (kind === 'ulid') setSingle(generateUlid())
    if (kind === 'ksuid') setSingle(generateKsuid())
  }

  const copyBatch = async () => {
    await navigator.clipboard.writeText(batch.join('\n'))
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <Fingerprint className="size-5" />
        UUID / ULID / KSUID
      </h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {(['uuid', 'ulid', 'ksuid'] as const).map((option) => (
          <button
            key={option}
            type="button"
            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${kind === option ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'}`}
            onClick={() => setKind(option)}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900/70">
        <code className="break-all text-sm">{single}</code>
      </div>
      <button
        type="button"
        className="mt-2 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
        onClick={regenerate}
      >
        <RefreshCw className="size-3.5" /> Regenerar
      </button>

      <div className="mt-4 grid gap-2 lg:grid-cols-[140px_1fr] lg:items-center">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Batch count
        </label>
        <input
          type="number"
          min={1}
          max={500}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        />
      </div>

      <textarea
        className="mt-2 min-h-[140px] w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
        readOnly
        value={batch.join('\n')}
      />
      <button
        type="button"
        className="mt-2 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
        onClick={copyBatch}
      >
        <Copy className="size-3.5" /> Copiar batch
      </button>

      <label className="mt-4 grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Validar {kind.toUpperCase()}
        </span>
        <input
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          value={candidate}
          onChange={(e) => setCandidate(e.target.value)}
          spellCheck={false}
        />
      </label>
      {isValid === null ? null : (
        <p
          className={`mt-2 text-xs font-semibold ${isValid ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}
        >
          {isValid ? 'ID valido.' : 'ID invalido.'}
        </p>
      )}
    </section>
  )
}
