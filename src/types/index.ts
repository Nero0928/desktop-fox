// AI 提供商類型
export type AIProvider = 
  | 'deepseek'
  | 'qwen'
  | 'ernie'
  | 'spark'
  | 'chatglm'
  | 'yi'
  | 'openrouter'

export interface AIProviderConfig {
  name: string
  apiKey: string
  baseURL?: string
  model: string
  enabled: boolean
  maxTokens?: number
  temperature?: number
}

export interface AIProvidersConfig {
  deepseek: AIProviderConfig
  qwen: AIProviderConfig
  ernie: AIProviderConfig
  spark: AIProviderConfig
  chatglm: AIProviderConfig
  yi: AIProviderConfig
  openrouter: AIProviderConfig
}

// 寵物狀態
export interface PetState {
  hunger: number
  mood: number
  energy: number
  lastFed: number
  lastInteraction: number
}

export type PetAnimationState = 'idle' | 'happy' | 'sad' | 'eating' | 'sleeping' | 'talking' | 'dragging'

// 聊天訊息
export interface ChatMessage {
  id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

// 動畫格式
export type AnimationFormat = 'frames' | 'live2d' | 'spine' | 'rive' | 'lottie'

export interface AnimationConfig {
  format: AnimationFormat
  path: string
  scale?: number
  fps?: number
}

// 設定
export interface AppSettings {
  // AI 設定
  aiProvider: AIProvider
  aiProviders: AIProvidersConfig
  
  // 動畫設定
  animationFormat: AnimationFormat
  animationPath: string
  
  // 一般設定
  language: 'zh-TW' | 'zh-CN' | 'en'
  autoStart: boolean
  showTrayIcon: boolean
  enableGlobalHotkey: boolean
  
  // 寵物行為
  petName: string
  decayRate: number
}

// 配額狀態
export interface QuotaStatus {
  usedToday: number
  maxFree: number
  hasPro: boolean
  lastResetDate: string
}

// 數據庫紀錄
export interface ChatHistoryRecord {
  id: number
  role: string
  content: string
  timestamp: number
}

export interface PetStateRecord {
  id: number
  hunger: number
  mood: number
  energy: number
  last_fed: number
  last_interaction: number
  updated_at: number
}
