import { useMemo, useState } from 'react'
import { Copy, KeySquare } from 'lucide-react'
import { buildJwtHs256 } from '@/shared/lib/jwt-builder'

const defaultHeader = `{
  "alg": "HS256",
  "typ": "JWT"
}`

const defaultPayload = `{
  "sub": "123",
  "name": "matti",
  "iat": 1710000000
}`

export function JwtBuilderTool() {
  const [header, setHeader] = useState(defaultHeader)
  const [payload, setPayload] = useState(defaultPayload)
  const [secret, setSecret] = useState('mi-clave-secreta')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  const canBuild = useMemo(
    () => header.trim() && payload.trim() && secret.trim(),
    [header, payload, secret],
  )

  const buildToken = async () => {
    try {
      setError('')
      const generated = await buildJwtHs256(header, payload, secret)
      setToken(generated)
    } catch (buildError) {
      const message = buildError instanceof Error ? buildError.message : 'No se pudo generar JWT.'
      setError(message)
    }
  }

  const copyToken = async () => {
    if (token) {
      await navigator.clipboard.writeText(token)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <KeySquare className="size-5" />
        JWT Builder (HS256)
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Crea JWT localmente con header/payload custom y firma HS256 usando clave secreta.
      </p>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Header JSON
          </span>
          <textarea
            className="min-h-[180px] rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            spellCheck={false}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Payload JSON
          </span>
          <textarea
            className="min-h-[180px] rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            spellCheck={false}
          />
        </label>
      </div>

      <label className="mt-3 grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Clave secreta
        </span>
        <input
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          spellCheck={false}
        />
      </label>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={!canBuild}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          onClick={buildToken}
        >
          Generar JWT
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          onClick={copyToken}
        >
          <Copy className="size-3.5" />
          Copiar
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">{error}</p>
      ) : null}

      <textarea
        className="mt-3 min-h-[130px] w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
        value={token}
        readOnly
        spellCheck={false}
      />
    </section>
  )
}
