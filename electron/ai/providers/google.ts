// Google Gemini Provider Adapter
import axios from 'axios'
import type { AIProviderAdapter, ProviderDefinition, AIRequest } from '../types'

export class GoogleProvider implements AIProviderAdapter {
  readonly id = 'google'
  readonly definition: ProviderDefinition = {
    id: 'google',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    api: 'google-ai',
    auth: 'api-key',
    authHeader: true,
    enabled: true,
    envKey: 'GEMINI_API_KEY',
    models: [
      {
        id: 'gemini-3-flash-preview',
        name: 'Gemini 3 Flash',
        input: ['text', 'image', 'video'],
        contextWindow: 1000000,
        maxTokens: 8192,
        reasoning: true,
        cost: { input: 0.1, output: 0.4 }
      },
      {
        id: 'gemini-3.1-pro-preview',
        name: 'Gemini 3.1 Pro',
        input: ['text', 'image', 'video'],
        contextWindow: 2000000,
        maxTokens: 8192,
        reasoning: true,
        cost: { input: 1.0, output: 4.0 }
      },
      {
        id: 'gemini-2-5-pro',
        name: 'Gemini 2.5 Pro',
        input: ['text', 'image'],
        contextWindow: 1000000,
        maxTokens: 8192,
        reasoning: true,
        cost: { input: 0.35, output: 1.05 }
      },
      {
        id: 'gemini-2-5-flash',
        name: 'Gemini 2.5 Flash',
        input: ['text', 'image'],
        contextWindow: 1000000,
        maxTokens: 8192,
        reasoning: true,
        cost: { input: 0.075, output: 0.30 }
      },
      {
        id: 'gemini-2-0-flash',
        name: 'Gemini 2.0 Flash',
        input: ['text', 'image'],
        contextWindow: 1000000,
        maxTokens: 8192,
        cost: { input: 0.05, output: 0.20 }
      }
    ]
  }

  async call(request: AIRequest): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    const response = await axios.post(
      `${this.definition.baseUrl}/models/${request.model}:generateContent`,
      {
        contents: [{
          parts: request.messages.map(m => ({ text: m.content }))
        }],
        generationConfig: {
          maxOutputTokens: request.max_tokens || 2048,
          temperature: request.temperature || 0.8
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          key: apiKey
        }
      }
    )
    return response.data.candidates[0].content.parts[0].text
  }

  async test(): Promise<boolean> {
    try {
      await this.call({
        model: 'gemini-2-5-flash',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
      return true
    } catch {
      return false
    }
  }

  getDefaultModel(): string {
    return 'gemini-2-5-flash'
  }
}