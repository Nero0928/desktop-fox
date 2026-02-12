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
  
  // 監聽來自主進程的寵物動作
  useEffect(() => {
    const unsubscribe = window.electronAPI.onPetAction((action) => {
      if (action === 'pet') {
        pet()
      } else if (action === 'feed') {
        feed()
      }
    })
    
    return () => {
      // 清理監聽
    }
  }, [pet, feed])
  
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
  
  // 右鍵選單 - 呼叫原生選單
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    window.electronAPI.window.showContextMenu()
  }, [])
  
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
