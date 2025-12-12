import { OpenRouterService, OpenRouterMessage } from '@/components/ai-chat/services/openRouterService';
import { PropertyFormValues } from '@/lib/schemas';

export interface AIPropertyData {
  title?: string;
  description?: string;
  price?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  district?: string;
  city?: string;
  address?: string;
  features?: string[];
  images?: string[];
  contactName?: string;
  contactPhone?: string;
  whatsapp?: string;
}

export class PropertyAIService {
  private openRouter: OpenRouterService;

  constructor() {
    this.openRouter = new OpenRouterService(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);
  }

  async extractPropertyData(userInput: string, attachment?: { mimeType: string; data: string }): Promise<AIPropertyData> {
    const systemPrompt = `You are a real estate AI assistant that extracts property listing information from user input.

Extract property details from the user's message and return a structured JSON response.

RESPONSE FORMAT:
Return ONLY a valid JSON object with these fields (omit any you can't determine):
{
  "title": "Property title/listing headline",
  "description": "Detailed property description",
  "price": 25000000, // Price in LKR (remove commas)
  "propertyType": "house|apartment|land|commercial",
  "bedrooms": 3,
  "bathrooms": 2,
  "size": 1500, // Size in square feet
  "district": "Colombo", // Sri Lankan district
  "city": "Rajagiriya", // City/town
  "address": "123 Main Street, Rajagiriya",
  "features": ["parking", "garden", "security"], // Array of features
  "contactName": "John Doe",
  "contactPhone": "+94771234567",
  "whatsapp": "+94771234567"
}

GUIDELINES:
- Extract as much information as possible from the user's input
- Use reasonable defaults for missing information
- Ensure phone numbers include country code (+94 for Sri Lanka)
- Price should be in LKR without commas
- Property type should be one of: house, apartment, land, commercial
- Features should be lowercase, space-separated
- Be conservative - only include information you're confident about

If the user provides an image, analyze it for property details and include those in your response.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput }
    ];

    // Handle image attachment if provided
    if (attachment && attachment.mimeType.startsWith('image/')) {
      const imageAnalysis = await this.openRouter.analyzeImage(
        attachment.data,
        'Analyze this property image and describe what you see - property type, condition, features, etc.'
      );
      
      messages.push({ 
        role: 'user', 
        content: `Also consider this image analysis: ${imageAnalysis}` 
      });
    }

    try {
      const response = await this.openRouter.sendMessage(messages);
      
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {};
    } catch (error) {
      console.error('Failed to extract property data:', error);
      return {};
    }
  }

  async generatePropertyDescription(propertyData: Partial<AIPropertyData>): Promise<string> {
    const systemPrompt = `You are a professional real estate copywriter. Create an engaging property description based on the provided details.

Write a compelling, detailed property description that:
- Highlights key features and benefits
- Uses engaging, professional language
- Includes relevant details about location and amenities
- Is suitable for a property listing website
- Is between 150-300 words

Property Details:
${JSON.stringify(propertyData, null, 2)}`;

    try {
      const response = await this.openRouter.sendMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate a property description based on these details.' }
      ]);
      
      return response.trim();
    } catch (error) {
      console.error('Failed to generate description:', error);
      return '';
    }
  }

  async suggestPropertyTitle(propertyData: Partial<AIPropertyData>): Promise<string> {
    const systemPrompt = `You are a real estate marketing expert. Create an attention-grabbing property title based on the provided details.

Create a concise, engaging title that:
- Is under 80 characters
- Highlights the most attractive features
- Uses keywords that attract buyers
- Is professional and appealing

Property Details:
${JSON.stringify(propertyData, null, 2)}`;

    try {
      const response = await this.openRouter.sendMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate a property title based on these details.' }
      ]);
      
      return response.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
    } catch (error) {
      console.error('Failed to generate title:', error);
      return '';
    }
  }

  validatePropertyData(data: AIPropertyData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length < 10) {
      errors.push('Title should be at least 10 characters long');
    }

    if (!data.description || data.description.trim().length < 50) {
      errors.push('Description should be at least 50 characters long');
    }

    if (!data.price || data.price <= 0) {
      errors.push('Price must be a positive number');
    }

    if (!data.propertyType || !['house', 'apartment', 'land', 'commercial'].includes(data.propertyType)) {
      errors.push('Property type must be house, apartment, land, or commercial');
    }

    if (!data.district || !data.city) {
      errors.push('District and city are required');
    }

    if (!data.contactName || !data.contactPhone) {
      errors.push('Contact name and phone are required');
    }

    if (data.contactPhone && !data.contactPhone.match(/^\+94\d{9}$/)) {
      errors.push('Phone number must be in format +947XXXXXXXX');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  convertToFormData(aiData: AIPropertyData): Partial<PropertyFormValues> {
    return {
      title: aiData.title || '',
      description: aiData.description || '',
      price: aiData.price ? aiData.price / 100 : 0, // Convert from cents
      type: (aiData.propertyType as 'land' | 'house' | 'commercial') || 'house',
      bedrooms: aiData.bedrooms || 0,
      bathrooms: aiData.bathrooms || 0,
      size: aiData.size ? `${aiData.size} sqft` : '', // Convert number to string format
      district: aiData.district || '',
      city: aiData.city || '',
      address: aiData.address || '',
      features: aiData.features || [],
      images: aiData.images || [],
      contactName: aiData.contactName || '',
      contactPhone: aiData.contactPhone || '',
      whatsapp: aiData.whatsapp || '',
      priceNegotiable: false,
    };
  }
}