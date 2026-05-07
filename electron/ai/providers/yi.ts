// Yi (零一萬物) Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class YiProvider implements AIProviderAdapter {
  readonly id = 'yi'
  readonly definition: ProviderDefinition = {
    id: 'yi',
    name: 'Yi (零一萬物)',
    baseUrl: 'https://api.lingyiwanwu.com/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'YI_API_KEY',
    models: [
      { id: 'yi-34b-chat', name: 'Yi 34B Chat', input: ['text'], contextWindow: 16384, maxTokens: 16384, cost: { input: 0.3, output: 0.9 } },
      { id: 'yi-large', name: 'Yi Large', input: ['text'], contextWindow: 16384, maxTokens: 16384, cost: { input: 1.0, output: 3.0 } }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(`${this.definition.baseUrl}/chat/completions`, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens,
      temperature: request.temperature
    }, {
      headers: { 'Authorization': `Bearer ${request.apiKey || process.env.YI_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'yi-34b-chat', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'yi-34b-chat' }
}