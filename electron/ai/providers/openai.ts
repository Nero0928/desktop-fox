// OpenAI Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class OpenAIProvider implements AIProviderAdapter {
  readonly id = 'openai'
  readonly definition: ProviderDefinition = {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'OPENAI_API_KEY',
    models: [
      {
        id: 'gpt-5.5',
        name: 'GPT-5.5',
        input: ['text', 'image'],
        contextWindow: 1000000,
        maxTokens: 32000,
        cost: { input: 3.0, output: 12.0 }
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        input: ['text', 'image'],
        contextWindow: 128000,
        maxTokens: 16384,
        cost: { input: 2.5, output: 10.0 }
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        input: ['text', 'image'],
        contextWindow: 128000,
        maxTokens: 16384,
        cost: { input: 0.15, output: 0.60 }
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        input: ['text', 'image'],
        contextWindow: 128000,
        maxTokens: 4096,
        cost: { input: 10.0, output: 30.0 }
      },
      {
        id: 'gpt-5.4-mini',
        name: 'GPT-5.4 Mini',
        input: ['text', 'image'],
        contextWindow: 64000,
        maxTokens: 16384,
        cost: { input: 0.15, output: 0.60 }
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
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
      return true
    } catch {
      return false
    }
  }

  getDefaultModel(): string {
    return 'gpt-4o-mini'
  }
}