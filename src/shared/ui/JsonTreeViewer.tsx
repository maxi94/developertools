import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Network, Search, TreePine } from 'lucide-react'

interface JsonTreeViewerProps {
  data: unknown
  title?: string
}

interface JsonTreeNodeProps {
  label: string
  value: unknown
  depth: number
  path: string
  query: string
}

interface GraphNode {
  id: string
  label: string
  path: string
  parentId: string | null
  type: string
  preview: string
}

type ViewMode = 'tree' | 'graph'

function getValueType(value: unknown): string {
  if (Array.isArray(value)) {
    return `Array(${value.length})`
  }
  if (value === null) {
    return 'null'
  }
  return typeof value === 'object' ? 'Object' : typeof value
}

function matchesQuery(path: string, label: string, value: unknown, query: string): boolean {
  if (!query) {
    return true
  }

  const target = `${path} ${label} ${JSON.stringify(value)}`.toLowerCase()
  return target.includes(query)
}

function hasNestedMatch(value: unknown, path: string, query: string): boolean {
  if (!query) {
    return true
  }

  if (!value || typeof value !== 'object') {
    return matchesQuery(path, path, value, query)
  }

  const entries = Array.isArray(value)
    ? value.map((child, index) => [String(index), child] as const)
    : Object.entries(value as Record<string, unknown>)

  return entries.some(([label, child]) => {
    const childPath = Array.isArray(value) ? `${path}[${label}]` : `${path}.${label}`
    return matchesQuery(childPath, label, child, query) || hasNestedMatch(child, childPath, query)
  })
}

function JsonTreeNode({ label, value, depth, path, query }: JsonTreeNodeProps) {
  const isExpandable =
    value !== null && typeof value === 'object' && Object.keys(value as object).length > 0
  const [isCollapsed, setIsCollapsed] = useState(depth > 1)
  const visible = matchesQuery(path, label, value, query) || hasNestedMatch(value, path, query)

  if (!visible) {
    return null
  }

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

      {!isCollapsed || query ? (
        <div className="mt-1.5 grid gap-1 border-l border-slate-200 pl-3 dark:border-slate-700">
          {entries.map(([childLabel, childValue]) => {
            const childPath = Array.isArray(value)
              ? `${path}[${childLabel}]`
              : `${path}.${childLabel}`
            return (
              <JsonTreeNode
                key={`${path}-${childLabel}`}
                label={childLabel}
                value={childValue}
                depth={depth + 1}
                path={childPath}
                query={query}
              />
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function previewValue(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `Array(${value.length})`
  }
  return `Object(${Object.keys(value).length})`
}

function collectGraphNodes(
  value: unknown,
  label: string,
  path: string,
  parentId: string | null,
): GraphNode[] {
  const node: GraphNode = {
    id: path,
    label,
    path,
    parentId,
    type: getValueType(value),
    preview: previewValue(value),
  }

  if (!value || typeof value !== 'object') {
    return [node]
  }

  const entries = Array.isArray(value)
    ? value.map((child, index) => [String(index), child] as const)
    : Object.entries(value as Record<string, unknown>)

  const children = entries.flatMap(([childLabel, childValue]) => {
    const childPath = Array.isArray(value) ? `${path}[${childLabel}]` : `${path}.${childLabel}`
    return collectGraphNodes(childValue, childLabel, childPath, path)
  })

  return [node, ...children]
}

function GraphView({ data, query }: { data: unknown; query: string }) {
  const [selectedId, setSelectedId] = useState<string>('root')
  const nodes = useMemo(() => collectGraphNodes(data, 'root', 'root', null), [data])
  const filteredNodes = useMemo(
    () =>
      nodes.filter((node) => {
        if (!query) {
          return true
        }
        const target = `${node.label} ${node.path} ${node.preview}`.toLowerCase()
        return target.includes(query)
      }),
    [nodes, query],
  )

  const activeSelectedId = filteredNodes.some((node) => node.id === selectedId)
    ? selectedId
    : (filteredNodes[0]?.id ?? 'root')
  const selectedNode = filteredNodes.find((node) => node.id === activeSelectedId) ?? null
  const children = filteredNodes.filter((node) => node.parentId === activeSelectedId)

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="grid max-h-[420px] gap-2 overflow-auto pr-1">
        {filteredNodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
              node.id === activeSelectedId
                ? 'border-blue-500 bg-blue-50 dark:border-sky-400 dark:bg-sky-500/10'
                : 'border-slate-200 bg-white hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-sky-500'
            }`}
            onClick={() => setSelectedId(node.id)}
          >
            <p className="font-semibold text-slate-700 dark:text-slate-200">{node.label}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{node.path}</p>
            <p className="mt-1 inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-[10px] dark:bg-slate-800">
              {node.type}
            </p>
          </button>
        ))}
      </div>

      <aside className="rounded-xl border border-slate-200 bg-white/60 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/40">
        <h4 className="mb-2 font-semibold text-slate-700 dark:text-slate-200">Detalle nodo</h4>
        {selectedNode ? (
          <div className="grid gap-2">
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Ruta:</strong> {selectedNode.path}
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Preview:</strong> {selectedNode.preview}
            </p>
            <div>
              <p className="mb-1 font-semibold text-slate-600 dark:text-slate-300">
                Conexiones hijas
              </p>
              <div className="grid gap-1">
                {children.length > 0 ? (
                  children.map((child) => (
                    <p key={child.id} className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">
                      {selectedNode.label} → {child.label}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">Sin hijos.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">Sin nodos para mostrar.</p>
        )}
      </aside>
    </div>
  )
}

export function JsonTreeViewer({ data, title = 'Visualizador JSON' }: JsonTreeViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('tree')
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        <div className="inline-flex rounded-xl border border-slate-300 p-1 dark:border-slate-600">
          <button
            type="button"
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
              viewMode === 'tree'
                ? 'bg-blue-600 text-white dark:bg-sky-500 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-300'
            }`}
            onClick={() => setViewMode('tree')}
          >
            <TreePine className="size-3.5" />
            Arbol
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
              viewMode === 'graph'
                ? 'bg-blue-600 text-white dark:bg-sky-500 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-300'
            }`}
            onClick={() => setViewMode('graph')}
          >
            <Network className="size-3.5" />
            Grafo
          </button>
        </div>
      </div>

      <label className="mb-3 inline-flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-600 dark:bg-slate-900/60">
        <Search className="size-3.5 text-slate-500 dark:text-slate-400" />
        <input
          className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
          placeholder="Filtrar por clave, ruta o valor..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          spellCheck={false}
        />
      </label>

      {viewMode === 'tree' ? (
        <div className="grid gap-2">
          <JsonTreeNode label="root" value={data} depth={0} path="root" query={normalizedQuery} />
        </div>
      ) : (
        <GraphView data={data} query={normalizedQuery} />
      )}
    </section>
  )
}
