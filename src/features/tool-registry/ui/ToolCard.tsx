import { Binary, Braces, FileText, Fingerprint, KeyRound, Link2, Pin, Star } from 'lucide-react'
import type { ToolDefinition } from '@/shared/types/tool'

interface ToolCardProps {
  tool: ToolDefinition
  isActive: boolean
  isFavorite: boolean
  onSelect: (toolId: ToolDefinition['id']) => void
  onToggleFavorite: (toolId: ToolDefinition['id']) => void
}

export function ToolCard({
  tool,
  isActive,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: ToolCardProps) {
  const iconByTool = {
    'json-formatter': Braces,
    base64: Binary,
    jwt: KeyRound,
    uuid: Fingerprint,
    'url-codec': Link2,
    'readme-generator': FileText,
  } as const
  const ToolIcon = iconByTool[tool.id]

  return (
    <article
      role="button"
      tabIndex={0}
      className={`group w-full rounded-lg px-3 py-2 text-left transition ${
        isActive
          ? 'bg-white/15 text-white'
          : 'text-indigo-100/90 hover:bg-white/10 hover:text-white'
      }`}
      onClick={() => onSelect(tool.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(tool.id)
        }
      }}
      aria-pressed={isActive}
      title={tool.name}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span
            className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md ${
              isActive
                ? 'bg-white/20 text-white'
                : 'bg-indigo-900/80 text-indigo-100 group-hover:bg-white/15 group-hover:text-white'
            }`}
          >
            <ToolIcon className="size-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-tight">{tool.name}</h3>
            <p className="text-[11px] leading-tight text-indigo-100/65">{tool.description}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
              tool.status === 'ready'
                ? 'bg-emerald-300/20 text-emerald-100'
                : 'bg-amber-300/25 text-amber-100'
            }`}
          >
            {tool.status === 'ready' ? 'On' : 'Soon'}
          </span>
          <button
            type="button"
            className={`inline-flex size-7 items-center justify-center rounded-md transition ${
              isFavorite
                ? 'bg-amber-300/20 text-amber-200'
                : 'text-indigo-200/70 hover:bg-white/10 hover:text-white'
            }`}
            onClick={(event) => {
              event.stopPropagation()
              onToggleFavorite(tool.id)
            }}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            {isFavorite ? <Star className="size-4 fill-current" /> : <Pin className="size-4" />}
          </button>
        </div>
      </div>
    </article>
  )
}
