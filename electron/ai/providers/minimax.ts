// MiniMax Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class MiniMaxProvider implements AIProviderAdapter {
  readonly id = 'minimax'
  readonly definition: ProviderDefinition = {
    id: 'minimax',
    name: 'MiniMax',
    baseUrl: 'https://api.minimax.io/anthropic',
    api: 'anthropic-messages',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'MINIMAX_API_KEY',
    models: [
      {
        id: 'MiniMax-M2.7',
        name: 'MiniMax M2.7',
        input: ['text'],
        contextWindow: 204800,
        maxTokens: 131072,
        reasoning: true,
        cost: { input: 0.3, output: 1.2, cacheRead: 0.06, cacheWrite: 0.375 }
      },
      {
        id: 'MiniMax-M2.5',
        name: 'MiniMax M2.5',
        input: ['text'],
        contextWindow: 192000,
        maxTokens: 65536,
        reasoning: true,
        cost: { input: 0.2, output: 0.8 }
      }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(
      `${this.definition.baseUrl}/v1/chat/completions`,
      {
        model: request.model,
        messages: request.messages,
        max_tokens: request.max_tokens,
        temperature: request.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({
        model: 'MiniMax-M2.7',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
      return true
    } catch {
      return false
    }
  }

  getDefaultModel(): string {
    return 'MiniMax-M2.7'
  }
}