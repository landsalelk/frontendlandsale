import { OpenRouterService, OpenRouterMessage, OPENROUTER_MODELS, OpenRouterModel } from './openRouterService';
import { MockOpenRouterService } from './mockOpenRouterService';
import { PropertyListingService, PropertyDraft } from './propertyListingService';
import { base64ToUint8Array, pcmToWav, arrayBufferToBase64 } from "../utils/audio";

// Extended system prompt for natural language property listing
const PROPERTY_AGENT_SYSTEM_PROMPT = `You are Priya, a friendly and professional Sri Lankan Real Estate Agent working for LandSale.lk. You help users buy, sell, and list properties in Sri Lanka.

YOUR PERSONALITY:
- Warm, approachable, and professional like a trusted local agent
- You speak naturally, using simple English with occasional Sinhala/Tamil greetings
- You're knowledgeable about Sri Lankan property markets, districts, and pricing
- You use emojis tastefully to make conversations friendly 🏡

LISTING CREATION MODE:
When a user wants to sell or list a property, guide them naturally through these steps:
1. **Property Type** - Ask what they're selling (land, house, apartment, etc.)
2. **Location** - Get the district and city/area in Sri Lanka
3. **Size** - Get land size in perches/acres or house size
4. **Price** - Get their asking price (in LKR, lakhs, or millions)
5. **Features** - Road access, utilities, amenities, views, etc.
6. **Contact** - Their phone number for buyers

EXTRACTION TAGS:
When you identify property information from the user's message, include it in these tags:
<PROPERTY_DATA>
{
  "property_type": "land|house|apartment|condo|townhouse",
  "land_size": number,
  "land_unit": "perches|acres|square_feet",
  "price": number,
  "price_unit": "total|per_perch|per_acre",
  "district": "string",
  "city": "string",
  "location": "string",
  "bedrooms": number,
  "bathrooms": number,
  "features": ["feature1", "feature2"],
  "contact_phone": "string"
}
</PROPERTY_DATA>

Only include fields that you can extract from the user's message. Partial data is fine.

LISTING SUMMARY:
When you have enough info (at least property type, location, and price), generate a listing preview:
<LISTING_PREVIEW>
{
  "title": "Auto-generated title",
  "description": "Auto-generated description",
  "ready_to_publish": true|false
}
</LISTING_PREVIEW>

CONVERSATION EXAMPLES:

User: "I want to sell my land"
You: "Great! I'd love to help you list your land! 🏡 Let me gather some details. Where is your land located? (District and city/area)"

User: "It's a 20 perch land in Colombo, Nugegoda area"
You: "Excellent location in Nugegoda, Colombo! 📍 That's a prime residential area. What's your asking price for this 20 perch land?"
<PROPERTY_DATA>{"property_type": "land", "land_size": 20, "land_unit": "perches", "district": "Colombo", "city": "Nugegoda"}</PROPERTY_DATA>

User: "I'm thinking 5 million, it has road access and electricity"
You: "Rs. 5,000,000 is competitive for Nugegoda! ✨ Road access and electricity are great selling points. Let me create your listing..."
<PROPERTY_DATA>{"price": 5000000, "price_unit": "total", "features": ["Road Access", "Electricity"]}</PROPERTY_DATA>
<LISTING_PREVIEW>{"title": "20 Perch Land for Sale in Nugegoda, Colombo", "description": "Beautiful 20 perch land for sale in prime Nugegoda area. Features road access and electricity. Asking price Rs. 5,000,000.", "ready_to_publish": true}</LISTING_PREVIEW>

PROPERTY SEARCH MODE:
When users want to buy or search for properties, provide helpful listings:
<PROPERTIES>
[{"id": "1", "price": "Rs. 5,000,000", "address": "Nugegoda, Colombo", "specs": "20 Perches • Flat Land • Road Access", "image": "https://images.unsplash.com/photo-1600596542815-e32c21216f3d?w=400"}]
</PROPERTIES>

SUGGESTIONS:
Always end with 3 quick reply suggestions relevant to the context:
<SUGGESTIONS>["Suggestion 1", "Suggestion 2", "Suggestion 3"]</SUGGESTIONS>

SRI LANKAN CONTEXT:
- Common land measurements: Perches (most common), Acres, Square Feet
- Price formats: "5 million", "50 lakhs", "Rs. 5,000,000", "LKR 5M"
- Popular districts: Colombo, Gampaha, Kandy, Galle, Negombo, Kurunegala
- Property features: Road frontage, electricity, water, flat land, scenic views

Remember: Be helpful, guide users naturally, and make listing their property as easy as chatting with a friend!`;

export class ChatService {
  private openRouter: OpenRouterService;
  private mockService: MockOpenRouterService;
  private propertyListingService: PropertyListingService;
  private messageHistory: OpenRouterMessage[] = [];
  private currentModel: string;
  private useMockService: boolean = false;
  private isListingMode: boolean = false;

