// Test the AI widget with mock service fallback
require('dotenv').config({ path: '.env.local' });

async function testAIWidgetWithFallback() {
  console.log('🤖 Testing AI Widget with Mock Service Fallback\n');

  try {
    // Import the ChatService dynamically
    const { ChatService } = await import('../src/components/ai-chat/services/chatServiceOpenRouter.ts');
    
    console.log('✅ ChatService imported successfully');
    
    const chatService = new ChatService();
    console.log('✅ ChatService initialized');
    console.log('Current model:', chatService.getCurrentModel());
    
    // Test basic message
    console.log('\n🧪 Testing basic message...');
    const response1 = await chatService.sendMessage('Hello, can you help me find properties?');
    console.log('Response:', response1.text);
    console.log('Audio available:', !!response1.audio);
    
    // Test property search
    console.log('\n🧪 Testing property search...');
    const response2 = await chatService.sendMessage('I want to buy a house in Colombo');
    console.log('Response:', response2.text);
    
    // Test streaming
    console.log('\n🧪 Testing streaming...');
    let streamResponse = '';
    await chatService.sendMessageStream('What are current property prices?', (chunk) => {
      streamResponse += chunk;
      process.stdout.write('.');
    });
    console.log('\nStream Response:', streamResponse);
    
    console.log('\n🎉 AI Widget is working correctly with fallback!');
    console.log('Note: Using mock service due to OpenRouter API restrictions');
    
  } catch (error) {
    console.error('❌ AI Widget test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAIWidgetWithFallback();