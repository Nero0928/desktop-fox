// StepFun Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class StepFunProvider implements AIProviderAdapter {
  readonly id = 'stepfun'
  readonly definition: ProviderDefinition = {
    id: 'stepfun',
    name: 'StepFun',
    baseUrl: 'https://api.stepfun.com/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'STEPFUN_API_KEY',
    models: [
      { id: 'step-1', name: 'Step-1', input: ['text'], contextWindow: 131072, maxTokens: 8192 },
      { id: 'step-1v', name: 'Step-1V (Vision)', input: ['text', 'image'], contextWindow: 131072, maxTokens: 8192 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(`${this.definition.baseUrl}/chat/completions`, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens
    }, {
      headers: { 'Authorization': `Bearer ${process.env.STEPFUN_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'step-1', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'step-1' }
}