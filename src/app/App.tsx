import { AppProviders } from '@/app/providers/AppProviders'
import { ToolList } from '@/features/tool-registry/ui/ToolList'

export function App() {
  return (
    <AppProviders>
      <main className="app-shell">
        <header className="app-header">
          <p className="app-kicker">Developer Tools</p>
          <h1>Utilidades 100% client-side</h1>
          <p className="app-subtitle">
            Convierte, valida y transforma datos sin salir del navegador.
          </p>
        </header>
        <ToolList />
      </main>
    </AppProviders>
  )
}
