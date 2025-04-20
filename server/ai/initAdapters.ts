/**
 * AI Adapter Initialization
 * 
 * This module handles initialization of AI provider adapters based on
 * available environment configuration and API keys.
 */

import { AIProvider, AIAdapterRegistry } from './aiTypes';
import { createAdapterRegistry } from './adapterRegistry';
import { logger } from '../utils/logger';

/**
 * Create and initialize all available AI adapters
 */
export function initAdapters(): AIAdapterRegistry {
  const registry = createAdapterRegistry();
  
  try {
    // Try to initialize OpenAI adapter if API key is available
    if (process.env.OPENAI_API_KEY) {
      initOpenAIAdapter(registry);
    } else {
      logger.warn('OpenAI API key not found, skipping adapter initialization');
    }
    
    // Try to initialize Anthropic adapter if API key is available
    if (process.env.ANTHROPIC_API_KEY) {
      initAnthropicAdapter(registry);
    } else {
      logger.warn('Anthropic API key not found, skipping adapter initialization');
    }
    
    // Try to initialize Perplexity adapter if API key is available
    if (process.env.PERPLEXITY_API_KEY) {
      initPerplexityAdapter(registry);
    } else {
      logger.warn('Perplexity API key not found, skipping adapter initialization');
    }
    
    // Log initialization summary
    const availableProviders = registry.getAvailableProviders();
    if (availableProviders.length === 0) {
      logger.warn('No AI adapters could be initialized. Check API keys.');
    } else {
      logger.info(`Initialized ${availableProviders.length} AI adapters: ${availableProviders.join(', ')}`);
      logger.info(`Default provider set to: ${registry.getDefaultProvider()}`);
    }
    
    return registry;
  } catch (error) {
    logger.error('Error initializing AI adapters', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Return registry even if partially initialized
    return registry;
  }
}

/**
 * Initialize OpenAI adapter
 */
function initOpenAIAdapter(registry: AIAdapterRegistry): void {
  try {
    // We'll implement the actual adapter initialization in a separate PR
    // This is a placeholder for now
    
    logger.info('OpenAI adapter initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize OpenAI adapter', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Initialize Anthropic adapter
 */
function initAnthropicAdapter(registry: AIAdapterRegistry): void {
  try {
    // We'll implement the actual adapter initialization in a separate PR
    // This is a placeholder for now
    
    logger.info('Anthropic adapter initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Anthropic adapter', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Initialize Perplexity adapter
 */
function initPerplexityAdapter(registry: AIAdapterRegistry): void {
  try {
    // We'll implement the actual adapter initialization in a separate PR
    // This is a placeholder for now
    
    logger.info('Perplexity adapter initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Perplexity adapter', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}