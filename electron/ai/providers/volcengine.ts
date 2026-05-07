// Volcengine (Doubao) Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class VolcEngineProvider implements AIProviderAdapter {
  readonly id = 'volcengine'
  readonly definition: ProviderDefinition = {
    id: 'volcengine',
    name: 'Volcengine (Doubao)',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'VOLCENGINE_API_KEY',
    needsRegion: true,
    models: [
      { id: 'doubao-pro-32k', name: 'Doubao Pro 32K', input: ['text'], contextWindow: 32768, maxTokens: 4096 },
      { id: 'doubao-lite-32k', name: 'Doubao Lite 32K', input: ['text'], contextWindow: 32768, maxTokens: 4096 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(`${this.definition.baseUrl}/chat/completions`, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens,
      temperature: request.temperature
    }, {
      headers: { 'Authorization': `Bearer ${request.apiKey || process.env.VOLCENGINE_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'doubao-pro-32k', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'doubao-pro-32k' }
}