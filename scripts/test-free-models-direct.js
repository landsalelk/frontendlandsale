// Test with truly free models
require('dotenv').config({ path: '.env.local' });

const axios = require('axios');

async function testFreeModels() {
  console.log('🆓 Testing Truly Free Models\n');

  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  // Test with the free models we found
  const freeModels = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'nvidia/llama-3.3-nemotron-super-49b-v1.5',
    'aion-labs/aion-rp-llama-3.1-8b'
  ];

  for (const model of freeModels) {
    try {
      console.log(`Testing ${model}...`);
      
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful real estate assistant. Keep responses short.' },
          { role: 'user', content: 'Hello! Can you help me find properties?' }
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
      
      console.log(`✅ ${model}: SUCCESS`);
      console.log('Response:', response.data.choices[0]?.message?.content);
      console.log('Usage:', response.data.usage);
      
      // If this works, update our service to use this model
      console.log('\n🎉 Found a working free model!');
      console.log(`Update your service to use: ${model}`);
      
      return model;
      
    } catch (error) {
      console.log(`❌ ${model}: FAILED - ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  console.log('\n❌ All free models failed. Possible issues:');
  console.log('- API key may need account verification');
  console.log('- Account may need initial credit/debit card setup');
  console.log('- API key may be in trial mode');
}

testFreeModels();