// ERNIE (文心一言) Provider Adapter
// Uses OAuth 2.0 access_token for authentication
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest, ERNIECredentials } from '../types'

export class ErnieProvider implements AIProviderAdapter {
  readonly id = 'ernie'
  readonly definition: ProviderDefinition = {
    id: 'ernie',
    name: '文心一言 (ERNIE)',
    baseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
    api: 'custom',  // 百度自定義格式
    auth: 'oauth',
    enabled: true,
    models: [
      {
        id: 'ernie-bot-turbo',
        name: 'ERNIE Bot Turbo',
        input: ['text'],
        contextWindow: 8192,
        maxTokens: 8192,
        cost: { input: 0.3, output: 0.6 }
      },
      {
        id: 'ernie-bot',
        name: 'ERNIE Bot',
        input: ['text'],
        contextWindow: 16384,
        maxTokens: 16384,
        cost: { input: 0.8, output: 2.0 }
      }
    ]
  }

  // ERNIE requires OAuth access_token
  private credentials: ERNIECredentials | null = null

  setCredentials(clientId: string, clientSecret: string): void {
    this.credentials = { clientId, clientSecret }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.credentials) {
      throw new Error('ERNIE credentials not set')
    }

    // Check if we have a cached token that's still valid
    if (this.credentials.accessToken && this.credentials.tokenExpiry) {
      if (Date.now() < this.credentials.tokenExpiry) {
        return this.credentials.accessToken
      }
    }

    // Exchange client credentials for access token
    const response = await axios.post(
      'https://aip.baidubce.com/oauth/2.0/token',
      null,
      {
        params: {
          grant_type: 'client_credentials',
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret
        }
      }
    )

    this.credentials.accessToken = response.data.access_token
    this.credentials.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000  // 提前1分鐘過期

    return this.credentials.accessToken
  }

  async call(request: AIRequest): Promise<string> {
    const accessToken = await this.getAccessToken()

    const response = await axios.post(
      `${this.definition.baseUrl}/wenxinworkshop/chat/ernie-bot-turbo?access_token=${accessToken}`,
      {
        messages: request.messages,
        max_tokens: request.max_tokens
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data.result
  }

  async test(): Promise<boolean> {
    try {
      await this.call({
        model: 'ernie-bot-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
      return true
    } catch {
      return false
    }
  }

  getDefaultModel(): string {
    return 'ernie-bot-turbo'
  }
}