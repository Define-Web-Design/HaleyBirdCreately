/**
 * OpenAI Service Adapter
 * 
 * This adapter implements the AIServiceAdapter interface for OpenAI,
 * providing access to OpenAI's models for text generation, chat, embeddings, and image generation.
 */

import OpenAI from 'openai';
import {
  AIServiceAdapter,
  AIAdapterStatus,
  AIAdapterMetrics,
  AIRequestOptions,
  AIResponse,
  AIImageGenerationOptions,
  AIChatMessage
} from './baseAdapter';
import winston from 'winston';

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'openai-adapter' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/openai-adapter.log',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
    })
  ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Default models
const DEFAULT_MODELS = {
  text: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  chat: 'gpt-4o',
  embeddings: 'text-embedding-3-small',
  image: 'dall-e-3'
};

// Configuration options
export interface OpenAIAdapterConfig {
  apiKey?: string;
  organization?: string;
  baseURL?: string;
  defaultModels?: {
    text?: string;
    chat?: string;
    embeddings?: string;
    image?: string;
  };
  priority?: number;
}

/**
 * OpenAI adapter implementation
 */
export class OpenAIAdapter implements AIServiceAdapter {
  private client: OpenAI;
  private config: OpenAIAdapterConfig;
  private status: AIAdapterStatus;
  private metrics: AIAdapterMetrics;
  
  /**
   * Create a new OpenAI adapter
   * @param config Adapter configuration
   */
  constructor(config: OpenAIAdapterConfig = {}) {
    // Use provided API key or environment variable
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    // Initialize client
    this.client = new OpenAI({
      apiKey,
      organization: config.organization,
      baseURL: config.baseURL
    });
    
    // Store configuration
    this.config = {
      ...config,
      apiKey // Store for status checks
    };
    
    // Initialize status
    this.status = {
      name: 'openai',
      available: false,
      priority: config.priority || 10, // Default priority
      capabilities: [
        'text',
        'chat',
        'json',
        'image',
        'embeddings',
        'vision',
        'functions',
        'tools'
      ]
    };
    
    // Initialize metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      totalTokensIn: 0,
      totalTokensOut: 0,
      startTime: new Date()
    };
    
