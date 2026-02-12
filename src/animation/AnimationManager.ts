import type { AnimationProvider, AnimationConfig } from './AnimationProvider'
import type { PetAnimationState, AnimationFormat } from '../types'
import { FrameAnimationProvider } from './FrameAnimationProvider'
import { Live2DProvider } from './Live2DProvider'
import { SpineProvider } from './SpineProvider'
import { RiveProvider } from './RiveProvider'

export class AnimationManager {
  private currentProvider: AnimationProvider | null = null
  private providers: Map<AnimationFormat, AnimationProvider> = new Map()
  private currentFormat: AnimationFormat = 'frames'
  private lastTime = 0
  private animationId: number | null = null
  
  constructor() {
    this.providers.set('frames', new FrameAnimationProvider())
    this.providers.set('live2d', new Live2DProvider())
    this.providers.set('spine', new SpineProvider())
    this.providers.set('rive', new RiveProvider())
  }
  
  async initialize(format: AnimationFormat, config: AnimationConfig): Promise<void> {
    this.currentFormat = format
    this.currentProvider = this.providers.get(format) || this.providers.get('frames')!
    await this.currentProvider.initialize(config)
  }
  
  async switchFormat(format: AnimationFormat, config: AnimationConfig): Promise<void> {
    if (format === this.currentFormat) return
    
    this.currentProvider?.destroy()
    this.currentProvider = this.providers.get(format)
    
    if (!this.currentProvider) {
      console.warn(`Unknown animation format: ${format}, falling back to frames`)
      this.currentProvider = this.providers.get('frames')!
    }
    
    this.currentFormat = format
    await this.currentProvider.initialize(config)
  }
  
  async loadAnimation(state: PetAnimationState): Promise<void> {
    await this.currentProvider?.loadAnimation(state)
  }
  
  startRenderLoop(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const render = (currentTime: number) => {
      const deltaTime = currentTime - this.lastTime
      this.lastTime = currentTime
      
      // 更新動畫
      this.currentProvider?.update(deltaTime)
      
      // 清除畫布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 渲染
      this.currentProvider?.render(ctx, 0, 0, canvas.width, canvas.height)
      
      this.animationId = requestAnimationFrame(render)
    }
    
    this.animationId = requestAnimationFrame(render)
  }
  
  stopRenderLoop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }
  
  getSupportedFormats(): Array<{ id: AnimationFormat; name: string; available: boolean }> {
    return [
      { id: 'frames', name: 'Frame Animation (PNG)', available: true },
      { id: 'live2d', name: 'Live2D Cubism', available: false },
      { id: 'spine', name: 'Spine', available: false },
      { id: 'rive', name: 'Rive', available: false }
    ]
  }
  
  getCurrentFormat(): AnimationFormat {
    return this.currentFormat
  }
  
  destroy(): void {
    this.stopRenderLoop()
    this.currentProvider?.destroy()
  }
}
