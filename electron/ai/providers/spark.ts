// Spark (訊飛星火) Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class SparkProvider implements AIProviderAdapter {
  readonly id = 'spark'
  readonly definition: ProviderDefinition = {
    id: 'spark',
    name: 'Spark (訊飛星火)',
    baseUrl: 'https://spark-api-open.xf-yun.com/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'SPARK_API_KEY',
    models: [
      { id: 'general', name: 'Spark General', input: ['text'], contextWindow: 8192, maxTokens: 8192 },
      { id: 'generalv3.5', name: 'Spark General V3.5', input: ['text'], contextWindow: 16384, maxTokens: 16384 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(`${this.definition.baseUrl}/chat/completions`, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens,
      temperature: request.temperature
    }, {
      headers: { 'Authorization': `Bearer ${process.env.SPARK_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'general', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'general' }
}