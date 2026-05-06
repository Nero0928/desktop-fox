// Cerebras Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class CerebrasProvider implements AIProviderAdapter {
  readonly id = 'cerebras'
  readonly definition: ProviderDefinition = {
    id: 'cerebras',
    name: 'Cerebras',
    baseUrl: 'https://api.cerebras.ai/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'CEREBRAS_API_KEY',
    models: [
      { id: 'cerebras/llama-3.3-70b', name: 'Llama 3.3 70B', input: ['text'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'cerebras/llama-3.1-8b', name: 'Llama 3.1 8B', input: ['text'], contextWindow: 131072, maxTokens: 16384 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(`${this.definition.baseUrl}/chat/completions`, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens,
      temperature: request.temperature
    }, {
      headers: { 'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'cerebras/llama-3.1-8b', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'cerebras/llama-3.3-70b' }
}