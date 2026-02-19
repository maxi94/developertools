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
    <section className="tool-panel" aria-label="JSON formatter">
      <div className="tool-panel-header">
        <h2>JSON Formatter</h2>
        <p>Entrada y salida permanecen en tu navegador.</p>
      </div>

      <div className="tool-grid">
        <label className="tool-field">
          <span>Input</span>
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            aria-label="JSON input"
          />
        </label>

        <label className="tool-field">
          <span>Output</span>
          <textarea
            value={output.value}
            readOnly
            spellCheck={false}
            aria-label="JSON output"
            data-status={output.status}
          />
        </label>
      </div>
    </section>
  )
}
