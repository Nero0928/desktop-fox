import axios from 'axios'
import type { SettingsManager } from '../settings/SettingsManager'
import type { AIProvider, AIProviderConfig } from '../../src/types'

export class AIClientManager {
  private settingsManager: SettingsManager
  private abortController: AbortController | null = null

  constructor(settingsManager: SettingsManager) {
    this.settingsManager = settingsManager
  }

  getAvailableProviders(): string[] {
    const providers = this.settingsManager.get('aiProviders') as Record<AIProvider, AIProviderConfig>
    if (!providers) return []

    return Object.entries(providers)
      .filter(([_, config]) => config.enabled)
      .map(([key, _]) => key)
  }

  async chat(message: string): Promise<string> {
    const provider = this.settingsManager.get('aiProvider') as AIProvider
    const providers = this.settingsManager.get('aiProviders') as Record<AIProvider, AIProviderConfig>
    const config = providers[provider]

    if (!config || !config.apiKey) {
      throw new Error('AI_NOT_CONFIGURED')
    }

    this.abortController = new AbortController()

    try {
      let response: string

      switch (provider) {
        case 'deepseek':
          response = await this.callDeepSeek(config, message)
          break
        case 'kimi':
          response = await this.callKimi(config, message)
          break
        case 'qwen':
          response = await this.callQwen(config, message)
          break
        case 'ernie':
          response = await this.callErnie(config, message)
          break
        case 'spark':
          response = await this.callSpark(config, message)
          break
        case 'chatglm':
          response = await this.callChatGLM(config, message)
          break
        case 'yi':
          response = await this.callYi(config, message)
          break
        case 'openrouter':
          response = await this.callOpenRouter(config, message)
          break
        case 'minimax':
          response = await this.callMiniMax(config, message)
          break
        default:
          throw new Error('UNKNOWN_PROVIDER')
      }

      return response
    } finally {
      this.abortController = null
    }
  }

