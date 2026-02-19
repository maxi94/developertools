import { Binary, Braces, CheckCircle2, Clock3, Link2 } from 'lucide-react'
import type { ToolDefinition } from '@/shared/types/tool'

interface ToolCardProps {
  tool: ToolDefinition
  isActive: boolean
  onSelect: (toolId: ToolDefinition['id']) => void
}

export function ToolCard({ tool, isActive, onSelect }: ToolCardProps) {
  const ToolIcon = tool.id === 'json-formatter' ? Braces : tool.id === 'base64' ? Binary : Link2

  return (
    <button
      type="button"
      className={`w-full rounded-2xl border p-3 text-left transition ${
        isActive
          ? 'border-blue-500 bg-blue-50 shadow-sm dark:border-sky-400 dark:bg-sky-500/10'
          : 'border-slate-300 bg-white/80 hover:-translate-y-0.5 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-sky-400'
      }`}
      onClick={() => onSelect(tool.id)}
      aria-pressed={isActive}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-slate-900/5 text-slate-700 dark:bg-white/10 dark:text-slate-200">
          <ToolIcon className="size-4" />
        </span>
        <h3 className="text-sm font-semibold">{tool.name}</h3>
      </div>
      <p className="mb-3 text-xs text-slate-600 dark:text-slate-300">{tool.description}</p>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
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
    </button>
  )
}
