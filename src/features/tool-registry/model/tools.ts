import type { ToolDefinition } from '@/shared/types/tool'

export const tools: ToolDefinition[] = [
  {
    id: 'json-formatter',
    name: 'Formateador JSON',
    description: 'Formatea y valida JSON localmente en tu navegador.',
    status: 'ready',
  },
  {
    id: 'base64',
    name: 'Codificador Base64',
    description: 'Codifica y decodifica texto de forma rapida.',
    status: 'planned',
  },
  {
    id: 'url-codec',
    name: 'Codificador URL',
    description: 'Escapa y desescapa contenido para URLs.',
    status: 'planned',
  },
]
