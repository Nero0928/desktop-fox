import type { AnimationProvider, AnimationConfig, AnimationFrame, FrameAnimationConfig } from './AnimationProvider'
import type { PetAnimationState } from '../types'

export class FrameAnimationProvider implements AnimationProvider {
  readonly name = 'Frame Animation'
  readonly format = 'frames'
  
  private config: FrameAnimationConfig = { basePath: './assets/sprites' }
  private currentFrames: AnimationFrame[] = []
  private currentFrameIndex = 0
  private frameTimer = 0
  private fps = 12
  private isLoading = false
  private loadedAnimations: Map<string, AnimationFrame[]> = new Map()
  
  async initialize(config: AnimationConfig): Promise<void> {
    this.config = {
      ...config,
      supportedStates: ['idle', 'happy', 'sad', 'eating', 'sleeping', 'talking', 'dragging']
    }
    this.fps = config.fps || 12
    
    // 預載入所有動畫
    await this.preloadAnimations()
  }
  
  private async preloadAnimations(): Promise<void> {
    const states = this.config.supportedStates || []
    
    for (const state of states) {
      const frames = await this.loadFramesForState(state)
      if (frames.length > 0) {
        this.loadedAnimations.set(state, frames)
      }
    }
  }
  
  private async loadFramesForState(state: PetAnimationState): Promise<AnimationFrame[]> {
    const frames: AnimationFrame[] = []
    const basePath = this.config.basePath || './assets/sprites'
    
    // 嘗試載入 1-30 幀
    for (let i = 1; i <= 30; i++) {
      try {
        const image = await this.loadImage(`${basePath}/${state}/${i}.png`)
        frames.push({
          image,
          duration: 1000 / this.fps
        })
      } catch {
        // 如果該幀不存在，停止載入
        break
      }
    }
    
    // 如果沒有載入任何幀，使用佔位符
    if (frames.length === 0) {
      frames.push({
        image: this.createPlaceholder(state),
        duration: 1000
      })
    }
    
    return frames
  }
  
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load: ${src}`))
      img.src = src
    })
  }
  
  private createPlaceholder(state: PetAnimationState): HTMLImageElement {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 250
    const ctx = canvas.getContext('2d')!
    
    // 根據狀態繪製不同顏色的佔位符
    const colors: Record<PetAnimationState, string> = {
      idle: '#FFB6C1',
      happy: '#FFD700',
      sad: '#87CEEB',
      eating: '#FFA07A',
      sleeping: '#DDA0DD',
      talking: '#98FB98',
      dragging: '#F0E68C'
    }
    
    ctx.fillStyle = colors[state] || '#FFB6C1'
    ctx.fillRect(0, 0, 200, 250)
    
    // 繪製狀態文字
    ctx.fillStyle = '#333'
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(state, 100, 125)
    
    const img = new Image()
    img.src = canvas.toDataURL()
    return img
  }
  
  async loadAnimation(state: PetAnimationState): Promise<void> {
    this.isLoading = true
    
    const frames = this.loadedAnimations.get(state)
    if (frames && frames.length > 0) {
      this.currentFrames = frames
      this.currentFrameIndex = 0
      this.frameTimer = 0
    }
    
    this.isLoading = false
  }
  
  update(deltaTime: number): void {
    if (this.currentFrames.length === 0 || this.isLoading) return
    
    this.frameTimer += deltaTime
    
    const currentFrame = this.currentFrames[this.currentFrameIndex]
    if (this.frameTimer >= currentFrame.duration) {
      this.frameTimer = 0
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.currentFrames.length
    }
  }
  
  render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    const frame = this.currentFrames[this.currentFrameIndex]
    if (!frame?.image) return
    
    ctx.drawImage(frame.image, x, y, width, height)
  }
  
  destroy(): void {
    this.currentFrames = []
    this.loadedAnimations.clear()
  }
}
