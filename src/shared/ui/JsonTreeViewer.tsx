import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface JsonTreeViewerProps {
  data: unknown
  title?: string
}

interface JsonTreeNodeProps {
  label: string
  value: unknown
  depth: number
}

function getValueType(value: unknown): string {
  if (Array.isArray(value)) {
    return `Array(${value.length})`
  }
  if (value === null) {
    return 'null'
  }
  return typeof value === 'object' ? 'Object' : typeof value
}

function JsonTreeNode({ label, value, depth }: JsonTreeNodeProps) {
  const isExpandable =
    value !== null && typeof value === 'object' && Object.keys(value as object).length > 0
  const [isCollapsed, setIsCollapsed] = useState(depth > 1)

  if (!isExpandable) {
    return (
      <div className="grid grid-cols-[minmax(0,180px)_1fr] gap-2 rounded-lg px-2 py-1.5 text-xs">
        <span className="truncate font-semibold text-slate-600 dark:text-slate-300">{label}</span>
        <code className="truncate rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {JSON.stringify(value)}
        </code>
      </div>
    )
  }

  const entries = Array.isArray(value)
    ? value.map((childValue, index) => [String(index), childValue] as const)
    : Object.entries(value as Record<string, unknown>)

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white/50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900/40">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
        onClick={() => setIsCollapsed((state) => !state)}
      >
        {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        <span>{label}</span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          {getValueType(value)}
        </span>
      </button>

      {!isCollapsed ? (
        <div className="mt-1.5 grid gap-1 border-l border-slate-200 pl-3 dark:border-slate-700">
          {entries.map(([childLabel, childValue]) => (
            <JsonTreeNode
              key={`${label}-${childLabel}`}
              label={childLabel}
              value={childValue}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function JsonTreeViewer({ data, title = 'Visualizador JSON' }: JsonTreeViewerProps) {
  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      <div className="grid gap-2">
        <JsonTreeNode label="root" value={data} depth={0} />
      </div>
    </section>
  )
}
