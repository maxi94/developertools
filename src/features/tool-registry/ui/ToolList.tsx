import { useEffect, useMemo, useState } from 'react'
import {
  ChevronRight,
  House,
  Menu,
  MoonStar,
  PanelLeft,
  Search,
  Sparkles,
  Star,
  Sun,
  X,
} from 'lucide-react'
import { Base64ImageTool } from '@/features/base64-image/ui/Base64ImageTool'
import { Base64PdfTool } from '@/features/base64-pdf/ui/Base64PdfTool'
import { Base64Tool } from '@/features/base64/ui/Base64Tool'
import { JsonFormatterTool } from '@/features/json-formatter/ui/JsonFormatterTool'
import { JsonModelGeneratorTool } from '@/features/json-model-generator/ui/JsonModelGeneratorTool'
import { JwtTool } from '@/features/jwt/ui/JwtTool'
import { ReadmeGeneratorTool } from '@/features/readme-generator/ui/ReadmeGeneratorTool'
import { SqlFormatterTool } from '@/features/sql-formatter/ui/SqlFormatterTool'
import { tools } from '@/features/tool-registry/model/tools'
import { ComingSoonTool } from '@/features/tool-registry/ui/ComingSoonTool'
import { ToolCard } from '@/features/tool-registry/ui/ToolCard'
import { UuidTool } from '@/features/uuid/ui/UuidTool'
import { useTheme } from '@/shared/hooks/useTheme'
import type { ToolCategory, ToolDefinition, ToolId } from '@/shared/types/tool'

const FAVORITES_KEY = 'developer-tools-favorites'
const categoryOrder: ToolCategory[] = [
  'Datos',
  'Formateadores',
  'Generadores de codigo',
  'Tokens e identidad',
  'Utilidades web',
  'Documentacion',
]

const categoryDescriptions: Record<ToolCategory, string> = {
  Datos: 'Utilidades para transformar y visualizar informacion de forma local.',
  Formateadores: 'Herramientas para dar formato legible a contenidos tecnicos.',
  'Generadores de codigo': 'Utilidades para crear clases, plantillas y codigo base.',
  'Tokens e identidad': 'Herramientas para generacion y analisis de identificadores y tokens.',
  'Utilidades web': 'Helpers para codificacion, escaping y tareas habituales de desarrollo web.',
  Documentacion: 'Generadores y asistentes para acelerar la documentacion tecnica.',
}

const releaseNotes = [
  {
    version: 'v0.4.0',
    date: '2026-02-19',
    title: 'Navegacion por Home/Categoria/Herramienta',
    changes: [
      'Nueva pagina de inicio con historial de mejoras.',
      'Nueva pagina por categoria con descripcion y accesos rapidos.',
      'Breadcrumb clickable para volver a Home o Categoria.',
    ],
  },
  {
    version: 'v0.3.0',
    date: '2026-02-19',
    title: 'Expansion de Base64',
    changes: [
      'Nuevas tools separadas: Base64 a Imagen y Base64 a PDF.',
      'Soporte para entrada unica y arrays JSON.',
      'Vista previa y descarga de assets generados.',
    ],
  },
  {
    version: 'v0.2.0',
    date: '2026-02-19',
    title: 'Generador README avanzado',
    changes: [
      'Editor completo con presets, secciones custom y TOC automatica.',
      'Preview progresiva con descarga de README.md.',
      'Campos para FAQ, roadmap, badges y enlaces.',
    ],
  },
]

type ViewState =
  | { type: 'home' }
  | { type: 'category'; category: ToolCategory }
  | { type: 'tool'; toolId: ToolId }

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

interface SidebarContentProps {
  favoriteToolIds: ToolId[]
  menuTools: ToolDefinition[]
  searchTerm: string
  selectedCategory: ToolCategory | null
  activeToolId: ToolId | null
  viewType: ViewState['type']
  onGoHome: () => void
  onSelectCategory: (category: ToolCategory) => void
  onSelectTool: (toolId: ToolId) => void
  onToggleFavorite: (toolId: ToolId) => void
}

