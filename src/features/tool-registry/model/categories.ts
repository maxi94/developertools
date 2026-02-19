import type { ToolCategory } from '@/shared/types/tool'
import { DEFAULT_LANGUAGE, type AppLanguage } from '@/shared/i18n/config'

export const categoryOrder: ToolCategory[] = [
  'Datos',
  'Formateadores',
  'Generadores de codigo',
  'Tokens e identidad',
  'Utilidades web',
  'Documentacion',
]

const categoryDescriptionsEs: Record<ToolCategory, string> = {
  Datos: 'Utilidades para transformar y visualizar informacion de forma local.',
  Formateadores: 'Herramientas para dar formato legible a contenidos tecnicos.',
  'Generadores de codigo': 'Utilidades para crear clases, plantillas y codigo base.',
  'Tokens e identidad': 'Herramientas para generacion y analisis de identificadores y tokens.',
  'Utilidades web': 'Helpers para codificacion, escaping y tareas habituales de desarrollo web.',
  Documentacion: 'Generadores y asistentes para acelerar la documentacion tecnica.',
}

const categoryLabels: Record<AppLanguage, Record<ToolCategory, string>> = {
  es: {
    Datos: 'Datos',
    Formateadores: 'Formateadores',
    'Generadores de codigo': 'Generadores de codigo',
    'Tokens e identidad': 'Tokens e identidad',
    'Utilidades web': 'Utilidades web',
    Documentacion: 'Documentacion',
  },
  en: {
    Datos: 'Data',
    Formateadores: 'Formatters',
    'Generadores de codigo': 'Code Generators',
    'Tokens e identidad': 'Tokens & Identity',
    'Utilidades web': 'Web Utilities',
    Documentacion: 'Documentation',
  },
}

const categoryDescriptions: Record<AppLanguage, Record<ToolCategory, string>> = {
  es: categoryDescriptionsEs,
  en: {
    Datos: 'Utilities to transform and visualize data locally.',
    Formateadores: 'Tools to format technical content into readable output.',
    'Generadores de codigo': 'Utilities to generate classes, templates and boilerplate code.',
    'Tokens e identidad': 'Tools for generating and analyzing identifiers and tokens.',
    'Utilidades web': 'Helpers for encoding, escaping and common web development tasks.',
    Documentacion: 'Generators and helpers to accelerate technical documentation.',
  },
}

export function getCategoryLabel(category: ToolCategory, language: AppLanguage): string {
  return categoryLabels[language]?.[category] ?? categoryLabels[DEFAULT_LANGUAGE][category]
}

export function getCategoryDescription(category: ToolCategory, language: AppLanguage): string {
  return categoryDescriptions[language]?.[category] ?? categoryDescriptions[DEFAULT_LANGUAGE][category]
}

export const categorySlugsByLanguage: Record<AppLanguage, Record<ToolCategory, string>> = {
  es: {
    Datos: 'datos',
    Formateadores: 'formateadores',
    'Generadores de codigo': 'generadores-codigo',
    'Tokens e identidad': 'tokens-identidad',
    'Utilidades web': 'utilidades-web',
    Documentacion: 'documentacion',
  },
  en: {
    Datos: 'data',
    Formateadores: 'formatters',
    'Generadores de codigo': 'code-generators',
    'Tokens e identidad': 'tokens-identity',
    'Utilidades web': 'web-utilities',
    Documentacion: 'documentation',
  },
}

export const categorySlugs = categorySlugsByLanguage[DEFAULT_LANGUAGE]

const slugToCategory: Record<string, ToolCategory> = Object.fromEntries(
  Object.values(categorySlugsByLanguage).flatMap((slugMap) =>
    Object.entries(slugMap).map(([category, slug]) => [slug, category as ToolCategory]),
  ),
)

export function getCategorySlug(category: ToolCategory, language: AppLanguage): string {
  return categorySlugsByLanguage[language]?.[category] ?? categorySlugsByLanguage[DEFAULT_LANGUAGE][category]
}

export function resolveCategoryFromSlug(slug: string): ToolCategory | null {
  return slugToCategory[slug] ?? null
}

export function createCategoryRecord<T>(factory: () => T): Record<ToolCategory, T> {
  return {
    Datos: factory(),
    Formateadores: factory(),
    'Generadores de codigo': factory(),
    'Tokens e identidad': factory(),
    'Utilidades web': factory(),
    Documentacion: factory(),
  }
}
