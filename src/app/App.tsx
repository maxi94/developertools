import { MoonStar, Sun } from 'lucide-react'
import { AppProviders } from '@/app/providers/AppProviders'
import { ToolList } from '@/features/tool-registry/ui/ToolList'
import { useTheme } from '@/shared/hooks/useTheme'

export function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <AppProviders>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#93c5fd_0%,_transparent_35%),radial-gradient(circle_at_top_right,_#c4b5fd_0%,_transparent_30%)] px-3 py-4 text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_#0f172a_0%,_transparent_40%),radial-gradient(circle_at_top_right,_#1e1b4b_0%,_transparent_32%)] dark:text-slate-100 sm:px-4 sm:py-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-end pb-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="size-3.5" /> : <MoonStar className="size-3.5" />}
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </div>
        <ToolList />
      </main>
    </AppProviders>
  )
}
