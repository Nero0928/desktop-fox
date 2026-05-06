// Groq Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class GroqProvider implements AIProviderAdapter {
  readonly id = 'groq'
  readonly definition: ProviderDefinition = {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'GROQ_API_KEY',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', input: ['text'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', input: ['text'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'gemma-2-9b', name: 'Gemma 2 9B', input: ['text'], contextWindow: 131072, maxTokens: 8192 },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', input: ['text'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'llama-3.2-1b', name: 'Llama 3.2 1B', input: ['text'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'llama-3.2-3b', name: 'Llama 3.2 3B', input: ['text'], contextWindow: 131072, maxTokens: 16384 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(`${this.definition.baseUrl}/chat/completions`, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens,
      temperature: request.temperature
    }, {
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'llama-3.3-70b-versatile' }
}