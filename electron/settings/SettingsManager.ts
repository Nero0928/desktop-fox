import type { DatabaseManager } from './DatabaseManager'
import type { AIProvidersConfig, AIProvider } from '../../src/types'

const DEFAULT_PROVIDERS: AIProvidersConfig = {
  // Chinese Market
  deepseek: {
    name: 'DeepSeek',
    apiKey: '',
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    enabled: true,
    maxTokens: 1024,
    temperature: 0.7
  },
  minimax: {
    name: 'MiniMax',
    apiKey: '',
    baseURL: 'https://api.minimax.io/anthropic',
    model: 'MiniMax-M2.7',
    enabled: false,
    maxTokens: 131072,
    temperature: 0.7
  },
  kimi: {
    name: 'Kimi (Moonshot)',
    apiKey: '',
    baseURL: 'https://api.moonshot.cn/v1',
    model: 'moonshotai/Kimi-K2.5',
    enabled: false,
    maxTokens: 262144,
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
    maxTokens: 131072,
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
  },
  volcengine: {
    name: '火山引擎 (Doubao)',
    apiKey: '',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    model: 'doubao-pro-32k',
    enabled: false,
    maxTokens: 32768,
    temperature: 0.7
  },
  qianfan: {
    name: '百度千帆',
    apiKey: '',
    baseURL: 'https://qianfan.baidubce.com/v2/appen/conversation/v2/llm',
    model: 'deepseek-v3.2',
    enabled: false,
    maxTokens: 16384,
    temperature: 0.7
  },
  stepfun: {
    name: '階躍星辰',
    apiKey: '',
    baseURL: 'https://api.stepfun.com/v1',
    model: 'step-1',
    enabled: false,
    maxTokens: 131072,
    temperature: 0.7
  },
  zai: {
    name: 'Z.AI (GLM)',
    apiKey: '',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    enabled: false,
    maxTokens: 131072,
    temperature: 0.7
  },
  // International
  openai: {
    name: 'OpenAI',
    apiKey: '',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    enabled: false,
    maxTokens: 16384,
    temperature: 0.7
  },
  anthropic: {
    name: 'Anthropic',
    apiKey: '',
    baseURL: 'https://api.anthropic.com/v1',
    model: 'claude-haiku-4',
    enabled: false,
    maxTokens: 8192,
    temperature: 0.7
  },
  google: {
    name: 'Google Gemini',
    apiKey: '',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2-5-pro',
    enabled: false,
    maxTokens: 8192,
    temperature: 0.7
  },
  mistral: {
    name: 'Mistral AI',
    apiKey: '',
    baseURL: 'https://api.mistral.ai/v1',
    model: 'mistral-small-latest',
    enabled: false,
    maxTokens: 16384,
    temperature: 0.7
  },
  groq: {
    name: 'Groq',
    apiKey: '',
    baseURL: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant',
    enabled: false,
    maxTokens: 16384,
    temperature: 0.7
  },
  together: {
    name: 'Together AI',
    apiKey: '',
    baseURL: 'https://api.together.xyz/v1',
    model: 'deepseek-ai/DeepSeek-R1',
    enabled: false,
    maxTokens: 65536,
    temperature: 0.7
  },
  fireworks: {
    name: 'Fireworks AI',
    apiKey: '',
    baseURL: 'https://api.fireworks.ai/inference/v1',
    model: 'accounts/fireworks/routers/kimi-k2p5-turbo',
    enabled: false,
    maxTokens: 256000,
    temperature: 0.7
  },
  deepinfra: {
    name: 'DeepInfra',
    apiKey: '',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    model: 'deepseek-ai/DeepSeek-V3.2',
    enabled: false,
    maxTokens: 16384,
    temperature: 0.7
  },
  cerebras: {
    name: 'Cerebras',
    apiKey: '',
    baseURL: 'https://api.cerebras.ai/v1',
    model: 'cerebras/llama-3.1-8b',
    enabled: false,
    maxTokens: 16384,
    temperature: 0.7
  },
  huggingface: {
    name: 'HuggingFace',
    apiKey: '',
    baseURL: 'https://api-inference.huggingface.co/v1',
    model: 'meta-llama/Llama-3.1-8B-Instruct',
    enabled: false,
    maxTokens: 16384,
    temperature: 0.7
  },
  xai: {
    name: 'xAI',
    apiKey: '',
    baseURL: 'https://api.x.ai/v1',
    model: 'grok-2-mini',
    enabled: false,
    maxTokens: 16384,
    temperature: 0.7
  },
  bedrock: {
    name: 'AWS Bedrock',
    apiKey: '',
    baseURL: 'https://bedrock-runtime.',
    model: 'anthropic.claude-sonnet-4-6',
    enabled: false,
    maxTokens: 8192,
    temperature: 0.7
  },
  opencode: {
    name: 'OpenCode',
    apiKey: '',
    baseURL: 'https://api.opencode.ai/v1',
    model: 'opencode/claude-3.5-sonnet',
    enabled: false,
    maxTokens: 8192,
    temperature: 0.7
  },
  venice: {
    name: 'Venice AI',
    apiKey: '',
    baseURL: 'https://api.venice.ai/v1',
    model: 'venice-1',
    enabled: false,
    maxTokens: 16384,
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
    
    // 確保所有 AI 提供商都存在（合併新提供商）
    const existingProviders = this.get('aiProviders') as AIProvidersConfig | null
    if (existingProviders) {
      let updated = false
      const mergedProviders = { ...existingProviders }
      
      for (const [key, defaultConfig] of Object.entries(DEFAULT_PROVIDERS)) {
        if (!(key in mergedProviders)) {
          mergedProviders[key as keyof AIProvidersConfig] = defaultConfig
          updated = true
        }
      }
      
      if (updated) {
        this.set('aiProviders', mergedProviders)
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