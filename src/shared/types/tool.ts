export type ToolId = 'json-formatter' | 'base64' | 'url-codec'
export type ToolStatus = 'ready' | 'planned'

export interface ToolDefinition {
  id: ToolId
  name: string
  description: string
  status: ToolStatus
}
