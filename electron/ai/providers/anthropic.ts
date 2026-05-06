// Anthropic Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'
import { SYSTEM_PROMPT_EN } from '../types'

export class AnthropicProvider implements AIProviderAdapter {
  readonly id = 'anthropic'
  readonly definition: ProviderDefinition = {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    api: 'anthropic-messages',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'ANTHROPIC_API_KEY',
    models: [
      {
        id: 'claude-opus-4.7',
        name: 'Claude Opus 4.7',
        input: ['text', 'image'],
        contextWindow: 1000000,
        maxTokens: 32000,
        reasoning: true,
        cost: { input: 3.0, output: 15.0 }
      },
      {
        id: 'claude-opus-4-6',
        name: 'Claude Opus 4.6',
        input: ['text', 'image'],
        contextWindow: 200000,
        maxTokens: 8192,
        reasoning: true,
        cost: { input: 3.0, output: 15.0 }
      },
      {
        id: 'claude-sonnet-4-6',
        name: 'Claude Sonnet 4.6',
        input: ['text', 'image'],
        contextWindow: 200000,
        maxTokens: 8192,
        reasoning: true,
        cost: { input: 0.8, output: 4.0 }
      },
      {
        id: 'claude-haiku-4',
        name: 'Claude Haiku 4',
        input: ['text', 'image'],
        contextWindow: 200000,
        maxTokens: 8192,
        reasoning: true,
        cost: { input: 0.2, output: 1.0 }
      }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(
      `${this.definition.baseUrl}/messages`,
      {
        model: request.model,
        messages: request.messages,
        max_tokens: request.max_tokens || 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    )
    return response.data.content[0].text
  }

  async test(): Promise<boolean> {
    try {
      await this.call({
        model: 'claude-haiku-4',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
      return true
    } catch {
      return false
    }
  }

  getDefaultModel(): string {
    return 'claude-opus-4-6'
  }
}