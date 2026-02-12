import React, { useEffect, useRef, useCallback } from 'react'
import { usePetStore } from '../../store/petStore'
import { AnimationManager } from '../../animation/AnimationManager'
import './PetDisplay.css'

export const PetDisplay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationManagerRef = useRef<AnimationManager | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const {
    animationState,
    isDragging,
    setDragging,
    hunger,
    mood,
    energy,
    pet,
    feed
  } = usePetStore()
  
  // 初始化動畫管理器
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const manager = new AnimationManager()
    animationManagerRef.current = manager
    
    manager.initialize('frames', {
      basePath: './assets/sprites',
      fps: 12,
      scale: 1
    }).then(() => {
      manager.loadAnimation('idle')
      manager.startRenderLoop(canvas)
    })
    
    return () => {
      manager.destroy()
    }
  }, [])
  
  // 監聽動畫狀態變化
  useEffect(() => {
    animationManagerRef.current?.loadAnimation(animationState)
  }, [animationState])
  
  // 拖曳處理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    
    setDragging(true)
    const startX = e.clientX
    const startY = e.clientY
    
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      window.electronAPI.window.drag(dx, dy)
    }
    
    const handleMouseUp = () => {
      setDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [setDragging])
  
  // 雙擊開啟聊天
  const handleDoubleClick = useCallback(() => {
    window.electronAPI.window.openChat()
  }, [])
  
  // 右鍵選單
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    // 移除已有的選單（防止疊加）
    const existingMenu = document.querySelector('.pet-context-menu')
    if (existingMenu) {
      existingMenu.remove()
    }
    
    const menu = document.createElement('div')
    menu.className = 'pet-context-menu'
    menu.innerHTML = `
      <div class="menu-item" data-action="chat">聊天</div>
      <div class="menu-item" data-action="pet">摸摸</div>
      <div class="menu-item" data-action="feed">餵食</div>
      <div class="menu-divider"></div>
      <div class="menu-item" data-action="settings">設定</div>
      <div class="menu-item" data-action="hide">隱藏</div>
      <div class="menu-item" data-action="quit">退出</div>
    `
    
    // 計算選單位置（避免超出視窗）
    const menuWidth = 120
    const menuHeight = 200
    let x = e.clientX
    let y = e.clientY
    
    // 確保選單不會超出螢幕右邊
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10
    }
    // 確保選單不會超出螢幕底部
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10
    }
    
    menu.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.98);
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      padding: 6px 0;
      min-width: ${menuWidth}px;
      z-index: 2147483647;
      font-size: 14px;
      user-select: none;
    `
    
    document.body.appendChild(menu)
    
    const handleClick = (evt: MouseEvent) => {
      const target = evt.target as HTMLElement
      const action = target.dataset.action
      
      switch (action) {
        case 'chat':
          window.electronAPI.window.openChat()
          break
        case 'pet':
          pet()
          break
        case 'feed':
          feed()
          break
        case 'settings':
          window.electronAPI.window.openSettings()
          break
        case 'hide':
          window.electronAPI.window.hide()
          break
        case 'quit':
          window.electronAPI.window.quit()
          break
      }
      
      menu.remove()
      document.removeEventListener('click', handleClick)
      document.removeEventListener('contextmenu', handleContextMenuClose)
    }
    
    // 點其他地方或再次右鍵時關閉選單
    const handleContextMenuClose = () => {
      menu.remove()
      document.removeEventListener('click', handleClick)
      document.removeEventListener('contextmenu', handleContextMenuClose)
    }
    
    // 延遲綁定，避免立即觸發
    setTimeout(() => {
      document.addEventListener('click', handleClick)
      document.addEventListener('contextmenu', handleContextMenuClose)
    }, 0)
  }, [pet, feed])
  
  // 計算狀態顏色
  const getStatColor = (value: number) => {
    if (value > 60) return '#4CAF50'
    if (value > 30) return '#FFC107'
    return '#F44336'
  }
  
  return (
    <div
      ref={containerRef}
      className={`pet-display ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <canvas
        ref={canvasRef}
        width={200}
        height={250}
        className="pet-canvas"
      />
      
      {/* 狀態條 */}
      <div className="pet-stats">
        <div className="stat-bar">
          <div
            className="stat-fill"
            style={{
              width: `${hunger}%`,
              backgroundColor: getStatColor(hunger)
            }}
            title={`飽食度: ${hunger}`}
          />
        </div>
        <div className="stat-bar">
          <div
            className="stat-fill"
            style={{
              width: `${mood}%`,
              backgroundColor: getStatColor(mood)
            }}
            title={`心情: ${mood}`}
          />
        </div>
        <div className="stat-bar">
          <div
            className="stat-fill"
            style={{
              width: `${energy}%`,
              backgroundColor: getStatColor(energy)
            }}
            title={`精力: ${energy}`}
          />
        </div>
      </div>
    </div>
  )
}
