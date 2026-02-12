import React, { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../../store/chatStore'
import { usePetStore } from '../../store/petStore'
import './ChatPanel.css'

export const ChatPanel: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showQuotaWarning, setShowQuotaWarning] = useState(false)
  
  const {
    messages,
    isLoading,
    inputMessage,
    quotaStatus,
    setInputMessage,
    sendMessage,
    loadHistory
  } = useChatStore()
  
  const { setAnimationState } = usePetStore()
  
  // 載入歷史訊息
  useEffect(() => {
    loadHistory()
  }, [])
  
  // 自動捲動到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // 寵物說話動畫
  useEffect(() => {
    if (isLoading) {
      setAnimationState('talking')
    } else {
      setAnimationState('idle')
    }
  }, [isLoading, setAnimationState])
  
  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return
    
    const message = inputMessage.trim()
    setInputMessage('')
    await sendMessage(message)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  const handleClose = () => {
    window.electronAPI.window.closeChat()
  }
  
  // 檢查配額警告
  useEffect(() => {
    if (quotaStatus && !quotaStatus.hasPro && quotaStatus.usedToday >= quotaStatus.maxFree - 2) {
      setShowQuotaWarning(true)
    } else {
      setShowQuotaWarning(false)
    }
  }, [quotaStatus])
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  }
  
  return (
    <div className="chat-panel">
      {/* 標題列 */}
      <div className="chat-header">
        <span className="chat-title">🦊 狐狐</span>
        <button className="chat-close" onClick={handleClose}>✕</button>
      </div>
      
      {/* 配額警告 */}
      {showQuotaWarning && (
        <div className="quota-warning">
          免費對話剩餘 {quotaStatus!.maxFree - quotaStatus!.usedToday} 次
          {!quotaStatus?.hasPro && (
            <span> · <a href="#" onClick={(e) => { e.preventDefault(); /* TODO: 開啟商店頁面 */ }}>升級 Pro</a></span>
          )}
        </div>
      )}
      
      {/* 訊息列表 */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>跟狐狐說點什麼吧～ 🦊</p>
            <p className="chat-hint">點擊寵物或按 Ctrl+Shift+F 可以顯示/隱藏</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
          >
            <div className="message-bubble">
              {msg.content}
            </div>
            <div className="message-time">
              {formatTime(msg.timestamp)}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message message-assistant">
            <div className="message-bubble typing">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* 輸入區 */}
      <div className="chat-input-area">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder="輸入訊息..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          className="chat-send"
          onClick={handleSend}
          disabled={!inputMessage.trim() || isLoading}
        >
          發送
        </button>
      </div>
    </div>
  )
}
