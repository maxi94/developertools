import { Hammer } from 'lucide-react'

interface ComingSoonToolProps {
  toolName: string
}

export function ComingSoonTool({ toolName }: ComingSoonToolProps) {
  return (
    <section
      className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40"
      aria-label={`${toolName} (proximamente)`}
    >
      <div className="mb-3">
        <h2 className="m-0 text-xl font-semibold">{toolName}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Esta funcionalidad estara disponible en una proxima version.
        </p>
      </div>
      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900/60">
        <span className="mt-0.5 inline-flex size-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300">
          <Hammer className="size-4" />
        </span>
        <p className="m-0 text-sm text-slate-700 dark:text-slate-200">
          Por ahora puedes usar la herramienta Formateador JSON desde el menu.
        </p>
      </div>
    </section>
  )
}
