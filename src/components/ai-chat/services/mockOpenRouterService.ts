import { OpenRouterService, OpenRouterMessage, OPENROUTER_MODELS, OpenRouterModel } from './openRouterService';

// Mock responses for when OpenRouter API is unavailable
const MOCK_RESPONSES = {
  'hello': {
    text: "Hello! I'm Priya, your real estate assistant. How can I help you today? 🏡",
    suggestions: ["Find properties", "Sell property", "Market info"]
  },
  'buy': {
    text: "I'd be happy to help you find properties! What type of property are you looking for? 🏠",
    suggestions: ["House for sale", "Apartment", "Land", "Commercial"]
  },
  'sell': {
    text: "Great! I can help you sell your property. What's the type and location of your property? 💰",
    suggestions: ["House details", "Apartment info", "Get valuation", "Market analysis"]
  },
  'colombo': {
    text: "I found some great properties in Colombo! Here are a few options:\n\n🏠 **3-bedroom house in Colombo 7**\nPrice: Rs. 25 million\nFeatures: 3 bed, 2 bath, garden\n\n🏢 **2-bedroom apartment in Colombo 3**\nPrice: Rs. 18 million\nFeatures: 2 bed, 2 bath, pool access\n\nWould you like more details on any of these?",
    suggestions: ["More houses", "Apartments", "Different area", "Schedule viewing"]
  },
  'price': {
    text: "Property prices vary by location and type. Here's a general guide:\n\n📍 **Colombo**: Rs. 15-50M for houses\n📍 **Suburbs**: Rs. 8-25M for houses\n📍 **Apartments**: Rs. 8-30M\n📍 **Land**: Rs. 2-15M per perch\n\nFor specific pricing, I need more details about what you're looking for.",
    suggestions: ["Get quote", "Market trends", "Valuation", "Compare areas"]
  },
  'help': {
    text: "I'm here to help with all your real estate needs! I can:\n\n🔍 Find properties for sale/rent\n💰 Provide market valuations\n📊 Show market trends\n🏠 Help with buying/selling process\n📄 Review property documents\n\nWhat would you like to know about?",
    suggestions: ["Find properties", "Market info", "Buying guide", "Selling tips"]
  }
};

const DEFAULT_MOCK_RESPONSE = {
  text: "I'm here to help with your real estate needs! I can assist with finding properties, market analysis, and buying/selling guidance. What would you like to know? 🏡",
  suggestions: ["Find properties", "Market info", "Get valuation", "Buying guide"]
};

export class MockOpenRouterService {
  private currentModel: OpenRouterModel;
  private messageHistory: OpenRouterMessage[] = [];

  constructor(model: OpenRouterModel = OPENROUTER_MODELS.CLAUDE_3_HAIKU_FREE) {
    this.currentModel = model;
  }

  setModel(model: OpenRouterModel) {
    this.currentModel = model;
  }

  getModel(): OpenRouterModel {
    return this.currentModel;
  }

  private generateMockResponse(userMessage: string): { text: string; suggestions: string[] } {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for keywords in the message
    for (const [keyword, response] of Object.entries(MOCK_RESPONSES)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    return DEFAULT_MOCK_RESPONSE;
  }

  async sendMessage(messages: OpenRouterMessage[]): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const userMessage = messages[messages.length - 1]?.content || '';
    const mockResponse = this.generateMockResponse(typeof userMessage === 'string' ? userMessage : '');
    
    // Add suggestions to the response text
    const suggestionsText = mockResponse.suggestions.length > 0 
      ? `\n\n<SUGGESTIONS>${JSON.stringify(mockResponse.suggestions)}</SUGGESTIONS>`
      : '';
    
    const fullResponse = mockResponse.text + suggestionsText;
    
    return fullResponse;
  }

  async sendMessageStream(messages: OpenRouterMessage[], onChunk: (chunk: string) => void): Promise<void> {
    const userMessage = messages[messages.length - 1]?.content || '';
    const mockResponse = this.generateMockResponse(typeof userMessage === 'string' ? userMessage : '');
    
    // Add suggestions to the response text
    const suggestionsText = mockResponse.suggestions.length > 0 
      ? `\n\n<SUGGESTIONS>${JSON.stringify(mockResponse.suggestions)}</SUGGESTIONS>`
      : '';
    
    const fullResponse = mockResponse.text + suggestionsText;
    
    // Simulate streaming by sending chunks
    const chunks = fullResponse.split(' ');
    for (let i = 0; i < chunks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      onChunk(chunks[i] + (i < chunks.length - 1 ? ' ' : ''));
    }
  }
}