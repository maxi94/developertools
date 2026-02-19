import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BookOpenText,
  Braces,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Code2,
  Database,
  Fingerprint,
  Globe2,
  House,
  Menu,
  MoonStar,
  PanelLeft,
  Pin,
  PinOff,
  Search,
  Sparkles,
  Star,
  Sun,
  X,
} from 'lucide-react'
import { Base64ImageTool } from '@/features/base64-image/ui/Base64ImageTool'
import { Base64PdfTool } from '@/features/base64-pdf/ui/Base64PdfTool'
import { Base64Tool } from '@/features/base64/ui/Base64Tool'
import { DateTimeTools } from '@/features/datetime-tools/ui/DateTimeTools'
import { EncodingSuiteTool } from '@/features/encoding-suite/ui/EncodingSuiteTool'
import { FakeDataTool } from '@/features/fake-data/ui/FakeDataTool'
import { IdToolkitTool } from '@/features/id-toolkit/ui/IdToolkitTool'
import { JsonFormatterTool } from '@/features/json-formatter/ui/JsonFormatterTool'
import { JsonModelGeneratorTool } from '@/features/json-model-generator/ui/JsonModelGeneratorTool'
import { JwtBuilderTool } from '@/features/jwt-builder/ui/JwtBuilderTool'
import { JwtTool } from '@/features/jwt/ui/JwtTool'
import { RegexTool } from '@/features/regex-tool/ui/RegexTool'
import { ReadmeGeneratorTool } from '@/features/readme-generator/ui/ReadmeGeneratorTool'
import { SqlMongoConverterTool } from '@/features/sql-mongo/ui/SqlMongoConverterTool'
import { SqlFormatterTool } from '@/features/sql-formatter/ui/SqlFormatterTool'
import { WEB_VERSION, tools } from '@/features/tool-registry/model/tools'
import { ToolCard } from '@/features/tool-registry/ui/ToolCard'
import { UrlCodecTool } from '@/features/url-codec/ui/UrlCodecTool'
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

const categoryMeta: Record<
  ToolCategory,
  { icon: JSX.Element; badgeClass: string; cardClass: string }
> = {
  Datos: {
    icon: <Database className="size-3.5" />,
    badgeClass:
      'bg-cyan-100 text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-200',
    cardClass:
      'border-slate-200 bg-slate-50 hover:border-cyan-400 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-cyan-500 dark:hover:bg-cyan-950/30',
  },
  Formateadores: {
    icon: <Braces className="size-3.5" />,
    badgeClass:
      'bg-violet-100 text-violet-700 dark:bg-violet-400/20 dark:text-violet-200',
    cardClass:
      'border-slate-200 bg-slate-50 hover:border-violet-400 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-violet-500 dark:hover:bg-violet-950/30',
  },
  'Generadores de codigo': {
    icon: <Code2 className="size-3.5" />,
    badgeClass:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200',
    cardClass:
      'border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/30',
  },
  'Tokens e identidad': {
    icon: <Fingerprint className="size-3.5" />,
    badgeClass:
      'bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200',
    cardClass:
      'border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-amber-500 dark:hover:bg-amber-950/30',
  },
  'Utilidades web': {
    icon: <Globe2 className="size-3.5" />,
    badgeClass:
      'bg-sky-100 text-sky-700 dark:bg-sky-400/20 dark:text-sky-200',
    cardClass:
      'border-slate-200 bg-slate-50 hover:border-sky-400 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-sky-500 dark:hover:bg-sky-950/30',
  },
  Documentacion: {
    icon: <BookOpenText className="size-3.5" />,
    badgeClass:
      'bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200',
    cardClass:
      'border-slate-200 bg-slate-50 hover:border-rose-400 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-rose-500 dark:hover:bg-rose-950/30',
  },
}

const categorySlugs: Record<ToolCategory, string> = {
  Datos: 'datos',
  Formateadores: 'formateadores',
  'Generadores de codigo': 'generadores-codigo',
  'Tokens e identidad': 'tokens-identidad',
  'Utilidades web': 'utilidades-web',
  Documentacion: 'documentacion',
}

