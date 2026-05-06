// Provider Factory - Registry pattern for all AI providers
import type { AIProviderId, ProviderDefinition, AIRequest } from './types'

// Import all providers
import { DeepSeekProvider } from './providers/deepseek'
import { MiniMaxProvider } from './providers/minimax'
import { KimiProvider } from './providers/kimi'
import { QwenProvider } from './providers/qwen'
import { ErnieProvider } from './providers/ernie'
import { SparkProvider } from './providers/spark'
import { ChatGLMProvider } from './providers/chatglm'
import { YiProvider } from './providers/yi'
import { OpenRouterProvider } from './providers/openrouter'
import { OpenAIProvider } from './providers/openai'
import { AnthropicProvider } from './providers/anthropic'
import { GoogleProvider } from './providers/google'
import { MistralProvider } from './providers/mistral'
import { GroqProvider } from './providers/groq'
import { TogetherProvider } from './providers/together'
import { FireworksProvider } from './providers/fireworks'
import { DeepInfraProvider } from './providers/deepinfra'
import { CerebrasProvider } from './providers/cerebras'
import { HuggingFaceProvider } from './providers/huggingface'
import { XAIProvider } from './providers/xai'
import { VolcEngineProvider } from './providers/volcengine'
import { QianfanProvider } from './providers/qianfan'
import { BedrockProvider } from './providers/bedrock'
import { StepFunProvider } from './providers/stepfun'
import { OpenCodeProvider } from './providers/opencode'
import { VeniceProvider } from './providers/venice'
import { ZAIProvider } from './providers/zai'

// Provider adapter interface - all providers implement this
export interface AIProviderAdapter {
  readonly id: AIProviderId
  readonly definition: ProviderDefinition

  call(request: AIRequest): Promise<string>
  test(): Promise<boolean>
  getDefaultModel(): string
}

// Provider registry - manages all registered providers
export class ProviderRegistry {
  private providers: Map<AIProviderId, AIProviderAdapter> = new Map()

  constructor() {
    // Register all providers
    this.registerProvider(new DeepSeekProvider())
    this.registerProvider(new MiniMaxProvider())
    this.registerProvider(new KimiProvider())
    this.registerProvider(new QwenProvider())
    this.registerProvider(new ErnieProvider())
    this.registerProvider(new SparkProvider())
    this.registerProvider(new ChatGLMProvider())
    this.registerProvider(new YiProvider())
    this.registerProvider(new OpenRouterProvider())
    this.registerProvider(new OpenAIProvider())
    this.registerProvider(new AnthropicProvider())
    this.registerProvider(new GoogleProvider())
    this.registerProvider(new MistralProvider())
    this.registerProvider(new GroqProvider())
    this.registerProvider(new TogetherProvider())
    this.registerProvider(new FireworksProvider())
    this.registerProvider(new DeepInfraProvider())
    this.registerProvider(new CerebrasProvider())
    this.registerProvider(new HuggingFaceProvider())
    this.registerProvider(new XAIProvider())
    this.registerProvider(new VolcEngineProvider())
    this.registerProvider(new QianfanProvider())
    this.registerProvider(new BedrockProvider())
    this.registerProvider(new StepFunProvider())
    this.registerProvider(new OpenCodeProvider())
    this.registerProvider(new VeniceProvider())
    this.registerProvider(new ZAIProvider())
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

  // Get all available models from all enabled providers
  getAvailableModels(): Array<{
    provider: AIProviderId
    model: string
    name: string
    reasoning?: boolean
    input: string[]
  }> {
    const models: Array<{
      provider: AIProviderId
      model: string
      name: string
      reasoning?: boolean
      input: string[]
    }> = []
    for (const provider of this.getEnabledProviders()) {
      for (const model of provider.definition.models) {
        models.push({
          provider: provider.id,
          model: model.id,
          name: model.name,
          reasoning: model.reasoning,
          input: model.input
        })
      }
    }
    return models
  }

  // Find provider by model reference (e.g., "deepseek/deepseek-chat")
  findProviderByModel(modelRef: string): AIProviderAdapter | undefined {
    const [providerId] = modelRef.split('/')
    return this.providers.get(providerId as AIProviderId)
  }

  // Get provider metadata
  getProviderInfo(id: AIProviderId): ProviderDefinition | undefined {
    const provider = this.providers.get(id)
    return provider?.definition
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

// Export all provider adapters for external use
export {
  DeepSeekProvider,
  MiniMaxProvider,
  KimiProvider,
  QwenProvider,
  ErnieProvider,
  SparkProvider,
  ChatGLMProvider,
  YiProvider,
  OpenRouterProvider,
  OpenAIProvider,
  AnthropicProvider,
  GoogleProvider,
  MistralProvider,
  GroqProvider,
  TogetherProvider,
  FireworksProvider,
  DeepInfraProvider,
  CerebrasProvider,
  HuggingFaceProvider,
  XAIProvider,
  VolcEngineProvider,
  QianfanProvider,
  BedrockProvider,
  StepFunProvider,
  OpenCodeProvider,
  VeniceProvider,
  ZAIProvider
}