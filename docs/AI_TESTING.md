# AI 連接測試指南

## 中國市場 AI 提供商測試

### 1. 快速測試腳本

在專案根目錄建立 `test-ai.js`：

```javascript
const axios = require('axios');

// 測試配置
const providers = {
  deepseek: {
    name: 'DeepSeek',
    url: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    key: process.env.DEEPSEEK_API_KEY
  },
  kimi: {
    name: 'Kimi (Moonshot)',
    url: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'kimi-k2.5',
    key: process.env.KIMI_API_KEY
  },
  qwen: {
    name: '通義千問',
    url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    model: 'qwen-turbo',
    key: process.env.QWEN_API_KEY
  },
  ernie: {
    name: '文心一言',
    url: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-bot-turbo',
    model: 'ernie-bot-turbo',
    key: process.env.BAIDU_API_KEY
  },
  spark: {
    name: '訊飛星火',
    url: 'https://spark-api-open.xf-yun.com/v1/chat/completions',
    model: 'general',
    key: process.env.SPARK_API_KEY
  },
  chatglm: {
    name: '智譜清言',
    url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4-flash',
    key: process.env.CHATGLM_API_KEY
  },
  yi: {
    name: '零一萬物',
    url: 'https://api.lingyiwanwu.com/v1/chat/completions',
    model: 'yi-34b-chat',
    key: process.env.YI_API_KEY
  }
};

async function testProvider(key, config) {
  console.log(`\n🧪 測試 ${config.name}...`);
  
  if (!config.key) {
    console.log(`   ⚠️  跳過：未設定 API Key`);
    return { success: false, error: 'NO_API_KEY' };
  }

  const startTime = Date.now();
  
  try {
    let response;
    
    if (key === 'qwen') {
      // 通義千問特殊格式
      response = await axios.post(config.url, {
        model: config.model,
        input: {
          messages: [{ role: 'user', content: '你好' }]
        },
        parameters: { max_tokens: 50 }
      }, {
        headers: { 
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
    } else if (key === 'ernie') {
      // 文心一言需要 access_token
      console.log('   ⚠️  文心一言需要額外的 access_token 流程');
      return { success: false, error: 'REQUIRES_OAUTH' };
    } else {
      // 標準 OpenAI 格式
      response = await axios.post(config.url, {
        model: config.model,
        messages: [{ role: 'user', content: '你好' }],
        max_tokens: 50
      }, {
        headers: { 
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
    }
    
    const latency = Date.now() - startTime;
    console.log(`   ✅ 成功 (${latency}ms)`);
    return { success: true, latency };
    
  } catch (error) {
    console.log(`   ❌ 失敗: ${error.response?.data?.error?.message || error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 AI 提供商連接測試\n');
  console.log('=' .repeat(40));
  
  const results = {};
  
  for (const [key, config] of Object.entries(providers)) {
    results[key] = await testProvider(key, config);
  }
  
  console.log('\n' + '='.repeat(40));
  console.log('📊 測試結果摘要');
  console.log('='.repeat(40));
  
  for (const [key, result] of Object.entries(results)) {
    const status = result.success ? '✅' : '❌';
    const detail = result.success ? `${result.latency}ms` : result.error;
    console.log(`${status} ${providers[key].name}: ${detail}`);
  }
}

runTests();
```

### 2. 執行測試

```bash
# 安裝 axios
npm install axios

# 設定環境變數後執行
export DEEPSEEK_API_KEY="your-key"
export KIMI_API_KEY="your-key"
export QWEN_API_KEY="your-key"
# ... 其他 key

node test-ai.js
```

---

## 常見問題與解決方案

### 問題 1：網路連接超時

**現象：** `Error: connect ETIMEDOUT`

**可能原因：**
- 防火牆阻擋
- DNS 解析問題
- 需要代理

**解決方案：**
```typescript
// 在 AIClientManager.ts 中加入代理支持
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxyUrl = process.env.HTTPS_PROXY || 'http://127.0.0.1:7890';
const agent = new HttpsProxyAgent(proxyUrl);

const response = await axios.post(url, data, {
  httpsAgent: agent,  // 加入這行
  headers: { ... },
  timeout: 30000
});
```

### 問題 2：API Key 無效

**現象：** `401 Unauthorized` 或 `Invalid API Key`

**檢查事項：**
1. Key 是否正確複製（沒有多餘空格）
2. Key 是否已過期
3. 是否已充值（部分服務需要預付費）

### 問題 3：文心一言 (ERNIE) 特殊認證

文心一言需要 OAuth 2.0 流程，不是簡單的 Bearer Token：

```typescript
// 需要先取得 access_token
const getBaiduAccessToken = async (apiKey: string, secretKey: string) => {
  const response = await axios.post(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`
  );
  return response.data.access_token;
};

// 然後用 access_token 呼叫 API
const callErnie = async (accessToken: string, message: string) => {
  const response = await axios.post(
    `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-bot-turbo?access_token=${accessToken}`,
    { messages: [{ role: 'user', content: message }] }
  );
  return response.data.result;
};
```

### 問題 4：訊飛星火 WebSocket

訊飛星火官方 API 使用 WebSocket，但 open.xf-yun.com 提供了 HTTP 兼容端點。

---

## 中國市場熱門 AI 排名（建議優先支持）

| 排名 | 提供商 | 特點 | 建議優先級 |
|------|--------|------|-----------|
| 1 | DeepSeek | 性價比高，API 穩定 | ⭐⭐⭐⭐⭐ |
| 2 | Kimi (Moonshot) | 長文本支持好 | ⭐⭐⭐⭐⭐ |
| 3 | 通義千問 | 阿里背景，中文強 | ⭐⭐⭐⭐ |
| 4 | 智譜清言 | GLM 系列，開源友好 | ⭐⭐⭐⭐ |
| 5 | 訊飛星火 | 語音能力強 | ⭐⭐⭐ |
| 6 | 文心一言 | 百度生態 | ⭐⭐⭐ |
| 7 | 零一萬物 | 新興，性價比不錯 | ⭐⭐ |

---

## 測試檢查清單

- [ ] 已註冊並取得各平台 API Key
- [ ] 已完成實名認證（如需）
- [ ] 已充值或確認有免費額度
- [ ] 網路可連接 API 端點
- [ ] 防火牆未阻擋
- [ ] （可選）代理設定正確