const slugToCategory = Object.fromEntries(
  Object.entries(categorySlugs).map(([category, slug]) => [slug, category as ToolCategory]),
)

const releaseNotes = [
  {
    version: 'v0.6.0',
    date: '2026-02-19',
    title: 'Rediseno UI, rutas directas y versionado',
    changes: [
      'Rediseno global: shell, header, sidebar, Home y Categoria con mejor jerarquia visual.',
      'Menu colapsable corregido: tooltips, overflow y boton de categoria dentro del contenedor.',
      'Rutas directas por categoria: /datos, /formateadores, etc. (legacy /categoria/* soportado).',
      'Regex mejorado con diagrama de estados en SVG y visualizacion mas clara.',
      'Version web independiente y version por herramienta visible en la interfaz.',
    ],
  },
  {
    version: 'v0.5.0',
    date: '2026-02-19',
    title: 'Arquitectura por rutas',
    changes: [
      'Navegacion persistente por URL para Home, Categoria y Herramienta.',
      'Cada tool ahora tiene una ruta directa compartible y guardable en favoritos del navegador.',
      'Sincronizacion con back/forward del browser.',
    ],
  },
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
]

const latestRelease = releaseNotes[0]
type ReleaseNote = (typeof releaseNotes)[number]

type ViewState =
  | { type: 'home' }
  | { type: 'category'; category: ToolCategory }
  | { type: 'tool'; toolId: ToolId }

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/'
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

function getCategoryPath(category: ToolCategory): string {
  return `/${categorySlugs[category]}`
}

function getToolPath(toolId: ToolId): string {
  return `/herramienta/${toolId}`
}

function viewToPath(view: ViewState): string {
  if (view.type === 'home') {
    return '/'
  }

  if (view.type === 'category') {
    return getCategoryPath(view.category)
  }

  return getToolPath(view.toolId)
}

function parseViewFromPath(pathname: string): ViewState {
  const normalized = normalizePath(pathname)
  if (normalized === '/') {
    return { type: 'home' }
  }

  // Canonical: /datos. Legacy accepted: /categoria/datos
  const directCategoryMatch = normalized.match(/^\/([^/]+)$/)
  if (directCategoryMatch) {
    const category = slugToCategory[directCategoryMatch[1]]
    if (category) {
      return { type: 'category', category }
    }
  }

  const legacyCategoryMatch = normalized.match(/^\/categoria\/([^/]+)$/)
  if (legacyCategoryMatch) {
    const category = slugToCategory[legacyCategoryMatch[1]]
    if (category) {
      return { type: 'category', category }
    }
    return { type: 'home' }
  }

  const toolMatch = normalized.match(/^\/herramienta\/([^/]+)$/)
  if (toolMatch) {
    const toolId = toolMatch[1] as ToolId
    const hasTool = tools.some((tool) => tool.id === toolId)
    if (hasTool) {
      return { type: 'tool', toolId }
    }
    return { type: 'home' }
  }

  return { type: 'home' }
}

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
  isMenuCollapsed: boolean
  collapsedCategories: Set<ToolCategory>
  onGoHome: () => void
  onSelectCategory: (category: ToolCategory) => void
  onSelectTool: (toolId: ToolId) => void
  onToggleFavorite: (toolId: ToolId) => void
  onToggleCategory: (category: ToolCategory) => void
  onExpandCategory: (category: ToolCategory) => void
}

