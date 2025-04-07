
/**
 * AI Service Integration Layer
 * 
 * This module provides a consistent interface for AI services across
 * web applications and iOS applications using the ServiceRegistry pattern.
 */

import { ServiceRegistry } from '../../server/services/registry';

// Define types for cross-platform compatibility
export interface AIServiceOptions {
  apiKey?: string;
  organization?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  platform?: 'web' | 'ios' | 'mobile';
}

export interface AIResponse<T = any> {
  content: T;
  metadata: {
    model: string;
    processingTime: number;
    tokenCount?: {
      input: number;
      output: number;
      total: number;
    };
    platform: string;
  };
}

// Service definition that works across platforms
export class AIService {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private platform: string;
  
  constructor(options: AIServiceOptions = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || '';
    this.model = options.model || 'gpt-4o';
    this.temperature = options.temperature || 0.7;
    this.maxTokens = options.maxTokens || 500;
    this.platform = options.platform || 'web';
    
    // Register self in the service registry
    const registry = ServiceRegistry.getInstance();
    registry.registerService('ai', this);
  }
  
  /**
   * Generate text using the AI model
   * Compatible with both web and iOS environments
   */
  async generateText(prompt: string): Promise<AIResponse<string>> {
    const startTime = Date.now();
    
    try {
      // Dynamic import to support both environments
      const { default: OpenAI } = await import('openai');
      
      // Create client with proper configuration
      const client = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: this.platform !== 'web', // Enable for iOS, disable for web
      });
      
      // Make the API call
      const response = await client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });
      
      // Extract and return response
      return {
        content: response.choices[0].message.content || '',
        metadata: {
          model: this.model,
          processingTime: Date.now() - startTime,
          tokenCount: {
            input: response.usage?.prompt_tokens || 0,
            output: response.usage?.completion_tokens || 0,
            total: response.usage?.total_tokens || 0
          },
          platform: this.platform
        }
      };
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error(`AI service failed: ${error.message}`);
    }
  }
  
  /**
   * Generate image from text prompt
   * Compatible with both web and iOS environments
   */
  async generateImage(prompt: string, size = '1024x1024'): Promise<AIResponse<string>> {
    const startTime = Date.now();
    
    try {
      // Dynamic import to support both environments
      const { default: OpenAI } = await import('openai');
      
      // Create client with proper configuration
      const client = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: this.platform !== 'web', // Enable for iOS, disable for web
      });
      
      // Make the API call
      const response = await client.images.generate({
        prompt,
        n: 1,
        size: size as any,
        response_format: 'url'
      });
      
      // Extract and return image URL
      return {
        content: response.data[0].url || '',
        metadata: {
          model: 'dall-e-3',
          processingTime: Date.now() - startTime,
          platform: this.platform
        }
      };
    } catch (error) {
      console.error('AI image generation error:', error);
      throw new Error(`AI image generation failed: ${error.message}`);
    }
  }
}

// Factory function to get a correctly configured service
export function getAIService(options: AIServiceOptions = {}): AIService {
  const registry = ServiceRegistry.getInstance();
  
  // Return existing service or create a new one
  if (registry.hasService('ai')) {
    return registry.getService<AIService>('ai');
  }
  
  return new AIService(options);
}
