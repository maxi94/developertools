import { useEffect, useMemo, useState } from 'react'
import { Menu, PanelLeft, Star, X } from 'lucide-react'
import { Base64Tool } from '@/features/base64/ui/Base64Tool'
import { JsonFormatterTool } from '@/features/json-formatter/ui/JsonFormatterTool'
import { JwtTool } from '@/features/jwt/ui/JwtTool'
import { tools } from '@/features/tool-registry/model/tools'
import { ComingSoonTool } from '@/features/tool-registry/ui/ComingSoonTool'
import { ToolCard } from '@/features/tool-registry/ui/ToolCard'
import { UuidTool } from '@/features/uuid/ui/UuidTool'
import type { ToolId } from '@/shared/types/tool'

const FAVORITES_KEY = 'developer-tools-favorites'

function getInitialFavorites(): ToolId[] {
  const raw = window.localStorage.getItem(FAVORITES_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    const validToolIds = new Set<ToolId>(tools.map((tool) => tool.id))
    return parsed.filter((toolId): toolId is ToolId => validToolIds.has(toolId as ToolId))
  } catch {
    return []
  }
}

interface MenuPanelProps {
  activeToolId: ToolId
  favoriteToolIds: ToolId[]
  onSelect: (toolId: ToolId) => void
  onToggleFavorite: (toolId: ToolId) => void
}

function MenuPanel({ activeToolId, favoriteToolIds, onSelect, onToggleFavorite }: MenuPanelProps) {
  const favoriteTools = tools.filter((tool) => favoriteToolIds.includes(tool.id))

  return (
    <>
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/50">
        <h2 className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          <Star className="size-3.5" />
          Favoritos
        </h2>
        {favoriteTools.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {favoriteTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                  tool.id === activeToolId
                    ? 'border-blue-500 bg-blue-600 text-white dark:border-sky-400 dark:bg-sky-500 dark:text-slate-950'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400'
                }`}
                onClick={() => onSelect(tool.id)}
              >
                {tool.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Marca una herramienta con estrella.
          </p>
        )}
      </div>

      <nav className="grid gap-2" aria-label="Menu de funcionalidades">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            isActive={tool.id === activeToolId}
            isFavorite={favoriteToolIds.includes(tool.id)}
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </nav>
    </>
  )
}

export function ToolList() {
  const [activeToolId, setActiveToolId] = useState<ToolId>('json-formatter')
  const [favoriteToolIds, setFavoriteToolIds] = useState<ToolId[]>(getInitialFavorites)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const activeTool = useMemo(() => tools.find((tool) => tool.id === activeToolId), [activeToolId])

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteToolIds))
  }, [favoriteToolIds])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const toggleFavorite = (toolId: ToolId) => {
    setFavoriteToolIds((currentFavorites) =>
      currentFavorites.includes(toolId)
        ? currentFavorites.filter((id) => id !== toolId)
        : [...currentFavorites, toolId],
    )
  }

  const selectTool = (toolId: ToolId) => {
    setActiveToolId(toolId)
    setIsMobileMenuOpen(false)
  }

  return (
    <section className="grid gap-4">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm lg:hidden dark:border-slate-700/70 dark:bg-slate-900/75 dark:text-slate-100"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="size-4" />
        Menu
      </button>

      <section className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        <aside className="hidden h-[calc(100vh-3.5rem)] overflow-y-auto rounded-2xl border border-slate-300/70 bg-white/90 p-4 shadow-lg shadow-slate-900/10 backdrop-blur lg:sticky lg:top-4 lg:block dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-black/40">
          <h2 className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            <PanelLeft className="size-3.5" />
            Menu de funcionalidades
          </h2>
          <MenuPanel
            activeToolId={activeToolId}
            favoriteToolIds={favoriteToolIds}
            onSelect={selectTool}
            onToggleFavorite={toggleFavorite}
          />
        </aside>

        <div className="min-w-0">
          {activeTool?.id === 'json-formatter' ? <JsonFormatterTool /> : null}
          {activeTool?.id === 'base64' ? <Base64Tool /> : null}
          {activeTool?.id === 'jwt' ? <JwtTool /> : null}
          {activeTool?.id === 'uuid' ? <UuidTool /> : null}
          {activeTool?.id === 'url-codec' ? (
            <ComingSoonTool toolName={activeTool?.name ?? 'Herramienta'} />
          ) : null}
        </div>
      </section>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/50 transition lg:hidden ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[340px] overflow-y-auto border-r border-slate-300 bg-white p-4 pb-8 shadow-2xl transition-transform duration-300 lg:hidden dark:border-slate-700 dark:bg-slate-950 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            <PanelLeft className="size-3.5" />
            Menu de funcionalidades
          </h2>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-md border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Cerrar menu"
          >
            <X className="size-4" />
          </button>
        </div>

        <MenuPanel
          activeToolId={activeToolId}
          favoriteToolIds={favoriteToolIds}
          onSelect={selectTool}
          onToggleFavorite={toggleFavorite}
        />
      </aside>
    </section>
  )
}
