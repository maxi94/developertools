import { AppProviders } from '@/app/providers/AppProviders'
import { ToolList } from '@/features/tool-registry/ui/ToolList'

export function App() {
  return (
    <AppProviders>
      <main className="relative min-h-screen overflow-hidden px-2 py-2 text-slate-900 sm:px-4 sm:py-4 dark:text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(circle_at_center,black_45%,transparent_100%)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)]" />
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/20" />
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-500/15" />
        <div className="mx-auto w-full max-w-[1680px]">
          <ToolList />
        </div>
      </main>
    </AppProviders>
  )
}
