// Venice AI Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class VeniceProvider implements AIProviderAdapter {
  readonly id = 'venice'
  readonly definition: ProviderDefinition = {
    id: 'venice',
    name: 'Venice AI',
    baseUrl: 'https://api.venice.ai/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'VENICE_API_KEY',
    models: [
      { id: 'venice-1', name: 'Venice 1', input: ['text'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', input: ['text'], contextWindow: 131072, maxTokens: 16384 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(`${this.definition.baseUrl}/chat/completions`, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens
    }, {
      headers: { 'Authorization': `Bearer ${process.env.VENICE_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'venice-1', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'venice-1' }
}