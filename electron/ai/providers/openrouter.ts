// OpenRouter Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class OpenRouterProvider implements AIProviderAdapter {
  readonly id = 'openrouter'
  readonly definition: ProviderDefinition = {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    models: [
      {
        id: 'openai/gpt-4o-mini',
        name: 'GPT-4o Mini (OpenRouter)',
        input: ['text'],
        contextWindow: 16384,
        maxTokens: 16384,
        cost: { input: 0.15, output: 0.6 }
      },
      {
        id: 'anthropic/claude-3-haiku',
        name: 'Claude 3 Haiku (OpenRouter)',
        input: ['text'],
        contextWindow: 200000,
        maxTokens: 4096,
        cost: { input: 0.25, output: 1.25 }
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
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://desktop-fox.app',
          'X-Title': 'Desktop Fox'
        }
      }
    )
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
      return true
    } catch {
      return false
    }
  }

  getDefaultModel(): string {
    return 'openai/gpt-4o-mini'
  }
}