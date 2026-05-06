// AI Provider index - exports all providers
export { DeepSeekProvider } from './deepseek'
export { MiniMaxProvider } from './minimax'
export { KimiProvider } from './kimi'
export { QwenProvider } from './qwen'
export { ErnieProvider } from './ernie'
export { SparkProvider } from './spark'
export { ChatGLMProvider } from './chatglm'
export { YiProvider } from './yi'
export { OpenRouterProvider } from './openrouter'

export { ProviderRegistry, getProviderRegistry, type AIProviderAdapter } from '../provider-registry'