/**
 * Anthropic Service Adapter
 * 
 * This adapter implements the AIServiceAdapter interface for Anthropic Claude,
 * providing access to Anthropic's models for text generation, chat, and analyzing images.
 */

import { AIServiceAdapter, AIAdapterStatus, AIAdapterMetrics } from './baseAdapter';
import {
  AIChatMessage,
  AIImageGenerationOptions,
  AIRequestOptions,
  AIResponse
} from '../aiTypes';
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../utils/logger';
import { getConfig } from '../../../config/globalConfig';

export interface AnthropicAdapterConfig {
  apiKey?: string;
  baseURL?: string;
  defaultModels?: {
    text?: string;
    chat?: string;
  };
  priority?: number;
}

/**
 * Anthropic Claude adapter implementation
 */
export class AnthropicAdapter implements AIServiceAdapter {
  private client: Anthropic;
  private config: AnthropicAdapterConfig;
  private status: AIAdapterStatus;
  private metrics: AIAdapterMetrics;

  /**
   * Create a new Anthropic adapter
   * @param config Adapter configuration
   */
  constructor(config: AnthropicAdapterConfig = {}) {
    // Get API key from config or env
    const apiKey = config.apiKey || 
      getConfig().ai?.anthropic?.apiKey || 
      process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      this.status = {
        available: false,
        error: 'Anthropic API key not found',
        lastChecked: new Date()
      };
      logger.warn('Anthropic adapter initialized without API key');
    } else {
      this.status = {
        available: true,
        lastChecked: new Date()
      };
    }

    // Initialize client
    this.client = new Anthropic({
      apiKey: apiKey as string,
      baseURL: config.baseURL
    });

    // Store config
    this.config = {
      ...config,
      apiKey,
      defaultModels: {
        text: 'claude-3-7-sonnet-20250219', // The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February, 2025
        chat: 'claude-3-7-sonnet-20250219',
        ...config.defaultModels
      },
      priority: config.priority || 70 // Lower than OpenAI but higher than other providers
    };

