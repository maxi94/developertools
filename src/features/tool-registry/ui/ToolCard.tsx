import type { ToolDefinition } from '@/shared/types/tool'

interface ToolCardProps {
  tool: ToolDefinition
  isActive: boolean
  onSelect: (toolId: ToolDefinition['id']) => void
}

export function ToolCard({ tool, isActive, onSelect }: ToolCardProps) {
  return (
    <button
      type="button"
      className={`tool-card ${isActive ? 'is-active' : ''}`}
      onClick={() => onSelect(tool.id)}
      aria-pressed={isActive}
    >
      <h2>{tool.name}</h2>
      <p>{tool.description}</p>
      <span className={`tool-badge ${tool.status === 'ready' ? 'is-ready' : 'is-planned'}`}>
        {tool.status === 'ready' ? 'Lista' : 'Proximamente'}
      </span>
    </button>
  )
}
