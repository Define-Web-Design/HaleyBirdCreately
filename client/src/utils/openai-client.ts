import { toast } from '@/hooks/use-toast';
import { ServiceRegistry } from '@/server/services/registry';

// OpenAI API types
export interface OpenAICompletionRequest {
  model: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenAIChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenAIResponse {
  id: string;
  choices: Array<{
    message?: {
      content: string;
      role: string;
    };
    text?: string;
    index: number;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// OpenAI client class
class OpenAIClient {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    // Try to get API key from constructor parameter first
    if (apiKey) {
      this.apiKey = apiKey;
      return;
    }

    // Then try to get from environment
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (envApiKey) {
      this.apiKey = envApiKey;
    }
  }

  // Set API key after construction
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  // Check if API key is set
  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  // Generate text completion
  public async createCompletion(request: OpenAICompletionRequest): Promise<OpenAIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not set');
    }

    try {
      const response = await fetch(`${this.baseUrl}/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenAI completion error:', error);
      throw error;
    }
  }

  // Generate chat completion
  public async createChatCompletion(request: OpenAIChatCompletionRequest): Promise<OpenAIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not set');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenAI chat completion error:', error);
      throw error;
    }
  }

  // Generate color palette based on text description
  public async generateColorPalette(description: string, count: number = 5): Promise<string[]> {
    try {
      const prompt = `Generate a color palette of ${count} colors based on the following description: "${description}". Return only a JSON array of hex color codes.`;

      const completion = await this.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a color palette generator. Respond only with JSON arrays of hex color codes.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      const content = completion.choices[0]?.message?.content || '';

      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        try {
          const colorArray = JSON.parse(jsonMatch[0]);
          if (Array.isArray(colorArray) && colorArray.every(color => typeof color === 'string')) {
            return colorArray;
          }
        } catch (e) {
          console.error('Failed to parse color palette JSON:', e);
        }
      }

      // Fallback extraction method - look for hex codes
      const hexCodes = content.match(/#[0-9A-Fa-f]{6}/g) || [];
      return hexCodes.slice(0, count);
    } catch (error) {
      console.error('Color palette generation error:', error);
      // Return default palette if generation fails
      return ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'].slice(0, count);
    }
  }
}

// Create singleton instance
const openAIClient = new OpenAIClient();

// Register with service registry if available
try {
  const registry = ServiceRegistry.getInstance();
  registry.registerService('openAIClient', openAIClient);
} catch (error) {
  console.log('Service registry not available in this context');
}

export default openAIClient;