function SidebarContent({
  favoriteToolIds,
  menuTools,
  searchTerm,
  selectedCategory,
  activeToolId,
  viewType,
  onGoHome,
  onSelectCategory,
  onSelectTool,
  onToggleFavorite,
}: SidebarContentProps) {
  const favoriteTools = tools.filter((tool) => favoriteToolIds.includes(tool.id))
  const groupedTools = categoryOrder
    .map((category) => ({
      category,
      tools: menuTools.filter((tool) => tool.category === category),
    }))
    .filter((group) => group.tools.length > 0)

  return (
    <>
      <button
        type="button"
        onClick={onGoHome}
        className={`mb-3 inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] transition ${
          viewType === 'home'
            ? 'border-white/30 bg-white/20 text-white'
            : 'border-white/10 bg-white/5 text-indigo-100/80 hover:bg-white/10 hover:text-white'
        }`}
      >
        <House className="size-4" />
        Inicio
      </button>

      <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
        <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-200/80">
          <Star className="size-3.5" />
          Accesos rapidos
        </p>
        {favoriteTools.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {favoriteTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                  tool.id === activeToolId && viewType === 'tool'
                    ? 'border-white/25 bg-white/20 text-white'
                    : 'border-white/10 bg-transparent text-indigo-100/80 hover:border-white/20 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => onSelectTool(tool.id)}
              >
                {tool.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-indigo-100/70">Fija herramientas con el icono de pin.</p>
        )}
      </div>

      <div className="grid gap-3">
        {groupedTools.map((group) => (
          <section key={group.category} className="grid gap-1.5">
            <button
              type="button"
              className={`rounded-md px-1 py-1 text-left text-[10px] font-semibold uppercase tracking-[0.14em] ${
                selectedCategory === group.category
                  ? 'text-white'
                  : 'text-indigo-200/70 hover:text-indigo-100'
              }`}
              onClick={() => onSelectCategory(group.category)}
            >
              {group.category}
            </button>
            <nav className="grid gap-1.5" aria-label={`Menu ${group.category}`}>
              {group.tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isActive={tool.id === activeToolId && viewType === 'tool'}
                  isFavorite={favoriteToolIds.includes(tool.id)}
                  onSelect={onSelectTool}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </nav>
          </section>
        ))}
      </div>

      {menuTools.length === 0 ? (
        <p className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-indigo-100/80">
          No se encontraron herramientas para: <strong>{searchTerm}</strong>
        </p>
      ) : null}
    </>
  )
}

interface HomeOverviewProps {
  favorites: ToolDefinition[]
  onSelectCategory: (category: ToolCategory) => void
  onSelectTool: (toolId: ToolId) => void
}

function HomeOverview({ favorites, onSelectCategory, onSelectTool }: HomeOverviewProps) {
  return (
    <section className="grid gap-4">
      <section className="rounded-xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="size-4" />
          Mejoras desde tu ultima visita
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {releaseNotes.map((release) => (
            <article
              key={release.version}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                {release.version} - {release.date}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {release.title}
              </h3>
              <ul className="mt-2 grid gap-1 text-xs text-slate-600 dark:text-slate-300">
                {release.changes.map((change) => (
                  <li key={change}>• {change}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
        <h2 className="text-lg font-semibold">Categorias</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {categoryOrder.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-sky-500 dark:hover:bg-sky-950/40"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{category}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {categoryDescriptions[category]}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
        <h2 className="text-lg font-semibold">Favoritos</h2>
        {favorites.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {favorites.map((tool) => (
              <button
                key={tool.id}
                type="button"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-300"
                onClick={() => onSelectTool(tool.id)}
              >
                {tool.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Todavia no tenes favoritos fijados.
          </p>
        )}
      </section>
    </section>
  )
}

interface CategoryOverviewProps {
  category: ToolCategory
  toolsByCategory: ToolDefinition[]
  favoriteToolIds: ToolId[]
  onSelectTool: (toolId: ToolId) => void
  onToggleFavorite: (toolId: ToolId) => void
}

function CategoryOverview({
  category,
  toolsByCategory,
  favoriteToolIds,
  onSelectTool,
  onToggleFavorite,
}: CategoryOverviewProps) {
  return (
    <section className="grid gap-4">
      <section className="rounded-xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
        <h2 className="text-lg font-semibold">{category}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {categoryDescriptions[category]}
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {toolsByCategory.map((tool) => (
          <article
            key={tool.id}
            className="rounded-xl border border-slate-300/70 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/85"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {tool.name}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {tool.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleFavorite(tool.id)}
                className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${
                  favoriteToolIds.includes(tool.id)
                    ? 'border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-400/60 dark:bg-amber-900/30 dark:text-amber-200'
                    : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {favoriteToolIds.includes(tool.id) ? 'Favorito' : 'Fijar'}
              </button>
            </div>

            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline dark:text-sky-300"
              onClick={() => onSelectTool(tool.id)}
            >
              Abrir herramienta
              <ChevronRight className="size-3.5" />
            </button>
          </article>
        ))}
      </section>
    </section>
  )
}

export function ToolList() {
  const { theme, toggleTheme } = useTheme()
  const [view, setView] = useState<ViewState>({ type: 'home' })
  const [favoriteToolIds, setFavoriteToolIds] = useState<ToolId[]>(getInitialFavorites)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const activeTool = useMemo(
    () => (view.type === 'tool' ? (tools.find((tool) => tool.id === view.toolId) ?? null) : null),
    [view],
  )
  const selectedCategory = useMemo<ToolCategory | null>(() => {
    if (view.type === 'category') {
      return view.category
    }

    if (view.type === 'tool' && activeTool) {
      return activeTool.category
    }

    return null
  }, [view, activeTool])

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredTools = useMemo(() => {
    if (!normalizedSearch) {
      return tools
    }

    return tools.filter((tool) => {
      const target = `${tool.name} ${tool.description}`.toLowerCase()
      return target.includes(normalizedSearch)
    })
  }, [normalizedSearch])

  const suggestions = useMemo(() => {
    if (!normalizedSearch) {
      return tools.slice(0, 6)
    }
    return tools.filter((tool) => tool.name.toLowerCase().includes(normalizedSearch)).slice(0, 6)
  }, [normalizedSearch])

  const favoriteTools = useMemo(
    () => tools.filter((tool) => favoriteToolIds.includes(tool.id)),
    [favoriteToolIds],
  )

  const toolsForSelectedCategory = useMemo(
    () => (selectedCategory ? tools.filter((tool) => tool.category === selectedCategory) : []),
    [selectedCategory],
  )

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

  const goHome = () => {
    setView({ type: 'home' })
    setIsMobileMenuOpen(false)
  }

  const selectCategory = (category: ToolCategory) => {
    setView({ type: 'category', category })
    setIsMobileMenuOpen(false)
  }

  const selectTool = (toolId: ToolId) => {
    setView({ type: 'tool', toolId })
    setIsMobileMenuOpen(false)
  }

  const applySuggestion = (toolId: ToolId) => {
    const selectedTool = tools.find((tool) => tool.id === toolId)
    if (!selectedTool) {
      return
    }
    setSearchTerm(selectedTool.name)
    selectTool(selectedTool.id)
    setIsSearchFocused(false)
  }

  return (
    <section className="w-full overflow-hidden bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur dark:bg-slate-950/85 dark:shadow-black/40">
      <header className="flex items-center gap-3 border-b border-slate-300/70 bg-slate-50/85 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/80 sm:px-4">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 lg:hidden dark:border-slate-700 dark:text-slate-200"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="size-4" />
        </button>

        <img src="/logo.svg" alt="Logo Developer Tools" className="size-7 shrink-0 rounded-md" />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700 dark:text-indigo-300">
            Developer Tools
          </p>
        </div>

        <div className="relative ml-auto hidden w-full max-w-sm md:block">
          <label className="inline-flex w-full items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
            <Search className="size-4" />
            <input
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Buscar herramienta..."
              value={searchTerm}
              onChange={(event) => {
                const nextValue = event.target.value
                setSearchTerm(nextValue)
                setHighlightedIndex(0)
                const exactMatch = tools.find(
                  (tool) => tool.name.toLowerCase() === nextValue.trim().toLowerCase(),
                )
                if (exactMatch) {
                  selectTool(exactMatch.id)
                }
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                window.setTimeout(() => setIsSearchFocused(false), 120)
              }}
              onKeyDown={(event) => {
                if (!suggestions.length) {
                  return
                }

                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setHighlightedIndex((current) => (current + 1) % suggestions.length)
                }

                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setHighlightedIndex((current) =>
                    current === 0 ? suggestions.length - 1 : current - 1,
                  )
                }

                if (event.key === 'Enter') {
                  event.preventDefault()
                  applySuggestion(suggestions[highlightedIndex].id)
                }

                if (event.key === 'Escape') {
                  setIsSearchFocused(false)
                }
              }}
              spellCheck={false}
            />
          </label>
          {isSearchFocused && suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-md border border-slate-300 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-950">
              {suggestions.map((tool, index) => (
                <button
                  key={tool.id}
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-sm ${
                    index === highlightedIndex
                      ? 'bg-blue-50 text-blue-700 dark:bg-sky-500/15 dark:text-sky-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => applySuggestion(tool.id)}
                >
                  <p className="font-semibold">{tool.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="size-3.5" /> : <MoonStar className="size-3.5" />}
          <span className="hidden sm:inline">Pasar a {theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
        </button>
      </header>

      <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-4 lg:px-4 lg:py-4">
        <aside className="hidden rounded-xl border border-slate-800 bg-indigo-950 px-3 py-4 lg:block">
          <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-200/80">
            <PanelLeft className="size-3.5" />
            Menu
          </p>
          <SidebarContent
            favoriteToolIds={favoriteToolIds}
            menuTools={filteredTools}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            activeToolId={activeTool?.id ?? null}
            viewType={view.type}
            onGoHome={goHome}
            onSelectCategory={selectCategory}
            onSelectTool={selectTool}
            onToggleFavorite={toggleFavorite}
          />
        </aside>

        <main className="overflow-y-auto bg-slate-100/80 px-3 py-3 dark:bg-slate-950/55 sm:px-4 sm:py-4">
          <section className="mb-4 rounded-xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
            <div className="inline-flex flex-wrap items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              <button
                type="button"
                className="hover:text-blue-700 dark:hover:text-sky-300"
                onClick={goHome}
              >
                Home
              </button>
              {selectedCategory ? (
                <>
                  <span>/</span>
                  <button
                    type="button"
                    className="hover:text-blue-700 dark:hover:text-sky-300"
                    onClick={() => selectCategory(selectedCategory)}
                  >
                    {selectedCategory}
                  </button>
                </>
              ) : null}
            </div>

            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
              {view.type === 'home' ? 'Inicio' : (activeTool?.name ?? selectedCategory)}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {view.type === 'home'
                ? 'Resumen de estado, mejoras recientes y acceso por categorias.'
                : (activeTool?.description ??
                  (selectedCategory
                    ? categoryDescriptions[selectedCategory]
                    : 'Selecciona una herramienta desde el menu lateral.'))}
            </p>
          </section>

          {view.type === 'home' ? (
            <HomeOverview
              favorites={favoriteTools}
              onSelectCategory={selectCategory}
              onSelectTool={selectTool}
            />
          ) : null}

          {view.type === 'category' && selectedCategory ? (
            <CategoryOverview
              category={selectedCategory}
              toolsByCategory={toolsForSelectedCategory}
              favoriteToolIds={favoriteToolIds}
              onSelectTool={selectTool}
              onToggleFavorite={toggleFavorite}
            />
          ) : null}

          {view.type === 'tool' ? (
            <>
              {activeTool?.id === 'json-formatter' ? <JsonFormatterTool /> : null}
              {activeTool?.id === 'base64' ? <Base64Tool /> : null}
              {activeTool?.id === 'base64-image' ? <Base64ImageTool /> : null}
              {activeTool?.id === 'base64-pdf' ? <Base64PdfTool /> : null}
              {activeTool?.id === 'sql-formatter' ? <SqlFormatterTool /> : null}
              {activeTool?.id === 'json-model-generator' ? <JsonModelGeneratorTool /> : null}
              {activeTool?.id === 'jwt' ? <JwtTool /> : null}
              {activeTool?.id === 'uuid' ? <UuidTool /> : null}
              {activeTool?.id === 'readme-generator' ? <ReadmeGeneratorTool /> : null}
              {activeTool?.id === 'url-codec' ? (
                <ComingSoonTool toolName={activeTool?.name ?? 'Herramienta'} />
              ) : null}
            </>
          ) : null}
        </main>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 transition lg:hidden ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[86vw] max-w-[340px] overflow-y-auto border-r border-indigo-900 bg-indigo-950 p-4 shadow-2xl transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200/80">
            <PanelLeft className="size-3.5" />
            Menu
          </p>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-md border border-indigo-400/25 text-indigo-100"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Cerrar menu"
          >
            <X className="size-4" />
          </button>
        </div>

        <SidebarContent
          favoriteToolIds={favoriteToolIds}
          menuTools={filteredTools}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          activeToolId={activeTool?.id ?? null}
          viewType={view.type}
          onGoHome={goHome}
          onSelectCategory={selectCategory}
          onSelectTool={selectTool}
          onToggleFavorite={toggleFavorite}
        />
      </aside>
    </section>
  )
}
