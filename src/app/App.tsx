import { AppProviders } from '@/app/providers/AppProviders'
import { ToolList } from '@/features/tool-registry/ui/ToolList'
import { useTheme } from '@/shared/hooks/useTheme'

export function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <AppProviders>
      <main className="app-shell">
        <header className="app-header">
          <div className="app-header-top">
            <p className="app-kicker">Developer Tools</p>
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            </button>
          </div>
          <h1>Utilidades 100% del lado del cliente</h1>
          <p className="app-subtitle">
            Convierte, valida y transforma datos sin salir del navegador.
          </p>
        </header>
        <ToolList />
      </main>
    </AppProviders>
  )
}
