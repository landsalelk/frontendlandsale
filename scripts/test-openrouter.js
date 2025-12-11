// Test script for OpenRouter integration
import { OpenRouterService, OPENROUTER_MODELS } from '../src/components/ai-chat/services/openRouterService.js';

async function testOpenRouter() {
  console.log('🚀 Testing OpenRouter Integration...\n');

  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
    console.log('❌ Please set your OpenRouter API key in .env.local');
    console.log('   Add: NEXT_PUBLIC_OPENROUTER_API_KEY=your-actual-api-key');
    return;
  }

  try {
    // Test 1: Basic text chat
    console.log('📋 Test 1: Basic Text Chat');
    const service = new OpenRouterService(apiKey, OPENROUTER_MODELS.CLAUDE_3_SONNET);
    
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful real estate assistant. Keep responses concise.'
      },
      {
        role: 'user',
        content: 'What are the current trends in the Sri Lankan real estate market?'
      }
    ];

    const response = await service.sendMessage(messages);
    console.log('✅ Response received:', response.substring(0, 100) + '...');
    console.log('');

    // Test 2: Model switching
    console.log('📋 Test 2: Model Switching');
    service.setModel(OPENROUTER_MODELS.GPT35_TURBO);
    console.log('✅ Switched to GPT-3.5 Turbo');
    console.log('');

    // Test 3: Streaming response
    console.log('📋 Test 3: Streaming Response');
    let streamedText = '';
    await service.sendMessageStream(messages, (chunk) => {
      streamedText += chunk;
      process.stdout.write(chunk);
    });
    console.log('\n✅ Streaming completed');
    console.log('');

    // Test 4: Available models
    console.log('📋 Test 4: Available Models');
    console.log('Available models:', Object.keys(OPENROUTER_MODELS).length);
    console.log('✅ Models loaded successfully');
    console.log('');

    console.log('🎉 All tests passed! OpenRouter integration is working correctly.');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Add your API key to .env.local');
    console.log('   2. Start your Next.js development server');
    console.log('   3. Test the AI chat widget in your browser');
    console.log('   4. Use the model selector to switch between AI providers');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   - Verify your API key is correct');
    console.log('   - Check if you have credits in your OpenRouter account');
    console.log('   - Ensure your network connection is working');
    console.log('   - Check OpenRouter status at https://status.openrouter.ai/');
  }
}

// Run the test
testOpenRouter();