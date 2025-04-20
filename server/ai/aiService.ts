/**
 * AI Service
 * 
 * This module provides a high-level interface for accessing AI functionality
 * through multiple provider adapters with fallback capabilities.
 */

import { 
  AIAdapter, 
  AIAdapterRegistry, 
  AIFallbackStrategy,
  AIProvider,
  AIRequestOptions,
  AIResponse,
  AIChatMessage,
  AIImageGenerationOptions,
  AIImageAnalysisOptions
} from './aiTypes';
import { logger } from '../utils/logger';
import { createSimpleFallbackStrategy, SimpleFallbackStrategy } from './fallbackStrategies';

// Function to get the best adapter based on metrics
function getBestAdapter(registry: AIAdapterRegistry): AIAdapter {
  const adapters = registry.getAll();
  if (adapters.length === 0) {
    throw new Error('No AI adapters available');
  }
  
  // Default to the first adapter
  return adapters[0];
}

/**
 * Main AI service class that provides a unified interface to all AI providers
 */
export class AIService {
  private fallbackStrategy: AIFallbackStrategy;
  
  constructor(
    private registry: AIAdapterRegistry,
    fallbackStrategy?: AIFallbackStrategy
  ) {
    // Create a default fallback strategy if none provided
    this.fallbackStrategy = fallbackStrategy || new SimpleFallbackStrategy(registry);
    
    logger.info('AI Service initialized with fallback strategy');
  }
  
  /**
   * Get status information for all AI adapters
   */
  getStatus(): { 
    providers: Record<string, any>,
    default: string,
    available: string[] 
  } {
    const providers: Record<string, any> = {};
    
    // Get status from each adapter
    this.registry.getAll().forEach(adapter => {
      providers[adapter.provider] = {
        ...adapter.getStatus(),
        metrics: adapter.getMetrics()
      };
    });
    
    return {
      providers,
      default: this.registry.getDefaultProvider(),
      available: this.registry.getAvailableProviders()
    };
  }
  
  /**
   * Generate text from a prompt
   */
  async generateText(
    prompt: string, 
    options?: AIRequestOptions
  ): Promise<AIResponse<string>> {
    logger.debug('Generating text', { promptLength: prompt.length, options });
    
    return this.fallbackStrategy.execute(
      adapter => adapter.generateText(prompt, options),
      options
    );
  }
  
  /**
   * Generate structured JSON from a prompt
   */
  async generateJson<T = any>(
    prompt: string,
    options?: AIRequestOptions
  ): Promise<AIResponse<T>> {
    logger.debug('Generating JSON', { promptLength: prompt.length, options });
    
    // Ensure JSON mode is enabled
    const jsonOptions = { 
      ...options,
      jsonMode: true 
    };
    
    return this.fallbackStrategy.execute(
      adapter => adapter.generateJson(prompt, jsonOptions),
      jsonOptions
    ) as Promise<AIResponse<T>>;
  }
  
  /**
   * Generate chat completion from messages
   */
  async chatCompletion(
    messages: AIChatMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse<AIChatMessage>> {
    logger.debug('Generating chat completion', { 
      messageCount: messages.length, 
      options 
    });
    
    return this.fallbackStrategy.execute(
      adapter => adapter.chatCompletion(messages, options),
      options
    );
  }
  
  /**
   * Generate an image from a text prompt
   */
  async generateImage(
    prompt: string,
    options?: AIImageGenerationOptions
  ): Promise<AIResponse<string>> {
    logger.debug('Generating image', { promptLength: prompt.length, options });
    
    return this.fallbackStrategy.execute(
      async adapter => {
        if (!adapter.generateImage) {
          throw new Error(`Provider ${adapter.provider} does not support image generation`);
        }
        return adapter.generateImage(prompt, options);
      },
      options
    );
  }
  
  /**
   * Analyze an image with a text prompt
   */
  async analyzeImage(
    options: AIImageAnalysisOptions
  ): Promise<AIResponse<string>> {
    logger.debug('Analyzing image', { 
      hasImageUrl: !!options.imageUrl,
      hasBase64: !!options.base64Image,
      promptLength: options.prompt.length
    });
    
    return this.fallbackStrategy.execute(
      async adapter => {
        if (!adapter.analyzeImage) {
          throw new Error(`Provider ${adapter.provider} does not support image analysis`);
        }
        return adapter.analyzeImage(options);
      },
      options
    );
  }
  
  /**
   * Generate embeddings for text
   */
  async generateEmbedding(
    text: string,
    options?: AIRequestOptions
  ): Promise<AIResponse<number[]>> {
    logger.debug('Generating embedding', { textLength: text.length, options });
    
    return this.fallbackStrategy.execute(
      adapter => adapter.generateEmbedding(text, options),
      options
    );
  }
  
  /**
   * Set the fallback strategy
   */
  setFallbackStrategy(strategy: AIFallbackStrategy): void {
    this.fallbackStrategy = strategy;
    logger.info('Fallback strategy updated');
  }
  
  /**
   * Get the current fallback strategy
   */
  getFallbackStrategy(): AIFallbackStrategy {
    return this.fallbackStrategy;
  }
}