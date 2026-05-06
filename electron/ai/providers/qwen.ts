// Qwen (通義千問) Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class QwenProvider implements AIProviderAdapter {
  readonly id = 'qwen'
  readonly definition: ProviderDefinition = {
    id: 'qwen',
    name: '通義千問 (Qwen)',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
    api: 'qwen',  // 專用格式
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    models: [
      {
        id: 'qwen-turbo',
        name: 'Qwen Turbo',
        input: ['text'],
        contextWindow: 8192,
        maxTokens: 8192,
        cost: { input: 0.2, output: 0.4 }
      },
      {
        id: 'qwen-plus',
        name: 'Qwen Plus',
        input: ['text'],
        contextWindow: 32768,
        maxTokens: 32768,
        cost: { input: 0.8, output: 2.0 }
      },
      {
        id: 'qwen-max',
        name: 'Qwen Max',
        input: ['text'],
        contextWindow: 131072,
        maxTokens: 131072,
        cost: { input: 2.0, output: 8.0 }
      }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    // Qwen uses a special request format with input/messages and parameters
    const response = await axios.post(
      `${this.definition.baseUrl}/services/aigc/text-generation/generation`,
      {
        model: request.model,
        input: {
          messages: request.messages
        },
        parameters: {
          max_tokens: request.max_tokens,
          temperature: request.temperature
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.output.text
  }

  async test(): Promise<boolean> {
    try {
      await this.call({
        model: 'qwen-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
      return true
    } catch {
      return false
    }
  }

  getDefaultModel(): string {
    return 'qwen-turbo'
  }
}