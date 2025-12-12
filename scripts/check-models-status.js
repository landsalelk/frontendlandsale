// Check available models and account status
require('dotenv').config({ path: '.env.local' });

const axios = require('axios');

async function checkModelsAndStatus() {
  console.log('🔍 Checking OpenRouter Models and Status\n');

  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  try {
    // Get available models
    console.log('📋 Available Models:');
    const modelsResponse = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'LandSale AI Test'
      }
    });
    
    const models = modelsResponse.data.data;
    console.log(`Found ${models.length} models`);
    
    // Show some free models
    const freeModels = models.filter(model => 
      model.id.includes('claude-3-haiku') || 
      model.id.includes('llama-3') || 
      model.id.includes('wizardlm')
    );
    
    console.log('\n🆓 Free/Cheap Models:');
    freeModels.slice(0, 5).forEach(model => {
      console.log(`- ${model.id}: ${model.pricing?.prompt || 'Free'}`);
    });
    
    // Test a simple chat with a free model
    console.log('\n🧪 Testing Claude 3 Haiku...');
    try {
      const chatResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: 'anthropic/claude-3-haiku',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Hello from OpenRouter!"' }
        ],
        max_tokens: 50
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'LandSale AI Test',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Chat test successful!');
      console.log('Response:', chatResponse.data.choices[0]?.message?.content);
      
    } catch (chatError) {
      console.log('❌ Chat test failed:', chatError.response?.data?.error?.message || chatError.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking models:', error.message);
  }
}

checkModelsAndStatus();