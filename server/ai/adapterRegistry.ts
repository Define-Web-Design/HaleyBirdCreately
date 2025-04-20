/**
 * AI Adapter Registry
 * 
 * This module provides a registry for AI adapters where adapters can be registered,
 * retrieved, and managed. It serves as the central repository for all available
 * AI service adapters.
 */

import { AIAdapter, AIProvider, AIAdapterRegistry } from './aiTypes';
import { logger } from '../utils/logger';

/**
 * Implementation of the AIAdapterRegistry interface
 */
export class DefaultAdapterRegistry implements AIAdapterRegistry {
  private adapters: Map<AIProvider, AIAdapter> = new Map();
  private defaultProvider: AIProvider = 'openai';
  
  /**
   * Register an adapter in the registry
   */
  register(adapter: AIAdapter): void {
    const provider = adapter.provider;
    
    if (this.adapters.has(provider)) {
      logger.warn(`Replacing existing adapter for provider: ${provider}`);
    }
    
    this.adapters.set(provider, adapter);
    logger.info(`Registered AI adapter for provider: ${provider}`);
  }
  
  /**
   * Unregister an adapter from the registry
   */
  unregister(provider: AIProvider): void {
    if (this.adapters.has(provider)) {
      this.adapters.delete(provider);
      logger.info(`Unregistered AI adapter for provider: ${provider}`);
    } else {
      logger.warn(`No adapter found for provider: ${provider}`);
    }
    
    // If we're removing the default provider, set a new default if available
    if (provider === this.defaultProvider && this.adapters.size > 0) {
      this.defaultProvider = this.adapters.keys().next().value;
      logger.info(`New default provider set to: ${this.defaultProvider}`);
    }
  }
  
  /**
   * Get all registered adapters
   */
  getAll(): AIAdapter[] {
    return Array.from(this.adapters.values());
  }
  
  /**
   * Get a specific adapter by provider
   */
  get(provider: AIProvider): AIAdapter | undefined {
    return this.adapters.get(provider);
  }
  
  /**
   * Get the default adapter
   */
  getDefault(): AIAdapter {
    const defaultAdapter = this.adapters.get(this.defaultProvider);
    
    if (!defaultAdapter) {
      // If the default provider doesn't exist, return the first available adapter
      const firstAdapter = this.adapters.values().next().value;
      
      if (!firstAdapter) {
        throw new Error('No AI adapters registered');
      }
      
      return firstAdapter;
    }
    
    return defaultAdapter;
  }
  
  /**
   * Set the default provider
   */
  setDefaultProvider(provider: AIProvider): void {
    if (!this.adapters.has(provider)) {
      throw new Error(`Cannot set default provider: No adapter registered for ${provider}`);
    }
    
    this.defaultProvider = provider;
    logger.info(`Default provider set to: ${provider}`);
  }
  
  /**
   * Get all available providers
   */
  getAvailableProviders(): AIProvider[] {
    return Array.from(this.adapters.keys());
  }
  
  /**
   * Get the current default provider
   */
  getDefaultProvider(): AIProvider {
    return this.defaultProvider;
  }
  
  /**
   * Check if a provider is registered
   */
  hasProvider(provider: AIProvider): boolean {
    return this.adapters.has(provider);
  }
  
  /**
   * Get the number of registered adapters
   */
  size(): number {
    return this.adapters.size;
  }
  
  /**
   * Clear all adapters from the registry
   */
  clear(): void {
    this.adapters.clear();
    logger.info('Cleared all AI adapters from registry');
  }
}

/**
 * Create a new adapter registry instance
 */
export function createAdapterRegistry(): AIAdapterRegistry {
  return new DefaultAdapterRegistry();
}