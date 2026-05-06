// Z.AI (GLM) Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class ZAIProvider implements AIProviderAdapter {
  readonly id = 'zai'
  readonly definition: ProviderDefinition = {
    id: 'zai',
    name: 'Z.AI (GLM)',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'ZAI_API_KEY',
    models: [
      { id: 'glm-4', name: 'GLM-4', input: ['text'], contextWindow: 131072, maxTokens: 131072 },
      { id: 'glm-4-plus', name: 'GLM-4 Plus', input: ['text', 'image'], contextWindow: 131072, maxTokens: 131072 },
      { id: 'glm-4-9b', name: 'GLM-4 9B', input: ['text'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'glm-4-flash', name: 'GLM-4 Flash', input: ['text'], contextWindow: 131072, maxTokens: 131072 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(`${this.definition.baseUrl}/chat/completions`, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens
    }, {
      headers: { 'Authorization': `Bearer ${process.env.ZAI_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'glm-4-flash', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'glm-4-flash' }
}