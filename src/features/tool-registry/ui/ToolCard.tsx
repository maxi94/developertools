import {
  Binary,
  Braces,
  CheckCircle2,
  Clock3,
  Fingerprint,
  KeyRound,
  Link2,
  Star,
} from 'lucide-react'
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
  } as const
  const ToolIcon = iconByTool[tool.id]

  return (
    <article
      role="button"
      tabIndex={0}
      className={`w-full rounded-xl border px-3 py-2 text-left transition ${
        isActive
          ? 'border-blue-500/60 bg-blue-50 dark:border-sky-400/70 dark:bg-sky-500/10'
          : 'border-slate-200/80 bg-transparent hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:border-sky-500/70 dark:hover:bg-sky-500/5'
      }`}
      onClick={() => onSelect(tool.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(tool.id)
        }
      }}
      aria-pressed={isActive}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <ToolIcon className="size-4" />
          </span>
          <h3 className="truncate text-sm font-semibold">{tool.name}</h3>
        </div>
        <button
          type="button"
          className={`inline-flex size-8 shrink-0 items-center justify-center rounded-md border transition ${
            isFavorite
              ? 'border-amber-300 bg-amber-100 text-amber-600 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-300'
              : 'border-slate-300 text-slate-500 hover:border-amber-300 hover:text-amber-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-amber-500/60 dark:hover:text-amber-300'
          }`}
          onClick={(event) => {
            event.stopPropagation()
            onToggleFavorite(tool.id)
          }}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Star className={`size-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      <p className="mb-3 text-xs text-slate-600 dark:text-slate-300">{tool.description}</p>
      <span
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
          tool.status === 'ready'
            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
            : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
        }`}
      >
        {tool.status === 'ready' ? (
          <CheckCircle2 className="size-3.5" />
        ) : (
          <Clock3 className="size-3.5" />
        )}
        {tool.status === 'ready' ? 'Lista' : 'Proximamente'}
      </span>
    </article>
  )
}
