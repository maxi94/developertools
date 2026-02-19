export type ToolId = 'json-formatter' | 'base64' | 'jwt' | 'uuid' | 'url-codec'
export type ToolStatus = 'ready' | 'planned'
export type ToolCategory = 'Datos' | 'Tokens e identidad' | 'Utilidades web'

export interface ToolDefinition {
  id: ToolId
  name: string
  description: string
  category: ToolCategory
  status: ToolStatus
}
