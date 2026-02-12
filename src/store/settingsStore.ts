import { create } from 'zustand'
import type { AIProvider, AnimationFormat, AppSettings } from '../types'

interface SettingsStore {
  settings: Partial<AppSettings>
  availableProviders: string[]
  isLoading: boolean
  
  loadSettings: () => Promise<void>
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>
  setAIProvider: (provider: AIProvider) => Promise<void>
  setAnimationFormat: (format: AnimationFormat) => void
  loadAvailableProviders: () => Promise<void>
  testProvider: (provider: string) => Promise<{ success: boolean; error?: string }>
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: {},
  availableProviders: [],
  isLoading: false,
  
  loadSettings: async () => {
    try {
      const settings = await window.electronAPI.settings.getAll()
      set({ settings })
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  },
  
  updateSetting: async (key, value) => {
    try {
      await window.electronAPI.settings.set(key, value)
      set((state) => ({
        settings: { ...state.settings, [key]: value }
      }))
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error)
    }
  },
  
  setAIProvider: async (provider) => {
    await get().updateSetting('aiProvider', provider)
  },
  
  setAnimationFormat: (format) => {
    set((state) => ({
      settings: { ...state.settings, animationFormat: format }
    }))
  },
  
  loadAvailableProviders: async () => {
    try {
      const providers = await window.electronAPI.ai.getAvailableProviders()
      set({ availableProviders: providers })
    } catch (error) {
      console.error('Failed to load providers:', error)
    }
  },
  
  testProvider: async (provider) => {
    set({ isLoading: true })
    try {
      const result = await window.electronAPI.ai.testProvider(provider)
      set({ isLoading: false })
      return result
    } catch (error) {
      console.error(`Failed to test provider ${provider}:`, error)
      set({ isLoading: false })
      return { success: false, error: '測試失敗' }
    }
  }
}))
