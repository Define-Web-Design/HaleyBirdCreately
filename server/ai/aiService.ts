/**
 * AI Service
 * 
 * This module provides a high-level interface for AI operations,
 * abstracting away the specifics of different AI providers through the adapter pattern
 * and providing automatic fallback mechanisms when providers are unavailable.
 */

import { adapterRegistry } from './adapterRegistry';
import { getBestAdapter, getProviderAdapter } from './initAdapters';
import { 
  AIChatMessage, 
  AIImageGenerationOptions, 
  AIRequestOptions 
} from './aiTypes';
import { 
  createSimpleFallbackStrategy,
  createPriorityBasedFallbackStrategy,
  createCapabilityBasedFallbackStrategy
} from './fallbackStrategies';
import { logger } from '../utils/logger';
import { getConfig } from '../../config/globalConfig';

// Default options for AI requests
const DEFAULT_OPTIONS: AIRequestOptions = {
  temperature: 0.7,
  maxTokens: 1024
};

/**
 * AI Service class providing a high-level interface to AI operations
 * with automatic provider selection and fallback
 */
export class AIService {
  /**
   * Generate text using the best available AI provider
   * 
   * @param prompt Text prompt
   * @param options Request options
   * @returns Generated text
   */
  static async generateText(prompt: string, options: AIRequestOptions = {}): Promise<string> {
    // Merge with default options
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const preferredProvider = options.provider || getConfig().ai?.preferredProvider;
    
    // Create fallback strategy
    const fallbackStrategy = createPriorityBasedFallbackStrategy(adapterRegistry);
    
    try {
      // Get best adapter with fallback support
      const adapter = await fallbackStrategy.getAdapter(preferredProvider);
      
      if (!adapter) {
        throw new Error('No AI provider available for text generation');
      }
      
      // Log the selected adapter
      const adapterName = adapter.constructor.name;
      logger.debug(`Using ${adapterName} for text generation`);
      
      // Generate text
      const result = await adapter.generateText(prompt, mergedOptions);
      
      return result.text;
    } catch (error) {
      logger.error('Text generation failed', { 
        error: error instanceof Error ? error.message : String(error),
        prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : '')
      });
      throw error;
    }
  }
  
  /**
   * Generate structured JSON data using the best available AI provider
   * 
   * @param prompt Text prompt
   * @param options Request options
   * @returns Generated JSON data
   */
  static async generateJson<T>(prompt: string, options: AIRequestOptions = {}): Promise<T> {
    // Merge with default options
    const mergedOptions = { 
      ...DEFAULT_OPTIONS, 
      ...options,
      temperature: options.temperature || 0.2 // Lower temperature for structured output
    };
    const preferredProvider = options.provider || getConfig().ai?.preferredProvider;
    
    // Create fallback strategy
    const fallbackStrategy = createPriorityBasedFallbackStrategy(adapterRegistry);
    
    try {
      // Get best adapter with fallback support
      const adapter = await fallbackStrategy.getAdapter(preferredProvider);
      
      if (!adapter) {
        throw new Error('No AI provider available for JSON generation');
      }
      
      // Log the selected adapter
      const adapterName = adapter.constructor.name;
      logger.debug(`Using ${adapterName} for JSON generation`);
      
      // Generate JSON
      const result = await adapter.generateJson<T>(prompt, mergedOptions);
      
      return result.text;
    } catch (error) {
      logger.error('JSON generation failed', { 
        error: error instanceof Error ? error.message : String(error),
        prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : '')
      });
      throw error;
    }
  }
  
  /**
   * Get embeddings for text using the best available provider
   * 
   * @param text Text to get embeddings for
   * @param options Request options
   * @returns Vector embeddings
   */
  static async getEmbeddings(text: string, options: AIRequestOptions = {}): Promise<number[]> {
    const preferredProvider = options.provider || getConfig().ai?.preferredProvider;
    
    // Create capability-based fallback strategy for embeddings
    const fallbackStrategy = createCapabilityBasedFallbackStrategy(
      adapterRegistry,
      'getEmbeddings'
    );
    
    try {
      // Get best adapter with fallback support
      const adapter = await fallbackStrategy.getAdapter(preferredProvider);
      
      if (!adapter) {
        throw new Error('No AI provider available for embeddings');
      }
      
      // Log the selected adapter
      const adapterName = adapter.constructor.name;
      logger.debug(`Using ${adapterName} for embeddings`);
      
      // Get embeddings
      const result = await adapter.getEmbeddings(text, options);
      
      return result.text;
    } catch (error) {
      logger.error('Embeddings generation failed', { 
        error: error instanceof Error ? error.message : String(error),
        textLength: text.length
      });
      throw error;
    }
  }
  
  /**
   * Generate image using the best available provider
   * 
   * @param options Image generation options
   * @returns Generated image data
   */
  static async generateImage(options: AIImageGenerationOptions): Promise<any> {
    const preferredProvider = options.provider || getConfig().ai?.preferredProvider;
    
    // Create capability-based fallback strategy for image generation
    const fallbackStrategy = createCapabilityBasedFallbackStrategy(
      adapterRegistry,
      'generateImage'
    );
    
    try {
      // Get best adapter with fallback support
      const adapter = await fallbackStrategy.getAdapter(preferredProvider);
      
      if (!adapter) {
        throw new Error('No AI provider available for image generation');
      }
      
      // Log the selected adapter
      const adapterName = adapter.constructor.name;
      logger.debug(`Using ${adapterName} for image generation`);
      
      // Generate image
      return await adapter.generateImage(options);
    } catch (error) {
      logger.error('Image generation failed', { 
        error: error instanceof Error ? error.message : String(error),
        prompt: options.prompt.substring(0, 100) + (options.prompt.length > 100 ? '...' : '')
      });
      throw error;
    }
  }
  
  /**
   * Get chat completion using the best available provider
   * 
   * @param messages Chat message history
   * @param options Request options
   * @returns Chat completion message
   */
  static async chatCompletion(
    messages: AIChatMessage[], 
    options: AIRequestOptions = {}
  ): Promise<AIChatMessage> {
    // Merge with default options
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const preferredProvider = options.provider || getConfig().ai?.preferredProvider;
    
    // Create fallback strategy
    const fallbackStrategy = createPriorityBasedFallbackStrategy(adapterRegistry);
    
    try {
      // Get best adapter with fallback support
      const adapter = await fallbackStrategy.getAdapter(preferredProvider);
      
      if (!adapter) {
        throw new Error('No AI provider available for chat completion');
      }
      
      // Log the selected adapter
      const adapterName = adapter.constructor.name;
      logger.debug(`Using ${adapterName} for chat completion`);
      
      // Get chat completion
      const result = await adapter.chatCompletion(messages, mergedOptions);
      
      return result.text;
    } catch (error) {
      logger.error('Chat completion failed', { 
        error: error instanceof Error ? error.message : String(error),
        messageCount: messages.length
      });
      throw error;
    }
  }
  
  /**
   * Analyze image using the best available provider
   * 
   * @param base64Image Base64-encoded image data
   * @param prompt Prompt describing what to analyze
   * @param options Request options
   * @returns Analysis text
   */
  static async analyzeImage(
    base64Image: string,
    prompt: string,
    options: AIRequestOptions = {}
  ): Promise<string> {
    const preferredProvider = options.provider || getConfig().ai?.preferredProvider;
    
    // Create capability-based fallback strategy that prioritizes vision-capable models
    // We need to check for adapters with multimodal capabilities
    const fallbackStrategy = createCapabilityBasedFallbackStrategy(
      adapterRegistry,
      'analyzeImage'
    );
    
    try {
      // Get best adapter with fallback support
      const adapter = await fallbackStrategy.getAdapter(preferredProvider);
      
      if (!adapter) {
        throw new Error('No AI provider available for image analysis');
      }
      
      // Check if the adapter supports image analysis
      if (typeof (adapter as any).analyzeImage !== 'function') {
        // Fall back to OpenAI or Anthropic which should support it
        const visionAdapter = await getProviderAdapter('openai') || 
                             await getProviderAdapter('anthropic');
                             
        if (!visionAdapter || typeof (visionAdapter as any).analyzeImage !== 'function') {
          throw new Error('No AI provider with image analysis capability available');
        }
        
        // Use the vision adapter instead
        return await AIService.analyzeImage(base64Image, prompt, {
          ...options,
          provider: visionAdapter.constructor.name.toLowerCase().replace('adapter', '')
        });
      }
      
      // Log the selected adapter
      const adapterName = adapter.constructor.name;
      logger.debug(`Using ${adapterName} for image analysis`);
      
      // Analyze image (using dynamic call since not all adapters might have this method)
      const result = await (adapter as any).analyzeImage(base64Image, prompt, options);
      
      return result.text;
    } catch (error) {
      logger.error('Image analysis failed', { 
        error: error instanceof Error ? error.message : String(error),
        promptLength: prompt.length
      });
      throw error;
    }
  }
  
  /**
   * Check if a specific provider is available
   * 
   * @param providerName Provider name
   * @returns True if provider is available
   */
  static async isProviderAvailable(providerName: string): Promise<boolean> {
    const adapter = adapterRegistry.getAdapter(providerName);
    
    if (!adapter) {
      return false;
    }
    
    return await adapterRegistry.checkAdapterHealth(providerName);
  }
  
  /**
   * Get status of all providers
   * 
   * @returns Provider status mapping
   */
  static getProviderStatus() {
    return adapterRegistry.getAdapterStatus();
  }
  
  /**
   * Get metrics for all providers
   * 
   * @returns Provider metrics mapping
   */
  static getProviderMetrics() {
    return adapterRegistry.getAdapterMetrics();
  }
  
  /**
   * Reset metrics for all providers
   */
  static resetAllMetrics() {
    adapterRegistry.resetAllMetrics();
  }
}