import { OpenRouterMessage, OPENROUTER_MODELS, OpenRouterModel } from './openRouterService';

// Enhanced mock responses for property listing creation
const MOCK_RESPONSES: Record<string, { text: string; suggestions: string[] }> = {
  'sell': {
    text: "Great! I'd love to help you sell your property! 🏡\n\nTo create a compelling listing, I'll need a few details. Let's start with the basics:\n\n**What type of property are you selling?**\n- Land/Plot\n- House\n- Apartment\n- Commercial property",
    suggestions: ["Land for sale", "House for sale", "Apartment", "Commercial"]
  },
  'land': {
    text: "Perfect! Land is in high demand right now! 🌿\n\n**Where is your land located?** Please share the district and city/area.\n\nFor example: \"Nugegoda, Colombo\" or \"Kandy road, Kadawatha\"",
    suggestions: ["Colombo area", "Gampaha area", "Kandy area", "Southern area"]
  },
  'house': {
    text: "Houses are very popular! 🏠\n\nLet me know:\n1. **Location** - Which district and area?\n2. **Size** - How many bedrooms/bathrooms?\n3. **Land size** - Property land area?\n\nYou can tell me everything in one message!",
    suggestions: ["4 bed house", "3 bed house", "Villa type", "Colonial house"]
  },
  'colombo': {
    text: "Excellent choice! Colombo properties are prime real estate! 📍\n\n<PROPERTY_DATA>{\"district\": \"Colombo\"}</PROPERTY_DATA>\n\n**What's the size of your property?**\n- For land: How many perches?\n- For houses: How many square feet or perches?",
    suggestions: ["10 perches", "20 perches", "30+ perches", "Enter exact size"]
  },
  'perch': {
    text: "Got it! 📐\n\n<PROPERTY_DATA>{\"land_unit\": \"perches\"}</PROPERTY_DATA>\n\nNow for the important part - **What's your asking price?**\n\nYou can say it like:\n- \"5 million\" or \"50 lakhs\"\n- \"Rs. 5,000,000 total\" or \"250,000 per perch\"",
    suggestions: ["Under 5M", "5-10 million", "10-20 million", "20+ million"]
  },
  'million': {
    text: "Great pricing! 💰\n\n**What features does your property have?**\n\nCommon features include:\n- Road access / frontage\n- Electricity connection\n- Water supply (pipe/well)\n- Flat or sloped land\n- Near schools/shops\n- Scenic views",
    suggestions: ["Road + electricity", "All utilities", "Corner lot", "Near main road"]
  },
  'road': {
    text: "Excellent! Road access is a major selling point! 🛣️\n\n<PROPERTY_DATA>{\"features\": [\"Road Access\"]}</PROPERTY_DATA>\n\n**What's your contact number?** This will be shown to interested buyers.\n\nFormat: 077XXXXXXX or +94 77XXXXXXX",
    suggestions: ["Add phone", "Add WhatsApp", "Both phone & WhatsApp", "Skip for now"]
  },
  'ready': {
    text: "🎉 **Your listing is ready to publish!**\n\n<LISTING_PREVIEW>{\"title\": \"20 Perch Land for Sale in Colombo\", \"description\": \"Beautiful 20 perch flat land with road access and electricity. Prime location in Colombo.\", \"ready_to_publish\": true}</LISTING_PREVIEW>\n\n📋 **Summary:**\n- Type: Land\n- Size: 20 Perches\n- Location: Colombo\n- Price: Rs. 5,000,000\n- Features: Road access, Electricity\n\nWould you like to:\n1. ✅ **Publish now**\n2. ✏️ Edit details\n3. 📸 Add photos",
    suggestions: ["Publish listing", "Edit details", "Add photos", "Save as draft"]
  },
  'buy': {
    text: "I'd be happy to help you find properties! 🏠\n\nWhat are you looking for?\n\n<PROPERTIES>\n[\n  {\"id\": \"1\", \"price\": \"Rs. 8,500,000\", \"address\": \"Nugegoda, Colombo\", \"specs\": \"20 Perches • Flat Land • Road Access\", \"image\": \"https://images.unsplash.com/photo-1600596542815-e32c21216f3d?w=400\"},\n  {\"id\": \"2\", \"price\": \"Rs. 15,000,000\", \"address\": \"Rajagiriya, Colombo\", \"specs\": \"15 Perches • Corner Lot • All Utilities\", \"image\": \"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400\"}\n]\n</PROPERTIES>",
    suggestions: ["More in Colombo", "Under 10M", "Land only", "With house"]
  },
  'show': {
    text: "Here are some featured properties! 🏡\n\n<PROPERTIES>\n[\n  {\"id\": \"1\", \"price\": \"Rs. 5,500,000\", \"address\": \"Kadawatha, Gampaha\", \"specs\": \"25 Perches • Flat Land • Residential\", \"image\": \"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400\"},\n  {\"id\": \"2\", \"price\": \"Rs. 12,000,000\", \"address\": \"Maharagama, Colombo\", \"specs\": \"18 Perches • Near Highway • Commercial Zone\", \"image\": \"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400\"},\n  {\"id\": \"3\", \"price\": \"Rs. 35,000,000\", \"address\": \"Colombo 5\", \"specs\": \"4 Bed • 3 Bath • 2 Story House\", \"image\": \"https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400\"}\n]\n</PROPERTIES>\n\nWant me to filter these for you?",
    suggestions: ["Land only", "Houses only", "Under 20M", "Near Colombo"]
  },
  'hello': {
    text: "Ayubowan! 🙏 Hello and welcome to LandSale.lk!\n\nI'm Priya, your personal real estate assistant. I'm here to help you:\n\n🏷️ **Sell your property** - Create a listing in minutes\n🔍 **Find properties** - Search available listings\n💰 **Get valuations** - Know your property's worth\n\nHow can I help you today?",
    suggestions: ["I want to sell", "Show me properties", "Property valuation"]
  },
  'hi': {
    text: "Ayubowan! 🙏 Welcome!\n\nI'm Priya from LandSale.lk. Whether you're looking to buy your dream property or sell your land, I'm here to make it simple!\n\nWhat brings you here today?",
    suggestions: ["I want to sell my land", "Looking to buy", "Just browsing"]
  },
  'price': {
    text: "Property prices vary by location. Here's a quick guide for Sri Lanka:\n\n📍 **Colombo District:**\n- Prime areas: Rs. 500K - 2M per perch\n- Suburbs: Rs. 200K - 500K per perch\n\n📍 **Gampaha District:**\n- Rs. 150K - 400K per perch\n\n📍 **Kandy District:**\n- Rs. 100K - 300K per perch\n\n📍 **Southern Province:**\n- Rs. 100K - 500K per perch (coastal areas higher)\n\nWant a specific valuation?",
    suggestions: ["Colombo prices", "My property value", "Compare areas", "Market trends"]
  },
  'help': {
    text: "I'm here to help! 🤝\n\nHere's what I can do for you:\n\n**🏷️ Selling:**\n- Create a listing in minutes\n- Get market valuations\n- Photography tips\n\n**🔍 Buying:**\n- Search properties\n- Compare options\n- Schedule viewings\n\n**📊 Information:**\n- Market trends\n- Price guides\n- Area insights\n\nJust tell me what you need!",
    suggestions: ["Create listing", "Find properties", "Market info", "Talk to agent"]
  },
  'nugegoda': {
    text: "Nugegoda is a prime residential area in Colombo! 📍\n\n<PROPERTY_DATA>{\"district\": \"Colombo\", \"city\": \"Nugegoda\"}</PROPERTY_DATA>\n\n**Current market:**\n- Land: Rs. 350K - 600K per perch\n- Houses: Rs. 25M - 60M\n- High demand area ⭐\n\nWhat's the size of your property in perches?",
    suggestions: ["10 perches", "20 perches", "15 perches", "Other size"]
  },
  'gampaha': {
    text: "Gampaha district is growing fast! 🌱\n\n<PROPERTY_DATA>{\"district\": \"Gampaha\"}</PROPERTY_DATA>\n\nPopular areas include:\n- Kadawatha\n- Ja-Ela\n- Negombo\n- Minuwangoda\n\nWhich area is your property in?",
    suggestions: ["Kadawatha", "Ja-Ela", "Negombo", "Minuwangoda"]
  },
  'kandy': {
    text: "Kandy - the hill capital! 🏔️\n\n<PROPERTY_DATA>{\"district\": \"Kandy\"}</PROPERTY_DATA>\n\nKandy properties are sought after for:\n- Scenic views\n- Cool climate\n- Tourist potential\n\nWhere exactly is your property?",
    suggestions: ["Kandy city", "Peradeniya", "Katugastota", "Suburbs"]
  }
};

