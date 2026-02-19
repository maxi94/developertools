import { useState } from 'react'
import { ClipboardCheck, Fingerprint, RefreshCw } from 'lucide-react'
import { generateUuidV4, isValidUuidV4 } from '@/shared/lib/uuid'

export function UuidTool() {
  const [uuid, setUuid] = useState(generateUuidV4())
  const [candidate, setCandidate] = useState('')

  const regenerate = () => {
    setUuid(generateUuidV4())
  }

  const copyUuid = async () => {
    await navigator.clipboard.writeText(uuid)
  }

  const isValid = candidate.length > 0 ? isValidUuidV4(candidate) : null

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <Fingerprint className="size-5" />
        Generador UUID v4
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Genera identificadores y valida si cumplen formato UUID v4.
      </p>

      <div className="mt-3 rounded-2xl border border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900/70">
        <code className="break-all font-mono text-sm">{uuid}</code>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          onClick={regenerate}
        >
          <RefreshCw className="size-3.5" />
          Regenerar
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          onClick={copyUuid}
        >
          <ClipboardCheck className="size-3.5" />
          Copiar
        </button>
      </div>

      <div className="mt-4">
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Validar UUID v4
          </span>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            value={candidate}
            onChange={(event) => setCandidate(event.target.value)}
            spellCheck={false}
            placeholder="Pega un UUID..."
          />
        </label>
        {isValid === null ? null : (
          <p
            className={`mt-2 text-xs font-semibold ${
              isValid
                ? 'text-emerald-600 dark:text-emerald-300'
                : 'text-rose-600 dark:text-rose-300'
            }`}
          >
            {isValid ? 'UUID valido.' : 'UUID invalido.'}
          </p>
        )}
      </div>
    </section>
  )
}
