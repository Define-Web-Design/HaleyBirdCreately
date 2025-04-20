/**
 * AI Service Fallback Strategies
 * 
 * This module provides strategies for handling fallbacks between AI providers
 * when a preferred provider is unavailable or encounters an error.
 */

import { AIServiceAdapter } from './adapters/baseAdapter';
import { AdapterRegistry } from './adapterRegistry';
import { logger } from '../utils/logger';

/**
 * Interface for adapter fallback strategies
 */
export interface AdapterFallbackStrategy {
  /**
   * Get the best adapter based on the strategy
   * @param preferredProvider Optional preferred provider name
   * @returns The best adapter or null if none available
   */
  getAdapter(preferredProvider?: string): Promise<AIServiceAdapter | null>;
}

/**
 * Create a simple fallback strategy that just uses the best adapter from the registry
 * @param registry Adapter registry
 * @returns Fallback strategy
 */
export function createSimpleFallbackStrategy(
  registry: AdapterRegistry
): AdapterFallbackStrategy {
  return {
    async getAdapter(preferredProvider?: string): Promise<AIServiceAdapter | null> {
      return registry.getBestAdapter(preferredProvider);
    }
  };
}

/**
 * Create a priority-based fallback strategy that sorts adapters by priority
 * 
 * @param registry Adapter registry
 * @returns Fallback strategy
 */
export function createPriorityBasedFallbackStrategy(
  registry: AdapterRegistry
): AdapterFallbackStrategy {
  return {
    async getAdapter(preferredProvider?: string): Promise<AIServiceAdapter | null> {
      // First try preferred provider if specified
      if (preferredProvider) {
        const adapter = registry.getAdapter(preferredProvider);
        if (adapter) {
          const available = await registry.checkAdapterHealth(preferredProvider);
          if (available) {
            logger.debug(`Using preferred provider: ${preferredProvider}`);
            return adapter;
          }
          logger.warn(`Preferred provider ${preferredProvider} is not available, falling back to priority-based selection`);
        }
      }
      
      // Get all adapters and sort by priority
      const adapters = Array.from(registry.getAllAdapters().entries())
        .sort((a, b) => {
          const statusA = registry.getAdapterStatus()[a[0]] || {};
          const statusB = registry.getAdapterStatus()[b[0]] || {};
          const priorityA = statusA.priority || 100;
          const priorityB = statusB.priority || 100;
          return priorityA - priorityB;
        });
      
      // Try each adapter in order
      for (const [name, adapter] of adapters) {
        const available = await registry.checkAdapterHealth(name);
        if (available) {
          logger.debug(`Selected provider by priority: ${name}`);
          return adapter;
        }
      }
      
      logger.error('No available adapters found');
      return null;
    }
  };
}

/**
 * Create a capability-based fallback strategy that selects adapters based on
 * whether they implement a specific capability
 * 
 * @param registry Adapter registry
 * @param capability Name of the required capability/method
 * @returns Fallback strategy
 */
export function createCapabilityBasedFallbackStrategy(
  registry: AdapterRegistry,
  capability: string
): AdapterFallbackStrategy {
  return {
    async getAdapter(preferredProvider?: string): Promise<AIServiceAdapter | null> {
      // First try preferred provider if specified
      if (preferredProvider) {
        const adapter = registry.getAdapter(preferredProvider);
        if (adapter && typeof (adapter as any)[capability] === 'function') {
          const available = await registry.checkAdapterHealth(preferredProvider);
          if (available) {
            logger.debug(`Using preferred provider: ${preferredProvider}`);
            return adapter;
          }
          logger.warn(`Preferred provider ${preferredProvider} is not available, falling back to capability-based selection`);
        } else if (adapter) {
          logger.warn(`Preferred provider ${preferredProvider} does not support capability: ${capability}`);
        }
      }
      
      // Get all adapters with the capability
      const adapters = Array.from(registry.getAllAdapters().entries())
        .filter(([_, adapter]) => typeof (adapter as any)[capability] === 'function')
        .sort((a, b) => {
          const statusA = registry.getAdapterStatus()[a[0]] || {};
          const statusB = registry.getAdapterStatus()[b[0]] || {};
          const priorityA = statusA.priority || 100;
          const priorityB = statusB.priority || 100;
          return priorityA - priorityB;
        });
      
      // Try each adapter in order
      for (const [name, adapter] of adapters) {
        const available = await registry.checkAdapterHealth(name);
        if (available) {
          logger.debug(`Selected provider by capability (${capability}): ${name}`);
          return adapter;
        }
      }
      
      logger.error(`No available adapters found with capability: ${capability}`);
      return null;
    }
  };
}

