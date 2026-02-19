import { MoonStar, Sun } from 'lucide-react'
import { AppProviders } from '@/app/providers/AppProviders'
import { ToolList } from '@/features/tool-registry/ui/ToolList'
import { useTheme } from '@/shared/hooks/useTheme'

export function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <AppProviders>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#93c5fd_0%,_transparent_35%),radial-gradient(circle_at_top_right,_#c4b5fd_0%,_transparent_30%)] px-4 py-8 text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_#0f172a_0%,_transparent_40%),radial-gradient(circle_at_top_right,_#1e1b4b_0%,_transparent_32%)] dark:text-slate-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <header className="rounded-3xl border border-slate-300/70 bg-white/80 p-5 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2">
                <img src="/logo.svg" alt="Logo Developer Tools" className="size-7 rounded-lg" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-sky-300">
                  Developer Tools
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <Sun className="size-3.5" />
                ) : (
                  <MoonStar className="size-3.5" />
                )}
                {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              </button>
            </div>
            <h1 className="mb-2 text-3xl font-bold leading-tight md:text-4xl">
              Utilidades 100% del lado del cliente
            </h1>
            <p className="m-0 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Convierte, valida y transforma datos sin salir del navegador.
            </p>
          </header>
          <ToolList />
        </div>
      </main>
    </AppProviders>
  )
}
