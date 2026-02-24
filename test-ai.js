const axios = require('axios');

// 測試配置 - 從環境變數讀取 API Keys
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
  },
  openrouter: {
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'openai/gpt-3.5-turbo',
    key: process.env.OPENROUTER_API_KEY
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
    
    // 嘗試提取回應內容
    let content = '';
    if (response.data.choices?.[0]?.message?.content) {
      content = response.data.choices[0].message.content;
    } else if (response.data.output?.text) {
      content = response.data.output.text; // 通義千問格式
    }
    console.log(`   💬 回應: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`);
    
    return { success: true, latency, response: content };
    
  } catch (error) {
    const latency = Date.now() - startTime;
    let errorMsg = error.message;
    
    if (error.response) {
      errorMsg = error.response.data?.error?.message 
        || error.response.data?.error?.code 
        || `HTTP ${error.response.status}`;
    } else if (error.code === 'ECONNABORTED') {
      errorMsg = '連接超時';
    } else if (error.code === 'ENOTFOUND') {
      errorMsg = 'DNS 解析失敗';
    }
    
    console.log(`   ❌ 失敗 (${latency}ms): ${errorMsg}`);
    return { success: false, error: errorMsg, latency };
  }
}

async function runTests() {
  console.log('🚀 Desktop Fox AI 提供商連接測試');
  console.log('=====================================');
  console.log('測試時間:', new Date().toLocaleString('zh-TW'));
  console.log('');
  
  // 檢查環境變數
  const configuredKeys = Object.entries(providers).filter(([_, p]) => p.key).length;
  console.log(`📋 已配置 ${configuredKeys}/${Object.keys(providers).length} 個 API Key`);
  
  if (configuredKeys === 0) {
    console.log('\n⚠️  沒有設定任何 API Key');
    console.log('請設定以下環境變數之一或多個：');
    console.log('  - DEEPSEEK_API_KEY');
    console.log('  - KIMI_API_KEY');
    console.log('  - QWEN_API_KEY');
    console.log('  - SPARK_API_KEY');
    console.log('  - CHATGLM_API_KEY');
    console.log('  - YI_API_KEY');
    console.log('  - OPENROUTER_API_KEY');
    console.log('');
    console.log('示例: export DEEPSEEK_API_KEY="your-key-here"');
    return;
  }
  
  const results = {};
  
  for (const [key, config] of Object.entries(providers)) {
    results[key] = await testProvider(key, config);
  }
  
  console.log('\n=====================================');
  console.log('📊 測試結果摘要');
  console.log('=====================================');
  
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;
  
  for (const [key, result] of Object.entries(results)) {
    const name = providers[key].name;
    
    if (result.error === 'NO_API_KEY') {
      console.log(`⏸️  ${name}: 未配置`);
      skipCount++;
    } else if (result.success) {
      console.log(`✅ ${name}: ${result.latency}ms`);
      successCount++;
    } else {
      console.log(`❌ ${name}: ${result.error}`);
      failCount++;
    }
  }
  
  console.log('=====================================');
  console.log(`總計: ${successCount} 成功 | ${failCount} 失敗 | ${skipCount} 未配置`);
  
  if (successCount > 0) {
    console.log('\n🎉 建議優先使用上述連接成功的 AI 提供商');
  }
}

runTests().catch(console.error);
