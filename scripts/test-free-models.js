// Test free models on OpenRouter
const https = require('https');

async function testFreeModels() {
  console.log('🚀 Testing OpenRouter Free Models...\n');
  
  const apiKey = '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';
  
  // Free models that are commonly available
  const freeModels = [
    'google/gemini-flash-1.5',
    'google/gemini-pro',
    'kimi/kimi-chat',
    'anthropic/claude-3-haiku',
    'openai/gpt-3.5-turbo',
    'meta-llama/llama-3.1-8b-instruct'
  ];
  
  for (const model of freeModels) {
    try {
      console.log(`Testing: ${model}`);
      
      const testMessage = {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful real estate assistant. Keep responses very brief.'
          },
          {
            role: 'user', 
            content: 'Hi!'
          }
        ],
        temperature: 0.7,
        max_tokens: 50
      };

      const response = await makeOpenRouterRequest(apiKey, testMessage);
      
      if (response && response.choices && response.choices[0]) {
        console.log(`✅ ${model}: Working!`);
        console.log(`   Cost: $${response.usage?.total_tokens ? (response.usage.total_tokens * 0.000001).toFixed(6) : 'N/A'}`);
        console.log(`   Response: "${response.choices[0].message.content.trim()}"`);
        console.log('');
      }
    } catch (error) {
      console.log(`❌ ${model}: ${error.message}`);
      console.log('');
    }
  }
}

function makeOpenRouterRequest(apiKey, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Real Estate AI Assistant'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(parsedData);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${parsedData.error?.message || data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });

    req.write(postData);
    req.end();
  });
}

testFreeModels();