// xAI Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class XAIProvider implements AIProviderAdapter {
  readonly id = 'xai'
  readonly definition: ProviderDefinition = {
    id: 'xai',
    name: 'xAI',
    baseUrl: 'https://api.x.ai/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'XAI_API_KEY',
    models: [
      { id: 'grok-2', name: 'Grok 2', input: ['text', 'image'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'grok-2-mini', name: 'Grok 2 Mini', input: ['text'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'grok-beta', name: 'Grok Beta', input: ['text'], contextWindow: 131072, maxTokens: 16384 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(`${this.definition.baseUrl}/chat/completions`, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens,
      temperature: request.temperature
    }, {
      headers: { 'Authorization': `Bearer ${process.env.XAI_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'grok-2-mini', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'grok-2' }
}