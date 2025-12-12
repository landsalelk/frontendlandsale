// Comprehensive OpenRouter API troubleshooting
require('dotenv').config({ path: '.env.local' });

const axios = require('axios');

async function troubleshootOpenRouter() {
  console.log('🔧 OpenRouter API Troubleshooting\n');

  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  console.log('Environment Check:');
  console.log('- API Key present:', !!apiKey);
  console.log('- API Key format:', apiKey?.startsWith('sk-or-') ? 'sk-or- format' : 'Unknown format');
  console.log('- API Key length:', apiKey?.length);
  
  if (!apiKey) {
    console.log('\n❌ No API key found in environment variables');
    console.log('Please add NEXT_PUBLIC_OPENROUTER_API_KEY to your .env.local file');
    return;
  }

  // Test different API endpoints
  console.log('\n🧪 Testing API endpoints...');
  
  const tests = [
    {
      name: 'Models List',
      url: 'https://openrouter.ai/api/v1/models',
      method: 'GET'
    },
    {
      name: 'Account Info',
      url: 'https://openrouter.ai/api/v1/auth/key',
      method: 'GET'
    },
    {
      name: 'Chat Completion',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      method: 'POST',
      data: {
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 50
      }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\nTesting ${test.name}...`);
      
      const config = {
        method: test.method,
        url: test.url,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'LandSale AI Test',
          'Content-Type': 'application/json'
        }
      };
      
      if (test.data) {
        config.data = test.data;
      }
      
      const response = await axios(config);
      console.log(`✅ ${test.name}: Success (Status: ${response.status})`);
      
      if (test.name === 'Account Info') {
        console.log('Account info:', response.data);
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: Failed`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
      
      if (error.response?.status === 401) {
        console.log(`   🔍 This suggests the API key is invalid or account issue`);
      }
    }
  }

  console.log('\n📋 Recommendations:');
  console.log('1. Verify your OpenRouter account at https://openrouter.ai/keys');
  console.log('2. Check if your API key is active and has the correct permissions');
  console.log('3. Try creating a new API key');
  console.log('4. Ensure your account has credits or access to free models');
  console.log('5. Check OpenRouter status at https://status.openrouter.ai/');
}

troubleshootOpenRouter();