import { useEffect, useMemo, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { decodeJwt, verifyJwtSignatureWithSecret } from '@/shared/lib/jwt'
import { JsonTreeViewer } from '@/shared/ui/JsonTreeViewer'

const jwtSample =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiTWF0dGkiLCJyb2xlIjoiZGV2In0.firma'

export function JwtTool() {
  const [token, setToken] = useState(jwtSample)
  const [secret, setSecret] = useState('')
  const [verification, setVerification] = useState<{
    status: 'idle' | 'valid' | 'invalid' | 'error'
    message: string
  }>({ status: 'idle', message: 'Ingresa una clave para validar firma (algoritmos HS*).' })

  const result = useMemo(() => {
    try {
      return { status: 'success' as const, value: decodeJwt(token) }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'JWT invalido.'
      return { status: 'error' as const, value: message }
    }
  }, [token])

  useEffect(() => {
    let cancelled = false

    const runVerification = async () => {
      if (!secret.trim()) {
        setVerification({
          status: 'idle',
          message: 'Ingresa una clave para validar firma (algoritmos HS*).',
        })
        return
      }

      if (result.status !== 'success') {
        setVerification({
          status: 'error',
          message: 'El token es invalido. Corrige el JWT antes de validar firma.',
        })
        return
      }

      try {
        const validation = await verifyJwtSignatureWithSecret(token, secret)
        if (cancelled) {
          return
        }

        if (validation.valid) {
          setVerification({ status: 'valid', message: 'Firma valida para la clave ingresada.' })
          return
        }

        setVerification({
          status: 'invalid',
          message: validation.reason ?? 'Firma invalida para la clave ingresada.',
        })
      } catch (error) {
        if (cancelled) {
          return
        }

        const message = error instanceof Error ? error.message : 'No se pudo validar la firma.'
        setVerification({ status: 'error', message })
      }
    }

    runVerification()

    return () => {
      cancelled = true
    }
  }, [result.status, secret, token])

  return (
    <section className="grid gap-3">
      <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
        <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
          <KeyRound className="size-5" />
          Visualizador JWT
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Decodifica el token localmente y permite validar firma con clave secreta (HS256/384/512).
        </p>
        <textarea
          className="mt-3 min-h-[140px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          spellCheck={false}
        />
        <label className="mt-3 grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Clave secreta
          </span>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            spellCheck={false}
            placeholder="Ej: mi-clave-secreta"
          />
        </label>
        <p
          className={`mt-2 text-xs font-semibold ${
            verification.status === 'valid'
              ? 'text-emerald-600 dark:text-emerald-300'
              : verification.status === 'invalid' || verification.status === 'error'
                ? 'text-rose-600 dark:text-rose-300'
                : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {verification.message}
        </p>
      </section>

      {result.status === 'success' ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <JsonTreeViewer data={result.value.header} title="Header" />
          <JsonTreeViewer data={result.value.payload} title="Payload" />
        </div>
      ) : (
        <section className="rounded-3xl border border-rose-300/70 bg-rose-50/90 p-4 text-sm text-rose-700 dark:border-rose-700/70 dark:bg-rose-950/40 dark:text-rose-300">
          {result.value}
        </section>
      )}
    </section>
  )
}