    logger.info('OpenAI adapter initialized');
  }
  
  /**
   * Get current status
   * @returns Adapter status
   */
  getStatus(): AIAdapterStatus {
    return { ...this.status };
  }
  
  /**
   * Test connection to OpenAI
   * @returns Promise resolving to true if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      logger.debug('Testing OpenAI connection');
      
      // Simple models list request to test connection
      const response = await this.client.models.list();
      
      const success = response && Array.isArray(response.data);
      this.status.available = success;
      
      if (success) {
        logger.info('OpenAI connection test successful');
        this.status.lastCheck = new Date();
      } else {
        logger.warn('OpenAI connection test failed: Unexpected response format');
        this.status.errorMessage = 'Unexpected response format';
      }
      
      return success;
    } catch (error) {
      logger.error('OpenAI connection test failed', { error });
      
      this.status.available = false;
      this.status.errorMessage = error instanceof Error ? error.message : String(error);
      
      return false;
    }
  }
  
  /**
   * Generate text using OpenAI
   * @param prompt Text prompt
   * @param options Request options
   * @returns Promise resolving to generated text
   */
  async generateText(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<string>> {
    const startTime = Date.now();
    
    try {
      // Track request
      this.metrics.totalRequests++;
      this.metrics.lastRequest = new Date();
      
      logger.debug('Generating text with OpenAI', { promptLength: prompt.length });
      
      // Prepare message
      const messages = [
        ...(options.system ? [{ role: 'system' as const, content: options.system }] : []),
        { role: 'user' as const, content: prompt }
      ];
      
      // Select model
      const model = options.model || 
        this.config.defaultModels?.text || 
        DEFAULT_MODELS.text;
      
      // Configure response format
      const responseFormat = options.responseFormat === 'json' 
        ? { type: 'json_object' as const } 
        : undefined;
      
      // Make API call
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        response_format: responseFormat,
        functions: options.functions,
        stream: false
      });
      
      const result = response.choices[0]?.message.content || '';
      
      // Track metrics
      this.metrics.successfulRequests++;
      this.metrics.totalTokensIn += response.usage?.prompt_tokens || 0;
      this.metrics.totalTokensOut += response.usage?.completion_tokens || 0;
      
      // Calculate latency
      const latency = Date.now() - startTime;
      this.updateLatency(latency);
      
      logger.info('Text generation successful', { 
        model,
        latency,
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens
      });
      
      // Format response
      return {
        data: result,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        },
        finishReason: response.choices[0]?.finish_reason || 'unknown'
      };
    } catch (error) {
      // Track failed request
      this.metrics.failedRequests++;
      
      logger.error('Text generation failed', { error });
      throw error;
    }
  }
  
  /**
   * Generate JSON using OpenAI
   * @param prompt Text prompt
   * @param options Request options
   * @returns Promise resolving to generated JSON
   */
  async generateJson<T>(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<T>> {
    try {
      // Force JSON response format
      const jsonOptions = {
        ...options,
        responseFormat: 'json' as const
      };
      
      const response = await this.generateText(prompt, jsonOptions);
      
      // Parse JSON response
      const jsonData = JSON.parse(response.data) as T;
      
      return {
        ...response,
        data: jsonData
      };
    } catch (error) {
      logger.error('JSON generation failed', { error });
      
      if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error(`Failed to parse JSON response: ${error.message}`);
      }
      
      throw error;
    }
  }
  
  /**
   * Get embeddings for text
   * @param text Text to get embeddings for
   * @param options Request options
   * @returns Promise resolving to vector embedding
   */
  async getEmbeddings(text: string, options: AIRequestOptions = {}): Promise<AIResponse<number[]>> {
    const startTime = Date.now();
    
    try {
      // Track request
      this.metrics.totalRequests++;
      this.metrics.lastRequest = new Date();
      
      logger.debug('Getting embeddings with OpenAI', { textLength: text.length });
      
      // Select model
      const model = options.model || 
        this.config.defaultModels?.embeddings || 
        DEFAULT_MODELS.embeddings;
      
      // Make API call
      const response = await this.client.embeddings.create({
        model,
        input: text
      });
      
      const embedding = response.data[0]?.embedding || [];
      
      // Track metrics
      this.metrics.successfulRequests++;
      this.metrics.totalTokensIn += response.usage?.prompt_tokens || 0;
      
      // Calculate latency
      const latency = Date.now() - startTime;
      this.updateLatency(latency);
      
      logger.info('Embeddings generation successful', { 
        model,
        latency,
        dimensions: embedding.length,
        promptTokens: response.usage?.prompt_tokens
      });
      
      // Format response
      return {
        data: embedding,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      // Track failed request
      this.metrics.failedRequests++;
      
      logger.error('Embeddings generation failed', { error });
      throw error;
    }
  }
  
  /**
   * Generate image using DALL-E
   * @param options Image generation options
   * @returns Promise resolving to image data
   */
  async generateImage(options: AIImageGenerationOptions): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Track request
      this.metrics.totalRequests++;
      this.metrics.lastRequest = new Date();
      
      logger.debug('Generating image with DALL-E', { promptLength: options.prompt.length });
      
      // Select model
      const model = options.model || 
        this.config.defaultModels?.image || 
        DEFAULT_MODELS.image;
      
      // Make API call
      const response = await this.client.images.generate({
        model,
        prompt: options.prompt,
        n: options.n || 1,
        size: (options.size || '1024x1024') as '1024x1024' | '256x256' | '512x512' | '1792x1024' | '1024x1792',
        quality: options.quality || 'standard',
        response_format: options.responseFormat || 'url'
      });
      
      // Track metrics
      this.metrics.successfulRequests++;
      
      // Calculate latency
      const latency = Date.now() - startTime;
      this.updateLatency(latency);
      
      logger.info('Image generation successful', { 
        model,
        latency,
        images: response.data.length
      });
      
      return response;
    } catch (error) {
      // Track failed request
      this.metrics.failedRequests++;
      
      logger.error('Image generation failed', { error });
      throw error;
    }
  }
  
  /**
   * Get chat completion
   * @param messages Chat message history
   * @param options Request options
   * @returns Promise resolving to chat completion
   */
  async chatCompletion(messages: AIChatMessage[], options: AIRequestOptions = {}): Promise<AIResponse<AIChatMessage>> {
    const startTime = Date.now();
    
    try {
      // Track request
      this.metrics.totalRequests++;
      this.metrics.lastRequest = new Date();
      
      logger.debug('Getting chat completion with OpenAI', { messageCount: messages.length });
      
      // Convert messages to OpenAI format
      // Need to correctly type and filter messages based on role
      type OpenAIMessage = {
        role: 'system' | 'user' | 'assistant' | 'function';
        content: string | null;
        name?: string;
        function_call?: { name: string; arguments: string };
      };
      
      const openaiMessages: OpenAIMessage[] = [];
      
      // Properly convert each message with type checking
      for (const msg of messages) {
        if (['system', 'user', 'assistant', 'function'].includes(msg.role)) {
          const formattedMsg: OpenAIMessage = {
            role: msg.role as 'system' | 'user' | 'assistant' | 'function',
            content: msg.content
          };
          
          if (msg.name) {
            formattedMsg.name = msg.name;
          }
          
          if (msg.function_call) {
            formattedMsg.function_call = msg.function_call;
          }
          
          openaiMessages.push(formattedMsg);
        }
      }
      
      // Select model
      const model = options.model || 
        this.config.defaultModels?.chat || 
        DEFAULT_MODELS.chat;
      
      // Make API call with proper typing
      const response = await this.client.chat.completions.create({
        model,
        messages: openaiMessages as any, // Type assertion since we carefully constructed these
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        functions: options.functions,
        stream: false
      });
      
      const result = response.choices[0]?.message;
      
      // Convert back to our message format
      const chatMessage: AIChatMessage = {
        role: result.role as any,
        content: result.content,
        ...(result.function_call ? { function_call: result.function_call as any } : {})
      };
      
      // Track metrics
      this.metrics.successfulRequests++;
      this.metrics.totalTokensIn += response.usage?.prompt_tokens || 0;
      this.metrics.totalTokensOut += response.usage?.completion_tokens || 0;
      
      // Calculate latency
      const latency = Date.now() - startTime;
      this.updateLatency(latency);
      
      logger.info('Chat completion successful', { 
        model,
        latency,
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens
      });
      
      // Format response
      return {
        data: chatMessage,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        },
        finishReason: response.choices[0]?.finish_reason || 'unknown'
      };
    } catch (error) {
      // Track failed request
      this.metrics.failedRequests++;
      
      logger.error('Chat completion failed', { error });
      throw error;
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
      totalTokensIn: 0,
      totalTokensOut: 0,
      startTime: new Date()
    };
    
    logger.info('Metrics reset');
  }
  
  /**
   * Update average latency calculation
   * @param latency New latency value in milliseconds
   */
  private updateLatency(latency: number): void {
    // Running average calculation
    const totalSuccessful = this.metrics.successfulRequests;
    
    if (totalSuccessful === 1) {
      // First successful request
      this.metrics.averageLatency = latency;
    } else {
      // Update running average
      this.metrics.averageLatency = 
        (this.metrics.averageLatency * (totalSuccessful - 1) + latency) / totalSuccessful;
    }
  }
}