import React, { useEffect, useState } from 'react'
import { useSettingsStore } from '../../store/settingsStore'
import type { AIProvider, AIProvidersConfig, AnimationFormat } from '../../types'
import './SettingsPanel.css'

const ANIMATION_FORMATS: Array<{ id: AnimationFormat; name: string; available: boolean; description: string }> = [
  { id: 'frames', name: 'PNG 幀動畫', available: true, description: '傳統幀動畫，支援 PNG 序列' },
  { id: 'live2d', name: 'Live2D Cubism', available: false, description: '2D 動態角色（即將推出）' },
  { id: 'spine', name: 'Spine', available: false, description: '2D 骨骼動畫（即將推出）' },
  { id: 'rive', name: 'Rive', available: false, description: '互動式動畫（即將推出）' }
]

const PROVIDER_NAMES: Record<AIProvider, string> = {
  deepseek: 'DeepSeek',
  qwen: '通義千問',
  ernie: '文心一言',
  spark: '訊飛星火',
  chatglm: '智譜清言',
  yi: '零一萬物',
  openrouter: 'OpenRouter'
}

export const SettingsPanel: React.FC = () => {
  const {
    settings,
    availableProviders,
    isLoading,
    loadSettings,
    updateSetting,
    setAIProvider,
    loadAvailableProviders,
    testProvider
  } = useSettingsStore()
  
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'animation'>('general')
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({})
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  
  useEffect(() => {
    loadSettings()
    loadAvailableProviders()
  }, [])
  
  const handleProviderChange = async (provider: AIProvider) => {
    await setAIProvider(provider)
  }
  
  const handleApiKeyChange = async (provider: AIProvider, apiKey: string) => {
    const providers = (settings.aiProviders || {}) as AIProvidersConfig
    const updatedProviders = {
      ...providers,
      [provider]: {
        ...providers[provider],
        apiKey
      }
    }
    await updateSetting('aiProviders', updatedProviders)
  }
  
  const handleToggleProvider = async (provider: AIProvider, enabled: boolean) => {
    const providers = (settings.aiProviders || {}) as AIProvidersConfig
    const updatedProviders = {
      ...providers,
      [provider]: {
        ...providers[provider],
        enabled
      }
    }
    await updateSetting('aiProviders', updatedProviders)
    loadAvailableProviders()
  }
  
  const handleTestProvider = async (provider: AIProvider) => {
    setTestResults(prev => ({ ...prev, [provider]: null }))
    const result = await testProvider(provider)
    setTestResults(prev => ({ ...prev, [provider]: result }))
  }
  
  const handleAnimationFormatChange = async (format: AnimationFormat) => {
    await updateSetting('animationFormat', format)
  }
  
  const aiProviders = (settings.aiProviders || {}) as AIProvidersConfig
  
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h1>⚙️ 設定</h1>
      </div>
      
      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          一般
        </button>
        <button
          className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          AI 設定
        </button>
        <button
          className={`tab ${activeTab === 'animation' ? 'active' : ''}`}
          onClick={() => setActiveTab('animation')}
        >
          動畫
        </button>
      </div>
      
      <div className="settings-content">
        {activeTab === 'general' && (
          <div className="settings-section">
            <div className="setting-item">
              <label>寵物名稱</label>
              <input
                type="text"
                value={settings.petName || '狐狐'}
                onChange={(e) => updateSetting('petName', e.target.value)}
                placeholder="輸入寵物名稱"
              />
            </div>
            
            <div className="setting-item">
              <label>語言</label>
              <select
                value={settings.language || 'zh-TW'}
                onChange={(e) => updateSetting('language', e.target.value)}
              >
                <option value="zh-TW">繁體中文</option>
                <option value="zh-CN">简体中文</option>
                <option value="en">English</option>
              </select>
            </div>
            
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoStart || false}
                  onChange={(e) => updateSetting('autoStart', e.target.checked)}
                />
                開機自動啟動
              </label>
            </div>
            
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.enableGlobalHotkey !== false}
                  onChange={(e) => updateSetting('enableGlobalHotkey', e.target.checked)}
                />
                啟用全域熱鍵 (Ctrl+Shift+F)
              </label>
            </div>
          </div>
        )}
        
        {activeTab === 'ai' && (
          <div className="settings-section">
            <div className="setting-item">
              <label>主要 AI 提供商</label>
              <select
                value={settings.aiProvider || 'deepseek'}
                onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              >
                {Object.entries(aiProviders).map(([key, config]) => (
                  config.enabled && (
                    <option key={key} value={key}>{PROVIDER_NAMES[key as AIProvider]}</option>
                  )
                ))}
              </select>
            </div>
            
            <div className="provider-list">
              <h3>API 設定</h3>
              {Object.entries(aiProviders).map(([key, config]) => {
                const provider = key as AIProvider
                return (
                  <div key={key} className="provider-item">
                    <div className="provider-header">
                      <label className="provider-toggle">
                        <input
                          type="checkbox"
                          checked={config.enabled}
                          onChange={(e) => handleToggleProvider(provider, e.target.checked)}
                        />
                        <span>{PROVIDER_NAMES[provider]}</span>
                      </label>
                      
                      {config.enabled && (
                        <button
                          className={`test-btn ${testResults[provider] === true ? 'success' : ''} ${testResults[provider] === false ? 'error' : ''}`}
                          onClick={() => handleTestProvider(provider)}
                          disabled={isLoading || !config.apiKey}
                        >
                          {testResults[provider] === true ? '✓' : testResults[provider] === false ? '✗' : '測試'}
                        </button>
                      )}
                    </div>
                    
                    {config.enabled && (
                      <div className="api-key-input">
                        <input
                          type={showApiKeys[provider] ? 'text' : 'password'}
                          placeholder={`輸入 ${PROVIDER_NAMES[provider]} API Key`}
                          value={config.apiKey || ''}
                          onChange={(e) => handleApiKeyChange(provider, e.target.value)}
                        />
                        <button
                          className="toggle-visibility"
                          onClick={() => setShowApiKeys(prev => ({ ...prev, [provider]: !prev[provider] }))}
                        >
                          {showApiKeys[provider] ? '🙈' : '👁️'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {activeTab === 'animation' && (
          <div className="settings-section">
            <div className="setting-item">
              <label>動畫格式</label>
              <div className="animation-formats">
                {ANIMATION_FORMATS.map((format) => (
                  <div
                    key={format.id}
                    className={`format-option ${settings.animationFormat === format.id ? 'selected' : ''} ${!format.available ? 'disabled' : ''}`}
                    onClick={() => format.available && handleAnimationFormatChange(format.id)}
                  >
                    <div className="format-header">
                      <span className="format-name">{format.name}</span>
                      {!format.available && <span className="format-badge">即將推出</span>}
                    </div>
                    <p className="format-desc">{format.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="setting-item">
              <label>動畫資源路徑</label>
              <input
                type="text"
                value={settings.animationPath || './assets/sprites'}
                onChange={(e) => updateSetting('animationPath', e.target.value)}
                placeholder="輸入動畫資源路徑"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
