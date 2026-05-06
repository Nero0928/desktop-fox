// AI Provider 類型定義
export type AIProviderId =
  | 'deepseek'
  | 'minimax'
  | 'kimi'
  | 'qwen'
  | 'ernie'
  | 'spark'
  | 'chatglm'
  | 'yi'
  | 'openrouter'

export type APIFormat =
  | 'openai-completions'   // OpenAI /v1/chat/completions
  | 'openai-responses'     // OpenAI /v1/responses
  | 'anthropic-messages'   // Anthropic /v1/messages
  | 'qwen'                 // 阿里雲通義千問專用
  | 'custom'               // 自定義格式

export type AuthType = 'api-key' | 'oauth' | 'bearer'

// 模型定義
export interface ModelDefinition {
  id: string           // 模型 ID (如 "deepseek-chat")
  name: string         // 顯示名稱
  input: ('text' | 'image')[]  // 輸入類型
  contextWindow: number // 上下文窗口 (tokens)
  maxTokens: number    // 最大輸出 (tokens)
  reasoning?: boolean  // 是否支援思考模式
  cost?: {
    input: number      // 每 1M tokens 的價格（美元）
    output: number
    cacheRead?: number
    cacheWrite?: number
  }
}

// Provider 定義
export interface ProviderDefinition {
  id: AIProviderId
  name: string         // 顯示名稱
  baseUrl: string      // API base URL
  api: APIFormat
  auth: AuthType
  authHeader?: boolean // 是否強制 Authorization header
  models: ModelDefinition[]
  enabled?: boolean
}

// 設定檔格式
export interface AIProvidersConfig {
  mode: 'merge' | 'replace'
  providers: Record<AIProviderId, ProviderDefinition>
  defaults: {
    provider: AIProviderId
    model: string
  }
}

// ERNIE 專用設定
export interface ERNIECredentials {
  clientId: string
  clientSecret: string
  accessToken?: string
  tokenExpiry?: number
}

// API 請求/回應格式
export interface AIRequest {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  max_tokens?: number
  temperature?: number
}

export interface AIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  reasoning?: string
}

// Provider 狀態
export interface ProviderStatus {
  id: AIProviderId
  enabled: boolean
  configured: boolean
  lastTest?: Date
  error?: string
}

// 系統提示詞
export const SYSTEM_PROMPT = '你是一個可愛的桌面寵物狐狐，25歲的女性大學生，主修藝術設計。個性傲嬌但貼心，說話直接但不失溫度。回覆要簡短（20字以內），像聊天一樣自然。'