  constructor() {
    this.openRouter = new OpenRouterService(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);
    this.mockService = new MockOpenRouterService(OPENROUTER_MODELS.CLAUDE_3_HAIKU_FREE);
    this.propertyListingService = new PropertyListingService();
    this.currentModel = OPENROUTER_MODELS.CLAUDE_3_HAIKU_FREE;
    this.initChat();
  }

  setModel(model: keyof typeof OPENROUTER_MODELS) {
    this.currentModel = OPENROUTER_MODELS[model];
    this.openRouter.setModel(this.currentModel as OpenRouterModel);
    this.mockService.setModel(this.currentModel as OpenRouterModel);
    this.initChat();
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  getPropertyDraft(): PropertyDraft {
    return this.propertyListingService.getDraft();
  }

  isInListingMode(): boolean {
    return this.isListingMode;
  }

  initChat() {
    this.openRouter.initChat(PROPERTY_AGENT_SYSTEM_PROMPT);
    this.messageHistory = [];
    this.isListingMode = false;
    this.propertyListingService.resetConversation();

    // Add initial greeting
    this.messageHistory.push({
      role: 'assistant',
      content: `Ayubowan! 🙏 I'm Priya, your personal real estate assistant at LandSale.lk! 🏡

Whether you're looking to **buy** your dream property or **sell** your land, I'm here to help make it simple and easy.

What would you like to do today?

<SUGGESTIONS>["I want to sell my land", "Show me properties", "I need help buying"]</SUGGESTIONS>`
    });
  }

  // Parse and extract property data from AI response
  private parsePropertyData(response: string): Partial<PropertyDraft> | null {
    const match = response.match(/<PROPERTY_DATA>([\s\S]*?)<\/PROPERTY_DATA>/);
    if (match) {
      try {
        const data = JSON.parse(match[1].trim());
        return data;
      } catch (e) {
        console.error('Failed to parse property data:', e);
      }
    }
    return null;
  }

  // Parse listing preview from AI response
  private parseListingPreview(response: string): { title: string; description: string; ready_to_publish: boolean } | null {
    const match = response.match(/<LISTING_PREVIEW>([\s\S]*?)<\/LISTING_PREVIEW>/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e) {
        console.error('Failed to parse listing preview:', e);
      }
    }
    return null;
  }

  // Clean response text by removing all tags
  private cleanResponseText(response: string): string {
    return response
      .replace(/<PROPERTY_DATA>[\s\S]*?<\/PROPERTY_DATA>/g, '')
      .replace(/<LISTING_PREVIEW>[\s\S]*?<\/LISTING_PREVIEW>/g, '')
      .replace(/<SUGGESTIONS>[\s\S]*?<\/SUGGESTIONS>/g, '')
      .replace(/<PROPERTIES>[\s\S]*?<\/PROPERTIES>/g, '')
      .replace(/<GENERATE_IMAGE>[\s\S]*?<\/GENERATE_IMAGE>/g, '')
      .replace(/<EDIT_IMAGE>[\s\S]*?<\/EDIT_IMAGE>/g, '')
      .trim();
  }

