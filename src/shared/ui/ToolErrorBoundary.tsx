import { Component, type ReactNode } from 'react'

interface ToolErrorBoundaryProps {
  children: ReactNode
}

interface ToolErrorBoundaryState {
  hasError: boolean
}

export class ToolErrorBoundary extends Component<ToolErrorBoundaryProps, ToolErrorBoundaryState> {
  override state: ToolErrorBoundaryState = {
    hasError: false,
  }

  static override getDerivedStateFromError(): ToolErrorBoundaryState {
    return { hasError: true }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <section className="rounded-2xl border border-rose-300/70 bg-rose-50/80 p-4 text-sm text-rose-700 dark:border-rose-700/60 dark:bg-rose-950/30 dark:text-rose-300">
          Ocurrio un error al cargar la herramienta. Recarga la pagina e intenta de nuevo.
        </section>
      )
    }

    return this.props.children
  }
}
