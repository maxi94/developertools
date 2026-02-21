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
  KeyRound,
  KeySquare,
  Link2,
  ScanSearch,
  Scissors,
  Star,
} from 'lucide-react'
import { getI18nCopy } from '@/shared/i18n/catalog'
import { useI18n } from '@/shared/i18n/useI18n'
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
  const { language } = useI18n()
  const ui = getI18nCopy(language, 'toolCard')

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
    'svg-optimizer': FileCode2,
    'image-to-base64': FileImage,
  } as const

  const ToolIcon = iconByTool[tool.id] ?? FileCode2

  return (
    <article
      role="button"
      tabIndex={0}
      className={`group w-full cursor-pointer rounded-lg border ${
        compact ? 'px-1.5 py-1.5' : 'px-2.5 py-2'
      } text-left transition ${
        isActive
          ? 'border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white'
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
      title={tool.name}
    >
      <div className="flex items-start justify-between gap-2">
        {compact ? (
          <span
            className={`inline-flex size-7 shrink-0 items-center justify-center rounded-lg border ${
              isActive
                ? 'border-slate-300 bg-white text-slate-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200'
                : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300'
            }`}
          >
            <ToolIcon className="size-3.5" />
            <span className="sr-only">{tool.name}</span>
          </span>
        ) : (
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <span
              className={`mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md border ${
                isActive
                  ? 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-900/25 dark:text-cyan-200'
                  : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <ToolIcon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold leading-tight tracking-tight">{tool.name}</h3>
              <p className="mt-0.5 overflow-hidden text-[11px] leading-snug text-slate-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] dark:text-slate-400">
                v{tool.version} · {tool.description}
              </p>
            </div>
          </div>
        )}
        {!compact ? (
          <button
            type="button"
            className={`inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md transition ${
              isFavorite
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
                : 'text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
            }`}
            onClick={(event) => {
              event.stopPropagation()
              onToggleFavorite(tool.id)
            }}
            aria-label={isFavorite ? ui.removeFromFavorites : ui.addToFavorites}
          >
            <Star className={`size-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        ) : null}
      </div>
    </article>
  )
}