function SidebarContent({
  favoriteToolIds,
  menuTools,
  searchTerm,
  selectedCategory,
  activeToolId,
  viewType,
  isMenuCollapsed,
  collapsedCategories,
  onGoHome,
  onSelectCategory,
  onSelectTool,
  onToggleFavorite,
  onToggleCategory,
  onExpandCategory,
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
        title={isMenuCollapsed ? 'Inicio' : undefined}
        className={`mb-3 inline-flex w-full items-center ${isMenuCollapsed ? 'justify-center px-2' : 'gap-2 px-3'} rounded-lg border py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] transition ${
          viewType === 'home'
            ? 'border-slate-300 bg-slate-100 text-slate-900 dark:border-white/30 dark:bg-white/20 dark:text-white'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100/80 dark:hover:bg-white/10 dark:hover:text-white'
        }`}
      >
        <House className="size-4" />
        {!isMenuCollapsed ? 'Inicio' : null}
      </button>

      {!isMenuCollapsed ? (
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
          <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-indigo-200/80">
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
                      ? 'border-slate-300 bg-slate-100 text-slate-900 dark:border-white/25 dark:bg-white/20 dark:text-white'
                      : 'border-slate-200 bg-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-indigo-100/80 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white'
                  }`}
                  onClick={() => onSelectTool(tool.id)}
                >
                  {tool.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-indigo-100/70">
              Fija herramientas con el icono de pin.
            </p>
          )}
        </div>
      ) : null}

      <div className="grid gap-3">
        {groupedTools.map((group) => (
          <section key={group.category} className="grid gap-1.5">
            <div className={`grid items-center ${isMenuCollapsed ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_auto]'} gap-1`}>
              <button
                type="button"
                title={isMenuCollapsed ? group.category : undefined}
                className={`min-w-0 inline-flex cursor-pointer items-center ${isMenuCollapsed ? 'justify-center px-0.5' : 'gap-1.5 px-1'} rounded-md py-1 text-left text-[10px] font-semibold uppercase tracking-[0.1em] ${
                  selectedCategory === group.category
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-indigo-200/70 dark:hover:text-indigo-100'
                }`}
                onClick={() => {
                  onExpandCategory(group.category)
                  onSelectCategory(group.category)
                }}
              >
                <span
                  className={`inline-flex size-4 shrink-0 items-center justify-center rounded-sm ${categoryMeta[group.category].badgeClass}`}
                >
                  {categoryMeta[group.category].icon}
                </span>
                {!isMenuCollapsed ? (
                  <span className="truncate">{group.category}</span>
                ) : null}
              </button>
              {!isMenuCollapsed ? (
                <button
                  type="button"
                  className="inline-flex size-6 shrink-0 cursor-pointer self-center items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:text-indigo-200/80 dark:hover:bg-white/10 dark:hover:text-white"
                  onClick={() => onToggleCategory(group.category)}
                  aria-label={
                    collapsedCategories.has(group.category)
                      ? 'Expandir categoria'
                      : 'Colapsar categoria'
                  }
                >
                  <ChevronDown
                    className={`size-4 transition ${
                      collapsedCategories.has(group.category) ? '-rotate-90' : ''
                    }`}
                  />
                </button>
              ) : null}
            </div>
            {!collapsedCategories.has(group.category) ? (
              <nav className="grid gap-1.5" aria-label={`Menu ${group.category}`}>
                {group.tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    compact={isMenuCollapsed}
                    isActive={tool.id === activeToolId && viewType === 'tool'}
                    isFavorite={favoriteToolIds.includes(tool.id)}
                    onSelect={onSelectTool}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </nav>
            ) : null}
          </section>
        ))}
      </div>

      {menuTools.length === 0 ? (
        <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100/80">
          No se encontraron herramientas para: <strong>{searchTerm}</strong>
        </p>
      ) : null}
    </>
  )
}

interface HomeOverviewProps {
  favorites: ToolDefinition[]
  latest: ReleaseNote
  onSelectCategory: (category: ToolCategory) => void
  onSelectTool: (toolId: ToolId) => void
}

