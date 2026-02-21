import type { ToolDefinition, ToolId } from '@/shared/types/tool'
import {
  DEFAULT_LANGUAGE,
  SECONDARY_FALLBACK_LANGUAGE,
  type AppLanguage,
} from '@/shared/i18n/config'

type LocalizedToolText = {
  name: string
  description: string
}

const toolTextsByLanguage: Record<AppLanguage, Partial<Record<ToolId, LocalizedToolText>>> = {
  es: {},
  en: {
  'json-formatter': {
    name: 'JSON Formatter',
    description: 'Format and validate JSON locally in your browser.',
  },
  'json-table': {
    name: 'JSON to Table',
    description: 'Convert JSON (including nested objects) to table and export CSV/Excel.',
  },
  base64: {
    name: 'Base64 Text',
    description: 'Encode and decode text quickly.',
  },
  'base64-image': {
    name: 'Base64 to Image',
    description: 'Convert one or many Base64 strings into images.',
  },
  'base64-pdf': {
    name: 'Base64 to PDF',
    description: 'Convert one or many Base64 strings into PDF files.',
  },
  'sql-formatter': {
    name: 'SQL Formatter',
    description: 'Format SQL queries with multi-dialect support.',
  },
  'code-minifier': {
    name: 'Minify/Expand JS-CSS',
    description: 'Minify and expand JavaScript or CSS from text or file.',
  },
  'regex-tool': {
    name: 'Regex Tool',
    description: 'Build, test, debug and export regular expressions.',
  },
  'sql-mongo-converter': {
    name: 'SQL to MongoDB',
    description: 'Convert simple SQL SELECT queries into MongoDB queries.',
  },
  'json-model-generator': {
    name: 'JSON to Classes',
    description: 'Generate classes from JSON in C#, TypeScript, Java, Python, Kotlin and Go.',
  },
  'jwt-builder': {
    name: 'JWT Builder',
    description: 'Create JWT tokens and sign HS256 locally.',
  },
  jwt: {
    name: 'JWT Viewer',
    description: 'Decode header and payload for inspection.',
  },
  uuid: {
    name: 'UUID Generator',
    description: 'Generate UUID v4 and validate its format.',
  },
  'url-codec': {
    name: 'URL Encoder',
    description: 'Encode and decode URL content.',
  },
  'encoding-suite': {
    name: 'Extra Encoder/Decoder',
    description: 'HTML, Unicode, Hex and URL-safe Base64.',
  },
  'color-tools': {
    name: 'Color Tools',
    description: 'Convert HEX/RGB/HSL and validate WCAG contrast.',
  },
  'box-shadow-generator': {
    name: 'Box Shadow Generator',
    description: 'Build CSS shadows with live preview and copy-ready output.',
  },
  'spacing-preview': {
    name: 'Border/Spacing Preview',
    description: 'Preview border-radius, padding and margin with exportable CSS.',
  },
  'datetime-tools': {
    name: 'DateTime Tools',
    description: 'Timezone conversion, Unix timestamp and ISO formatter.',
  },
  'id-toolkit': {
    name: 'UUID/ULID/KSUID Toolkit',
    description: 'Generator, validator and batch export for IDs.',
  },
  'fake-data-generator': {
    name: 'Fake Data Generator',
    description: 'Generate fake JSON with names, emails, UUID and dates.',
  },
  'image-to-base64': {
    name: 'Image to Base64',
    description: 'Convert local images to Data URL/Base64.',
  },
  'case-converter': {
    name: 'Case Converter',
    description: 'Convert text between camelCase, snake_case, kebab-case and more.',
  },
  'svg-optimizer': {
    name: 'SVG Optimizer/Preview',
    description: 'Minify SVG, preview and export the result.',
  },
  },
  pt: {},
}

export function localizeTool(tool: ToolDefinition, language: AppLanguage): ToolDefinition {
  const localizedForLanguage = toolTextsByLanguage[language]?.[tool.id]
  const localizedFallback =
    language === DEFAULT_LANGUAGE
      ? undefined
      : toolTextsByLanguage[SECONDARY_FALLBACK_LANGUAGE]?.[tool.id]
        ?? toolTextsByLanguage[DEFAULT_LANGUAGE]?.[tool.id]
  const localized = localizedForLanguage ?? localizedFallback
  if (!localized) {
    return tool
  }

  return {
    ...tool,
    name: localized.name,
    description: localized.description,
  }
}
