// Kimi (Moonshot) Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class KimiProvider implements AIProviderAdapter {
  readonly id = 'kimi'
  readonly definition: ProviderDefinition = {
    id: 'kimi',
    name: 'Kimi (Moonshot)',
    baseUrl: 'https://api.moonshot.cn/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    models: [
      {
        id: 'moonshot-v1-8k',
        name: 'Moonshot V1 8K',
        input: ['text'],
        contextWindow: 8192,
        maxTokens: 8192
      },
      {
        id: 'moonshot-v1-32k',
        name: 'Moonshot V1 32K',
        input: ['text'],
        contextWindow: 32768,
        maxTokens: 32768
      },
      {
        id: 'moonshot-v1-128k',
        name: 'Moonshot V1 128K',
        input: ['text'],
        contextWindow: 131072,
        maxTokens: 131072
      }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(
      `${this.definition.baseUrl}/chat/completions`,
      {
        model: request.model,
        messages: request.messages,
        max_tokens: request.max_tokens,
        temperature: request.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.KIMI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({
        model: 'moonshot-v1-8k',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
      return true
    } catch {
      return false
    }
  }

  getDefaultModel(): string {
    return 'moonshot-v1-8k'
  }
}