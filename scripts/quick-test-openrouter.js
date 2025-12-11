// Quick test with hardcoded API key
const https = require('https');

async function quickTest() {
  console.log('🚀 Quick OpenRouter Test...\n');
  
  const apiKey = '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';
  
  try {
    const testMessage = {
      model: 'anthropic/claude-3-sonnet-20240229',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful real estate assistant.'
        },
        {
          role: 'user', 
          content: 'What are the current trends in Sri Lankan real estate? Keep it brief.'
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    };

    const response = await makeOpenRouterRequest(apiKey, testMessage);
    
    if (response && response.choices && response.choices[0]) {
      console.log('✅ API call successful!');
      console.log('✅ Response:', response.choices[0].message.content);
      console.log('✅ Model:', response.model);
      console.log('✅ Tokens used:', response.usage?.total_tokens);
    } else {
      console.log('❌ Unexpected response:', JSON.stringify(response, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
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

quickTest();