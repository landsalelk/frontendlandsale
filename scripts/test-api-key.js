// Test OpenRouter API key validity
const axios = require('axios');

async function testApiKey() {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  console.log('Testing OpenRouter API key...');
  console.log('API Key present:', !!apiKey);
  console.log('API Key length:', apiKey?.length);
  
  if (!apiKey) {
    console.log('❌ No API key found in environment variables');
    return;
  }

  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'LandSale AI Widget'
      }
    });
    
    console.log('✅ API Key is valid!');
    console.log('Available models count:', response.data.data?.length || 0);
    
    // Test a simple chat completion
    const chatResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'anthropic/claude-3-haiku',
      messages: [
        { role: 'user', content: 'Hello, this is a test message.' }
      ],
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'LandSale AI Widget',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Chat API working!');
    console.log('Response:', chatResponse.data.choices[0]?.message?.content);
    
  } catch (error) {
    console.log('❌ API Error:', error.response?.status, error.response?.data?.error?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Verify your OpenRouter account is active');
      console.log('2. Check if the API key is correct in your OpenRouter dashboard');
      console.log('3. Ensure you have credits or are using free models');
      console.log('4. Try regenerating the API key');
    }
  }
}

testApiKey();