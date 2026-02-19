import {
  Binary,
  Braces,
  Database,
  DatabaseZap,
  FileCode2,
  FileImage,
  FlaskConical,
  FileJson2,
  FileText,
  Fingerprint,
  KeySquare,
  KeyRound,
  Link2,
  Clock3,
  Pin,
  ScanSearch,
  Star,
} from 'lucide-react'
import type { ToolDefinition } from '@/shared/types/tool'

interface ToolCardProps {
  tool: ToolDefinition
  isActive: boolean
  isFavorite: boolean
  compact?: boolean
  onSelect: (toolId: ToolDefinition['id']) => void
  onToggleFavorite: (toolId: ToolDefinition['id']) => void
}

export function ToolCard({
  tool,
  isActive,
  isFavorite,
  compact = false,
  onSelect,
  onToggleFavorite,
}: ToolCardProps) {
  const iconByTool = {
    'json-formatter': Braces,
    base64: Binary,
    'base64-image': FileImage,
    'base64-pdf': FileText,
    'sql-formatter': Database,
    'sql-mongo-converter': DatabaseZap,
    'regex-tool': ScanSearch,
    'json-model-generator': FileJson2,
    'jwt-builder': KeySquare,
    jwt: KeyRound,
    uuid: Fingerprint,
    'url-codec': Link2,
    'encoding-suite': FileCode2,
    'datetime-tools': Clock3,
    'id-toolkit': Fingerprint,
    'fake-data-generator': FlaskConical,
    'readme-generator': FileText,
  } as const
  const ToolIcon = iconByTool[tool.id]

  return (
    <article
      role="button"
      tabIndex={0}
      className={`group w-full cursor-pointer rounded-lg ${compact ? 'px-2 py-2' : 'px-3 py-2'} text-left transition ${
        isActive
          ? 'bg-slate-900/10 text-slate-900 dark:bg-white/15 dark:text-white'
          : 'text-slate-700 hover:bg-slate-900/10 hover:text-slate-900 dark:text-indigo-100/90 dark:hover:bg-white/10 dark:hover:text-white'
      }`}
      onClick={() => onSelect(tool.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(tool.id)
        }
      }}
      aria-pressed={isActive}
      title={`${tool.name} (v${tool.version})`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className={`flex min-w-0 flex-1 items-center ${compact ? 'justify-center' : ''} gap-2 text-left`}>
          <span
            className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md ${
              isActive
                ? 'bg-slate-900/15 text-slate-800 dark:bg-white/20 dark:text-white'
                : 'bg-slate-200 text-slate-700 group-hover:bg-slate-300 dark:bg-indigo-900/80 dark:text-indigo-100 dark:group-hover:bg-white/15 dark:group-hover:text-white'
            }`}
          >
            <ToolIcon className="size-4" />
          </span>
          {!compact ? (
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-tight">{tool.name}</h3>
              <p className="text-[11px] leading-tight text-slate-500 dark:text-indigo-100/65">
                {tool.description} · v{tool.version}
              </p>
            </div>
          ) : <span className="sr-only">{tool.name}</span>}
        </div>
        <div className={`flex shrink-0 items-center gap-1 ${compact ? 'hidden' : ''}`}>
          {!compact ? (
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                tool.status === 'ready'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-300/20 dark:text-emerald-100'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-300/25 dark:text-amber-100'
              }`}
            >
              {tool.status === 'ready' ? 'On' : 'Soon'}
            </span>
          ) : null}
          <button
            type="button"
            className={`inline-flex size-7 cursor-pointer items-center justify-center rounded-md transition ${
              isFavorite
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-300/20 dark:text-amber-200'
                : 'text-slate-500 hover:bg-slate-900/10 hover:text-slate-800 dark:text-indigo-200/70 dark:hover:bg-white/10 dark:hover:text-white'
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
