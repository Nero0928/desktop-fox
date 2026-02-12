import type { PetAnimationState } from '../types'

export interface AnimationFrame {
  image: HTMLImageElement | null
  duration: number
}

export interface AnimationProvider {
  readonly name: string
  readonly format: string
  
  initialize(config: AnimationConfig): Promise<void>
  loadAnimation(state: PetAnimationState): Promise<void>
  update(deltaTime: number): void
  render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void
  destroy(): void
}

export interface AnimationConfig {
  basePath: string
  scale?: number
  fps?: number
}

export interface FrameAnimationConfig extends AnimationConfig {
  framePattern?: string
  supportedStates?: PetAnimationState[]
}
