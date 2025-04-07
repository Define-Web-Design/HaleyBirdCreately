
import { toast } from '@/hooks/use-toast';

interface OpenAIOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

class OpenAIClient {
  private apiKey: string;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('OpenAI API key is missing. Set VITE_OPENAI_API_KEY in your .env.local file');
    }
  }

  /**
   * Generate text using OpenAI's completion API
   */
  async generateText(prompt: string, options: OpenAIOptions = {}): Promise<string> {
    if (!this.apiKey) {
      toast({
        title: 'API key missing',
        description: 'OpenAI API key is required to generate text',
        variant: 'destructive',
      });
      return 'API key is required';
    }

    try {
      const defaultOptions: OpenAIOptions = {
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 500,
      };

      const mergedOptions = { ...defaultOptions, ...options };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: mergedOptions.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.max_tokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate text');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating text with OpenAI:', error);
      throw error;
    }
  }

  /**
   * Generate structured data using OpenAI
   */
  async generateStructuredData<T>(prompt: string, systemPrompt: string = '', options: OpenAIOptions = {}): Promise<T> {
    if (!this.apiKey) {
      toast({
        title: 'API key missing',
        description: 'OpenAI API key is required to generate structured data',
        variant: 'destructive',
      });
      throw new Error('API key is required');
    }

    try {
      const defaultOptions: OpenAIOptions = {
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 1000,
      };

      const mergedOptions = { ...defaultOptions, ...options };

      // Create system message that enforces JSON output
      const finalSystemPrompt = 
        `${systemPrompt}\nYou must respond with valid JSON only, no other text.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: mergedOptions.model,
          messages: [
            { role: 'system', content: finalSystemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.max_tokens,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate structured data');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{}';
      
      // Parse JSON response
      return JSON.parse(content) as T;
    } catch (error) {
      console.error('Error generating JSON from OpenAI:', error);
      throw new Error('Failed to generate valid JSON response');
    }
  }

  /**
   * Analyze image using OpenAI Vision API
   */
  async analyzeImage(imageUrl: string, prompt: string): Promise<string> {
    if (!this.apiKey) {
      toast({
        title: 'API key missing',
        description: 'OpenAI API key is required to analyze images',
        variant: 'destructive',
      });
      return 'API key is required';
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl } }
              ]
            }
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to analyze image');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error analyzing image with OpenAI:', error);
      throw error;
    }
  }
}

// Create and export a default instance
const openai = new OpenAIClient();
export default openai;
