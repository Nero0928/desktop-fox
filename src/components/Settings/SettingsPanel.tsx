import React, { useEffect, useState } from 'react'
import { useSettingsStore } from '../../store/settingsStore'
import type { AIProvider, AIProvidersConfig, AnimationFormat } from '../../types'
import './SettingsPanel.css'

// AI Provider display info
const PROVIDER_INFO: Record<AIProvider, { name: string; region: string; description: string }> = {
  // Chinese market
  deepseek: { name: 'DeepSeek', region: '🇨🇳', description: '中國頂尖AI模型' },
  minimax: { name: 'MiniMax', region: '🇨🇳', description: 'M2.7 多模態模型' },
  kimi: { name: 'Kimi (Moonshot)', region: '🇨🇳', description: '長文本處理強' },
  qwen: { name: '通義千問', region: '🇨🇳', description: '阿里雲大模型' },
  ernie: { name: '文心一言', region: '🇨🇳', description: '百度文言一心' },
  spark: { name: '訊飛星火', region: '🇨🇳', description: '科大訊飛' },
  chatglm: { name: '智譜清言', region: '🇨🇳', description: 'GLM系列模型' },
  yi: { name: '零一萬物', region: '🇨🇳', description: 'Yi系列模型' },
  openrouter: { name: 'OpenRouter', region: '🌐', description: '多模型gateway' },
  // International
  openai: { name: 'OpenAI', region: '🌐', description: 'GPT-4o, GPT-5.5' },
  anthropic: { name: 'Anthropic', region: '🌐', description: 'Claude系列' },
  google: { name: 'Google Gemini', region: '🌐', description: 'Gemini 3/2.5' },
  mistral: { name: 'Mistral AI', region: '🌐', description: 'Mistral Large' },
  groq: { name: 'Groq', region: '🌐', description: '高速LPU推理' },
  together: { name: 'Together AI', region: '🌐', description: 'Llama/DeepSeek' },
  fireworks: { name: 'Fireworks AI', region: '🌐', description: '高速推理' },
  deepinfra: { name: 'DeepInfra', region: '🌐', description: '低成本推理' },
  cerebras: { name: 'Cerebras', region: '🌐', description: '專用AI晶片' },
  huggingface: { name: 'HuggingFace', region: '🌐', description: '開源模型' },
  xai: { name: 'xAI', region: '🌐', description: 'Grok 系列' },
  volcengine: { name: '火山引擎', region: '🇨🇳', description: '豆包模型' },
  qianfan: { name: '百度千帆', region: '🇨🇳', description: '百度雲' },
  bedrock: { name: 'AWS Bedrock', region: '🌐', description: 'AWS雲端' },
  stepfun: { name: '階跃星辰', region: '🇨🇳', description: 'Step系列' },
  opencode: { name: 'OpenCode', region: '🌐', description: '程式碼模型' },
  venice: { name: 'Venice AI', region: '🌐', description: '隱私優先' },
  zai: { name: 'Z.AI (GLM)', region: '🇨🇳', description: 'GLM-4系列' }
}

// Provider categories
const PROVIDER_CATEGORIES = {
  chinese: ['deepseek', 'minimax', 'kimi', 'qwen', 'ernie', 'spark', 'chatglm', 'yi', 'openrouter', 'volcengine', 'qianfan', 'stepfun', 'zai'] as AIProvider[],
  international: ['openai', 'anthropic', 'google', 'mistral', 'groq', 'together', 'fireworks', 'deepinfra', 'cerebras', 'huggingface', 'xai', 'bedrock', 'opencode', 'venice'] as AIProvider[]
}

const ANIMATION_FORMATS: Array<{ id: AnimationFormat; name: string; available: boolean; description: string }> = [
  { id: 'frames', name: 'PNG 幀動畫', available: true, description: '傳統幀動畫，支援 PNG 序列' },
  { id: 'live2d', name: 'Live2D Cubism', available: false, description: '2D 動態角色（即將推出）' },
  { id: 'spine', name: 'Spine', available: false, description: '2D 骨骼動畫（即將推出）' },
  { id: 'rive', name: 'Rive', available: false, description: '互動式動畫（即將推出）' }
]