function HomeOverview({ favorites, latest, onSelectCategory, onSelectTool }: HomeOverviewProps) {
  const totalTools = tools.length
  const totalCategories = categoryOrder.length

  return (
    <section className="grid gap-4">
      <section className="relative overflow-hidden rounded-2xl border border-slate-300/70 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-5 text-slate-900 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-teal-900 dark:text-slate-100 dark:shadow-slate-900/25">
        <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-300/20" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 size-40 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-300/15" />
        <p className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/60 bg-cyan-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-800 dark:border-white/20 dark:bg-white/10 dark:text-cyan-100">
          <Sparkles className="size-3.5" />
          Web {WEB_VERSION}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">{latest.title}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-200">Publicado el {latest.date}</p>
        <ul className="mt-4 grid gap-1.5 text-sm text-slate-700 dark:text-slate-100/95">
          {latest.changes.map((change) => (
            <li key={change}>• {change}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
          <span className="rounded-full border border-cyan-300/60 bg-cyan-100/75 px-2.5 py-1 text-cyan-800 dark:border-white/20 dark:bg-white/10 dark:text-cyan-100">
            {totalTools} tools activas
          </span>
          <span className="rounded-full border border-emerald-300/60 bg-emerald-100/75 px-2.5 py-1 text-emerald-800 dark:border-white/20 dark:bg-white/10 dark:text-emerald-100">
            {totalCategories} categorias
          </span>
          <span className="rounded-full border border-slate-300/80 bg-white/80 px-2.5 py-1 text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-slate-100">
            Favoritos: {favorites.length}
          </span>
          <span className="rounded-full border border-violet-300/60 bg-violet-100/75 px-2.5 py-1 text-violet-800 dark:border-white/20 dark:bg-white/10 dark:text-violet-100">
            Release: {latest.version}
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
        <div className="flex items-center justify-between gap-2">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="size-4" />
            Historial de mejoras
          </h2>
          <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Web {WEB_VERSION}
          </span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {releaseNotes.map((release, index) => (
            <article
              key={release.version}
              className={`rounded-lg border p-3 ${
                index === 0
                  ? 'border-teal-300 bg-teal-50/70 dark:border-teal-500/40 dark:bg-teal-950/30'
                  : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/60'
              }`}
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
              className={`group cursor-pointer rounded-lg border p-3 text-left transition ${categoryMeta[category].cardClass}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-105 ${categoryMeta[category].badgeClass}`}
                >
                  {categoryMeta[category].icon}
                </span>
                <ChevronRight className="mt-1 size-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{category}</p>
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
  latest: ReleaseNote
  onSelectTool: (toolId: ToolId) => void
  onToggleFavorite: (toolId: ToolId) => void
}

function CategoryOverview({
  category,
  toolsByCategory,
  favoriteToolIds,
  latest,
  onSelectTool,
  onToggleFavorite,
}: CategoryOverviewProps) {
  const favoriteCountInCategory = toolsByCategory.filter((tool) =>
    favoriteToolIds.includes(tool.id),
  ).length

  return (
    <section className="grid gap-4">
      <section className="relative overflow-hidden rounded-2xl border border-slate-300/70 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 text-slate-900 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-cyan-900 dark:text-slate-100 dark:shadow-slate-900/25">
        <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-300/25" />
        <div className="pointer-events-none absolute -bottom-16 left-8 size-40 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-300/15" />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-100/90">
              Categoria activa
            </p>
            <h2 className="mt-1 inline-flex items-center gap-2 text-2xl font-semibold text-slate-900 dark:text-white">
              <span
                className={`inline-flex size-7 items-center justify-center rounded-md ${categoryMeta[category].badgeClass}`}
              >
                {categoryMeta[category].icon}
              </span>
              {category}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-100/90">
              {categoryDescriptions[category]}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
              <span className="rounded-full border border-cyan-300/60 bg-cyan-100/75 px-2.5 py-1 text-cyan-800 dark:border-white/20 dark:bg-white/10 dark:text-cyan-100">
                {toolsByCategory.length} tools
              </span>
              <span className="rounded-full border border-amber-300/60 bg-amber-100/75 px-2.5 py-1 text-amber-800 dark:border-white/20 dark:bg-white/10 dark:text-amber-100">
                {favoriteCountInCategory} favoritas
              </span>
              <span className="rounded-full border border-emerald-300/60 bg-emerald-100/75 px-2.5 py-1 text-emerald-800 dark:border-white/20 dark:bg-white/10 dark:text-emerald-100">
                Web: {WEB_VERSION}
              </span>
              <span className="rounded-full border border-violet-300/60 bg-violet-100/75 px-2.5 py-1 text-violet-800 dark:border-white/20 dark:bg-white/10 dark:text-violet-100">
                Release: {latest.version}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 dark:border-white/25 dark:bg-white/10 dark:text-slate-100">
            <Sparkles className="size-3.5" />
            {latest.version} - {latest.date}
          </span>
        </div>
        <p className="relative mt-3 text-xs text-slate-600 dark:text-slate-200/85">
          Novedad reciente: <span className="font-semibold text-slate-900 dark:text-white">{latest.title}</span>
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {toolsByCategory.map((tool, index) => (
          <article
            key={tool.id}
            className="group overflow-hidden rounded-2xl border border-slate-300/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/90 dark:hover:border-slate-500"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400" />
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Tool {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {tool.name}
                  </h3>
                </div>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                    tool.status === 'ready'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-300/20 dark:text-emerald-100'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-300/25 dark:text-amber-100'
                  }`}
                >
                  {tool.status === 'ready' ? 'On' : 'Soon'}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                {tool.description}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300">
                Version tool: v{tool.version}
              </p>

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(tool.id)}
                  className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                    favoriteToolIds.includes(tool.id)
                      ? 'border-amber-300/60 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-400/60 dark:bg-amber-900/30 dark:text-amber-200'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  {favoriteToolIds.includes(tool.id) ? 'Favorito' : 'Fijar'}
                </button>

                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-cyan-300 bg-cyan-50 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-700 transition hover:border-cyan-400 hover:bg-cyan-100 dark:border-cyan-500/40 dark:bg-cyan-900/20 dark:text-cyan-200 dark:hover:bg-cyan-900/30"
                  onClick={() => onSelectTool(tool.id)}
                >
                  Abrir
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  )
}

export function ToolList() {
  const { theme, toggleTheme } = useTheme()
  const [view, setView] = useState<ViewState>(() => parseViewFromPath(window.location.pathname))
  const [favoriteToolIds, setFavoriteToolIds] = useState<ToolId[]>(getInitialFavorites)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopMenuCollapsed, setIsDesktopMenuCollapsed] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<ToolCategory>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const mainRef = useRef<HTMLElement>(null)

  const activeTool = useMemo(
    () => (view.type === 'tool' ? (tools.find((tool) => tool.id === view.toolId) ?? null) : null),
    [view],
  )
  const isActiveToolFavorite = !!activeTool && favoriteToolIds.includes(activeTool.id)

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
      return tools
    }

    return tools.filter((tool) => {
      const target = `${tool.name} ${tool.description} ${tool.category}`.toLowerCase()
      return target.includes(normalizedSearch)
    })
  }, [normalizedSearch])

  const groupedSuggestions = useMemo(
    () =>
      categoryOrder
        .map((category) => ({
          category,
          tools: suggestions.filter((tool) => tool.category === category),
        }))
        .filter((group) => group.tools.length > 0),
    [suggestions],
  )

  const flatSuggestions = useMemo(
    () => groupedSuggestions.flatMap((group) => group.tools),
    [groupedSuggestions],
  )

  const favoriteTools = useMemo(
    () => tools.filter((tool) => favoriteToolIds.includes(tool.id)),
    [favoriteToolIds],
  )

  const toolsForSelectedCategory = useMemo(
    () => (selectedCategory ? tools.filter((tool) => tool.category === selectedCategory) : []),
    [selectedCategory],
  )

  useEffect(() => {
    const onPopState = () => {
      setView(parseViewFromPath(window.location.pathname))
      setIsMobileMenuOpen(false)
    }

    window.addEventListener('popstate', onPopState)

    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  useEffect(() => {
    const parsed = parseViewFromPath(window.location.pathname)
    const canonicalPath = viewToPath(parsed)
    const currentPath = normalizePath(window.location.pathname)

    if (currentPath !== canonicalPath) {
      window.history.replaceState({}, '', canonicalPath)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteToolIds))
  }, [favoriteToolIds])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const scrollMainToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateTo = (path: string) => {
    const nextPath = normalizePath(path)
    const currentPath = normalizePath(window.location.pathname)

    if (nextPath !== currentPath) {
      window.history.pushState({}, '', nextPath)
    }

    setView(parseViewFromPath(nextPath))
    setIsMobileMenuOpen(false)
    window.requestAnimationFrame(scrollMainToTop)
  }

  const toggleFavorite = (toolId: ToolId) => {
    setFavoriteToolIds((currentFavorites) =>
      currentFavorites.includes(toolId)
        ? currentFavorites.filter((id) => id !== toolId)
        : [...currentFavorites, toolId],
    )
  }

  const toggleCategory = (category: ToolCategory) => {
    setCollapsedCategories((current) => {
      const next = new Set(current)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const expandCategory = (category: ToolCategory) => {
    setCollapsedCategories((current) => {
      if (!current.has(category)) {
        return current
      }
      const next = new Set(current)
      next.delete(category)
      return next
    })
  }

  const goHome = () => {
    navigateTo('/')
  }

  const selectCategory = (category: ToolCategory) => {
    navigateTo(getCategoryPath(category))
  }

  const selectTool = (toolId: ToolId) => {
    navigateTo(getToolPath(toolId))
  }

  const applySuggestion = (toolId: ToolId) => {
    const selectedTool = tools.find((tool) => tool.id === toolId)
    if (!selectedTool) {
      return
    }
    setSearchTerm('')
    setHighlightedIndex(0)
    selectTool(selectedTool.id)
    setIsSearchFocused(false)
  }

  return (
    <section className="relative z-10 w-full overflow-hidden rounded-[22px] border border-slate-300/70 bg-white/75 shadow-[0_24px_70px_-26px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/70 dark:shadow-black/45">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-300/70 bg-gradient-to-r from-white/95 via-sky-50/80 to-emerald-50/70 px-3 py-2 dark:border-slate-700 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-800/85 sm:px-4">
        <button
          type="button"
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-slate-300 text-slate-700 lg:hidden dark:border-slate-700 dark:text-slate-200"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="size-4" />
        </button>

        <img
          src="/logo.svg"
          alt="Logo Developer Tools"
          className="size-7 shrink-0 rounded-md ring-1 ring-slate-300/80 dark:ring-slate-600/70"
        />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-slate-800 dark:text-slate-100">
            Developer Tools
          </p>
        </div>

        <div className="relative ml-auto hidden w-full max-w-sm md:block">
          <label className="inline-flex w-full items-center gap-2 rounded-lg border border-slate-300/80 bg-white/90 px-2.5 py-1.5 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-950/85 dark:text-slate-400">
            <Search className="size-4" />
            <input
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Buscar herramienta..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setHighlightedIndex(0)
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                window.setTimeout(() => setIsSearchFocused(false), 120)
              }}
              onKeyDown={(event) => {
                if (!flatSuggestions.length) {
                  return
                }

                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setHighlightedIndex((current) => (current + 1) % flatSuggestions.length)
                }

                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setHighlightedIndex((current) =>
                    current === 0 ? flatSuggestions.length - 1 : current - 1,
                  )
                }

                if (event.key === 'Enter') {
                  event.preventDefault()
                  applySuggestion(flatSuggestions[highlightedIndex].id)
                }

                if (event.key === 'Escape') {
                  setIsSearchFocused(false)
                }
              }}
              spellCheck={false}
            />
            {searchTerm ? (
              <button
                type="button"
                className="inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                onClick={() => {
                  setSearchTerm('')
                  setHighlightedIndex(0)
                }}
                aria-label="Limpiar filtro"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </label>
          {isSearchFocused && groupedSuggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-80 overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-950">
              {groupedSuggestions.map((group) => (
                <div
                  key={group.category}
                  className="border-b border-slate-200/70 px-2 py-1.5 last:border-b-0 dark:border-slate-800"
                >
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    {group.category}
                  </p>
                  <div className="mt-1 grid gap-1">
                    {group.tools.map((tool) => {
                      const index = flatSuggestions.findIndex((entry) => entry.id === tool.id)
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          className={`block w-full cursor-pointer rounded-md px-2 py-2 text-left text-sm ${
                            index === highlightedIndex
                              ? 'bg-blue-50 text-blue-700 dark:bg-sky-500/15 dark:text-sky-300'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'
                          }`}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onClick={() => applySuggestion(tool.id)}
                        >
                          <p className="font-semibold">{tool.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {tool.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="size-3.5" /> : <MoonStar className="size-3.5" />}
          <span className="hidden sm:inline">Pasar a {theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
        </button>
      </header>

      <div
        className={`grid min-h-[calc(100vh-8rem)] ${
          isDesktopMenuCollapsed
            ? 'lg:grid-cols-[104px_minmax(0,1fr)]'
            : 'lg:grid-cols-[300px_minmax(0,1fr)]'
        } lg:gap-4 lg:px-4 lg:py-4`}
      >
        <aside
          className={`hidden overflow-x-hidden rounded-2xl border border-slate-300/80 bg-gradient-to-b from-white/80 to-slate-50/80 py-4 shadow-inner dark:border-slate-700 dark:from-slate-900/90 dark:to-indigo-950/75 lg:block ${
            isDesktopMenuCollapsed ? 'px-2' : 'px-3'
          }`}
        >
          <div
            className={`mb-3 flex items-center gap-2 ${
              isDesktopMenuCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            {!isDesktopMenuCollapsed ? (
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-indigo-200/80">
                <PanelLeft className="size-3.5" />
                Menu
              </p>
            ) : null}
            <button
              type="button"
              className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-100 dark:border-indigo-400/25 dark:text-indigo-100 dark:hover:bg-white/10"
              onClick={() => setIsDesktopMenuCollapsed((value) => !value)}
              aria-label={isDesktopMenuCollapsed ? 'Expandir menu' : 'Minimizar menu'}
            >
              {isDesktopMenuCollapsed ? (
                <ChevronsRight className="size-4" />
              ) : (
                <ChevronsLeft className="size-4" />
              )}
            </button>
          </div>
          <SidebarContent
            favoriteToolIds={favoriteToolIds}
            menuTools={filteredTools}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            activeToolId={activeTool?.id ?? null}
            viewType={view.type}
            isMenuCollapsed={isDesktopMenuCollapsed}
            collapsedCategories={collapsedCategories}
            onGoHome={goHome}
            onSelectCategory={selectCategory}
            onSelectTool={selectTool}
            onToggleFavorite={toggleFavorite}
            onToggleCategory={toggleCategory}
            onExpandCategory={expandCategory}
          />
        </aside>

        <main
          ref={mainRef}
          className="overflow-y-auto rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50/75 to-sky-50/50 px-3 py-3 dark:border-slate-800 dark:from-slate-950/45 dark:to-slate-900/35 sm:px-4 sm:py-4"
        >
          <section className="mb-4 rounded-2xl border border-slate-300/70 bg-white/90 p-4 shadow-[0_8px_22px_-16px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-900/85">
            <div className="inline-flex flex-wrap items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              <button
                type="button"
                className="cursor-pointer hover:text-blue-700 dark:hover:text-sky-300"
                onClick={goHome}
              >
                Home
              </button>
              {selectedCategory ? (
                <>
                  <span>/</span>
                  <button
                    type="button"
                    className="cursor-pointer hover:text-blue-700 dark:hover:text-sky-300"
                    onClick={() => selectCategory(selectedCategory)}
                  >
                    {selectedCategory}
                  </button>
                </>
              ) : null}
            </div>

            <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
                    {view.type === 'home' ? 'Inicio' : (activeTool?.name ?? selectedCategory)}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <Sparkles className="size-3" />
                    Web {WEB_VERSION}
                  </span>
                  {activeTool ? (
                    <span className="inline-flex items-center rounded-full border border-cyan-300 bg-cyan-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-900/25 dark:text-cyan-200">
                      Tool v{activeTool.version}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {view.type === 'home'
                    ? 'Resumen de estado, mejoras recientes y acceso por categorias.'
                    : (activeTool?.description ??
                      (selectedCategory
                        ? categoryDescriptions[selectedCategory]
                        : 'Selecciona una herramienta desde el menu lateral.'))}
                </p>
              </div>
              {activeTool ? (
                <button
                  type="button"
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                    isActiveToolFavorite
                      ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/50 dark:bg-amber-900/25 dark:text-amber-200'
                      : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'
                  }`}
                  onClick={() => toggleFavorite(activeTool.id)}
                >
                  {isActiveToolFavorite ? (
                    <PinOff className="size-3.5" />
                  ) : (
                    <Pin className="size-3.5" />
                  )}
                  {isActiveToolFavorite ? 'Quitar favorito' : 'Fijar favorito'}
                </button>
              ) : null}
            </div>
          </section>

          {view.type === 'home' ? (
            <HomeOverview
              favorites={favoriteTools}
              latest={latestRelease}
              onSelectCategory={selectCategory}
              onSelectTool={selectTool}
            />
          ) : null}

          {view.type === 'category' && selectedCategory ? (
            <CategoryOverview
              category={selectedCategory}
              toolsByCategory={toolsForSelectedCategory}
              favoriteToolIds={favoriteToolIds}
              latest={latestRelease}
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
              {activeTool?.id === 'fake-data-generator' ? <FakeDataTool /> : null}
              {activeTool?.id === 'sql-formatter' ? <SqlFormatterTool /> : null}
              {activeTool?.id === 'sql-mongo-converter' ? <SqlMongoConverterTool /> : null}
              {activeTool?.id === 'regex-tool' ? <RegexTool /> : null}
              {activeTool?.id === 'json-model-generator' ? <JsonModelGeneratorTool /> : null}
              {activeTool?.id === 'jwt-builder' ? <JwtBuilderTool /> : null}
              {activeTool?.id === 'jwt' ? <JwtTool /> : null}
              {activeTool?.id === 'uuid' ? <UuidTool /> : null}
              {activeTool?.id === 'id-toolkit' ? <IdToolkitTool /> : null}
              {activeTool?.id === 'url-codec' ? <UrlCodecTool /> : null}
              {activeTool?.id === 'encoding-suite' ? <EncodingSuiteTool /> : null}
              {activeTool?.id === 'datetime-tools' ? <DateTimeTools /> : null}
              {activeTool?.id === 'readme-generator' ? <ReadmeGeneratorTool /> : null}
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
        className={`fixed inset-y-0 left-0 z-50 w-[86vw] max-w-[340px] overflow-y-auto overflow-x-hidden border-r border-slate-300 bg-gradient-to-b from-white to-slate-100 p-4 shadow-2xl transition-transform duration-300 dark:border-indigo-900 dark:from-slate-900 dark:to-indigo-950 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-indigo-200/80">
            <PanelLeft className="size-3.5" />
            Menu
          </p>
          <button
            type="button"
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-slate-300 text-slate-700 dark:border-indigo-400/25 dark:text-indigo-100"
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
          isMenuCollapsed={false}
          collapsedCategories={collapsedCategories}
          onGoHome={goHome}
          onSelectCategory={selectCategory}
          onSelectTool={selectTool}
          onToggleFavorite={toggleFavorite}
          onToggleCategory={toggleCategory}
          onExpandCategory={expandCategory}
        />
      </aside>
    </section>
  )
}
