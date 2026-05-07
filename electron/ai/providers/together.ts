// Together AI Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class TogetherProvider implements AIProviderAdapter {
  readonly id = 'together'
  readonly definition: ProviderDefinition = {
    id: 'together',
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'TOGETHER_API_KEY',
    models: [
      { id: 'moonshotai/Kimi-K2.5', name: 'Kimi K2.5', input: ['text', 'image'], contextWindow: 262144, maxTokens: 262144, reasoning: true },
      { id: 'zai-org/GLM-4.7', name: 'GLM 4.7 Fp8', input: ['text'], contextWindow: 202752, maxTokens: 4096 },
      { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B Instruct Turbo', input: ['text'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'meta-llama/Llama-4-Scout-17B-16E-Instruct', name: 'Llama 4 Scout 17B', input: ['text', 'image'], contextWindow: 10000000, maxTokens: 16384 },
      { id: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8', name: 'Llama 4 Maverick 17B', input: ['text', 'image'], contextWindow: 20000000, maxTokens: 16384 },
      { id: 'deepseek-ai/DeepSeek-V3.1', name: 'DeepSeek V3.1', input: ['text'], contextWindow: 131072, maxTokens: 16384 },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', input: ['text'], contextWindow: 131072, maxTokens: 65536, reasoning: true },
      { id: 'moonshotai/Kimi-K2-Instruct-0905', name: 'Kimi K2-Instruct 0905', input: ['text'], contextWindow: 262144, maxTokens: 16384 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(`${this.definition.baseUrl}/chat/completions`, {
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens,
      temperature: request.temperature
    }, {
      headers: { 'Authorization': `Bearer ${request.apiKey || process.env.TOGETHER_API_KEY}`, 'Content-Type': 'application/json' }
    })
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'moonshotai/Kimi-K2.5', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'moonshotai/Kimi-K2.5' }
}