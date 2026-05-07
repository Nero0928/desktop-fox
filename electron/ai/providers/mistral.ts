// Mistral AI Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class MistralProvider implements AIProviderAdapter {
  readonly id = 'mistral'
  readonly definition: ProviderDefinition = {
    id: 'mistral',
    name: 'Mistral AI',
    baseUrl: 'https://api.mistral.ai/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'MISTRAL_API_KEY',
    models: [
      {
        id: 'mistral-large-latest',
        name: 'Mistral Large',
        input: ['text', 'image'],
        contextWindow: 262144,
        maxTokens: 16384,
        cost: { input: 2.0, output: 6.0 }
      },
      {
        id: 'mistral-medium-2508',
        name: 'Mistral Medium 3.1',
        input: ['text', 'image'],
        contextWindow: 262144,
        maxTokens: 8192,
        cost: { input: 0.5, output: 1.5 }
      },
      {
        id: 'mistral-small-latest',
        name: 'Mistral Small 4',
        input: ['text', 'image'],
        contextWindow: 128000,
        maxTokens: 16384,
        cost: { input: 0.15, output: 0.45 }
      },
      {
        id: 'pixtral-large-latest',
        name: 'Pixtral',
        input: ['text', 'image'],
        contextWindow: 128000,
        maxTokens: 32768,
        cost: { input: 0.5, output: 1.5 }
      },
      {
        id: 'codestral-latest',
        name: 'Codestral',
        input: ['text'],
        contextWindow: 256000,
        maxTokens: 4096,
        cost: { input: 0.3, output: 0.9 }
      },
      {
        id: 'devstral-medium-latest',
        name: 'Devstral 2',
        input: ['text'],
        contextWindow: 262144,
        maxTokens: 32768,
        cost: { input: 0.2, output: 0.6 }
      },
      {
        id: 'magistral-small',
        name: 'Magistral Small',
        input: ['text'],
        contextWindow: 128000,
        maxTokens: 40000,
        reasoning: true,
        cost: { input: 0.15, output: 0.45 }
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
          'Authorization': `Bearer ${request.apiKey || process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
      return true
    } catch {
      return false
    }
  }

  getDefaultModel(): string {
    return 'mistral-large-latest'
  }
}