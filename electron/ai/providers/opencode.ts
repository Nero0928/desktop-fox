// OpenCode Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class OpenCodeProvider implements AIProviderAdapter {
  readonly id = 'opencode'
  readonly definition: ProviderDefinition = {
    id: 'opencode',
    name: 'OpenCode',
    baseUrl: 'https://api.opencode.ai/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'OPENCODE_API_KEY',
    models: [
      { id: 'opencode/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', input: ['text', 'image'], contextWindow: 200000, maxTokens: 8192 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(`${this.definition.baseUrl}/chat/completions`, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens
    }, {
      headers: { 'Authorization': `Bearer ${request.apiKey || process.env.OPENCODE_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'opencode/claude-3.5-sonnet', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'opencode/claude-3.5-sonnet' }
}