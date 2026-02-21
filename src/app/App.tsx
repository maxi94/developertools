import { AppProviders } from '@/app/providers/AppProviders'
import { ToolList } from '@/features/tool-registry/ui/ToolList'

export function App() {
  return (
    <AppProviders>
      <main className="relative min-h-[100dvh] overflow-x-clip overflow-y-auto text-slate-900 dark:text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(56,189,248,0.14),transparent_36%),radial-gradient(circle_at_86%_2%,rgba(59,130,246,0.1),transparent_30%),radial-gradient(circle_at_72%_84%,rgba(20,184,166,0.08),transparent_34%),linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] bg-[size:auto,auto,auto,32px_32px,32px_32px] [mask-image:radial-gradient(circle_at_center,black_52%,transparent_100%)] dark:bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(16,185,129,0.12),transparent_26%),linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)]" />
        <div className="pointer-events-none absolute -left-24 top-14 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl dark:bg-cyan-500/20" />
        <div className="pointer-events-none absolute -right-16 top-2 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl dark:bg-emerald-500/15" />
        <div className="relative z-10 w-full">
          <ToolList />
        </div>
      </main>
    </AppProviders>
  )
}
