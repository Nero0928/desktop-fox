// HuggingFace Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class HuggingFaceProvider implements AIProviderAdapter {
  readonly id = 'huggingface'
  readonly definition: ProviderDefinition = {
    id: 'huggingface',
    name: 'Hugging Face',
    baseUrl: 'https://api-inference.huggingface.co/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'HUGGINGFACE_API_KEY',
    models: [
      { id: 'meta-llama/Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B', input: ['text'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'meta-llama/Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B', input: ['text'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B', input: ['text'], contextWindow: 32768, maxTokens: 8192 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(`${this.definition.baseUrl}/chat/completions`, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens,
      temperature: request.temperature
    }, {
      headers: { 'Authorization': `Bearer ${request.apiKey || process.env.HUGGINGFACE_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'meta-llama/Llama-3.1-8B-Instruct', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'meta-llama/Llama-3.1-8B-Instruct' }
}