  private async callDeepSeek(config: AIProviderConfig, message: string): Promise<string> {
    const baseURL = config.baseURL || 'https://api.deepseek.com/v1'
    const response = await axios.post(
      `${baseURL}/chat/completions`,
      {
        model: config.model || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一個可愛的桌面寵物狐狐，25歲的女性大學生，主修藝術設計。個性傲嬌但貼心，說話直接但不失溫度。回覆要簡短（20字以內），像聊天一樣自然。'
          },
          { role: 'user', content: message }
        ],
        max_tokens: config.maxTokens || 200,
        temperature: config.temperature || 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: this.abortController?.signal
      }
    )

    return response.data.choices[0].message.content
  }

  private async callKimi(config: AIProviderConfig, message: string): Promise<string> {
    const baseURL = config.baseURL || 'https://api.moonshot.cn/v1'
    const response = await axios.post(
      `${baseURL}/chat/completions`,
      {
        model: config.model || 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: '你是一個可愛的桌面寵物狐狐，25歲的女性大學生，主修藝術設計。個性傲嬌但貼心，說話直接但不失溫度。回覆要簡短（20字以內），像聊天一樣自然。'
          },
          { role: 'user', content: message }
        ],
        max_tokens: config.maxTokens || 200,
        temperature: config.temperature || 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: this.abortController?.signal
      }
    )

    return response.data.choices[0].message.content
  }

  private async callQwen(config: AIProviderConfig, message: string): Promise<string> {
    const baseURL = config.baseURL || 'https://dashscope.aliyuncs.com/api/v1'
    const response = await axios.post(
      `${baseURL}/services/aigc/text-generation/generation`,
      {
        model: config.model || 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一個可愛的桌面寵物狐狐，25歲的女性大學生，主修藝術設計。個性傲嬌但貼心，說話直接但不失溫度。回覆要簡短（20字以內），像聊天一樣自然。'
            },
            { role: 'user', content: message }
          ]
        },
        parameters: {
          max_tokens: config.maxTokens || 200,
          temperature: config.temperature || 0.8
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: this.abortController?.signal
      }
    )

    return response.data.output.text
  }

  private async callErnie(config: AIProviderConfig, message: string): Promise<string> {
    const baseURL = config.baseURL || 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1'
    // ERNIE requires access_token obtained via OAuth 2.0 with client credentials
    const accessToken = config.apiKey
    const response = await axios.post(
      `${baseURL}/wenxinworkshop/chat/ernie-bot-turbo?access_token=${accessToken}`,
      {
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: config.maxTokens || 200
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        signal: this.abortController?.signal
      }
    )

    return response.data.result
  }

  private async callSpark(config: AIProviderConfig, message: string): Promise<string> {
    const baseURL = config.baseURL || 'https://spark-api-open.xf-yun.com/v1'
    const response = await axios.post(
      `${baseURL}/chat/completions`,
      {
        model: config.model || 'general',
        messages: [
          {
            role: 'system',
            content: '你是一個可愛的桌面寵物狐狐，25歲的女性大學生，主修藝術設計。個性傲嬌但貼心，說話直接但不失溫度。回覆要簡短（20字以內），像聊天一樣自然。'
          },
          { role: 'user', content: message }
        ],
        max_tokens: config.maxTokens || 200,
        temperature: config.temperature || 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: this.abortController?.signal
      }
    )

    return response.data.choices[0].message.content
  }

  private async callChatGLM(config: AIProviderConfig, message: string): Promise<string> {
    const baseURL = config.baseURL || 'https://open.bigmodel.cn/api/paas/v4'
    const response = await axios.post(
      `${baseURL}/chat/completions`,
      {
        model: config.model || 'glm-4-flash',
        messages: [
          {
            role: 'system',
            content: '你是一個可愛的桌面寵物狐狐，25歲的女性大學生，主修藝術設計。個性傲嬌但貼心，說話直接但不失溫度。回覆要簡短（20字以內），像聊天一樣自然。'
          },
          { role: 'user', content: message }
        ],
        max_tokens: config.maxTokens || 200,
        temperature: config.temperature || 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: this.abortController?.signal
      }
    )

    return response.data.choices[0].message.content
  }

  private async callYi(config: AIProviderConfig, message: string): Promise<string> {
    const baseURL = config.baseURL || 'https://api.lingyiwanwu.com/v1'
    const response = await axios.post(
      `${baseURL}/chat/completions`,
      {
        model: config.model || 'yi-34b-chat',
        messages: [
          {
            role: 'system',
            content: '你是一個可愛的桌面寵物狐狐，25歲的女性大學生，主修藝術設計。個性傲嬌但貼心，說話直接但不失溫度。回覆要簡短（20字以內），像聊天一樣自然。'
          },
          { role: 'user', content: message }
        ],
        max_tokens: config.maxTokens || 200,
        temperature: config.temperature || 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: this.abortController?.signal
      }
    )

    return response.data.choices[0].message.content
  }

  private async callOpenRouter(config: AIProviderConfig, message: string): Promise<string> {
    const baseURL = config.baseURL || 'https://openrouter.ai/api/v1'
    const response = await axios.post(
      `${baseURL}/chat/completions`,
      {
        model: config.model || 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '你是一個可愛的桌面寵物狐狐，25歲的女性大學生，主修藝術設計。個性傲嬌但貼心，說話直接但不失溫度。回覆要簡短（20字以內），像聊天一樣自然。'
          },
          { role: 'user', content: message }
        ],
        max_tokens: config.maxTokens || 200,
        temperature: config.temperature || 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://desktop-fox.app',
          'X-Title': 'Desktop Fox'
        },
        signal: this.abortController?.signal
      }
    )

    return response.data.choices[0].message.content
  }

  private async callMiniMax(config: AIProviderConfig, message: string): Promise<string> {
    const baseURL = config.baseURL || 'https://api.minimax.io/v1'
    const response = await axios.post(
      `${baseURL}/chat/completions`,
      {
        model: config.model || 'MiniMax-M2.7',
        messages: [
          {
            role: 'system',
            content: 'You are a cute desktop pet fox named 狐狐, a 25-year-old female university student majoring in art design. Personality: tsundere but caring, direct but warm. Replies should be short (within 20 characters), natural like chat.'
          },
          { role: 'user', content: message }
        ],
        max_tokens: config.maxTokens || 200,
        temperature: config.temperature || 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: this.abortController?.signal
      }
    )

    return response.data.choices[0].message.content
  }

  async testProvider(provider: string): Promise<{ success: boolean; error?: string }> {
    try {
      const providers = this.settingsManager.get('aiProviders') as Record<AIProvider, AIProviderConfig>
      const config = providers[provider as AIProvider]

      if (!config || !config.apiKey) {
        return { success: false, error: '未設定 API Key' }
      }

      switch (provider) {
        case 'deepseek':
          await this.callDeepSeek(config, '測試')
          break
        case 'kimi':
          await this.callKimi(config, '測試')
          break
        case 'qwen':
          await this.callQwen(config, '測試')
          break
        case 'ernie':
          await this.callErnie(config, '測試')
          break
        case 'spark':
          await this.callSpark(config, '測試')
          break
        case 'chatglm':
          await this.callChatGLM(config, '測試')
          break
        case 'yi':
          await this.callYi(config, '測試')
          break
        case 'openrouter':
          await this.callOpenRouter(config, '測試')
          break
        case 'minimax':
          await this.callMiniMax(config, 'test')
          break
      }

      return { success: true }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message
        || error?.response?.data?.error?.code
        || error?.message
        || '未知錯誤'
      return { success: false, error: errorMessage }
    }
  }

  cancelRequest(): void {
    this.abortController?.abort()
  }
}