/**
 * AI Service Fallback Strategies
 * 
 * This module provides fallback strategies for AI service operations.
 * If a primary AI service fails, these strategies determine how to
 * retry or switch to alternative providers.
 */

import { 
  AIAdapter, 
  AIAdapterRegistry, 
  AIProvider, 
  AIRequestOptions,
  AIResponse,
  AIFallbackStrategy
} from './aiTypes';
import { logger } from '../utils/logger';

/**
 * Simple fallback strategy that tries providers in sequence
 * until one succeeds or all fail.
 */
export class SimpleFallbackStrategy implements AIFallbackStrategy {
  constructor(
    private registry: AIAdapterRegistry,
    private preferredOrder: AIProvider[] = []
  ) {}
  
  /**
   * Execute an operation with fallback support
   */
  async execute<T>(
    operation: (adapter: AIAdapter) => Promise<AIResponse<T>>,
    options?: AIRequestOptions
  ): Promise<AIResponse<T>> {
    // If a specific provider is requested, try only that provider
    if (options?.provider) {
      const adapter = this.registry.get(options.provider);
      if (!adapter) {
        throw new Error(`Provider not found: ${options.provider}`);
      }
      
      try {
        return await operation(adapter);
      } catch (error) {
        logger.error(`Operation failed with provider ${options.provider}`, {
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    }
    
    // Otherwise, try providers in the preferred order, then any remaining providers
    const attemptedProviders: AIProvider[] = [];
    const errors: Record<AIProvider, string> = {};
    
    // First try providers in preferred order
    for (const provider of this.preferredOrder) {
      const adapter = this.registry.get(provider);
      if (!adapter) continue;
      
      attemptedProviders.push(provider);
      
      try {
        return await operation(adapter);
      } catch (error) {
        logger.warn(`Operation failed with provider ${provider}, trying next`, {
          error: error instanceof Error ? error.message : String(error)
        });
        errors[provider] = error instanceof Error ? error.message : String(error);
      }
    }
    
    // Then try any providers not already attempted
    const remainingProviders = this.registry.getAll()
      .filter(adapter => !attemptedProviders.includes(adapter.provider));
    
    for (const adapter of remainingProviders) {
      const provider = adapter.provider;
      attemptedProviders.push(provider);
      
      try {
        return await operation(adapter);
      } catch (error) {
        logger.warn(`Operation failed with provider ${provider}, trying next`, {
          error: error instanceof Error ? error.message : String(error)
        });
        errors[provider] = error instanceof Error ? error.message : String(error);
      }
    }
    
    // If we get here, all providers failed
    const errorMessage = `All providers failed: ${JSON.stringify(errors)}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Prioritized fallback strategy that weighs provider selection based on
 * recent success rates, latency, and other factors.
 */
export class PrioritizedFallbackStrategy implements AIFallbackStrategy {
  private maxRetries = 3;
  
  constructor(
    private registry: AIAdapterRegistry,
    private weights = {
      successRate: 0.5,
      latency: 0.3,
      cost: 0.2
    }
  ) {}
  
  /**
   * Execute an operation with fallback support
   */
  async execute<T>(
    operation: (adapter: AIAdapter) => Promise<AIResponse<T>>,
    options?: AIRequestOptions
  ): Promise<AIResponse<T>> {
    // If a specific provider is requested, try only that provider
    if (options?.provider) {
      const adapter = this.registry.get(options.provider);
      if (!adapter) {
        throw new Error(`Provider not found: ${options.provider}`);
      }
      
      return this.tryWithRetries(adapter, operation, options.retries || this.maxRetries);
    }
    
    // Get all adapters and sort by score
    const adapters = this.registry.getAll();
    const rankedAdapters = this.rankAdapters(adapters);
    
    // Try adapters in ranked order
    const errors: Record<AIProvider, string> = {};
    
    for (const adapter of rankedAdapters) {
      const provider = adapter.provider;
      
      try {
        return await this.tryWithRetries(adapter, operation, options?.retries || this.maxRetries);
      } catch (error) {
        logger.warn(`Operation failed with provider ${provider}, trying next`, {
          error: error instanceof Error ? error.message : String(error)
        });
        errors[provider] = error instanceof Error ? error.message : String(error);
      }
    }
    
    // If we get here, all providers failed
    const errorMessage = `All providers failed: ${JSON.stringify(errors)}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  /**
   * Try an operation with the given adapter, with retries
   */
  private async tryWithRetries<T>(
    adapter: AIAdapter,
    operation: (adapter: AIAdapter) => Promise<AIResponse<T>>,
    maxRetries: number
  ): Promise<AIResponse<T>> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation(adapter);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(100 * Math.pow(2, attempt), 2000);
          logger.debug(`Retrying with ${adapter.provider} after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error(`Failed after ${maxRetries} retries`);
  }
  
  /**
   * Rank adapters based on their success rates, latency, and cost
   */
  private rankAdapters(adapters: AIAdapter[]): AIAdapter[] {
    return adapters.map(adapter => {
      const metrics = adapter.getMetrics();
      const status = adapter.getStatus();
      
      // Calculate success rate (0-1)
      const successRate = metrics.totalRequests > 0
        ? metrics.successfulRequests / metrics.totalRequests
        : 0.5; // Default if no data
      
      // Calculate normalized latency score (0-1, higher is better/faster)
      const latencyScore = metrics.averageLatency > 0
        ? Math.min(1, 2000 / metrics.averageLatency) // Cap at 2 seconds
        : 0.5; // Default if no data
      
      // Calculate availability score
      const availabilityScore = status.healthy ? 1 : 0;
      
      // Calculate total score
      const score = 
        (this.weights.successRate * successRate) +
        (this.weights.latency * latencyScore) +
        (availabilityScore); // Immediate disqualification if not healthy
      
      return { adapter, score };
    })
    .filter(item => item.score > 0) // Filter out unhealthy adapters
    .sort((a, b) => b.score - a.score) // Sort by score (descending)
    .map(item => item.adapter);
  }
}

/**
 * Token preservation strategy that selects providers based on
 * token availability and usage limits.
 */
export class TokenPreservationStrategy implements AIFallbackStrategy {
  constructor(
    private registry: AIAdapterRegistry,
    private tokenBudgets: Record<AIProvider, number> = {}
  ) {}
  
  /**
   * Execute an operation with token budget awareness
   */
  async execute<T>(
    operation: (adapter: AIAdapter) => Promise<AIResponse<T>>,
    options?: AIRequestOptions
  ): Promise<AIResponse<T>> {
    // If a specific provider is requested, use it regardless of token budget
    if (options?.provider) {
      const adapter = this.registry.get(options.provider);
      if (!adapter) {
        throw new Error(`Provider not found: ${options.provider}`);
      }
      
      try {
        return await operation(adapter);
      } catch (error) {
        logger.error(`Operation failed with provider ${options.provider}`, {
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    }
    
    // Otherwise, select provider based on token budgets
    const adapters = this.registry.getAll();
    const rankedAdapters = this.rankAdaptersByTokenBudget(adapters);
    
    // Try adapters in ranked order
    const errors: Record<AIProvider, string> = {};
    
    for (const adapter of rankedAdapters) {
      const provider = adapter.provider;
      
      try {
        return await operation(adapter);
      } catch (error) {
        logger.warn(`Operation failed with provider ${provider}, trying next`, {
          error: error instanceof Error ? error.message : String(error)
        });
        errors[provider] = error instanceof Error ? error.message : String(error);
      }
    }
    
    // If we get here, all providers failed
    const errorMessage = `All providers failed: ${JSON.stringify(errors)}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  /**
   * Rank adapters based on token budgets
   */
  private rankAdaptersByTokenBudget(adapters: AIAdapter[]): AIAdapter[] {
    return adapters.map(adapter => {
      const provider = adapter.provider;
      const metrics = adapter.getMetrics();
      const status = adapter.getStatus();
      
      // Skip unhealthy adapters
      if (!status.healthy) {
        return { adapter, score: -1 };
      }
      
      // Get token budget for this provider
      const budget = this.tokenBudgets[provider] || 0;
      
      // Get token usage
      const tokensUsed = 
        (metrics.totalTokensIn || 0) + 
        (metrics.totalTokensOut || 0);
      
      // Calculate remaining budget
      const remainingBudget = Math.max(0, budget - tokensUsed);
      
      // If budget is 0, it means unlimited, so rank based on success rate
      const score = budget === 0
        ? (metrics.totalRequests > 0 
           ? metrics.successfulRequests / metrics.totalRequests 
           : 0.5)
        : remainingBudget;
      
      return { adapter, score };
    })
    .filter(item => item.score > 0) // Filter out unhealthy adapters or those with no budget
    .sort((a, b) => b.score - a.score) // Sort by score (descending)
    .map(item => item.adapter);
  }
  
  /**
   * Update token budget for a provider
   */
  updateTokenBudget(provider: AIProvider, budget: number): void {
    this.tokenBudgets[provider] = budget;
  }
  
  /**
   * Get current token budgets
   */
  getTokenBudgets(): Record<AIProvider, number> {
    return { ...this.tokenBudgets };
  }
}

/**
 * Create a simple fallback strategy with the given registry
 */
export function createSimpleFallbackStrategy(
  registry: AIAdapterRegistry,
  preferredOrder: AIProvider[] = []
): AIFallbackStrategy {
  return new SimpleFallbackStrategy(registry, preferredOrder);
}

/**
 * Create a prioritized fallback strategy with the given registry
 */
export function createPrioritizedFallbackStrategy(
  registry: AIAdapterRegistry,
  weights = { successRate: 0.5, latency: 0.3, cost: 0.2 }
): AIFallbackStrategy {
  return new PrioritizedFallbackStrategy(registry, weights);
}

/**
 * Create a token preservation fallback strategy with the given registry
 */
export function createTokenPreservationStrategy(
  registry: AIAdapterRegistry,
  tokenBudgets: Record<AIProvider, number> = {}
): TokenPreservationStrategy {
  return new TokenPreservationStrategy(registry, tokenBudgets);
}