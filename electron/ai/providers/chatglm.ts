// ChatGLM (智譜清言) Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class ChatGLMProvider implements AIProviderAdapter {
  readonly id = 'chatglm'
  readonly definition: ProviderDefinition = {
    id: 'chatglm',
    name: '智譜清言 (ChatGLM)',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    api: 'openai-completions',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    models: [
      {
        id: 'glm-4-flash',
        name: 'GLM-4 Flash',
        input: ['text'],
        contextWindow: 131072,
        maxTokens: 131072,
        cost: { input: 0.1, output: 0.3 }
      },
      {
        id: 'glm-4',
        name: 'GLM-4',
        input: ['text'],
        contextWindow: 131072,
        maxTokens: 131072,
        cost: { input: 1.0, output: 3.0 }
      },
      {
        id: 'glm-4-plus',
        name: 'GLM-4 Plus',
        input: ['text', 'image'],
        contextWindow: 131072,
        maxTokens: 131072,
        cost: { input: 2.0, output: 6.0 }
      }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const response = await axios.post(
      `${this.definition.baseUrl}/chat/completions`,
      {
        model: request.model,
        messages: request.messages,
        max_tokens: request.max_tokens,
        temperature: request.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHATGLM_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.choices[0].message.content
  }

  async test(): Promise<boolean> {
    try {
      await this.call({
        model: 'glm-4-flash',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
      return true
    } catch {
      return false
    }
  }

  getDefaultModel(): string {
    return 'glm-4-flash'
  }
}