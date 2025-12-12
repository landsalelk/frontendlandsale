// Simple test to verify AI widget functionality
import { ChatService } from '../src/components/ai-chat/services/chatServiceOpenRouter.js';

async function testAIWidget() {
  console.log('🤖 Testing AI Widget Functionality...\n');

  try {
    // Test ChatService initialization
    console.log('1. Testing ChatService initialization...');
    const chatService = new ChatService();
    console.log('✅ ChatService initialized successfully');
    console.log('Current model:', chatService.getCurrentModel());

    // Test sending a simple message
    console.log('\n2. Testing message sending...');
    const response = await chatService.sendMessage('Hello, can you help me find properties in Colombo?');
    
    console.log('✅ Message sent successfully');
    console.log('Response:', response.text);
    
    if (response.suggestions && response.suggestions.length > 0) {
      console.log('Suggestions:', response.suggestions);
    }
    
    if (response.properties && response.properties.length > 0) {
      console.log('Properties found:', response.properties.length);
    }

    console.log('\n🎉 AI Widget is working correctly!');
    
  } catch (error) {
    console.error('❌ AI Widget test failed:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.message.includes('API key')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('- Check if NEXT_PUBLIC_OPENROUTER_API_KEY is set in .env.local');
      console.log('- Verify the API key is valid and has credits');
      console.log('- Try using a free model like anthropic/claude-3-haiku');
    }
  }
}

testAIWidget();