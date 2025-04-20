
/**
 * AI Service Fallback Strategy Patterns
 * 
 * This module provides standardized fallback strategy implementations
 * that can be applied across different AI service providers.
 */

import { AIRequestOptions, AIResponse } from './baseAdapter';
import { AIAdapterRegistry } from './adapterRegistry';
import { Logger } from '../../utils/logger';

export interface FallbackStrategy {
  execute<T>(
    prompt: string, 
    options: AIRequestOptions, 
    registry: AIAdapterRegistry,
    generateFn: (adapter: any, prompt: string, options: AIRequestOptions) => Promise<AIResponse<T>>
  ): Promise<AIResponse<T>>;
}

/**
 * Sequential Fallback Strategy
 * 
 * Tries each adapter in priority order until one succeeds
 */
export class SequentialFallbackStrategy implements FallbackStrategy {
  private logger: Logger;
  
  constructor() {
    this.logger = new Logger('SequentialFallback');
  }
  
  async execute<T>(
    prompt: string, 
    options: AIRequestOptions, 
    registry: AIAdapterRegistry,
    generateFn: (adapter: any, prompt: string, options: AIRequestOptions) => Promise<AIResponse<T>>
  ): Promise<AIResponse<T>> {
    const adapters = registry.getAvailableAdapters();
    
    if (adapters.length === 0) {
      throw new Error('No AI providers are available');
    }
    
    let lastError: Error | null = null;
    
    for (const adapter of adapters) {
      try {
        this.logger.info(`Attempting with provider: ${adapter.getStatus().name}`);
        const result = await generateFn(adapter, prompt, options);
        return result;
      } catch (error) {
        this.logger.warn(`Provider ${adapter.getStatus().name} failed, trying next`, error);
        lastError = error;
      }
    }
    
    throw lastError || new Error('All AI providers failed');
  }
}

/**
 * Racing Fallback Strategy
 * 
 * Tries all adapters in parallel and returns the first successful result
 */
export class RacingFallbackStrategy implements FallbackStrategy {
  private logger: Logger;
  private timeout: number;
  
  constructor(timeoutMs: number = 30000) {
    this.logger = new Logger('RacingFallback');
    this.timeout = timeoutMs;
  }
  
  async execute<T>(
    prompt: string, 
    options: AIRequestOptions, 
    registry: AIAdapterRegistry,
    generateFn: (adapter: any, prompt: string, options: AIRequestOptions) => Promise<AIResponse<T>>
  ): Promise<AIResponse<T>> {
    const adapters = registry.getAvailableAdapters();
    
    if (adapters.length === 0) {
      throw new Error('No AI providers are available');
    }
    
    this.logger.info(`Racing ${adapters.length} providers for fastest response`);
    
    // Create a promise for each adapter
    const promises = adapters.map(adapter => {
      return new Promise<AIResponse<T> & { adapterName: string }>((resolve, reject) => {
        generateFn(adapter, prompt, options)
          .then(result => {
            resolve({
              ...result,
              adapterName: adapter.getStatus().name
            });
          })
          .catch(reject);
      });
    });
    
    // Add timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Fallback strategy timed out after ${this.timeout}ms`));
      }, this.timeout);
    });
    
    // Race all promises
    try {
      const result = await Promise.race([...promises, timeoutPromise]) as AIResponse<T> & { adapterName: string };
      this.logger.info(`Racing strategy won with adapter: ${result.adapterName}`);
      
      // Remove the adapter name before returning
      const { adapterName, ...cleanResult } = result;
      return cleanResult;
    } catch (error) {
      this.logger.error('All racing providers failed', error);
      throw new Error('All AI providers failed in racing mode');
    }
  }
}

/**
 * Hybrid Fallback Strategy
 * 
 * Tries primary provider first, then races secondary providers if primary fails
 */
export class HybridFallbackStrategy implements FallbackStrategy {
  private logger: Logger;
  
  constructor() {
    this.logger = new Logger('HybridFallback');
  }
  
  async execute<T>(
    prompt: string, 
    options: AIRequestOptions, 
    registry: AIAdapterRegistry,
    generateFn: (adapter: any, prompt: string, options: AIRequestOptions) => Promise<AIResponse<T>>
  ): Promise<AIResponse<T>> {
    const adapters = registry.getAvailableAdapters();
    
    if (adapters.length === 0) {
      throw new Error('No AI providers are available');
    }
    
    // Try primary provider first
    const primaryAdapter = adapters[0];
    this.logger.info(`Trying primary provider: ${primaryAdapter.getStatus().name}`);
    
    try {
      return await generateFn(primaryAdapter, prompt, options);
    } catch (primaryError) {
      this.logger.warn(`Primary provider failed, switching to fallback mode`, primaryError);
      
      // If primary fails, race the secondary providers
      const secondaryAdapters = adapters.slice(1);
      if (secondaryAdapters.length === 0) {
        throw new Error('Primary provider failed and no fallbacks available');
      }
      
      this.logger.info(`Racing ${secondaryAdapters.length} fallback providers`);
      
      // Race the secondary providers
      const racingPromises = secondaryAdapters.map(adapter => {
        return generateFn(adapter, prompt, options)
          .catch(error => {
            this.logger.warn(`Fallback provider ${adapter.getStatus().name} failed`, error);
            return Promise.reject(error);
          });
      });
      
      return await Promise.any(racingPromises);
    }
  }
}

/**
 * Factory for creating fallback strategies
 */
export class FallbackStrategyFactory {
  static createStrategy(type: 'sequential' | 'racing' | 'hybrid'): FallbackStrategy {
    switch (type) {
      case 'sequential':
        return new SequentialFallbackStrategy();
      case 'racing':
        return new RacingFallbackStrategy();
      case 'hybrid':
        return new HybridFallbackStrategy();
      default:
        return new SequentialFallbackStrategy();
    }
  }
}
