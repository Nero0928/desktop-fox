// AI Client Manager - Unified interface for all AI providers
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

  // Get all available providers
  getAvailableProviders(): AIProviderAdapter[] {
    return this.registry.getEnabledProviders()
  }

  // Get provider info by ID
  getProviderInfo(id: AIProviderId) {
    return this.registry.getProviderInfo(id)
  }

  // Get all available models
  getAvailableModels() {
    return this.registry.getAvailableModels()
  }

  // Main chat function
  async chat(message: string): Promise<string> {
    const providerId = this.settingsManager.get('aiProvider') as AIProviderId
    const modelId = this.settingsManager.get('aiModel') as string ||
      this.registry.getProvider(providerId)?.getDefaultModel() ||
      'deepseek-v4-flash'

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

  // Test a specific provider
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
        error: error?.response?.data?.error?.message ||
               error?.response?.data?.error?.code ||
               error?.message ||
               'Unknown error'
      }
    }
  }

  // Test all providers
  async testAllProviders(): Promise<Record<string, { success: boolean; error?: string }>> {
    const results: Record<string, { success: boolean; error?: string }> = {}
    for (const provider of this.registry.getAllProviders()) {
      results[provider.id] = await this.testProvider(provider.id)
    }
    return results
  }

  // Cancel ongoing request
  cancelRequest(): void {
    this.abortController?.abort()
  }

  // Get model reference format (provider/model)
  getModelRef(providerId: AIProviderId, modelId: string): string {
    return `${providerId}/${modelId}`
  }

  // Parse model reference
  parseModelRef(modelRef: string): { provider: AIProviderId; model: string } | null {
    const provider = this.registry.findProviderByModel(modelRef)
    if (!provider) return null
    const model = modelRef.split('/')[1]
    return { provider: provider.id, model }
  }
}