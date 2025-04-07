
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
import { OpenAI } from 'openai';

// OpenAI client configuration
const createOpenAIClient = () => {
  // Check for API key in environment
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key is not set. Set VITE_OPENAI_API_KEY in your environment.');
    return null;
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Note: For production, API requests should go through your backend
  });
};

// Singleton instance
let openaiClient: OpenAI | null = null;

export const getOpenAIClient = (): OpenAI | null => {
  if (!openaiClient) {
    openaiClient = createOpenAIClient();
  }
  return openaiClient;
};

// Example function to generate text with OpenAI
export const generateText = async (prompt: string): Promise<string> => {
  const client = getOpenAIClient();
  
  if (!client) {
    throw new Error('OpenAI client is not initialized. Check your API key.');
  }
  
  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
    });
    
    return response.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('Error generating text with OpenAI:', error);
    throw error;
  }
};

// Function to generate color palette from description
export const generateColorPalette = async (description: string): Promise<string[]> => {
  const client = getOpenAIClient();
  
  if (!client) {
    throw new Error('OpenAI client is not initialized. Check your API key.');
  }
  
  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a color palette generator. Respond only with an array of 5 hex color codes based on the given description." 
        },
        { role: "user", content: `Generate a color palette for: ${description}` }
      ],
      max_tokens: 100,
    });
    
    const content = response.choices[0]?.message?.content || '[]';
    // Parse the hex color codes from the response
    const hexCodes = content.match(/#[0-9A-Fa-f]{6}/g) || [];
    
    return hexCodes.slice(0, 5); // Return up to 5 colors
  } catch (error) {
    console.error('Error generating color palette with OpenAI:', error);
    throw error;
  }
};
