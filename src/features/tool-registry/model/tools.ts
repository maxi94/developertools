import type { ToolDefinition } from '@/shared/types/tool'

export const tools: ToolDefinition[] = [
  {
    id: 'json-formatter',
    name: 'Formateador JSON',
    description: 'Formatea y valida JSON localmente en tu navegador.',
    category: 'Datos',
    status: 'ready',
  },
  {
    id: 'base64',
    name: 'Base64 Texto',
    description: 'Codifica y decodifica texto de forma rapida.',
    category: 'Datos',
    status: 'ready',
  },
  {
    id: 'base64-image',
    name: 'Base64 a imagen',
    description: 'Convierte una o varias cadenas Base64 en imagenes.',
    category: 'Datos',
    status: 'ready',
  },
  {
    id: 'base64-pdf',
    name: 'Base64 a PDF',
    description: 'Convierte una o varias cadenas Base64 en archivos PDF.',
    category: 'Datos',
    status: 'ready',
  },
  {
    id: 'jwt',
    name: 'Visualizador JWT',
    description: 'Decodifica header y payload para inspeccion.',
    category: 'Tokens e identidad',
    status: 'ready',
  },
  {
    id: 'uuid',
    name: 'Generador UUID',
    description: 'Genera UUID v4 y valida su formato.',
    category: 'Tokens e identidad',
    status: 'ready',
  },
  {
    id: 'url-codec',
    name: 'Codificador URL',
    description: 'Escapa y desescapa contenido para URLs.',
    category: 'Utilidades web',
    status: 'planned',
  },
  {
    id: 'readme-generator',
    name: 'Generador README',
    description: 'Crea README.md con plantilla y vista previa.',
    category: 'Documentacion',
    status: 'ready',
  },
]
