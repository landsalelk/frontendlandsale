import { OpenRouterService, OpenRouterMessage, OPENROUTER_MODELS, OpenRouterModel } from './openRouterService';
import { base64ToUint8Array, pcmToWav, arrayBufferToBase64 } from "../utils/audio";

export class ChatService {
  private openRouter: OpenRouterService;
  private messageHistory: OpenRouterMessage[] = [];
  private currentModel: string;

  constructor() {
    this.openRouter = new OpenRouterService(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);
    this.currentModel = OPENROUTER_MODELS.CLAUDE_3_HAIKU_FREE;
    this.initChat();
  }

  setModel(model: keyof typeof OPENROUTER_MODELS) {
    this.currentModel = OPENROUTER_MODELS[model];
    this.openRouter.setModel(this.currentModel as OpenRouterModel);
    this.initChat(); // Reinitialize with new model
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  initChat() {
    const systemPrompt = `You are Priya, a friendly and professional Real Estate Agent. Help users with buying, selling, or renting properties. You can analyze images of properties or review PDF documents like contracts or brochures. Keep responses concise and helpful, suitable for a WhatsApp-style chat. Use emojis occasionally.

        CRITICAL REQUIREMENT: You MUST include 3 suggested responses for the user at the end of EVERY message. These suggestions should be:
        1. Relevant to the current context.
        2. Short (1-4 words).
        3. Written from the user's perspective (e.g., "Show me photos", "Yes, please").

        IMAGE GENERATION & EDITING:
        - If the user asks to design a flyer, create an image, or visualize a concept, output the prompt inside <GENERATE_IMAGE> tags.
          Example: <GENERATE_IMAGE>Modern real estate flyer for a luxury open house, gold typography, dark background</GENERATE_IMAGE>
        - If the user sends an image and asks to edit it (e.g., "add a retro filter", "remove the chair"), output the editing instructions inside <EDIT_IMAGE> tags.
          Example: <EDIT_IMAGE>Add a warm retro filter to the image</EDIT_IMAGE>

        PROPERTY LISTINGS:
        If the user asks to see properties, recommendations, or listings, you MUST include a structured JSON array of 2-3 properties wrapped in <PROPERTIES> tags.
        Use realistic data and always use these specific Unsplash Image URLs for the images (rotate through them):
        - https://images.unsplash.com/photo-1600596542815-e32c21216f3d?w=400
        - https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400
        - https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400
        - https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400
        - https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400

        FORMAT FOR PROPERTIES:
        <PROPERTIES>
        [
          {
            "id": "1",
            "price": "$1,200,000",
            "address": "123 Maple Drive, Beverly Hills",
            "specs": "4 Bed • 3 Bath • 2,500 sqft",
            "image": "https://images.unsplash.com/photo-1600596542815-e32c21216f3d?w=400"
          }
        ]
        </PROPERTIES>

        GENERAL FORMAT:
        [Your response text]
        [Optional: <GENERATE_IMAGE>...</GENERATE_IMAGE>]
        [Optional: <PROPERTIES>...</PROPERTIES>]
        <SUGGESTIONS>["Suggestion 1", "Suggestion 2", "Suggestion 3"]</SUGGESTIONS>
        `;

    this.openRouter.initChat(systemPrompt);
    this.messageHistory = [];
    
    // Add initial greeting
    this.messageHistory.push({
      role: 'assistant',
      content: "Hello! I'm Priya, your personal Real Estate AI. 🏡 How can I assist you today?\n\n<SUGGESTIONS>[\"I want to buy\", \"I want to sell\", \"Just browsing\"]</SUGGESTIONS>"
    });
  }

  // Helper to generate speech using OpenRouter (if supported by the model)
  private async generateSpeech(text: string): Promise<string | undefined> {
    try {
      // For now, we'll use a simple text-to-speech approach
      // In a production environment, you might want to integrate with a dedicated TTS service
      // or use OpenRouter's audio capabilities when available
      
      // Placeholder - you can integrate with browser's speech synthesis
      // or use a service like ElevenLabs, Azure Speech, etc.
      console.log('Speech generation requested:', text);
      return undefined;
    } catch (error) {
      console.error('Failed to generate speech:', error);
      return undefined;
    }
  }

  // Helper to generate or edit images using OpenRouter
  public async generateImage(prompt: string, attachment?: { mimeType: string; data: string }): Promise<string | undefined> {
    try {
      let imagePrompt = prompt;
      
      // If we have an attachment, this is an edit request
      if (attachment) {
        const analysis = await this.openRouter.analyzeImage(attachment.data, `Analyze this image and then: ${prompt}`);
        imagePrompt = analysis;
      }

      // For image generation, we'll use a text-based approach for now
      // In production, you might want to integrate with DALL-E, Stable Diffusion, etc.
      console.log('Image generation requested:', imagePrompt);
      return undefined;
      
    } catch (error) {
      console.error('Image generation/editing failed:', error);
      return undefined;
    }
  }

  async sendMessage(text: string, attachment?: { mimeType: string; data: string }): Promise<{ text: string, audio?: string }> {
    try {
      // Add user message to history
      this.messageHistory.push({
        role: 'user',
        content: text
      });

      // Prepare messages for OpenRouter
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: `You are Priya, a friendly and professional Real Estate Agent. Help users with buying, selling, or renting properties. You can analyze images of properties or review PDF documents like contracts or brochures. Keep responses concise and helpful, suitable for a WhatsApp-style chat. Use emojis occasionally.

        CRITICAL REQUIREMENT: You MUST include 3 suggested responses for the user at the end of EVERY message. These suggestions should be:
        1. Relevant to the current context.
        2. Short (1-4 words).
        3. Written from the user's perspective (e.g., "Show me photos", "Yes, please").

        IMAGE GENERATION & EDITING:
        - If the user asks to design a flyer, create an image, or visualize a concept, output the prompt inside <GENERATE_IMAGE> tags.
          Example: <GENERATE_IMAGE>Modern real estate flyer for a luxury open house, gold typography, dark background</GENERATE_IMAGE>
        - If the user sends an image and asks to edit it (e.g., "add a retro filter", "remove the chair"), output the editing instructions inside <EDIT_IMAGE> tags.
          Example: <EDIT_IMAGE>Add a warm retro filter to the image</EDIT_IMAGE>

        PROPERTY LISTINGS:
        If the user asks to see properties, recommendations, or listings, you MUST include a structured JSON array of 2-3 properties wrapped in <PROPERTIES> tags.
        Use realistic data and always use these specific Unsplash Image URLs for the images (rotate through them):
        - https://images.unsplash.com/photo-1600596542815-e32c21216f3d?w=400
        - https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400
        - https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400
        - https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400
        - https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400`
        },
        ...this.messageHistory.slice(-10) // Keep last 10 messages for context
      ];

      // Handle attachment if present
      if (attachment) {
        // For image attachments, add vision capabilities
        if (attachment.mimeType.startsWith('image/')) {
          const imageAnalysis = await this.openRouter.analyzeImage(
            attachment.data,
            `Please analyze this image and describe what you see, focusing on any real estate-related aspects.`
          );
          
          // Add image analysis to the last user message
          const lastMessage = messages[messages.length - 1];
          if (typeof lastMessage.content === 'string') {
            lastMessage.content += `\n\n[Image Analysis: ${imageAnalysis}]`;
          }
        }
      }

      // Send message to OpenRouter
      const responseText = await this.openRouter.sendMessage(messages);

      // Add assistant response to history
      this.messageHistory.push({
        role: 'assistant',
        content: responseText
      });

      // Generate audio for the response
      const textToSpeak = responseText
        .replace(/<SUGGESTIONS>.*?<\/SUGGESTIONS>/s, '')
        .replace(/<PROPERTIES>.*?<\/PROPERTIES>/s, '')
        .replace(/<GENERATE_IMAGE>.*?<\/GENERATE_IMAGE>/s, '')
        .replace(/<EDIT_IMAGE>.*?<\/EDIT_IMAGE>/s, '')
        .trim();
      
      let audioData: string | undefined = undefined;
      
      if (textToSpeak) {
        audioData = await this.generateSpeech(textToSpeak);
      }

      return { 
        text: responseText, 
        audio: audioData
      };
      
    } catch (error) {
      console.error('Error sending message:', error);
      return { 
        text: "I'm sorry, I'm having trouble processing your request. Please try again.",
        audio: undefined
      };
    }
  }

  // Streaming support for real-time responses
  async sendMessageStream(text: string, onChunk: (chunk: string) => void, attachment?: { mimeType: string; data: string }): Promise<void> {
    try {
      // Add user message to history
      this.messageHistory.push({
        role: 'user',
        content: text
      });

      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: `You are Priya, a friendly and professional Real Estate Agent...`
        },
        ...this.messageHistory.slice(-10)
      ];

      // Handle attachment
      if (attachment && attachment.mimeType.startsWith('image/')) {
        const imageAnalysis = await this.openRouter.analyzeImage(
          attachment.data,
          `Please analyze this image and describe what you see.`
        );
        
        const lastMessage = messages[messages.length - 1];
        if (typeof lastMessage.content === 'string') {
          lastMessage.content += `\n\n[Image Analysis: ${imageAnalysis}]`;
        }
      }

      // Stream the response
      await this.openRouter.sendMessageWithStream(messages, (chunk) => {
        onChunk(chunk);
      });

    } catch (error) {
      console.error('Error in streaming message:', error);
      onChunk("I'm sorry, I'm having trouble processing your request.");
    }
  }

  // Get current message history
  getMessageHistory(): OpenRouterMessage[] {
    return [...this.messageHistory];
  }

  // Clear conversation history
  clearHistory(): void {
    this.messageHistory = [];
    this.initChat();
  }

  // Get available models
  getAvailableModels(): typeof OPENROUTER_MODELS {
    return OPENROUTER_MODELS;
  }
}

export default ChatService;