import type { ToolDefinition } from '@/shared/types/tool'

interface ToolCardProps {
  tool: ToolDefinition
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <article className="tool-card">
      <h2>{tool.name}</h2>
      <p>{tool.description}</p>
    </article>
  )
}
