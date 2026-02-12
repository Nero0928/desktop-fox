import type { DatabaseManager } from './DatabaseManager'
import type { AIProvidersConfig, AIProvider } from '../../src/types'

const DEFAULT_PROVIDERS: AIProvidersConfig = {
  deepseek: {
    name: 'DeepSeek',
    apiKey: '',
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    enabled: true,
    maxTokens: 1024,
    temperature: 0.7
  },
  qwen: {
    name: '通義千問',
    apiKey: '',
    baseURL: 'https://dashscope.aliyuncs.com/api/v1',
    model: 'qwen-turbo',
    enabled: false,
    maxTokens: 1024,
    temperature: 0.7
  },
  ernie: {
    name: '文心一言',
    apiKey: '',
    baseURL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat',
    model: 'ernie-bot-turbo',
    enabled: false,
    maxTokens: 1024,
    temperature: 0.7
  },
  spark: {
    name: '訊飛星火',
    apiKey: '',
    baseURL: 'https://spark-api-open.xf-yun.com/v1',
    model: 'general',
    enabled: false,
    maxTokens: 1024,
    temperature: 0.7
  },
  chatglm: {
    name: '智譜清言',
    apiKey: '',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    enabled: false,
    maxTokens: 1024,
    temperature: 0.7
  },
  yi: {
    name: '零一萬物',
    apiKey: '',
    baseURL: 'https://api.lingyiwanwu.com/v1',
    model: 'yi-34b-chat',
    enabled: false,
    maxTokens: 1024,
    temperature: 0.7
  },
  openrouter: {
    name: 'OpenRouter',
    apiKey: '',
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'openai/gpt-3.5-turbo',
    enabled: false,
    maxTokens: 1024,
    temperature: 0.7
  }
}

const DEFAULT_SETTINGS = {
  aiProvider: 'deepseek' as AIProvider,
  aiProviders: DEFAULT_PROVIDERS,
  animationFormat: 'frames' as const,
  animationPath: './assets/sprites',
  language: 'zh-TW' as const,
  autoStart: false,
  showTrayIcon: true,
  enableGlobalHotkey: true,
  petName: '狐狐',
  decayRate: 1.0
}

export class SettingsManager {
  private db: DatabaseManager
  private cache: Map<string, any> = new Map()

  constructor(db: DatabaseManager) {
    this.db = db
  }

  async initialize(): Promise<void> {
    // 載入所有設定到快取
    const settings = this.db.getAllSettings()
    for (const [key, value] of Object.entries(settings)) {
      this.cache.set(key, value)
    }
    
    // 確保預設值存在
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      if (this.get(key) === null) {
        this.set(key, value)
      }
    }
  }

  get(key: string): any {
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }
    
    const value = this.db.getSetting(key)
    if (value !== null) {
      this.cache.set(key, value)
    }
    
    return value
  }

  set(key: string, value: any): void {
    this.cache.set(key, value)
    this.db.setSetting(key, value)
  }

  getAll(): Record<string, any> {
    return Object.fromEntries(this.cache)
  }
}
