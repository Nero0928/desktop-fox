// AI Client Manager - 使用 Provider Registry 的統一管理器
import type { SettingsManager } from '../settings/SettingsManager'
import { getProviderRegistry, type AIProviderAdapter } from './provider-registry'
import type { AIProviderId, AIRequest } from './types'
import { SYSTEM_PROMPT } from './types'

export class AIClientManager {
  private settingsManager: SettingsManager
  private abortController: AbortController | null = null
  private registry = getProviderRegistry()

  constructor(settingsManager: SettingsManager) {
    this.settingsManager = settingsManager
  }

  getAvailableProviders(): AIProviderAdapter[] {
    return this.registry.getEnabledProviders()
  }

  async chat(message: string): Promise<string> {
    const providerId = this.settingsManager.get('aiProvider') as AIProviderId
    const modelId = this.settingsManager.get('aiModel') as string || this.getDefaultModel(providerId)

    const provider = this.registry.getProvider(providerId)
    if (!provider) {
      throw new Error(`UNKNOWN_PROVIDER: ${providerId}`)
    }

    this.abortController = new AbortController()

    try {
      const request: AIRequest = {
        model: modelId,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.8
      }

      return await provider.call(request)
    } finally {
      this.abortController = null
    }
  }

  private getDefaultModel(providerId: AIProviderId): string {
    const provider = this.registry.getProvider(providerId)
    return provider?.getDefaultModel() || 'deepseek-chat'
  }

  async testProvider(providerId: string): Promise<{ success: boolean; error?: string }> {
    const provider = this.registry.getProvider(providerId as AIProviderId)
    if (!provider) {
      return { success: false, error: `UNKNOWN_PROVIDER: ${providerId}` }
    }

    try {
      const success = await provider.test()
      return { success }
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error?.message
          || error?.response?.data?.error?.code
          || error?.message
          || 'Unknown error'
      }
    }
  }

  cancelRequest(): void {
    this.abortController?.abort()
  }
}