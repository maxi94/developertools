export type ToolId =
  | 'json-formatter'
  | 'json-table'
  | 'base64'
  | 'base64-image'
  | 'base64-pdf'
  | 'sql-formatter'
  | 'regex-tool'
  | 'jwt-builder'
  | 'encoding-suite'
  | 'datetime-tools'
  | 'code-minifier'
  | 'sql-mongo-converter'
  | 'id-toolkit'
  | 'fake-data-generator'
  | 'json-model-generator'
  | 'jwt'
  | 'uuid'
  | 'url-codec'
  | 'color-tools'
  | 'box-shadow-generator'
  | 'spacing-preview'
  | 'svg-optimizer'
  | 'image-to-base64'
  | 'case-converter'
export type ToolStatus = 'ready' | 'planned'
export type ToolCategory =
  | 'Datos'
  | 'Formateadores'
  | 'Generadores de codigo'
  | 'Tokens e identidad'
  | 'Utilidades web'
  | 'Documentacion'

export interface ToolDefinition {
  id: ToolId
  name: string
  description: string
  category: ToolCategory
  status: ToolStatus
  version: string
}
