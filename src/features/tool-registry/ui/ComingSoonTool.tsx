interface ComingSoonToolProps {
  toolName: string
}

export function ComingSoonTool({ toolName }: ComingSoonToolProps) {
  return (
    <section className="tool-panel" aria-label={`${toolName} (proximamente)`}>
      <div className="tool-panel-header">
        <h2>{toolName}</h2>
        <p>Esta funcionalidad estara disponible en una proxima version.</p>
      </div>
      <div className="tool-empty-state">
        <p>Por ahora puedes usar la herramienta Formateador JSON desde el menu.</p>
      </div>
    </section>
  )
}
