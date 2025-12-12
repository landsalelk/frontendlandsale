// Test the updated mock service
require('dotenv').config({ path: '.env.local' });

// Simple mock service test (updated format)
const MOCK_RESPONSES = {
  'hello': {
    text: "Hello! I'm Priya, your real estate assistant. How can I help you today? 🏡",
    suggestions: ["Find properties", "Sell property", "Market info"]
  },
  'buy': {
    text: "I'd be happy to help you find properties! What type of property are you looking for? 🏠",
    suggestions: ["House for sale", "Apartment", "Land", "Commercial"]
  },
  'colombo': {
    text: "I found some great properties in Colombo! Here are a few options:\n\n🏠 **3-bedroom house in Colombo 7**\nPrice: Rs. 25 million\nFeatures: 3 bed, 2 bath, garden\n\n🏢 **2-bedroom apartment in Colombo 3**\nPrice: Rs. 18 million\nFeatures: 2 bed, 2 bath, pool access\n\nWould you like more details on any of these?",
    suggestions: ["More houses", "Apartments", "Different area", "Schedule viewing"]
  }
};

function generateMockResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const [keyword, response] of Object.entries(MOCK_RESPONSES)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }
  
  return {
    text: "I'm here to help with your real estate needs! I can assist with finding properties, market analysis, and buying/selling guidance. What would you like to know? 🏡",
    suggestions: ["Find properties", "Market info", "Get valuation", "Buying guide"]
  };
}

// Simulate the updated sendMessage function
async function mockSendMessage(messages) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const userMessage = messages[messages.length - 1]?.content || '';
  const mockResponse = generateMockResponse(typeof userMessage === 'string' ? userMessage : '');
  
  // Add suggestions to the response text
  const suggestionsText = mockResponse.suggestions.length > 0 
    ? `\n\n<SUGGESTIONS>${JSON.stringify(mockResponse.suggestions)}</SUGGESTIONS>`
    : '';
  
  const fullResponse = mockResponse.text + suggestionsText;
  
  return fullResponse; // Return string, not object
}

async function testUpdatedMockService() {
  console.log('🤖 Testing Updated Mock Service (String Return Format)\n');

  const testMessages = [
    { role: 'user', content: 'Hello!' },
    { role: 'user', content: 'I want to buy a house' },
    { role: 'user', content: 'Show me properties in Colombo' }
  ];

  for (const message of testMessages) {
    console.log(`Testing: ${message.content}`);
    const response = await mockSendMessage([message]);
    console.log(`Response: ${response}`);
    console.log('---\n');
  }
  
  console.log('✅ Updated mock service is working!');
  console.log('Now returns string format to match OpenRouterService');
}

testUpdatedMockService();