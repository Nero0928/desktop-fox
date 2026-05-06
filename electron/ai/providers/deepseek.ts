// DeepSeek Provider Adapter
import axios, { AxiosError } from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class DeepSeekProvider implements AIProviderAdapter {
  readonly id = 'deepseek'
  readonly definition: ProviderDefinition = {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        input: ['text'],
        contextWindow: 131072,
        maxTokens: 8192,
        cost: { input: 0.1, output: 0.3 }
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek Reasoner',
        input: ['text'],
        contextWindow: 131072,
        maxTokens: 65536,
        reasoning: true,
        cost: { input: 0.3, output: 1.2 }
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
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
      return true
    } catch {
      return false
    }
  }

  getDefaultModel(): string {
    return 'deepseek-chat'
  }
}