    // Initialize metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      lastUsed: null
    };

    logger.info('Anthropic adapter initialized', {
      available: this.status.available,
      models: this.config.defaultModels
    });
  }

  /**
   * Get current status
   * @returns Adapter status
   */
  getStatus(): AIAdapterStatus {
    return { ...this.status };
  }

  /**
   * Test connection to Anthropic
   * @returns Promise resolving to true if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        this.status = {
          available: false,
          error: 'Anthropic API key not found',
          lastChecked: new Date()
        };
        return false;
      }

      // Simple chat completion to test connection
      const result = await this.client.messages.create({
        max_tokens: 10,
        model: this.config.defaultModels?.chat || 'claude-3-7-sonnet-20250219',
        messages: [{ role: 'user', content: 'Hello, are you available?' }],
      });

      if (result && result.id) {
        this.status = {
          available: true,
          lastChecked: new Date()
        };
        logger.info('Anthropic connection test successful');
        return true;
      } else {
        throw new Error('Invalid response from Anthropic');
      }
    } catch (error) {
      this.status = {
        available: false,
        error: error instanceof Error ? error.message : String(error),
        lastChecked: new Date()
      };
      logger.error('Anthropic connection test failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  /**
   * Generate text using Anthropic
   * @param prompt Text prompt
   * @param options Request options
   * @returns Promise resolving to generated text
   */
  async generateText(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<string>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const model = options.model || this.config.defaultModels?.text || 'claude-3-7-sonnet-20250219';
      
      const response = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature,
        system: options.systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0]?.text || '';
      const latency = Date.now() - startTime;
      
      this.updateLatency(latency);
      this.metrics.successfulRequests++;
      this.metrics.lastUsed = new Date();

      return {
        text: content,
        model,
        usage: {
          promptTokens: response.usage?.input_tokens || 0,
          completionTokens: response.usage?.output_tokens || 0,
          totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
        },
        latency
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.metrics.failedRequests++;

      logger.error('Anthropic text generation failed', { 
        error: error instanceof Error ? error.message : String(error),
        prompt: prompt.slice(0, 100) // Log only the beginning of the prompt
      });

      throw new Error(`Anthropic text generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate JSON using Anthropic
   * @param prompt Text prompt
   * @param options Request options
   * @returns Promise resolving to generated JSON
   */
  async generateJson<T>(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<T>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const model = options.model || this.config.defaultModels?.text || 'claude-3-7-sonnet-20250219';
      
      // Enhance the prompt to request JSON output
      const jsonPrompt = `${prompt}\n\nProvide your response as valid JSON without any explanations or markdown formatting.`;
      
      // Add system message to ensure JSON output
      const systemPrompt = options.systemPrompt || '';
      const jsonSystemPrompt = `${systemPrompt ? systemPrompt + '\n' : ''}You must respond with valid JSON only, without any explanation or conversation.`;
      
      const response = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.2, // Lower temperature for more deterministic JSON
        system: jsonSystemPrompt,
        messages: [{ role: 'user', content: jsonPrompt }]
      });

      const content = response.content[0]?.text || '';
      
      // Extract JSON from the response
      let jsonResult: T;
      try {
        // Try to parse the entire response as JSON
        jsonResult = JSON.parse(content);
      } catch (parseError) {
        // If that fails, try to extract JSON using regex
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/```\n([\s\S]*?)\n```/) ||
                          content.match(/\{[\s\S]*\}/);
                          
        if (jsonMatch) {
          try {
            jsonResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch (e) {
            throw new Error('Failed to parse JSON from response');
          }
        } else {
          throw new Error('No valid JSON found in response');
        }
      }

      const latency = Date.now() - startTime;
      
      this.updateLatency(latency);
      this.metrics.successfulRequests++;
      this.metrics.lastUsed = new Date();

      return {
        text: jsonResult as T,
        model,
        usage: {
          promptTokens: response.usage?.input_tokens || 0,
          completionTokens: response.usage?.output_tokens || 0,
          totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
        },
        latency
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.metrics.failedRequests++;

      logger.error('Anthropic JSON generation failed', { 
        error: error instanceof Error ? error.message : String(error),
        prompt: prompt.slice(0, 100) // Log only the beginning of the prompt
      });

      throw new Error(`Anthropic JSON generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get embeddings for text - Not supported by Anthropic
   * @param text Text to get embeddings for
   * @param options Request options
   * @returns Promise resolving to vector embedding
   */
  async getEmbeddings(text: string, options: AIRequestOptions = {}): Promise<AIResponse<number[]>> {
    throw new Error('Embeddings are not supported by the Anthropic API');
  }

  /**
   * Generate image - Not supported by Anthropic
   * @param options Image generation options
   * @returns Promise resolving to image data
   */
  async generateImage(options: AIImageGenerationOptions): Promise<any> {
    throw new Error('Image generation is not supported by the Anthropic API');
  }

  /**
   * Get chat completion
   * @param messages Chat message history
   * @param options Request options
   * @returns Promise resolving to chat completion
   */
  async chatCompletion(messages: AIChatMessage[], options: AIRequestOptions = {}): Promise<AIResponse<AIChatMessage>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Determine model to use
      const model = options.model || this.config.defaultModels?.chat || 'claude-3-7-sonnet-20250219';
      
      // Format messages for Anthropic API
      const formattedMessages = messages.map(msg => {
        return {
          role: msg.role === 'system' ? 'user' : msg.role,
          content: msg.content
        };
      });
      
      // Extract system message if present
      const systemMessages = messages.filter(msg => msg.role === 'system');
      const systemPrompt = systemMessages.length > 0 
        ? systemMessages.map(msg => msg.content).join('\n') 
        : options.systemPrompt;
      
      // Filter out system messages as they're handled separately
      const userAssistantMessages = formattedMessages.filter(msg => msg.role !== 'system');
      
      // Make the API call
      const response = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature,
        system: systemPrompt,
        messages: userAssistantMessages,
      });

      const content = response.content[0]?.text || '';
      const latency = Date.now() - startTime;
      
      this.updateLatency(latency);
      this.metrics.successfulRequests++;
      this.metrics.lastUsed = new Date();

      // Format response in standard format
      const chatMessage: AIChatMessage = {
        role: 'assistant',
        content: content,
        name: 'anthropic'
      };

      return {
        text: chatMessage,
        model,
        usage: {
          promptTokens: response.usage?.input_tokens || 0,
          completionTokens: response.usage?.output_tokens || 0,
          totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
        },
        latency
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.metrics.failedRequests++;

      logger.error('Anthropic chat completion failed', { 
        error: error instanceof Error ? error.message : String(error),
        messages: messages.slice(0, 2) // Log only the first few messages
      });

      throw new Error(`Anthropic chat completion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Analyze image using Anthropic's multimodal capabilities
   * @param base64Image Base64-encoded image
   * @param prompt Prompt describing what to analyze in the image
   * @param options Request options
   * @returns Promise resolving to analysis text
   */
  async analyzeImage(base64Image: string, prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<string>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const model = options.model || this.config.defaultModels?.chat || 'claude-3-7-sonnet-20250219';
      
      // Claude requires the image content type
      const contentType = this.determineContentType(base64Image);
      
      const response = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature,
        system: options.systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: contentType,
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      });

      const content = response.content[0]?.text || '';
      const latency = Date.now() - startTime;
      
      this.updateLatency(latency);
      this.metrics.successfulRequests++;
      this.metrics.lastUsed = new Date();

      return {
        text: content,
        model,
        usage: {
          promptTokens: response.usage?.input_tokens || 0,
          completionTokens: response.usage?.output_tokens || 0,
          totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
        },
        latency
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.metrics.failedRequests++;

      logger.error('Anthropic image analysis failed', { 
        error: error instanceof Error ? error.message : String(error),
        prompt
      });

      throw new Error(`Anthropic image analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get performance metrics
   * @returns Adapter metrics
   */
  getMetrics(): AIAdapterMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      lastUsed: null
    };
  }

  /**
   * Update average latency calculation
   * @param latency New latency value in milliseconds
   */
  private updateLatency(latency: number): void {
    if (this.metrics.totalRequests <= 1) {
      this.metrics.averageLatency = latency;
    } else {
      // Calculate running average
      const totalResponsesUsed = this.metrics.successfulRequests + this.metrics.failedRequests;
      this.metrics.averageLatency = 
        (this.metrics.averageLatency * (totalResponsesUsed - 1) + latency) / totalResponsesUsed;
    }
  }

  /**
   * Determine content type based on base64 image data
   * @param base64Image Base64-encoded image data
   * @returns Content type string
   */
  private determineContentType(base64Image: string): string {
    // Check for data URI format first
    if (base64Image.startsWith('data:')) {
      const matches = base64Image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
      if (matches && matches.length > 1) {
        return matches[1];
      }
      // Remove the data URI prefix if present
      base64Image = base64Image.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, '');
    }
    
    // Try to determine type from the binary data
    const prefix = base64Image.substring(0, 5);
    
    if (prefix.includes('iVBOR')) {
      return 'image/png';
    } else if (prefix.includes('/9j/')) {
      return 'image/jpeg';
    } else if (prefix.includes('R0lGO')) {
      return 'image/gif';
    } else if (prefix.includes('UklGR')) {
      return 'image/webp';
    } else if (prefix.includes('PHN2Z')) {
      return 'image/svg+xml';
    }
    
    // Default to JPEG if we can't determine
    return 'image/jpeg';
  }
}