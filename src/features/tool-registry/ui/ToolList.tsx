import { useMemo, useState } from 'react'
import { JsonFormatterTool } from '@/features/json-formatter/ui/JsonFormatterTool'
import { tools } from '@/features/tool-registry/model/tools'
import { ComingSoonTool } from '@/features/tool-registry/ui/ComingSoonTool'
import { ToolCard } from '@/features/tool-registry/ui/ToolCard'
import type { ToolId } from '@/shared/types/tool'

export function ToolList() {
  const [activeToolId, setActiveToolId] = useState<ToolId>('json-formatter')

  const activeTool = useMemo(() => tools.find((tool) => tool.id === activeToolId), [activeToolId])

  return (
    <section className="tool-layout">
      <aside className="tool-sidebar">
        <h2>Menu de funcionalidades</h2>
        <div className="tool-list">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isActive={tool.id === activeToolId}
              onSelect={setActiveToolId}
            />
          ))}
        </div>
      </aside>

      {activeTool?.id === 'json-formatter' ? (
        <JsonFormatterTool />
      ) : (
        <ComingSoonTool toolName={activeTool?.name ?? 'Herramienta'} />
      )}
    </section>
  )
}
