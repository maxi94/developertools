import { AppProviders } from '@/app/providers/AppProviders'
import { ToolList } from '@/features/tool-registry/ui/ToolList'

export function App() {
  return (
    <AppProviders>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#93c5fd_0%,_transparent_35%),radial-gradient(circle_at_top_right,_#c4b5fd_0%,_transparent_30%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_#0f172a_0%,_transparent_40%),radial-gradient(circle_at_top_right,_#1e1b4b_0%,_transparent_32%)] dark:text-slate-100">
        <ToolList />
      </main>
    </AppProviders>
  )
}
