import {
  Binary,
  Braces,
  Clock3,
  Database,
  DatabaseZap,
  FileCode2,
  FileImage,
  FileJson2,
  FileText,
  FingerprintPattern as Fingerprint,
  FlaskConical,
  KeyRound,
  KeySquare,
  Link2,
  Pin,
  ScanSearch,
  Scissors,
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
    'json-table': FileJson2,
    base64: Binary,
    'base64-image': FileImage,
    'base64-pdf': FileText,
    'sql-formatter': Database,
    'code-minifier': Scissors,
    'case-converter': FileCode2,
    'sql-mongo-converter': DatabaseZap,
    'regex-tool': ScanSearch,
    'json-model-generator': FileJson2,
    'jwt-builder': KeySquare,
    jwt: KeyRound,
    uuid: Fingerprint,
    'url-codec': Link2,
    'encoding-suite': FileCode2,
    'color-tools': Braces,
    'box-shadow-generator': FileCode2,
    'spacing-preview': FileCode2,
    'datetime-tools': Clock3,
    'id-toolkit': Fingerprint,
    'fake-data-generator': FlaskConical,
    'svg-optimizer': FileCode2,
    'image-to-base64': FileImage,
  } as const
  const ToolIcon = iconByTool[tool.id] ?? FileCode2

  return (
    <article
      role="button"
      tabIndex={0}
      className={`group w-full cursor-pointer rounded-xl border ${compact ? 'px-1.5 py-1.5' : 'px-2 py-1.5'} text-left transition ${
        isActive
          ? 'border-cyan-300/70 bg-cyan-50 text-slate-900 shadow-[0_8px_18px_-14px_rgba(8,145,178,0.75)] dark:border-cyan-400/50 dark:bg-cyan-950/35 dark:text-white'
          : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-100 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900/70'
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
            className={`inline-flex size-7 shrink-0 items-center justify-center rounded-lg border ${
              isActive
                ? 'border-cyan-300/70 bg-white/90 text-cyan-700 dark:border-cyan-400/60 dark:bg-cyan-500/20 dark:text-cyan-200'
                : 'border-slate-200 bg-white text-slate-700 group-hover:border-slate-300 group-hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:group-hover:border-cyan-500/60 dark:group-hover:bg-slate-800 dark:group-hover:text-cyan-200'
            }`}
          >
            <ToolIcon className="size-3.5" />
          </span>
          {!compact ? (
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-tight tracking-tight">{tool.name}</h3>
              <p className="overflow-hidden text-[10px] leading-snug text-slate-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] dark:text-slate-400">
                v{tool.version} · {tool.description}
              </p>
            </div>
          ) : <span className="sr-only">{tool.name}</span>}
        </div>
        <div className={`flex shrink-0 items-center gap-1 ${compact ? 'hidden' : ''}`}>
          <button
            type="button"
            className={`inline-flex size-6 cursor-pointer items-center justify-center rounded-lg transition ${
              isFavorite
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
                : 'text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-cyan-200'
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
