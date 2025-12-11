import axios from 'axios';

// OpenRouter API Configuration
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Available models on OpenRouter
export const OPENROUTER_MODELS = {
  // Free/Cheap Models (Recommended for development)
  CLAUDE_3_HAIKU_FREE: 'anthropic/claude-3-haiku',
  LLAMA_3_8B_FREE: 'meta-llama/llama-3.1-8b-instruct',
  WIZARDLM_FREE: 'microsoft/wizardlm-2-8x22b',
  GPT35_TURBO_FREE: 'openai/gpt-3.5-turbo',
  
  // Premium Models
  GPT4: 'openai/gpt-4',
  GPT4_TURBO: 'openai/gpt-4-turbo',
  GPT35_TURBO: 'openai/gpt-3.5-turbo',
  CLAUDE_3_OPUS: 'anthropic/claude-3-opus-20240229',
  CLAUDE_3_SONNET: 'anthropic/claude-3-sonnet',
  CLAUDE_3_HAIKU: 'anthropic/claude-3-haiku',
  
  // Note: Google Gemini models may not be available on all OpenRouter plans
  GEMINI_FLASH: 'google/gemini-flash-1.5-8b',
  GEMINI_PRO: 'google/gemini-pro',
  GEMINI_PRO_VISION: 'google/gemini-pro-vision',
  
  LLAMA_3_70B: 'meta-llama/llama-3-70b-instruct',
  LLAMA_3_8B: 'meta-llama/llama-3-8b-instruct',
  MIXTRAL_8X7B: 'mistralai/mixtral-8x7b-instruct',
  // Vision models
  GPT4_VISION: 'openai/gpt-4-vision-preview',
  CLAUDE_3_OPUS_VISION: 'anthropic/claude-3-opus-20240229',
} as const;

export type OpenRouterModel = typeof OPENROUTER_MODELS[keyof typeof OPENROUTER_MODELS];

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string; detail?: 'auto' | 'low' | 'high' };
  }>;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private apiKey: string;
  private baseURL: string;
  private currentModel: OpenRouterModel;
  private messageHistory: OpenRouterMessage[] = [];

  constructor(apiKey: string = OPENROUTER_API_KEY || '', model: OpenRouterModel = OPENROUTER_MODELS.CLAUDE_3_SONNET) {
    this.apiKey = apiKey;
    this.baseURL = OPENROUTER_BASE_URL;
    this.currentModel = model;
  }

  setModel(model: OpenRouterModel) {
    this.currentModel = model;
  }

  getModel(): OpenRouterModel {
    return this.currentModel;
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    try {
      const response = await axios({
        method: 'POST',
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Landsale.lk AI Assistant',
          'Content-Type': 'application/json',
        },
        data,
      });

      return response.data;
    } catch (error: any) {
      console.error('OpenRouter API Error:', error.response?.data || error.message);
      throw new Error(`OpenRouter API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async sendMessage(messages: OpenRouterMessage[]): Promise<string> {
    const response = await this.makeRequest('/chat/completions', {
      model: this.currentModel,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return response.choices[0]?.message?.content || '';
  }

  async sendMessageWithStream(messages: OpenRouterMessage[], onChunk: (chunk: string) => void): Promise<void> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Landsale.lk AI Assistant',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.currentModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body available');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Vision support for image analysis
  async analyzeImage(imageData: string, prompt: string): Promise<string> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageData}`
            }
          }
        ]
      }
    ];

    const response = await this.makeRequest('/chat/completions', {
      model: OPENROUTER_MODELS.CLAUDE_3_OPUS_VISION, // Use vision-capable model
      messages: messages,
      temperature: 0.3,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || '';
  }

  // Initialize chat with system prompt
  initChat(systemPrompt?: string): void {
    this.messageHistory = [];
    if (systemPrompt) {
      this.messageHistory.push({
        role: 'system',
        content: systemPrompt
      });
    }
  }

  // Add message to history
  addMessage(role: 'user' | 'assistant', content: string): void {
    this.messageHistory.push({
      role,
      content
    });
  }

  // Get current message history
  getMessageHistory(): OpenRouterMessage[] {
    return [...this.messageHistory];
  }

  // Clear message history
  clearHistory(): void {
    this.messageHistory = [];
  }
}

export default OpenRouterService;