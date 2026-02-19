export type ToolId =
  | 'json-formatter'
  | 'base64'
  | 'base64-image'
  | 'base64-pdf'
  | 'sql-formatter'
  | 'regex-tool'
  | 'jwt-builder'
  | 'encoding-suite'
  | 'datetime-tools'
  | 'sql-mongo-converter'
  | 'id-toolkit'
  | 'fake-data-generator'
  | 'json-model-generator'
  | 'jwt'
  | 'uuid'
  | 'url-codec'
  | 'readme-generator'
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
