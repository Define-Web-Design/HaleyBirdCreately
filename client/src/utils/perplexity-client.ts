
import { toast } from '@/hooks/use-toast';

// Perplexity API types
export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityChatCompletionRequest {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface PerplexityResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    index: number;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Perplexity client class
class PerplexityClient {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.perplexity.ai';

  constructor(apiKey?: string) {
    // Try to get API key from constructor parameter first
    if (apiKey) {
      this.apiKey = apiKey;
      return;
    }

    // Then try to get from environment
    const envApiKey = import.meta.env.VITE_PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY;
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

  // Generate chat completion
  public async createChatCompletion(request: PerplexityChatCompletionRequest): Promise<PerplexityResponse> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key is not set');
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
        throw new Error(`Perplexity API Error: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Perplexity chat completion error:', error);
      throw error;
    }
  }

  // Generate text using Perplexity AI
  public async generateText(prompt: string, options = {}): Promise<string> {
    try {
      // Default options
      const defaultOptions = {
        model: 'sonar-medium-online',
        temperature: 0.7,
        max_tokens: 500
      };

      // Merge default options with provided options
      const mergedOptions = { ...defaultOptions, ...options };

      const completion = await this.createChatCompletion({
        model: mergedOptions.model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: mergedOptions.temperature,
        max_tokens: mergedOptions.max_tokens
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating text from Perplexity:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate text. Please check your API key and try again.',
        variant: 'destructive'
      });
      return '';
    }
  }

  // Generate JSON response
  public async generateJsonResponse<T>(
    prompt: string, 
    systemPrompt: string = '', 
    options = {}
  ): Promise<T> {
    try {
      // Default options
      const defaultOptions = {
        model: 'sonar-medium-online',
        temperature: 0.7,
        max_tokens: 1000
      };

      // Merge default options with provided options
      const mergedOptions = { ...defaultOptions, ...options };

      // Create system message that enforces JSON output
      const finalSystemPrompt = 
        `${systemPrompt}\nYou must respond with valid JSON only, no other text.`;

      const completion = await this.createChatCompletion({
        model: mergedOptions.model,
        messages: [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: mergedOptions.temperature,
        max_tokens: mergedOptions.max_tokens
      });

      const content = completion.choices[0]?.message?.content || '{}';
      
      // Parse JSON response
      return JSON.parse(content) as T;
    } catch (error) {
      console.error('Error generating JSON from Perplexity:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate JSON response. Please check your API key and try again.',
        variant: 'destructive'
      });
      throw new Error('Failed to generate valid JSON response');
    }
  }

  // Analyze content using Perplexity AI
  public async analyzeContent(content: string) {
    const prompt = `
      Analyze the following content and provide an assessment of:
      1. The overall sentiment (positive, negative, neutral)
      2. Key topics covered
      3. Important keywords for categorization

      Content: ${content}
    `;

    const systemPrompt = `
      You are an AI content analyst. Provide a JSON response with these fields:
      - sentiment: string (positive, negative, or neutral)
      - topics: string[] (array of main topics)
      - keywords: string[] (array of relevant keywords)
    `;

    return this.generateJsonResponse<{
      sentiment: string;
      topics: string[];
      keywords: string[];
    }>(prompt, systemPrompt);
  }
}

// Create singleton instance
const perplexityClient = new PerplexityClient();

export default perplexityClient;
