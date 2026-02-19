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
    <section className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur lg:sticky lg:top-4 dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          Menu de funcionalidades
        </h2>
        <div className="grid gap-2">
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