  private async generateSpeech(text: string): Promise<string | undefined> {
    try {
      console.log('Speech generation requested:', text ?? 'No text provided');
      return undefined;
    } catch (error) {
      console.error('Failed to generate speech:', error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  public async generateImage(prompt: string, attachment?: { mimeType: string; data: string }): Promise<string | undefined> {
    try {
      let imagePrompt = prompt;

      if (attachment) {
        const analysis = await this.openRouter.analyzeImage(attachment.data, `Analyze this image and then: ${prompt}`);
        imagePrompt = analysis;
      }

      console.log('Image generation requested:', imagePrompt ?? 'No prompt provided');
      return undefined;

    } catch (error) {
      console.error('Image generation/editing failed:', error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  async sendMessage(text: string, attachment?: { mimeType: string; data: string }): Promise<{
    text: string;
    audio?: string;
    propertyData?: Partial<PropertyDraft>;
    listingPreview?: { title: string; description: string; ready_to_publish: boolean };
    isListingMode?: boolean;
  }> {
    try {
      // Check if entering listing mode
      const lowerText = text.toLowerCase();
      if (lowerText.includes('sell') || lowerText.includes('list my') || lowerText.includes('post my')) {
        this.isListingMode = true;
      }

      // If in listing mode, also extract property info locally
      if (this.isListingMode) {
        const extractedInfo = this.propertyListingService.extractPropertyInfo(text);
        if (Object.keys(extractedInfo).length > 0) {
          this.propertyListingService.updateDraft(extractedInfo);
        }
      }

      // Add user message to history
      this.messageHistory.push({
        role: 'user',
        content: text
      });

      // Prepare messages for OpenRouter
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: PROPERTY_AGENT_SYSTEM_PROMPT
        },
        ...this.messageHistory.slice(-10)
      ];

      // Handle attachment if present
      if (attachment) {
        if (attachment.mimeType.startsWith('image/')) {
          try {
            const imageAnalysis = await this.openRouter.analyzeImage(
              attachment.data,
              `Please analyze this property image and describe what you see, focusing on real estate aspects like land features, buildings, surroundings, condition, etc.`
            );

            const lastMessage = messages[messages.length - 1];
            if (typeof lastMessage.content === 'string') {
              lastMessage.content += `\n\n[Image Analysis: ${imageAnalysis}]`;
            }
          } catch (e) {
            console.warn('Image analysis failed:', e);
          }
        }
      }

      let responseText: string;

      try {
        console.log('🤖 Attempting to use OpenRouter API...');
        const response = await this.openRouter.sendMessage(messages);
        responseText = response;
        this.useMockService = false;
        console.log('✅ OpenRouter API succeeded');
      } catch (openRouterError) {
        console.warn('❌ OpenRouter API failed, falling back to mock service:', openRouterError instanceof Error ? openRouterError.message : String(openRouterError));
        this.useMockService = true;

        const mockResponse = await this.mockService.sendMessage(messages);
        responseText = mockResponse;
        console.log('✅ Mock service fallback succeeded');
      }

      // Add assistant response to history
      this.messageHistory.push({
        role: 'assistant',
        content: responseText
      });

      // Parse property data from response
      const propertyData = this.parsePropertyData(responseText);
      if (propertyData && this.isListingMode) {
        this.propertyListingService.updateDraft(propertyData);
      }

      // Parse listing preview
      const listingPreview = this.parseListingPreview(responseText);

      // Clean the response text
      const cleanText = this.cleanResponseText(responseText);

      // Generate audio for the response
      let audioData: string | undefined = undefined;
      if (cleanText) {
        audioData = await this.generateSpeech(cleanText);
      }

      return {
        text: responseText,
        audio: audioData,
        propertyData: propertyData || undefined,
        listingPreview: listingPreview || undefined,
        isListingMode: this.isListingMode
      };

    } catch (error) {
      console.error('Error sending message:', error instanceof Error ? error.message : String(error));
      return {
        text: "I'm sorry, I'm having trouble processing your request. Please try again. 🙏",
        audio: undefined
      };
    }
  }

  async sendMessageStream(text: string, onChunk: (chunk: string) => void, attachment?: { mimeType: string; data: string }): Promise<void> {
    try {
      this.messageHistory.push({
        role: 'user',
        content: text
      });

      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: PROPERTY_AGENT_SYSTEM_PROMPT
        },
        ...this.messageHistory.slice(-10)
      ];

      if (attachment && attachment.mimeType.startsWith('image/')) {
        try {
          const imageAnalysis = await this.openRouter.analyzeImage(
            attachment.data,
            `Please analyze this property image and describe what you see.`
          );

          const lastMessage = messages[messages.length - 1];
          if (typeof lastMessage.content === 'string') {
            lastMessage.content += `\n\n[Image Analysis: ${imageAnalysis}]`;
          }
        } catch (imageError) {
          console.warn('Image analysis failed, continuing without it:', imageError);
        }
      }

      try {
        await this.openRouter.sendMessageWithStream(messages, (chunk) => {
          onChunk(chunk);
        });
        this.useMockService = false;
      } catch (openRouterError) {
        console.warn('OpenRouter streaming failed, falling back to mock service:', openRouterError);
        this.useMockService = true;

        await this.mockService.sendMessageStream(messages, (chunk) => {
          onChunk(chunk);
        });
      }

    } catch (error) {
      console.error('Error in streaming message:', error);
      onChunk("I'm sorry, I'm having trouble processing your request. 🙏");
    }
  }

  // Publish the current property listing with images
  async publishListing(userId: string, imageUrls?: string[]): Promise<{ success: boolean; propertyId?: string; url?: string; error?: string }> {
    // Add images to draft if provided
    if (imageUrls && imageUrls.length > 0) {
      this.propertyListingService.updateDraft({ images: imageUrls });
    }
    return this.propertyListingService.publishListing(userId);
  }

  // Get listing summary
  getListingSummary(): string {
    return this.propertyListingService.generateListingSummary();
  }

  // Check if listing is ready
  isListingReady(): boolean {
    return this.propertyListingService.isReadyToPublish();
  }

  getMessageHistory(): OpenRouterMessage[] {
    return [...this.messageHistory];
  }

  clearHistory(): void {
    this.messageHistory = [];
    this.isListingMode = false;
    this.propertyListingService.resetConversation();
    this.initChat();
  }

  getAvailableModels(): typeof OPENROUTER_MODELS {
    return OPENROUTER_MODELS;
  }
}

export default ChatService;