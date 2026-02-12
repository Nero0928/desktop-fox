import { create } from 'zustand'
import type { PetAnimationState } from '../types'

interface PetStore {
  // 狀態
  hunger: number
  mood: number
  energy: number
  animationState: PetAnimationState
  isDragging: boolean
  
  // 動作
  setHunger: (value: number) => void
  setMood: (value: number) => void
  setEnergy: (value: number) => void
  setAnimationState: (state: PetAnimationState) => void
  setDragging: (dragging: boolean) => void
  
  // 互動
  feed: () => void
  pet: () => void
  play: () => void
  sleep: () => void
  wake: () => void
  
  // 衰減
  decay: () => void
}

const MAX_STAT = 100
const MIN_STAT = 0
const DECAY_AMOUNT = 2

export const usePetStore = create<PetStore>((set) => ({
  // 初始狀態
  hunger: 80,
  mood: 80,
  energy: 80,
  animationState: 'idle',
  isDragging: false,
  
  // 設置器
  setHunger: (value) => set({ hunger: Math.max(MIN_STAT, Math.min(MAX_STAT, value)) }),
  setMood: (value) => set({ mood: Math.max(MIN_STAT, Math.min(MAX_STAT, value)) }),
  setEnergy: (value) => set({ energy: Math.max(MIN_STAT, Math.min(MAX_STAT, value)) }),
  setAnimationState: (state) => set({ animationState: state }),
  setDragging: (dragging) => set({ isDragging: dragging }),
  
  // 互動
  feed: () => {
    set((state) => ({
      hunger: Math.min(MAX_STAT, state.hunger + 20),
      animationState: 'eating'
    }))
    setTimeout(() => set({ animationState: 'idle' }), 3000)
  },
  
  pet: () => {
    set((state) => ({
      mood: Math.min(MAX_STAT, state.mood + 15),
      animationState: 'happy'
    }))
    setTimeout(() => set({ animationState: 'idle' }), 2000)
  },
  
  play: () => {
    set((state) => ({
      mood: Math.min(MAX_STAT, state.mood + 10),
      energy: Math.max(MIN_STAT, state.energy - 10),
      animationState: 'happy'
    }))
    setTimeout(() => set({ animationState: 'idle' }), 2000)
  },
  
  sleep: () => {
    set({ animationState: 'sleeping' })
    // 睡眠時慢慢恢復精力
    const sleepInterval = setInterval(() => {
      set((state) => {
        const newEnergy = Math.min(MAX_STAT, state.energy + 5)
        if (newEnergy >= MAX_STAT) {
          clearInterval(sleepInterval)
          return { energy: MAX_STAT, animationState: 'idle' }
        }
        return { energy: newEnergy }
      })
    }, 1000)
  },
  
  wake: () => {
    set({ animationState: 'idle' })
  },
  
  // 衰減
  decay: () => {
    set((state) => ({
      hunger: Math.max(MIN_STAT, state.hunger - DECAY_AMOUNT),
      mood: Math.max(MIN_STAT, state.mood - DECAY_AMOUNT),
      energy: Math.max(MIN_STAT, state.energy - DECAY_AMOUNT)
    }))
  }
}))

// 定時衰減
setInterval(() => {
  usePetStore.getState().decay()
}, 60000) // 每分鐘衰減一次
