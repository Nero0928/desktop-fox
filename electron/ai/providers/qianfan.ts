// Qianfan (百度) Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class QianfanProvider implements AIProviderAdapter {
  readonly id = 'qianfan'
  readonly definition: ProviderDefinition = {
    id: 'qianfan',
    name: 'Qianfan (百度)',
    baseUrl: 'https://qianfan.baidubce.com/v2/appen/conversation/v2/llm',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'QIANFAN_API_KEY',
    models: [
      { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', input: ['text'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'ernie-4.0-8k', name: 'ERNIE 4.0 8K', input: ['text'], contextWindow: 8192, maxTokens: 4096 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(this.definition.baseUrl, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens,
      temperature: request.temperature
    }, {
      headers: { 'Authorization': `Bearer ${request.apiKey || process.env.QIANFAN_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'deepseek-v3.2', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'deepseek-v3.2' }
}