// Fireworks AI Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class FireworksProvider implements AIProviderAdapter {
  readonly id = 'fireworks'
  readonly definition: ProviderDefinition = {
    id: 'fireworks',
    name: 'Fireworks AI',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'FIREWORKS_API_KEY',
    models: [
      { id: 'accounts/fireworks/models/kimi-k2p6', name: 'Kimi K2.6', input: ['text', 'image'], contextWindow: 262144, maxTokens: 262144 },
      { id: 'accounts/fireworks/routers/kimi-k2p5-turbo', name: 'Kimi K2.5 Turbo', input: ['text', 'image'], contextWindow: 256000, maxTokens: 256000 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(`${this.definition.baseUrl}/chat/completions`, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens,
      temperature: request.temperature
    }, {
      headers: { 'Authorization': `Bearer ${request.apiKey || process.env.FIREWORKS_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'accounts/fireworks/routers/kimi-k2p5-turbo', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'accounts/fireworks/routers/kimi-k2p5-turbo' }
}