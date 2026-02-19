import { useMemo, useState } from 'react'
import { formatJson } from '@/shared/lib/json'

const sample = '{ "framework": "react", "clientSideOnly": true, "tools": ["json-formatter"] }'

export function JsonFormatterTool() {
  const [source, setSource] = useState(sample)

  const output = useMemo(() => {
    try {
      return {
        status: 'success' as const,
        value: formatJson(source),
      }
    } catch {
      return {
        status: 'error' as const,
        value: 'JSON invalido: revisa comillas, comas y llaves.',
      }
    }
  }, [source])

  return (
    <section className="tool-panel" aria-label="Formateador JSON">
      <div className="tool-panel-header">
        <h2>Formateador JSON</h2>
        <p>La entrada y salida permanecen en tu navegador.</p>
      </div>

      <div className="tool-actions">
        <button type="button" onClick={() => setSource(sample)}>
          Usar ejemplo
        </button>
        <button type="button" onClick={() => setSource('')}>
          Limpiar
        </button>
      </div>

      <div className="tool-grid">
        <label className="tool-field">
          <span>Entrada</span>
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            aria-label="Entrada JSON"
          />
        </label>

        <label className="tool-field">
          <span>Salida</span>
          <textarea
            value={output.value}
            readOnly
            spellCheck={false}
            aria-label="Salida JSON"
            data-status={output.status}
          />
        </label>
      </div>
    </section>
  )
}
