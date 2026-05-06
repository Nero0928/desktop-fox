// AWS Bedrock Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class BedrockProvider implements AIProviderAdapter {
  readonly id = 'bedrock'
  readonly definition: ProviderDefinition = {
    id: 'bedrock',
    name: 'AWS Bedrock',
    baseUrl: 'https://bedrock-runtime.',
    api: 'aws-bedrock',
    auth: 'aws-iam',
    enabled: true,
    envKey: 'AWS_ACCESS_KEY_ID',
    needsRegion: true,
    models: [
      { id: 'anthropic.claude-opus-4-6', name: 'Claude Opus 4.6 (Bedrock)', input: ['text', 'image'], contextWindow: 200000, maxTokens: 8192 },
      { id: 'anthropic.claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (Bedrock)', input: ['text', 'image'], contextWindow: 200000, maxTokens: 8192 },
      { id: 'meta.llama-3.1-70b-instruct', name: 'Llama 3.1 70B (Bedrock)', input: ['text'], contextWindow: 131072, maxTokens: 16384 }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    // Bedrock uses AWS Signature Version 4 - simplified here
    const region = process.env.AWS_REGION || 'us-east-1'
    const url = `${this.definition.baseUrl}${region}/model/${request.model}/invoke`
    const response = await axios.post(url, {
      messages: request.messages,
      max_tokens: request.max_tokens
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AWS_BEDROCK_API_KEY || process.env.AWS_ACCESS_KEY_ID}`
      }
    })
    return response.data.content[0].text
  }

  async test(): Promise<boolean> {
    try {
      await this.call({ model: 'anthropic.claude-sonnet-4-6', messages: [{ role: 'user', content: 'test' }], max_tokens: 10 })
      return true
    } catch { return false }
  }

  getDefaultModel(): string { return 'anthropic.claude-sonnet-4-6' }
}