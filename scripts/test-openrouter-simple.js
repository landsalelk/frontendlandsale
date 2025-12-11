// Simple test script for OpenRouter integration
// This test uses the compiled Next.js environment

const https = require('https');

async function testOpenRouterAPI() {
  console.log('🚀 Testing OpenRouter API Integration...\n');

  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
    console.log('❌ Please set your OpenRouter API key in .env.local');
    console.log('   Replace "your-openrouter-api-key-here" with your actual API key');
    console.log('   Get your API key from: https://openrouter.ai/keys');
    return;
  }

  try {
    console.log('📋 Test 1: API Key Validation');
    console.log('✅ API key is set (first 8 chars):', apiKey.substring(0, 8) + '...');
    console.log('');

    console.log('📋 Test 2: API Endpoint Test');
    
    const testMessage = {
      model: 'anthropic/claude-3-sonnet-20240229',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful real estate assistant. Keep responses concise.'
        },
        {
          role: 'user', 
          content: 'What are the current trends in the Sri Lankan real estate market? Keep it brief.'
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    };

    const response = await makeOpenRouterRequest(apiKey, testMessage);
    
    if (response && response.choices && response.choices[0]) {
      console.log('✅ API call successful!');
      console.log('✅ Response received:', response.choices[0].message.content.substring(0, 100) + '...');
      console.log('✅ Model used:', response.model);
      console.log('✅ Tokens used:', response.usage?.total_tokens || 'N/A');
    } else {
      console.log('❌ Unexpected API response format');
      console.log('Response:', JSON.stringify(response, null, 2));
    }
    
    console.log('');
    console.log('🎉 OpenRouter API integration test completed!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Start your Next.js development server: npm run dev');
    console.log('   2. Open your browser to http://localhost:3000');
    console.log('   3. Test the AI chat widget in your application');
    console.log('   4. Use the model selector to switch between AI providers');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   - Verify your API key is correct');
    console.log('   - Check if you have credits in your OpenRouter account');
    console.log('   - Ensure your network connection is working');
    console.log('   - Check OpenRouter status at https://status.openrouter.ai/');
    console.log('   - API Documentation: https://openrouter.ai/docs');
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

// Run the test
testOpenRouterAPI();