export const SettingsPanel: React.FC = () => {
  const {
    settings,
    isLoading,
    loadSettings,
    updateSetting,
    setAIProvider,
    loadAvailableProviders,
    testProvider
  } = useSettingsStore()

  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'animation'>('ai')
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; error?: string } | null>>({})
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [filterCategory, setFilterCategory] = useState<'all' | 'chinese' | 'international'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadSettings()
    loadAvailableProviders()
  }, [])

  const handleProviderChange = async (provider: AIProvider) => {
    await setAIProvider(provider)
    void loadAvailableProviders()
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

  const handleTestAllEnabled = async () => {
    const providers = (settings.aiProviders || {}) as AIProvidersConfig
    for (const [key, config] of Object.entries(providers)) {
      if (config.enabled && config.apiKey) {
        await handleTestProvider(key as AIProvider)
      }
    }
  }

  const getTestButtonContent = (provider: AIProvider) => {
    const result = testResults[provider]
    if (result === null) return '🔄'
    if (result === undefined) return '測試'
    return result.success ? '✅' : '❌'
  }

  const getTestButtonClass = (provider: AIProvider) => {
    const result = testResults[provider]
    if (result === null) return 'testing'
    if (result?.success) return 'success'
    if (result && !result.success) return 'error'
    return ''
  }

  const handleAnimationFormatChange = async (format: AnimationFormat) => {
    await updateSetting('animationFormat', format)
  }

  const aiProviders = (settings.aiProviders || {}) as AIProvidersConfig

  // Filter providers based on search and category
  const getFilteredProviders = () => {
    let providers = Object.keys(aiProviders) as AIProvider[]

    // Category filter
    if (filterCategory === 'chinese') {
      providers = providers.filter(p => PROVIDER_CATEGORIES.chinese.includes(p))
    } else if (filterCategory === 'international') {
      providers = providers.filter(p => PROVIDER_CATEGORIES.international.includes(p))
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      providers = providers.filter(p =>
        PROVIDER_INFO[p]?.name.toLowerCase().includes(query) ||
        PROVIDER_INFO[p]?.description.toLowerCase().includes(query)
      )
    }

    return providers.sort((a, b) => {
      // Enabled providers first
      const aEnabled = aiProviders[a]?.enabled
      const bEnabled = aiProviders[b]?.enabled
      if (aEnabled && !bEnabled) return -1
      if (!aEnabled && bEnabled) return 1
      return PROVIDER_INFO[a]?.name.localeCompare(PROVIDER_INFO[b]?.name || '')
    })
  }

  const enabledProvidersCount = Object.values(aiProviders).filter(p => p.enabled).length

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
                onChange={(e) => updateSetting('language', e.target.value as 'zh-TW' | 'zh-CN' | 'en')}
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
          <div className="settings-section ai-settings">
            {/* Current provider selector */}
            <div className="current-provider">
              <label>當前使用</label>
              <select
                value={settings.aiProvider || 'deepseek'}
                onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              >
                {getFilteredProviders().map(key => (
                  aiProviders[key]?.enabled && (
                    <option key={key} value={key}>
                      {PROVIDER_INFO[key]?.region} {PROVIDER_INFO[key]?.name}
                    </option>
                  )
                ))}
              </select>
              <span className="provider-count">已啟用: {enabledProvidersCount}/27</span>
            </div>

            {/* Filter and search */}
            <div className="provider-controls">
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterCategory('all')}
                >
                  全部
                </button>
                <button
                  className={`filter-btn ${filterCategory === 'chinese' ? 'active' : ''}`}
                  onClick={() => setFilterCategory('chinese')}
                >
                  🌏 中國
                </button>
                <button
                  className={`filter-btn ${filterCategory === 'international' ? 'active' : ''}`}
                  onClick={() => setFilterCategory('international')}
                >
                  🌍 國際
                </button>
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="🔍 搜尋提供商..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Batch test button */}
            <div className="batch-actions">
              <button
                className="test-all-btn"
                onClick={handleTestAllEnabled}
                disabled={isLoading}
              >
                🧪 測試所有已啟用
              </button>
            </div>

            {/* Provider list */}
            <div className="provider-list">
              {getFilteredProviders().map(key => {
                const config = aiProviders[key]
                const provider = key as AIProvider
                const info = PROVIDER_INFO[provider]

                return (
                  <div key={key} className={`provider-item ${config.enabled ? 'enabled' : 'disabled'}`}>
                    <div className="provider-header">
                      <label className="provider-toggle">
                        <input
                          type="checkbox"
                          checked={config.enabled}
                          onChange={(e) => handleToggleProvider(provider, e.target.checked)}
                        />
                        <span className="provider-name">
                          <span className="provider-region">{info?.region}</span>
                          {info?.name}
                        </span>
                      </label>

                      {settings.aiProvider === provider && (
                        <span className="current-badge">使用中</span>
                      )}

                      {config.enabled && (
                        <button
                          className={`test-btn ${getTestButtonClass(provider)}`}
                          onClick={() => handleTestProvider(provider)}
                          disabled={isLoading || !config.apiKey}
                          title={testResults[provider]?.error || '點擊測試連線'}
                        >
                          {getTestButtonContent(provider)}
                        </button>
                      )}
                    </div>

                    <div className="provider-info">
                      <span className="provider-description">{info?.description}</span>
                      {testResults[provider] && !testResults[provider]?.success && (
                        <span className="error-message">{testResults[provider]?.error}</span>
                      )}
                    </div>

                    {config.enabled && (
                      <div className="api-key-input">
                        <input
                          type={showApiKeys[provider] ? 'text' : 'password'}
                          placeholder={`輸入 API Key`}
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

                    {config.enabled && config.apiKey && testResults[provider]?.success && (
                      <div className="connection-success">
                        ✅ 連線成功
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