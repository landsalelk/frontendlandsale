// Test script to debug OpenRouter API issues
const axios = require('axios');

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

async function testOpenRouterAPI() {
  console.log('🧪 Testing OpenRouter API...');
  console.log('API Key:', OPENROUTER_API_KEY ? '✅ Configured' : '❌ Missing');
  
  if (!OPENROUTER_API_KEY) {
    console.log('❌ No API key found. Please check your .env.local file.');
    return;
  }

  try {
    console.log('📡 Making test request to OpenRouter...');
    
    const response = await axios({
      method: 'POST',
      url: `${OPENROUTER_BASE_URL}/chat/completions`,
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Landsale.lk AI Assistant Test',
        'Content-Type': 'application/json',
      },
      data: {
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message. Please respond with "Test successful" if you receive this.'
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('✅ OpenRouter API Test Successful!');
    console.log('Response:', response.data.choices[0]?.message?.content || 'No content');
    console.log('Model used:', response.data.model);
    console.log('Tokens used:', response.data.usage?.total_tokens || 'Unknown');
    
  } catch (error) {
    console.log('❌ OpenRouter API Test Failed!');
    console.log('Error Type:', error.response?.status || error.code || 'Unknown');
    console.log('Error Message:', error.response?.data?.error?.message || error.message);
    console.log('Error Details:', error.response?.data || error.stack);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 401 Authentication Error Detected!');
      console.log('Possible causes:');
      console.log('- Invalid API key');
      console.log('- API key not activated');
      console.log('- Billing issues with OpenRouter account');
      console.log('- API key restrictions (IP, referrer, etc.)');
    }
  }
}

// Run the test
testOpenRouterAPI().catch(console.error);