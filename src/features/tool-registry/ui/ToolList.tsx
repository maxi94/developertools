import { useEffect, useMemo, useState } from 'react'
import { Star } from 'lucide-react'
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

export function ToolList() {
  const [activeToolId, setActiveToolId] = useState<ToolId>('json-formatter')
  const [favoriteToolIds, setFavoriteToolIds] = useState<ToolId[]>(getInitialFavorites)

  const activeTool = useMemo(() => tools.find((tool) => tool.id === activeToolId), [activeToolId])
  const favoriteTools = useMemo(
    () => tools.filter((tool) => favoriteToolIds.includes(tool.id)),
    [favoriteToolIds],
  )

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteToolIds))
  }, [favoriteToolIds])

  const toggleFavorite = (toolId: ToolId) => {
    setFavoriteToolIds((currentFavorites) =>
      currentFavorites.includes(toolId)
        ? currentFavorites.filter((id) => id !== toolId)
        : [...currentFavorites, toolId],
    )
  }

  return (
    <section className="grid gap-4">
      <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
        <h2 className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          <Star className="size-3.5" />
          Favoritos
        </h2>
        {favoriteTools.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {favoriteTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  tool.id === activeToolId
                    ? 'border-blue-500 bg-blue-600 text-white dark:border-sky-400 dark:bg-sky-500 dark:text-slate-950'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400'
                }`}
                onClick={() => setActiveToolId(tool.id)}
              >
                <Star className="size-3.5 fill-current" />
                {tool.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Marca herramientas con estrella en el menu para tener acceso rapido aqui.
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur lg:hidden dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          Menu rapido
        </h2>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                tool.id === activeToolId
                  ? 'border-blue-500 bg-blue-600 text-white dark:border-sky-400 dark:bg-sky-500 dark:text-slate-950'
                  : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
              }`}
              onClick={() => setActiveToolId(tool.id)}
            >
              {tool.name}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden h-fit rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur lg:sticky lg:top-4 lg:block dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            Menu de funcionalidades
          </h2>
          <div className="grid gap-2">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isActive={tool.id === activeToolId}
                isFavorite={favoriteToolIds.includes(tool.id)}
                onSelect={setActiveToolId}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </aside>

        <div>
          {activeTool?.id === 'json-formatter' ? <JsonFormatterTool /> : null}
          {activeTool?.id === 'base64' ? <Base64Tool /> : null}
          {activeTool?.id === 'jwt' ? <JwtTool /> : null}
          {activeTool?.id === 'uuid' ? <UuidTool /> : null}
          {activeTool?.id === 'url-codec' ? (
            <ComingSoonTool toolName={activeTool?.name ?? 'Herramienta'} />
          ) : null}
        </div>
      </section>
    </section>
  )
}
