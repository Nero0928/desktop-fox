import { contextBridge, ipcRenderer } from 'electron'

// 暴露給渲染進程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // Database
  db: {
    getChatHistory: (limit?: number) => ipcRenderer.invoke('db:getChatHistory', limit),
    saveMessage: (role: string, content: string) => ipcRenderer.invoke('db:saveMessage', role, content),
    clearChatHistory: () => ipcRenderer.invoke('db:clearChatHistory')
  },
  
  // Settings
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll')
  },
  
  // AI
  ai: {
    chat: (message: string) => ipcRenderer.invoke('ai:chat', message),
    getAvailableProviders: () => ipcRenderer.invoke('ai:getAvailableProviders'),
    testProvider: (provider: string): Promise<{ success: boolean; error?: string }> => ipcRenderer.invoke('ai:testProvider', provider)
  },
  
  // Quota
  quota: {
    getStatus: () => ipcRenderer.invoke('quota:getStatus')
  },
  
  // Window
  window: {
    openChat: () => ipcRenderer.invoke('window:openChat'),
    closeChat: () => ipcRenderer.invoke('window:closeChat'),
    drag: (x: number, y: number) => ipcRenderer.invoke('window:drag', x, y),
    openSettings: () => ipcRenderer.invoke('window:openSettings'),
    showContextMenu: () => ipcRenderer.invoke('window:showContextMenu'),
    hide: () => ipcRenderer.invoke('window:hide'),
    show: () => ipcRenderer.invoke('window:show'),
    quit: () => ipcRenderer.invoke('window:quit')
  },
  
  // Pet actions
  onPetAction: (callback: (action: string) => void) => {
    ipcRenderer.on('pet:action', (_, action) => callback(action))
  }
})

// TypeScript 類型聲明 - 必須在全局
declare global {
  interface Window {
    electronAPI: {
      db: {
        getChatHistory: (limit?: number) => Promise<any[]>
        saveMessage: (role: string, content: string) => Promise<void>
        clearChatHistory: () => Promise<void>
      }
      settings: {
        get: (key: string) => Promise<any>
        set: (key: string, value: any) => Promise<void>
        getAll: () => Promise<Record<string, any>>
      }
      ai: {
        chat: (message: string) => Promise<string>
        getAvailableProviders: () => Promise<string[]>
        testProvider: (provider: string) => Promise<{ success: boolean; error?: string }>
      }
      quota: {
        getStatus: () => Promise<{
          usedToday: number
          maxFree: number
          hasPro: boolean
        }>
      }
      window: {
        openChat: () => Promise<void>
        closeChat: () => Promise<void>
        drag: (x: number, y: number) => Promise<void>
        openSettings: () => Promise<void>
        showContextMenu: () => Promise<void>
        hide: () => Promise<void>
        show: () => Promise<void>
        quit: () => Promise<void>
      }
      onPetAction: (callback: (action: string) => void) => void
    }
  }
}

export {}
