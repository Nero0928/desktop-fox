import type { AnimationProvider, AnimationConfig } from './AnimationProvider'
import type { PetAnimationState } from '../types'

export class RiveProvider implements AnimationProvider {
  readonly name = 'Rive'
  readonly format = 'rive'
  
  async initialize(_config: AnimationConfig): Promise<void> {
    // TODO: 整合 Rive Runtime
    console.log('Rive provider initialized (stub)')
  }
  
  async loadAnimation(_state: PetAnimationState): Promise<void> {
    // TODO: 載入 Rive 動畫
  }
  
  update(_deltaTime: number): void {
    // TODO: 更新 Rive 動畫
  }
  
  render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    // TODO: 渲染 Rive 動畫
    ctx.fillStyle = '#F0F8FF'
    ctx.fillRect(x, y, width, height)
    ctx.fillStyle = '#333'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Rive Coming Soon', x + width/2, y + height/2)
  }
  
  destroy(): void {
    // TODO: 清理 Rive 資源
  }
}
