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
  pt: {
    'json-formatter': {
      name: 'Formatador JSON',
      description: 'Formate e valide JSON localmente no seu navegador.',
    },
    'json-table': {
      name: 'JSON para tabela',
      description: 'Converta JSON (incluindo objetos aninhados) em tabela e exporte CSV/Excel.',
    },
    base64: {
      name: 'Base64 Texto',
      description: 'Codifique e decodifique texto rapidamente.',
    },
    'base64-image': {
      name: 'Base64 para imagem',
      description: 'Converta uma ou varias strings Base64 em imagens.',
    },
    'base64-pdf': {
      name: 'Base64 para PDF',
      description: 'Converta uma ou varias strings Base64 em arquivos PDF.',
    },
    'sql-formatter': {
      name: 'Formatador SQL',
      description: 'Formate consultas SQL com suporte a multiplos dialetos.',
    },
    'code-minifier': {
      name: 'Minify/Expand JS-CSS',
      description: 'Minifique e expanda JavaScript ou CSS a partir de texto ou arquivo.',
    },
    'regex-tool': {
      name: 'Ferramenta Regex',
      description: 'Crie, teste, depure e exporte expressoes regulares.',
    },
    'sql-mongo-converter': {
      name: 'SQL para MongoDB',
      description: 'Converta consultas SQL SELECT simples em consultas MongoDB.',
    },
    'json-model-generator': {
      name: 'JSON para classes',
      description: 'Gere classes a partir de JSON em C#, TypeScript, Java, Python, Kotlin e Go.',
    },
    'jwt-builder': {
      name: 'JWT Builder',
      description: 'Crie tokens JWT e assine HS256 localmente.',
    },
    jwt: {
      name: 'Visualizador JWT',
      description: 'Decodifique header e payload para inspecao.',
    },
    uuid: {
      name: 'Gerador UUID',
      description: 'Gere UUID v4 e valide seu formato.',
    },
    'url-codec': {
      name: 'Codificador URL',
      description: 'Codifique e decodifique conteudo para URLs.',
    },
    'encoding-suite': {
      name: 'Encoder/Decoder extra',
      description: 'HTML, Unicode, Hex e Base64 URL-safe.',
    },
    'color-tools': {
      name: 'Ferramentas de cor',
      description: 'Converta HEX/RGB/HSL e valide contraste WCAG.',
    },
    'box-shadow-generator': {
      name: 'Gerador de Box Shadow',
      description: 'Crie sombras CSS com preview em tempo real e saida pronta para copiar.',
    },
    'spacing-preview': {
      name: 'Preview de borda/espacamento',
      description: 'Visualize border-radius, padding e margin com CSS exportavel.',
    },
    'datetime-tools': {
      name: 'Ferramentas DateTime',
      description: 'Conversao de fuso horario, Unix timestamp e formatador ISO.',
    },
    'id-toolkit': {
      name: 'Toolkit UUID/ULID/KSUID',
      description: 'Gerador, validador e exportacao em lote de IDs.',
    },
    'image-to-base64': {
      name: 'Imagem para Base64',
      description: 'Converta imagens locais para Data URL/Base64.',
    },
    'case-converter': {
      name: 'Conversor de caixa',
      description: 'Converta texto entre camelCase, snake_case, kebab-case e mais.',
    },
    'svg-optimizer': {
      name: 'Otimizador SVG/Preview',
      description: 'Minifique SVG, visualize e exporte o resultado.',
    },
  },
}

export function localizeTool(tool: ToolDefinition, language: AppLanguage): ToolDefinition {
  const localizedForLanguage = toolTextsByLanguage[language]?.[tool.id]
  const localizedFallback =
    language === DEFAULT_LANGUAGE
      ? undefined
      : language === SECONDARY_FALLBACK_LANGUAGE
        ? toolTextsByLanguage[DEFAULT_LANGUAGE]?.[tool.id]
        : toolTextsByLanguage[DEFAULT_LANGUAGE]?.[tool.id]
          ?? toolTextsByLanguage[SECONDARY_FALLBACK_LANGUAGE]?.[tool.id]
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
