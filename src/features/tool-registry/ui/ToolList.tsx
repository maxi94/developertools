import { JsonFormatterTool } from '@/features/json-formatter/ui/JsonFormatterTool'
import { tools } from '@/features/tool-registry/model/tools'
import { ToolCard } from '@/features/tool-registry/ui/ToolCard'

export function ToolList() {
  return (
    <section className="tool-layout">
      <aside className="tool-sidebar">
        <h2>Catálogo</h2>
        <div className="tool-list">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </aside>

      <JsonFormatterTool />
    </section>
  )
}