/**
 * Create a cost-based fallback strategy that favors lower-cost providers
 * until a threshold of failures or latency is reached
 * 
 * @param registry Adapter registry
 * @param costThreshold Cost threshold for considering higher-cost providers
 * @param failureThreshold Failure threshold for switching providers
 * @returns Fallback strategy
 */
export function createCostBasedFallbackStrategy(
  registry: AdapterRegistry,
  costThreshold: number = 0.5,
  failureThreshold: number = 3
): AdapterFallbackStrategy {
  // Track failures per provider
  const failures: Record<string, number> = {};
  
  return {
    async getAdapter(preferredProvider?: string): Promise<AIServiceAdapter | null> {
      // First try preferred provider if specified
      if (preferredProvider) {
        const adapter = registry.getAdapter(preferredProvider);
        if (adapter) {
          const available = await registry.checkAdapterHealth(preferredProvider);
          if (available && (failures[preferredProvider] || 0) < failureThreshold) {
            logger.debug(`Using preferred provider: ${preferredProvider}`);
            return adapter;
          }
          
          if (!available) {
            logger.warn(`Preferred provider ${preferredProvider} is not available, falling back to cost-based selection`);
          } else {
            logger.warn(`Preferred provider ${preferredProvider} exceeded failure threshold, falling back to cost-based selection`);
          }
        }
      }
      
      // Cost tiers for providers (example values)
      const costTiers: Record<string, number> = {
        'openai': 1.0,
        'anthropic': 0.8,
        'perplexity': 0.3,
        // Add more as needed
      };
      
      // Get all adapters and sort by cost
      const adapters = Array.from(registry.getAllAdapters().entries())
        .map(([name, adapter]) => {
          return {
            name,
            adapter,
            cost: costTiers[name] || 0.5,
            failures: failures[name] || 0
          };
        })
        .filter(item => item.failures < failureThreshold) // Filter out adapters that exceeded failure threshold
        .sort((a, b) => a.cost - b.cost);
      
      // First try cheap providers
      for (const item of adapters) {
        if (item.cost <= costThreshold) {
          const available = await registry.checkAdapterHealth(item.name);
          if (available) {
            logger.debug(`Selected low-cost provider: ${item.name} (cost: ${item.cost})`);
            return item.adapter;
          }
        }
      }
      
      // If no cheap providers available, try expensive ones
      for (const item of adapters) {
        if (item.cost > costThreshold) {
          const available = await registry.checkAdapterHealth(item.name);
          if (available) {
            logger.debug(`Selected higher-cost provider: ${item.name} (cost: ${item.cost})`);
            return item.adapter;
          }
        }
      }
      
      logger.error('No available adapters found');
      return null;
    }
  };
}

/**
 * Helper function to track a provider failure
 * @param registry Adapter registry
 * @param provider Provider name
 * @param failures Failures record
 */
export function trackProviderFailure(
  registry: AdapterRegistry,
  provider: string,
  failures: Record<string, number>
): void {
  if (!failures[provider]) {
    failures[provider] = 0;
  }
  failures[provider]++;
  
  logger.warn(`Provider ${provider} failure count: ${failures[provider]}`);
}

/**
 * Helper function to reset failure count for a provider
 * @param provider Provider name
 * @param failures Failures record
 */
export function resetProviderFailures(
  provider: string, 
  failures: Record<string, number>
): void {
  failures[provider] = 0;
  logger.info(`Reset failure count for provider: ${provider}`);
}