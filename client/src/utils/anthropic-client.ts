
import { toast } from '@/hooks/use-toast';
import { ServiceRegistry } from '@/server/services/registry';

// Anthropic API types
export interface AnthropicMessageRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  system?: string;
  response_format?: { type: string };
}

export interface AnthropicCompletionRequest {
  model: string;
  prompt: string;
  max_tokens_to_sample?: number;
  temperature?: number;
}

export interface AnthropicResponse {
  id: string;
  content: Array<{
    text: string;
    type: string;
  }>;
  model: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Anthropic client class
class AnthropicClient {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.anthropic.com';
  private apiVersion = '2023-06-01';

  constructor(apiKey?: string) {
    // Try to get API key from constructor parameter first
    if (apiKey) {
      this.apiKey = apiKey;
      return;
    }

    // Then try to get from environment
    const envApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
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

  // Legacy text completion API (older Claude API)
  public async createCompletion(request: AnthropicCompletionRequest): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key is not set');
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.apiVersion
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.completion;
    } catch (error) {
      console.error('Anthropic completion error:', error);
      throw error;
    }
  }

  // Modern Claude messages API
  public async createChatCompletion(request: AnthropicMessageRequest): Promise<AnthropicResponse> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key is not set');
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.apiVersion
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API Error: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Anthropic chat completion error:', error);
      throw error;
    }
  }

  // Generate color palette based on text description using Claude
  public async generateColorPalette(description: string, count: number = 5): Promise<string[]> {
    try {
      const systemPrompt = "You are a color palette generator. Respond only with JSON arrays of hex color codes.";
      const prompt = `Generate a color palette of ${count} colors based on the following description: "${description}". Return only a JSON array of hex color codes.`;

      const completion = await this.createChatCompletion({
        model: 'claude-3-opus-20240229',
        messages: [
          { role: 'user', content: prompt }
        ],
        system: systemPrompt,
        temperature: 0.7,
        max_tokens: 150,
        response_format: { type: 'json_object' }
      });

      const content = completion.content[0]?.text || '';

      // Try to extract JSON array from the response
      try {
        const parsedContent = JSON.parse(content);
        if (Array.isArray(parsedContent)) {
          return parsedContent;
        } else if (Array.isArray(parsedContent.colors)) {
          return parsedContent.colors;
        }
      } catch (e) {
        console.error('Failed to parse color palette JSON:', e);
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

  // Analyze content using Claude
  public async analyzeContent(content: string): Promise<any> {
    try {
      const systemPrompt = `
      You are an AI content analyst. Provide a JSON response with these fields:
      - sentiment: string (positive, negative, or neutral)
      - topics: string[] (array of main topics)
      - keywords: string[] (array of relevant keywords)
      `;

      const prompt = `
      Analyze the following content and provide an assessment of:
      1. The overall sentiment (positive, negative, neutral)
      2. Key topics covered
      3. Important keywords for categorization

      Content: ${content}
      `;

      const response = await this.createChatCompletion({
        model: 'claude-3-opus-20240229',
        messages: [
          { role: 'user', content: prompt }
        ],
        system: systemPrompt,
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.content[0].text);
      return result;
    } catch (error) {
      console.error('Content analysis error:', error);
      return {
        sentiment: 'neutral',
        topics: ['unknown'],
        keywords: ['error']
      };
    }
  }
}

// Create singleton instance
const anthropicClient = new AnthropicClient();

// Register with service registry if available
try {
  const registry = ServiceRegistry.getInstance();
  registry.registerService('anthropicClient', anthropicClient);
} catch (error) {
  console.log('Service registry not available in this context');
}

export default anthropicClient;
