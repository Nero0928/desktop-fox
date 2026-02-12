import type { AnimationProvider, AnimationConfig } from './AnimationProvider'
import type { PetAnimationState } from '../types'

export class Live2DProvider implements AnimationProvider {
  readonly name = 'Live2D Cubism'
  readonly format = 'live2d'
  
  async initialize(config: AnimationConfig): Promise<void> {
    // TODO: 整合 Live2D Cubism SDK
    console.log('Live2D provider initialized (stub)')
  }
  
  async loadAnimation(state: PetAnimationState): Promise<void> {
    // TODO: 載入對應動作
  }
  
  update(deltaTime: number): void {
    // TODO: 更新 Live2D 模型
  }
  
  render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    // TODO: 渲染 Live2D 模型
    ctx.fillStyle = '#FFE4E1'
    ctx.fillRect(x, y, width, height)
    ctx.fillStyle = '#333'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Live2D Coming Soon', x + width/2, y + height/2)
  }
  
  destroy(): void {
    // TODO: 清理 Live2D 資源
  }
}
