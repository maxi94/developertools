import { useMemo, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { decodeJwt } from '@/shared/lib/jwt'
import { JsonTreeViewer } from '@/shared/ui/JsonTreeViewer'

const jwtSample =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiTWF0dGkiLCJyb2xlIjoiZGV2In0.firma'

export function JwtTool() {
  const [token, setToken] = useState(jwtSample)

  const result = useMemo(() => {
    try {
      return { status: 'success' as const, value: decodeJwt(token) }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'JWT invalido.'
      return { status: 'error' as const, value: message }
    }
  }, [token])

  return (
    <section className="grid gap-3">
      <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
        <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
          <KeyRound className="size-5" />
          Visualizador JWT
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Decodifica el token localmente sin validar firma.
        </p>
        <textarea
          className="mt-3 min-h-[140px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          spellCheck={false}
        />
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
