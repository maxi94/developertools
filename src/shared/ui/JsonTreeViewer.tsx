import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Expand,
  LocateFixed,
  Minimize2,
  Network,
  Search,
  TreePine,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

interface JsonTreeViewerProps {
  data: unknown
  title?: string
}

interface JsonTreeNodeProps {
  label: string
  value: unknown
  depth: number
  path: string
  visiblePaths: Set<string> | null
  resetToken: number
  collapseMode: 'auto' | 'expanded' | 'collapsed'
}

interface GraphNode {
  id: string
  label: string
  path: string
  parentId: string | null
  type: string
  preview: string
}

interface SvgNodePosition {
  id: string
  x: number
  y: number
  label: string
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

function collectVisiblePaths(
  label: string,
  value: unknown,
  path: string,
  query: string,
  visiblePaths: Set<string>,
): boolean {
  const selfMatch = matchesQuery(path, label, value, query)

  if (!value || typeof value !== 'object') {
    if (selfMatch) {
      visiblePaths.add(path)
    }
    return selfMatch
  }

  const entries = Array.isArray(value)
    ? value.map((child, index) => [String(index), child] as const)
    : Object.entries(value as Record<string, unknown>)

  let hasChildMatch = false
  for (const [childLabel, childValue] of entries) {
    const childPath = Array.isArray(value) ? `${path}[${childLabel}]` : `${path}.${childLabel}`
    if (collectVisiblePaths(childLabel, childValue, childPath, query, visiblePaths)) {
      hasChildMatch = true
    }
  }

  if (selfMatch || hasChildMatch) {
    visiblePaths.add(path)
  }

  return selfMatch || hasChildMatch
}

function JsonTreeNode({
  label,
  value,
  depth,
  path,
  visiblePaths,
  resetToken,
  collapseMode,
}: JsonTreeNodeProps) {
  const isExpandable =
    value !== null && typeof value === 'object' && Object.keys(value as object).length > 0
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (collapseMode === 'expanded') {
      return false
    }
    if (collapseMode === 'collapsed') {
      return isExpandable
    }
    return depth > 1
  })
  const visible = !visiblePaths || visiblePaths.has(path)

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
        className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
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
          {entries.map(([childLabel, childValue]) => {
            const childPath = Array.isArray(value)
              ? `${path}[${childLabel}]`
              : `${path}.${childLabel}`
            return (
              <JsonTreeNode
                key={`${path}-${childLabel}-${resetToken}`}
                label={childLabel}
                value={childValue}
                depth={depth + 1}
                path={childPath}
                visiblePaths={visiblePaths}
                resetToken={resetToken}
                collapseMode={collapseMode}
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
  const MIN_ZOOM = 0.45
  const MAX_ZOOM = 2.6
  const ZOOM_STEP = 0.1
  const PAN_STEP = 96

  const [selectedId, setSelectedId] = useState<string>('root')
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set())
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
  const deferredNodes = useDeferredValue(filteredNodes)
  const isRendering = deferredNodes !== filteredNodes

  const frameRef = useRef<HTMLDivElement | null>(null)
  const panStartRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const touchPanRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null)

  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, GraphNode[]>()
    for (const node of deferredNodes) {
      const current = map.get(node.parentId) ?? []
      current.push(node)
      map.set(node.parentId, current)
    }
    return map
  }, [deferredNodes])

  const hasChildrenSet = useMemo(() => {
    const ids = new Set<string>()
    for (const node of deferredNodes) {
      if ((childrenByParent.get(node.id)?.length ?? 0) > 0) {
        ids.add(node.id)
      }
    }
    return ids
  }, [childrenByParent, deferredNodes])

  const visibleGraphNodes = useMemo(() => {
    const visible: GraphNode[] = []
    const visit = (node: GraphNode) => {
      visible.push(node)
      if (collapsedNodeIds.has(node.id)) {
        return
      }
      const children = childrenByParent.get(node.id) ?? []
      for (const child of children) {
        visit(child)
      }
    }

    const roots = childrenByParent.get(null) ?? []
    for (const root of roots) {
      visit(root)
    }

    return visible
  }, [childrenByParent, collapsedNodeIds])

  const activeSelectedId = visibleGraphNodes.some((node) => node.id === selectedId)
    ? selectedId
    : (visibleGraphNodes[0]?.id ?? 'root')
  const selectedNode = deferredNodes.find((node) => node.id === activeSelectedId) ?? null
  const children = childrenByParent.get(activeSelectedId) ?? []
  const isLargeGraph = visibleGraphNodes.length > 220
  const renderLimit = isLargeGraph ? 220 : visibleGraphNodes.length
  const visibleNodes = useMemo(
    () => visibleGraphNodes.slice(0, renderLimit),
    [renderLimit, visibleGraphNodes],
  )
  const visibleIds = new Set(visibleNodes.map((node) => node.id))
  const visibleEdges = visibleNodes.filter(
    (node) => node.parentId && visibleIds.has(node.parentId),
  ) as Array<GraphNode & { parentId: string }>

  const svgLayout = useMemo(() => {
    const graphNodes = visibleGraphNodes.slice(0, renderLimit)
    const byDepth = new Map<number, GraphNode[]>()
    const depthById = new Map<string, number>()
    const nodeById = new Map(graphNodes.map((node) => [node.id, node]))

    const getDepth = (node: GraphNode): number => {
      if (!node.parentId) {
        return 0
      }
      const cached = depthById.get(node.id)
      if (cached !== undefined) {
        return cached
      }
      const parent = nodeById.get(node.parentId)
      const depth = parent ? getDepth(parent) + 1 : 0
      depthById.set(node.id, depth)
      return depth
    }

    for (const node of graphNodes) {
      const depth = getDepth(node)
      const bucket = byDepth.get(depth) ?? []
      bucket.push(node)
      byDepth.set(depth, bucket)
    }

    const depthKeys = Array.from(byDepth.keys()).sort((a, b) => a - b)
    const positions: SvgNodePosition[] = []
    const posById = new Map<string, { x: number; y: number }>()
    const colWidth = 210
    const rowHeight = 60

    for (const depth of depthKeys) {
      const col = byDepth.get(depth) ?? []
      for (let row = 0; row < col.length; row += 1) {
        const node = col[row]
        const x = 120 + depth * colWidth
        const y = 52 + row * rowHeight
        positions.push({
          id: node.id,
          x,
          y,
          label: node.label,
          type: node.type,
          preview: node.preview,
        })
        posById.set(node.id, { x, y })
      }
    }

    const maxRows = Math.max(1, ...depthKeys.map((depth: number) => (byDepth.get(depth) ?? []).length))
    return {
      width: Math.max(760, depthKeys.length * colWidth + 220),
      height: Math.max(260, maxRows * rowHeight + 80),
      positions,
      posById,
    }
  }, [renderLimit, visibleGraphNodes])

  const centerOnNode = useCallback((nodeId: string) => {
    const frame = frameRef.current
    const point = svgLayout.posById.get(nodeId)
    if (!frame || !point) {
      return
    }

    const targetX = point.x * zoom - frame.clientWidth / 2
    const targetY = point.y * zoom - frame.clientHeight / 2
    frame.scrollTo({ left: Math.max(0, targetX), top: Math.max(0, targetY), behavior: 'smooth' })
  }, [svgLayout.posById, zoom])

  const applyZoom = useCallback(
    (nextZoom: number, anchor?: { x: number; y: number }) => {
      const frame = frameRef.current
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(nextZoom.toFixed(2))))
      if (!frame || !anchor || clamped === zoom) {
        setZoom(clamped)
        return
      }

      const worldX = (frame.scrollLeft + anchor.x) / zoom
      const worldY = (frame.scrollTop + anchor.y) / zoom
      setZoom(clamped)
      window.requestAnimationFrame(() => {
        frame.scrollTo({
          left: Math.max(0, worldX * clamped - anchor.x),
          top: Math.max(0, worldY * clamped - anchor.y),
          behavior: 'auto',
        })
      })
    },
    [zoom],
  )

  const zoomFromViewportCenter = useCallback((delta: number) => {
    const frame = frameRef.current
    if (!frame) {
      setZoom((current) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((current + delta).toFixed(2)))))
      return
    }

    const anchor = { x: frame.clientWidth / 2, y: frame.clientHeight / 2 }
    setZoom((current) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((current + delta).toFixed(2))))
      if (next === current) {
        return current
      }

      const worldX = (frame.scrollLeft + anchor.x) / current
      const worldY = (frame.scrollTop + anchor.y) / current
      window.requestAnimationFrame(() => {
        frame.scrollTo({
          left: Math.max(0, worldX * next - anchor.x),
          top: Math.max(0, worldY * next - anchor.y),
          behavior: 'auto',
        })
      })
      return next
    })
  }, [])

  const isZoomInKey = (event: KeyboardEvent | React.KeyboardEvent) =>
    event.code === 'NumpadAdd' ||
    event.code === 'Equal' ||
    event.key === '+' ||
    event.key === '='

  const isZoomOutKey = (event: KeyboardEvent | React.KeyboardEvent) =>
    event.code === 'NumpadSubtract' ||
    event.code === 'Minus' ||
    event.key === '-' ||
    event.key === '_'

  const toggleNodeCollapse = useCallback((nodeId: string) => {
    setSelectedId(nodeId)
    setCollapsedNodeIds((current) => {
      const next = new Set(current)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  const collapseAll = useCallback(() => {
    const next = new Set<string>()
    for (const nodeId of hasChildrenSet) {
      if (nodeId !== 'root') {
        next.add(nodeId)
      }
    }
    setCollapsedNodeIds(next)
  }, [hasChildrenSet])

  const expandAll = useCallback(() => {
    setCollapsedNodeIds(new Set())
  }, [])

  const toggleFullscreen = async () => {
    const frame = frameRef.current
    if (!frame) {
      return
    }

    if (!document.fullscreenElement) {
      await frame.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement && document.fullscreenElement === frameRef.current))
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    centerOnNode(activeSelectedId)
  }, [activeSelectedId, centerOnNode])

  useEffect(() => {
    const onWindowKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }

      const frame = frameRef.current
      if (!frame) {
        return
      }

      if (isZoomInKey(event)) {
        event.preventDefault()
        zoomFromViewportCenter(ZOOM_STEP)
      } else if (isZoomOutKey(event)) {
        event.preventDefault()
        zoomFromViewportCenter(-ZOOM_STEP)
      }
    }

    window.addEventListener('keydown', onWindowKeyDown)
    return () => window.removeEventListener('keydown', onWindowKeyDown)
  }, [zoomFromViewportCenter])

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
      <section className="rounded-xl border border-slate-200 bg-white/60 p-3 dark:border-slate-700 dark:bg-slate-900/40 lg:col-span-2">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-600 dark:text-slate-300">
            {isRendering ? 'Renderizando grafo...' : `Nodos visibles: ${visibleGraphNodes.length}`}
            {isLargeGraph ? ` | Vista simplificada (${renderLimit})` : ''}
          </div>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
              onClick={() => zoomFromViewportCenter(-ZOOM_STEP)}
            >
              <ZoomOut className="size-3.5" />
              Zoom -
            </button>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
              onClick={() => zoomFromViewportCenter(ZOOM_STEP)}
            >
              <ZoomIn className="size-3.5" />
              Zoom +
            </button>
            <span className="inline-flex min-w-12 items-center justify-center rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
              onClick={() => {
                applyZoom(1)
                centerOnNode(activeSelectedId)
              }}
            >
              <LocateFixed className="size-3.5" />
              Centrar
            </button>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="size-3.5" /> : <Expand className="size-3.5" />}
              {isFullscreen ? 'Salir pantalla completa' : 'Pantalla completa'}
            </button>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
              onClick={expandAll}
            >
              Expandir nodos
            </button>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
              onClick={collapseAll}
            >
              Colapsar nodos
            </button>
          </div>
        </div>
        <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">
          Zoom con `+/-` (o botones). Flechas: navegar. `Enter`: colapsar/expandir nodo. `0`: reset.
        </p>

        <div
          ref={frameRef}
          tabIndex={0}
          style={{ touchAction: 'none' }}
          className={`max-h-[68vh] overflow-auto rounded-lg border border-slate-200 bg-slate-50/80 p-2 dark:border-slate-700 dark:bg-slate-950/30 ${
            isPanning ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
          onMouseDown={(event) => {
            const canPan = event.button === 1 || event.button === 0 || (event.button === 0 && isSpacePressed)
            if (!canPan || !frameRef.current) {
              return
            }
            event.preventDefault()
            panStartRef.current = {
              x: event.clientX,
              y: event.clientY,
              left: frameRef.current.scrollLeft,
              top: frameRef.current.scrollTop,
            }
            setIsPanning(true)
          }}
          onMouseMove={(event) => {
            if (!isPanning || !panStartRef.current || !frameRef.current) {
              return
            }
            const dx = event.clientX - panStartRef.current.x
            const dy = event.clientY - panStartRef.current.y
            frameRef.current.scrollLeft = panStartRef.current.left - dx
            frameRef.current.scrollTop = panStartRef.current.top - dy
          }}
          onMouseUp={() => {
            panStartRef.current = null
            setIsPanning(false)
          }}
          onMouseLeave={() => {
            panStartRef.current = null
            setIsPanning(false)
          }}
          onTouchStart={(event) => {
            const frame = frameRef.current
            if (!frame) {
              return
            }

            if (event.touches.length === 2) {
              const [touchA, touchB] = [event.touches[0], event.touches[1]]
              const dx = touchA.clientX - touchB.clientX
              const dy = touchA.clientY - touchB.clientY
              pinchRef.current = {
                distance: Math.hypot(dx, dy),
                zoom,
              }
              touchPanRef.current = null
              setIsPanning(false)
              return
            }

            if (event.touches.length === 1) {
              const touch = event.touches[0]
              touchPanRef.current = {
                x: touch.clientX,
                y: touch.clientY,
                left: frame.scrollLeft,
                top: frame.scrollTop,
              }
              pinchRef.current = null
              setIsPanning(true)
            }
          }}
          onTouchMove={(event) => {
            const frame = frameRef.current
            if (!frame) {
              return
            }

            if (event.touches.length === 2 && pinchRef.current) {
              event.preventDefault()
              const [touchA, touchB] = [event.touches[0], event.touches[1]]
              const dx = touchA.clientX - touchB.clientX
              const dy = touchA.clientY - touchB.clientY
              const nextDistance = Math.hypot(dx, dy)
              if (!nextDistance || pinchRef.current.distance <= 0) {
                return
              }

              const ratio = nextDistance / pinchRef.current.distance
              const rect = frame.getBoundingClientRect()
              const centerX = (touchA.clientX + touchB.clientX) / 2 - rect.left
              const centerY = (touchA.clientY + touchB.clientY) / 2 - rect.top
              applyZoom(pinchRef.current.zoom * ratio, { x: centerX, y: centerY })
              return
            }

            if (event.touches.length === 1 && touchPanRef.current) {
              event.preventDefault()
              const touch = event.touches[0]
              const dx = touch.clientX - touchPanRef.current.x
              const dy = touch.clientY - touchPanRef.current.y
              frame.scrollLeft = touchPanRef.current.left - dx
              frame.scrollTop = touchPanRef.current.top - dy
            }
          }}
          onTouchEnd={(event) => {
            const frame = frameRef.current
            if (!frame) {
              touchPanRef.current = null
              pinchRef.current = null
              setIsPanning(false)
              return
            }

            if (event.touches.length === 0) {
              touchPanRef.current = null
              pinchRef.current = null
              setIsPanning(false)
              return
            }

            if (event.touches.length === 1) {
              const touch = event.touches[0]
              touchPanRef.current = {
                x: touch.clientX,
                y: touch.clientY,
                left: frame.scrollLeft,
                top: frame.scrollTop,
              }
              pinchRef.current = null
              setIsPanning(true)
            }
          }}
          onKeyDown={(event) => {
            const frame = frameRef.current
            if (!frame) {
              return
            }
            if (event.key === ' ') {
              event.preventDefault()
              setIsSpacePressed(true)
              return
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              frame.scrollBy({ top: -PAN_STEP, behavior: 'smooth' })
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              frame.scrollBy({ top: PAN_STEP, behavior: 'smooth' })
            }
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              frame.scrollBy({ left: -PAN_STEP, behavior: 'smooth' })
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              frame.scrollBy({ left: PAN_STEP, behavior: 'smooth' })
            }
            if (isZoomInKey(event)) {
              event.preventDefault()
              zoomFromViewportCenter(ZOOM_STEP)
            }
            if (isZoomOutKey(event)) {
              event.preventDefault()
              zoomFromViewportCenter(-ZOOM_STEP)
            }
            if (event.key === '0') {
              event.preventDefault()
              applyZoom(1, { x: frame.clientWidth / 2, y: frame.clientHeight / 2 })
              centerOnNode(activeSelectedId)
            }
            if (event.key === 'Enter' && hasChildrenSet.has(activeSelectedId)) {
              event.preventDefault()
              toggleNodeCollapse(activeSelectedId)
            }
          }}
          onKeyUp={(event) => {
            if (event.key === ' ') {
              setIsSpacePressed(false)
            }
          }}
        >
          <div style={{ width: svgLayout.width * zoom, height: svgLayout.height * zoom }}>
            <svg
              width={svgLayout.width * zoom}
              height={svgLayout.height * zoom}
              viewBox={`0 0 ${svgLayout.width} ${svgLayout.height}`}
            >
              <defs>
                <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                  <polygon points="0 0, 7 3.5, 0 7" className="fill-slate-400 dark:fill-slate-500" />
                </marker>
              </defs>
              {visibleEdges.map((edge) => {
                const from = svgLayout.posById.get(edge.parentId)
                const to = svgLayout.posById.get(edge.id)
                if (!from || !to) {
                  return null
                }
                return (
                  <line
                    key={`${edge.parentId}-${edge.id}`}
                    x1={from.x + 52}
                    y1={from.y}
                    x2={to.x - 52}
                    y2={to.y}
                    stroke="currentColor"
                    className="text-slate-400 dark:text-slate-500"
                    strokeWidth={1.4}
                    markerEnd="url(#arrowhead)"
                  />
                )
              })}
              {svgLayout.positions.map((node) => (
                <g
                  key={node.id}
                  onClick={() => {
                    setSelectedId(node.id)
                    centerOnNode(node.id)
                  }}
                  className="cursor-pointer"
                >
                  <rect
                    x={node.x - 52}
                    y={node.y - 23}
                    width={104}
                    height={46}
                    rx={10}
                    className={`stroke-[1.2] ${
                      node.id === activeSelectedId
                        ? 'fill-blue-100 stroke-blue-500 dark:fill-sky-500/20 dark:stroke-sky-400'
                        : 'fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-600'
                    }`}
                  />
                  <text
                    x={node.x}
                    y={node.y - 7}
                    textAnchor="middle"
                    className="fill-slate-800 text-[10px] font-semibold dark:fill-slate-100"
                  >
                    {node.label.length > 16 ? `${node.label.slice(0, 16)}...` : node.label}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    className="fill-slate-500 text-[9px] dark:fill-slate-400"
                  >
                    {node.type}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 15}
                    textAnchor="middle"
                    className="fill-slate-500 text-[8px] dark:fill-slate-400"
                  >
                    {node.preview.length > 18 ? `${node.preview.slice(0, 18)}...` : node.preview}
                  </text>
                  {hasChildrenSet.has(node.id) ? (
                    <g
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleNodeCollapse(node.id)
                      }}
                    >
                      <circle
                        cx={node.x + 40}
                        cy={node.y + 13}
                        r={8}
                        className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-500"
                      />
                      <text
                        x={node.x + 40}
                        y={node.y + 16}
                        textAnchor="middle"
                        className="fill-slate-700 text-[10px] font-semibold dark:fill-slate-200"
                      >
                        {collapsedNodeIds.has(node.id) ? '+' : '-'}
                      </text>
                    </g>
                  ) : null}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      <div className="grid max-h-[420px] gap-2 overflow-auto pr-1">
        {visibleGraphNodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
              node.id === activeSelectedId
                ? 'border-blue-500 bg-blue-50 dark:border-sky-400 dark:bg-sky-500/10'
                : 'border-slate-200 bg-white hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-sky-500'
            }`}
            onClick={() => {
              setSelectedId(node.id)
              centerOnNode(node.id)
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-slate-700 dark:text-slate-200">{node.label}</p>
              {hasChildrenSet.has(node.id) ? (
                <button
                  type="button"
                  className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded border border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:text-slate-300 dark:hover:border-sky-400 dark:hover:text-sky-300"
                  onClick={(event) => {
                    event.stopPropagation()
                    toggleNodeCollapse(node.id)
                  }}
                  aria-label={collapsedNodeIds.has(node.id) ? 'Expandir nodo' : 'Colapsar nodo'}
                >
                  {collapsedNodeIds.has(node.id) ? (
                    <ChevronRight className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                </button>
              ) : null}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{node.path}</p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {node.preview}
            </p>
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
              <p className="mb-1 font-semibold text-slate-600 dark:text-slate-300">Conexiones hijas</p>
              {hasChildrenSet.has(activeSelectedId) ? (
                <button
                  type="button"
                  className="mb-2 inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
                  onClick={() => toggleNodeCollapse(activeSelectedId)}
                >
                  {collapsedNodeIds.has(activeSelectedId) ? 'Expandir seleccion' : 'Colapsar seleccion'}
                </button>
              ) : null}
              <div className="grid gap-1">
                {children.length > 0 ? (
                  children.map((child) => (
                    <p key={child.id} className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">
                      {selectedNode.label}
                      {' -> '}
                      {child.label}
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
  const [resetToken, setResetToken] = useState(0)
  const [collapseMode, setCollapseMode] = useState<'auto' | 'expanded' | 'collapsed'>('auto')
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const visiblePaths = useMemo(() => {
    if (!normalizedQuery) {
      return null
    }

    const paths = new Set<string>()
    collectVisiblePaths('root', data, 'root', normalizedQuery, paths)
    return paths
  }, [data, normalizedQuery])

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        <div className="inline-flex items-center gap-1">
          {viewMode === 'tree' ? (
            <>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
                onClick={() => {
                  setCollapseMode('expanded')
                  setResetToken((value) => value + 1)
                }}
              >
                Expandir todo
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
                onClick={() => {
                  setCollapseMode('collapsed')
                  setResetToken((value) => value + 1)
                }}
              >
                Colapsar todo
              </button>
            </>
          ) : null}
        </div>
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
          <JsonTreeNode
            key={`root-${resetToken}`}
            label="root"
            value={data}
            depth={0}
            path="root"
            visiblePaths={visiblePaths}
            resetToken={resetToken}
            collapseMode={collapseMode}
          />
        </div>
      ) : (
        <GraphView data={data} query={normalizedQuery} />
      )}
    </section>
  )
}

