import { create } from 'zustand'
import type { ChatMessage } from '../types'

interface ChatStore {
  messages: ChatMessage[]
  isLoading: boolean
  inputMessage: string
  quotaStatus: {
    usedToday: number
    maxFree: number
    hasPro: boolean
  } | null
  
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  setIsLoading: (loading: boolean) => void
  setInputMessage: (message: string) => void
  setQuotaStatus: (status: { usedToday: number; maxFree: number; hasPro: boolean }) => void
  loadHistory: () => Promise<void>
  sendMessage: (content: string) => Promise<void>
  clearHistory: () => Promise<void>
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  inputMessage: '',
  quotaStatus: null,
  
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setInputMessage: (message) => set({ inputMessage: message }),
  setQuotaStatus: (status) => set({ quotaStatus: status }),
  
  loadHistory: async () => {
    try {
      const history = await window.electronAPI.db.getChatHistory(50)
      // 反轉順序讓最新的在最下面
      set({ messages: history.reverse() })
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  },
  
  sendMessage: async (content: string) => {
    const { messages } = get()
    
    // 檢查配額
    const quota = await window.electronAPI.quota.getStatus()
    set({ quotaStatus: quota })
    
    if (!quota.hasPro && quota.usedToday >= quota.maxFree) {
      const errorMessage: ChatMessage = {
        id: Date.now(),
        role: 'assistant',
        content: '今天的免費對話次數用完啦～明天再來吧！（或購買 Pro 解鎖無限對話）',
        timestamp: Date.now()
      }
      set((state) => ({
        messages: [...state.messages, errorMessage]
      }))
      return
    }
    
    // 添加用戶訊息
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: Date.now()
    }
    
    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true
    }))
    
    // 儲存到資料庫
    await window.electronAPI.db.saveMessage('user', content)
    
    try {
      // 呼叫 AI
      const response = await window.electronAPI.ai.chat(content)
      
      // 添加 AI 回覆
      const assistantMessage: ChatMessage = {
        id: Date.now(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }
      
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false
      }))
      
      // 儲存到資料庫
      await window.electronAPI.db.saveMessage('assistant', response)
      
      // 更新配額狀態
      const newQuota = await window.electronAPI.quota.getStatus()
      set({ quotaStatus: newQuota })
      
    } catch (error) {
      console.error('Failed to send message:', error)
      
      const errorMessage: ChatMessage = {
        id: Date.now(),
        role: 'assistant',
        content: error instanceof Error && error.message === 'FREE_QUOTA_EXCEEDED'
          ? '今天的免費對話次數用完啦～明天再來吧！'
          : '嗚...好像出了點問題，稍後再試試看？',
        timestamp: Date.now()
      }
      
      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false
      }))
    }
  },
  
  clearHistory: async () => {
    await window.electronAPI.db.clearChatHistory()
    set({ messages: [] })
  }
}))
