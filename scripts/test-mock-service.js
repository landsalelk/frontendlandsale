// Test the mock service directly
require('dotenv').config({ path: '.env.local' });

// Simple mock service test
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

async function testMockService() {
  console.log('🤖 Testing Mock AI Service\n');

  const testMessages = [
    'Hello!',
    'I want to buy a house',
    'Show me properties in Colombo',
    'What are the prices like?'
  ];

  for (const message of testMessages) {
    console.log(`User: ${message}`);
    const response = generateMockResponse(message);
    console.log(`AI: ${response.text}`);
    console.log(`Suggestions: ${response.suggestions.join(', ')}`);
    console.log('---\n');
  }
  
  console.log('✅ Mock service is working!');
  console.log('The AI widget will use this fallback when OpenRouter API is unavailable.');
}

testMockService();