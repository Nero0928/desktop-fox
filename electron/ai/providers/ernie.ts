// ERNIE (文心一言) Provider Adapter - OAuth 2.0
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest, ERNIECredentials } from '../types'

export class ErnieProvider implements AIProviderAdapter {
  readonly id = 'ernie'
  readonly definition: ProviderDefinition = {
    id: 'ernie',
    name: 'ERNIE (文心一言)',
    baseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
    api: 'custom',
    auth: 'oauth',
    enabled: true,
    envKey: 'BAIDU_ACCESS_TOKEN',
    models: [
      { id: 'ernie-bot-turbo', name: 'ERNIE Bot Turbo', input: ['text'], contextWindow: 8192, maxTokens: 8192 },
      { id: 'ernie-bot', name: 'ERNIE Bot', input: ['text'], contextWindow: 16384, maxTokens: 16384 }
    ]
  }

  private credentials: ERNIECredentials | null = null

  setCredentials(clientId: string, clientSecret: string): void {
    this.credentials = { clientId, clientSecret }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.credentials) throw new Error('ERNIE credentials not set')
    if (this.credentials.accessToken && this.credentials.tokenExpiry && Date.now() < this.credentials.tokenExpiry) {
      return this.credentials.accessToken
    }
    const response = await axios.post('https://aip.baidubce.com/oauth/2.0/token', null, {
      params: { grant_type: 'client_credentials', client_id: this.credentials.clientId, client_secret: this.credentials.clientSecret }
    })
    this.credentials.accessToken = response.data.access_token
    this.credentials.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000
    return this.credentials.accessToken
  }

  async call(request: AIRequest): Promise<string> {
    const accessToken = await this.getAccessToken()
    const response = await axios.post(`${this.definition.baseUrl}/wenxinworkshop/chat/ernie-bot-turbo?access_token=${accessToken}`, {
      messages: request.messages, max_tokens: request.max_tokens
    }, { headers: { 'Content-Type': 'application/json' } })
    return response.data.result
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'ernie-bot-turbo', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'ernie-bot-turbo' }
}