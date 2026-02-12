import { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, nativeImage, dialog } from 'electron'
import path from 'path'
import { DatabaseManager } from './database/DatabaseManager'
import { SettingsManager } from './settings/SettingsManager'
import { AIClientManager } from './ai/AIClientManager'
import { QuotaManager } from './quota/QuotaManager'

let mainWindow: BrowserWindow | null = null
let chatWindow: BrowserWindow | null = null
let tray: Tray | null = null
let dbManager: DatabaseManager | null = null
let settingsManager: SettingsManager | null = null
let aiClientManager: AIClientManager | null = null
let quotaManager: QuotaManager | null = null

const isDev = process.env.NODE_ENV === 'development'

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 200,
    height: 250,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/#/pet')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: '#/pet' })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.setIgnoreMouseEvents(false)
}

function createChatWindow() {
  if (chatWindow) {
    chatWindow.focus()
    return
  }

  const petBounds = mainWindow?.getBounds()
  if (!petBounds) return

  chatWindow = new BrowserWindow({
    width: 350,
    height: 500,
    x: petBounds.x - 360,
    y: petBounds.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (isDev) {
    chatWindow.loadURL('http://localhost:5173/#/chat')
  } else {
    chatWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: '#/chat' })
  }

  chatWindow.on('closed', () => {
    chatWindow = null
  })
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/tray-icon.png')
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  
  tray = new Tray(trayIcon)
  tray.setToolTip('Desktop Fox')
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '顯示/隱藏',
      click: () => {
        if (mainWindow?.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow?.show()
        }
      }
    },
    {
      label: '設定',
      click: () => {
        createSettingsWindow()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])
  
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
    }
  })
}

function createSettingsWindow() {
  const settingsWindow = new BrowserWindow({
    width: 600,
    height: 500,
    frame: true,
    transparent: false,
    alwaysOnTop: false,
    resizable: false,
    title: 'Desktop Fox - 設定',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (isDev) {
    settingsWindow.loadURL('http://localhost:5173/#/settings')
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: '#/settings' })
  }
}

async function initializeManagers() {
  const userDataPath = app.getPath('userData')
  
  dbManager = new DatabaseManager(userDataPath)
  await dbManager.initialize()
  
  settingsManager = new SettingsManager(dbManager)
  await settingsManager.initialize()
  
  quotaManager = new QuotaManager(dbManager)
  
  aiClientManager = new AIClientManager(settingsManager)
}

function showPetContextMenu() {
  if (!mainWindow) return
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '💬 聊天',
      click: () => {
        createChatWindow()
      }
    },
    {
      label: '🤚 摸摸',
      click: () => {
        mainWindow?.webContents.send('pet:action', 'pet')
      }
    },
    {
      label: '🍖 餵食',
      click: () => {
        mainWindow?.webContents.send('pet:action', 'feed')
      }
    },
    { type: 'separator' },
    {
      label: '⚙️ 設定',
      click: () => {
        createSettingsWindow()
      }
    },
    {
      label: '👁️ 隱藏',
      click: () => {
        mainWindow?.hide()
      }
    },
    { type: 'separator' },
    {
      label: '❌ 退出',
      click: () => {
        app.quit()
      }
    }
  ])
  
  contextMenu.popup({ window: mainWindow })
}

function setupIPC() {
  // Context Menu IPC
  ipcMain.handle('window:showContextMenu', () => {
    showPetContextMenu()
  })
  
  // Database IPC
  ipcMain.handle('db:getChatHistory', async (_, limit?: number) => {
    return dbManager?.getChatHistory(limit)
  })
  
  ipcMain.handle('db:saveMessage', async (_, role: string, content: string) => {
    dbManager?.saveMessage(role, content)
  })
  
  ipcMain.handle('db:clearChatHistory', async () => {
    dbManager?.clearChatHistory()
  })
  
  // Settings IPC
  ipcMain.handle('settings:get', async (_, key: string) => {
    return settingsManager?.get(key)
  })
  
  ipcMain.handle('settings:set', async (_, key: string, value: any) => {
    settingsManager?.set(key, value)
  })
  
  ipcMain.handle('settings:getAll', async () => {
    return settingsManager?.getAll()
  })
  
  // AI IPC
  ipcMain.handle('ai:chat', async (_, message: string) => {
    const canUseAI = await quotaManager?.canUseAI()
    if (!canUseAI) {
      throw new Error('FREE_QUOTA_EXCEEDED')
    }
    
    const response = await aiClientManager?.chat(message)
    await quotaManager?.useAI()
    return response
  })
  
  ipcMain.handle('ai:getAvailableProviders', () => {
    return aiClientManager?.getAvailableProviders()
  })
  
  ipcMain.handle('ai:testProvider', async (_, provider: string) => {
    return aiClientManager?.testProvider(provider)
  })
  
  // Quota IPC
  ipcMain.handle('quota:getStatus', async () => {
    return quotaManager?.getStatus()
  })
  
  // Window IPC
  ipcMain.handle('window:openChat', () => {
    createChatWindow()
  })
  
  ipcMain.handle('window:closeChat', () => {
    chatWindow?.close()
  })
  
  ipcMain.handle('window:drag', (_, x: number, y: number) => {
    if (mainWindow) {
      const [currentX, currentY] = mainWindow.getPosition()
      mainWindow.setPosition(currentX + x, currentY + y)
    }
  })
  
  ipcMain.handle('window:openSettings', () => {
    createSettingsWindow()
  })
  
  ipcMain.handle('window:hide', () => {
    mainWindow?.hide()
  })
  
  ipcMain.handle('window:show', () => {
    mainWindow?.show()
  })
  
  ipcMain.handle('window:quit', () => {
    app.quit()
  })
}

app.whenReady().then(async () => {
  await initializeManagers()
  createMainWindow()
  createTray()
  setupIPC()
  
  // 全局熱鍵 Ctrl+Shift+F
  globalShortcut.register('CommandOrControl+Shift+F', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
    }
  })
})

app.on('window-all-closed', () => {
  // macOS 上除非用戶按下 Cmd+Q，否則不退出
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  dbManager?.close()
})

// 安全起見，防止多開
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}
