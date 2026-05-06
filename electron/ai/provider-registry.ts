// Provider 工廠 - 創建各 Provider 的 adapter
import type { AIProviderId, ProviderDefinition, AIRequest } from './types'
import { DeepSeekProvider } from './providers/deepseek'
import { MiniMaxProvider } from './providers/minimax'
import { KimiProvider } from './providers/kimi'
import { QwenProvider } from './providers/qwen'
import { ErnieProvider } from './providers/ernie'
import { SparkProvider } from './providers/spark'
import { ChatGLMProvider } from './providers/chatglm'
import { YiProvider } from './providers/yi'
import { OpenRouterProvider } from './providers/openrouter'

// Provider adapter interface
export interface AIProviderAdapter {
  readonly id: AIProviderId
  readonly definition: ProviderDefinition

  call(request: AIRequest): Promise<string>
  test(): Promise<boolean>
  getDefaultModel(): string
}

// Provider registry
export class ProviderRegistry {
  private providers: Map<AIProviderId, AIProviderAdapter> = new Map()

  constructor() {
    this.registerProvider(new DeepSeekProvider())
    this.registerProvider(new MiniMaxProvider())
    this.registerProvider(new KimiProvider())
    this.registerProvider(new QwenProvider())
    this.registerProvider(new ErnieProvider())
    this.registerProvider(new SparkProvider())
    this.registerProvider(new ChatGLMProvider())
    this.registerProvider(new YiProvider())
    this.registerProvider(new OpenRouterProvider())
  }

  private registerProvider(adapter: AIProviderAdapter): void {
    this.providers.set(adapter.id, adapter)
  }

  getProvider(id: AIProviderId): AIProviderAdapter | undefined {
    return this.providers.get(id)
  }

  getAllProviders(): AIProviderAdapter[] {
    return Array.from(this.providers.values())
  }

  getEnabledProviders(): AIProviderAdapter[] {
    return this.getAllProviders().filter(p => p.definition.enabled)
  }

  getAvailableModels(): Array<{ provider: AIProviderId; model: string; name: string }> {
    const models: Array<{ provider: AIProviderId; model: string; name: string }> = []
    for (const provider of this.getEnabledProviders()) {
      for (const model of provider.definition.models) {
        models.push({
          provider: provider.id,
          model: model.id,
          name: model.name
        })
      }
    }
    return models
  }

  // Find provider by model ID (e.g., "deepseek/deepseek-chat")
  findProviderByModel(modelRef: string): AIProviderAdapter | undefined {
    const [providerId, modelId] = modelRef.split('/')
    return this.providers.get(providerId as AIProviderId)
  }
}

// Singleton instance
let registry: ProviderRegistry | null = null

export function getProviderRegistry(): ProviderRegistry {
  if (!registry) {
    registry = new ProviderRegistry()
  }
  return registry
}