const DEFAULT_MOCK_RESPONSE = {
  text: "I understand! 🤔\n\nI'm here to help with your real estate needs. I can:\n\n🏷️ **Help you sell** - Create a listing for your property\n🔍 **Help you buy** - Find properties that match your needs\n💰 **Provide valuations** - Get market prices for areas\n\nWhat would you like to do?",
  suggestions: ["Sell my property", "Find properties", "Get valuation", "Market info"]
};

// Context-aware listing responses based on what's missing
function getListingContextResponse(message: string): { text: string; suggestions: string[] } | null {
  const lower = message.toLowerCase();

  // Detect numbers that could be size
  const sizeMatch = message.match(/(\d+)\s*(?:perch|p\b|perches)/i);
  if (sizeMatch) {
    const size = sizeMatch[1];
    return {
      text: `${size} perches - noted! 📐\n\n<PROPERTY_DATA>{"land_size": ${size}, "land_unit": "perches"}</PROPERTY_DATA>\n\n**What's your asking price for this property?**\n\nTip: Check similar properties in your area to price competitively.`,
      suggestions: ["Under 5 million", "5-10 million", "10-20 million", "Above 20 million"]
    };
  }

  // Detect price mentions
  const priceMatch = message.match(/(\d+)\s*(?:million|m\b|mn|lakhs?|lac)/i);
  if (priceMatch) {
    let price = parseInt(priceMatch[1]);
    if (lower.includes('million') || lower.includes(' m') || message.match(/\d+\s*m\b/i)) {
      price *= 1000000;
    } else if (lower.includes('lakh') || lower.includes('lac')) {
      price *= 100000;
    }
    return {
      text: `Rs. ${price.toLocaleString()} - great price! 💰\n\n<PROPERTY_DATA>{"price": ${price}, "price_unit": "total"}</PROPERTY_DATA>\n\n**What features does your property have?**\n\nCommon selling points:\n✅ Road access\n✅ Electricity\n✅ Water supply\n✅ Flat/level land\n✅ Near amenities`,
      suggestions: ["Road + electricity", "All utilities", "Near main road", "Scenic view"]
    };
  }

  // Detect phone number
  const phoneMatch = message.match(/((?:\+94|0)?[0-9]{9,10})/);
  if (phoneMatch) {
    return {
      text: `Contact saved: ${phoneMatch[1]} 📱\n\n<PROPERTY_DATA>{"contact_phone": "${phoneMatch[1]}"}</PROPERTY_DATA>\n\n🎉 **Excellent! I have all the details I need!**\n\nLet me create your listing...\n\n<LISTING_PREVIEW>{"title": "Property for Sale", "description": "Great property in prime location with excellent features.", "ready_to_publish": true}</LISTING_PREVIEW>\n\nReady to publish?`,
      suggestions: ["Publish now", "Edit details", "Add photos", "Preview listing"]
    };
  }

  return null;
}

export class MockOpenRouterService {
  private currentModel: OpenRouterModel;
  private messageHistory: OpenRouterMessage[] = [];
  private conversationContext: {
    isListingMode: boolean;
    collectedData: Record<string, any>;
  } = { isListingMode: false, collectedData: {} };

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

    // Check if entering listing mode
    if (lowerMessage.includes('sell') || lowerMessage.includes('list my') || lowerMessage.includes('post my')) {
      this.conversationContext.isListingMode = true;
    }

    // In listing mode, check for context-aware responses
    if (this.conversationContext.isListingMode) {
      const contextResponse = getListingContextResponse(userMessage);
      if (contextResponse) {
        return contextResponse;
      }
    }

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
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
      onChunk(chunks[i] + (i < chunks.length - 1 ? ' ' : ''));
    }
  }
}