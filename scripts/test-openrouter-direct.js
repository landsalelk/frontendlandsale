// Test OpenRouter service directly
require('dotenv').config({ path: '.env.local' });

const axios = require('axios');

async function testOpenRouterService() {
  console.log('🔧 Testing OpenRouter Service...\n');

  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  console.log('API Key from environment:', apiKey ? 'Present' : 'Missing');
  
  if (!apiKey) {
    console.log('❌ No API key found. Please check .env.local file');
    return;
  }

  try {
    // Test basic API connectivity
    console.log('1. Testing API connectivity...');
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'anthropic/claude-3-haiku',
      messages: [
        { role: 'system', content: 'You are a helpful real estate assistant.' },
        { role: 'user', content: 'Hello, can you help me find properties?' }
      ],
      max_tokens: 100
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'LandSale AI Test',
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API connection successful!');
    console.log('Response:', response.data.choices[0]?.message?.content);
    
    console.log('\n🎉 OpenRouter service is working correctly!');
    
  } catch (error) {
    console.error('❌ OpenRouter service test failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data?.error?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔧 Troubleshooting:');
      console.log('- Verify your OpenRouter account is active');
      console.log('- Check if the API key is correct');
      console.log('- Ensure you have credits or are using free models');
      console.log('- Try regenerating the API key in your OpenRouter dashboard');
    }
  }
}

testOpenRouterService();