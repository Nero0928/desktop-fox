import type { AnimationProvider, AnimationConfig } from './AnimationProvider'
import type { PetAnimationState } from '../types'

export class SpineProvider implements AnimationProvider {
  readonly name = 'Spine'
  readonly format = 'spine'
  
  async initialize(_config: AnimationConfig): Promise<void> {
    // TODO: 整合 Spine Runtime
    console.log('Spine provider initialized (stub)')
  }
  
  async loadAnimation(_state: PetAnimationState): Promise<void> {
    // TODO: 載入 Spine 動畫
  }
  
  update(_deltaTime: number): void {
    // TODO: 更新 Spine 動畫
  }
  
  render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    // TODO: 渲染 Spine 動畫
    ctx.fillStyle = '#E6E6FA'
    ctx.fillRect(x, y, width, height)
    ctx.fillStyle = '#333'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Spine Coming Soon', x + width/2, y + height/2)
  }
  
  destroy(): void {
    // TODO: 清理 Spine 資源
  }
}
