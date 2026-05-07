// AI Provider Type Definitions - Desktop Fox
// Inspired by OpenClaw's model provider architecture

export type AIProviderId =
  // Original Chinese market providers
  | 'deepseek'
  | 'minimax'
  | 'kimi'
  | 'qwen'
  | 'ernie'
  | 'spark'
  | 'chatglm'
  | 'yi'
  | 'openrouter'
  // International providers
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'groq'
  | 'together'
  | 'fireworks'
  | 'deepinfra'
  | 'cerebras'
  | 'huggingface'
  | 'xai'
  | 'volcengine'
  | 'qianfan'
  | 'bedrock'
  | 'stepfun'
  | 'opencode'
  | 'venice'
  | 'zai'

export type APIFormat =
  | 'openai-completions'    // OpenAI /v1/chat/completions
  | 'openai-responses'      // OpenAI /v1/responses
  | 'anthropic-messages'    // Anthropic /v1/messages
  | 'qwen'                  // Alibaba Qwen custom format
  | 'custom'                // Custom format (ERNIE, etc.)
  | 'google-ai'            // Google Gemini API
  | 'aws-bedrock'           // AWS Bedrock

export type AuthType = 'api-key' | 'oauth' | 'bearer' | 'aws-iam'

// Model definition
export interface ModelDefinition {
  id: string
  name: string
  input: ('text' | 'image' | 'audio' | 'video')[]
  contextWindow: number
  maxTokens: number
  reasoning?: boolean
  cost?: {
    input: number      // per 1M tokens (USD)
    output: number
    cacheRead?: number
    cacheWrite?: number
  }
}

// Provider definition
export interface ProviderDefinition {
  id: AIProviderId
  name: string
  baseUrl: string
  api: APIFormat
  auth: AuthType
  authHeader?: boolean
  models: ModelDefinition[]
  enabled?: boolean
  envKey?: string      // environment variable name for API key
  needsRegion?: boolean // requires region configuration (AWS, etc.)
}

// Settings format
export interface AIProvidersConfig {
  mode: 'merge' | 'replace'
  providers: Record<AIProviderId, ProviderDefinition>
  defaults: {
    provider: AIProviderId
    model: string
  }
}

// ERNIE-specific credentials
export interface ERNIECredentials {
  clientId: string
  clientSecret: string
  accessToken?: string
  tokenExpiry?: number
}

// AWS Bedrock region config
export interface BedrockConfig {
  region: string
  credentials?: {
    accessKeyId: string
    secretAccessKey: string
  }
}

// AI Request/Response
export interface AIRequest {
  model: string
  apiKey?: string  // Per-request API key override (supports token plan keys)
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  max_tokens?: number
  temperature?: number
  reasoning?: {
    type: 'enabled' | 'disabled'
    effort?: 'low' | 'medium' | 'high' | 'maximum'
  }
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

// Provider status for UI
export interface ProviderStatus {
  id: AIProviderId
  enabled: boolean
  configured: boolean
  lastTest?: Date
  error?: string
}

// System prompt for fox character
export const SYSTEM_PROMPT = '你是一個可愛的桌面寵物狐狐，25歲的女性大學生，主修藝術設計。個性傲嬌但貼心，說話直接但不失溫度。回覆要簡短（20字以內），像聊天一樣自然。'

// OpenAI system prompt (English)
export const SYSTEM_PROMPT_EN = 'You are a cute desktop pet fox named 狐狐, a 25-year-old female university student majoring in art design. Personality: tsundere but caring, direct but warm. Replies should be short (within 20 characters), natural like chat.'