import { AppProviders } from '@/app/providers/AppProviders'
import { ToolList } from '@/features/tool-registry/ui/ToolList'

export function App() {
  return (
    <AppProviders>
      <main className="relative h-[100dvh] overflow-hidden text-slate-900 dark:text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_85%_0%,rgba(16,185,129,0.14),transparent_28%),linear-gradient(to_right,rgba(148,163,184,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.09)_1px,transparent_1px)] bg-[size:auto,auto,32px_32px,32px_32px] [mask-image:radial-gradient(circle_at_center,black_44%,transparent_100%)] dark:bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(16,185,129,0.12),transparent_26%),linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)]" />
        <div className="pointer-events-none absolute -left-24 top-14 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-500/20" />
        <div className="pointer-events-none absolute -right-16 top-2 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-500/15" />
        <div className="relative z-10 w-full">
          <ToolList />
        </div>
      </main>
    </AppProviders>
  )
}
