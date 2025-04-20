/**
 * AI Service Adapter Initialization
 * 
 * This module handles the initialization and registration of all supported AI service adapters.
 * It automatically detects available API keys and registers adapters with appropriate configurations.
 */

import { adapterRegistry } from './adapters/adapterRegistry';
import { OpenAIAdapter } from './adapters/openaiAdapter';
import { AnthropicAdapter } from './adapters/anthropicAdapter';
import { PerplexityAdapter } from './adapters/perplexityAdapter';
import { logger } from '../utils/logger';
import { getConfig } from '../../config/globalConfig';

/**
 * Initialize and register all AI service adapters
 * @returns Promise resolving to true if at least one adapter was successfully registered
 */
export async function initializeAdapters(): Promise<boolean> {
  let adaptersRegistered = 0;
  
  try {
    // Get AI configuration from global config
    const aiConfig = getConfig().ai || {};
    
    // Initialize OpenAI adapter if API key available
    const openaiApiKey = aiConfig?.openai?.apiKey || process.env.OPENAI_API_KEY;
    if (openaiApiKey) {
      const openaiAdapter = new OpenAIAdapter({
        apiKey: openaiApiKey,
        baseURL: aiConfig?.openai?.baseURL,
        defaultModels: {
          text: aiConfig?.openai?.defaultTextModel || 'gpt-4o',
          chat: aiConfig?.openai?.defaultChatModel || 'gpt-4o',
          embeddings: aiConfig?.openai?.defaultEmbeddingsModel || 'text-embedding-3-small',
          image: aiConfig?.openai?.defaultImageModel || 'dall-e-3'
        },
        priority: 10 // Highest priority
      });
      
      adapterRegistry.register('openai', openaiAdapter);
      logger.info('Registered OpenAI adapter');
      adaptersRegistered++;
    } else {
      logger.debug('OpenAI API key not found, adapter not registered');
    }
    
    // Initialize Anthropic adapter if API key available
    const anthropicApiKey = aiConfig?.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY;
    if (anthropicApiKey) {
      const anthropicAdapter = new AnthropicAdapter({
        apiKey: anthropicApiKey,
        baseURL: aiConfig?.anthropic?.baseURL,
        defaultModels: {
          text: aiConfig?.anthropic?.defaultTextModel || 'claude-3-7-sonnet-20250219',
          chat: aiConfig?.anthropic?.defaultChatModel || 'claude-3-7-sonnet-20250219'
        },
        priority: 20 // Medium priority
      });
      
      adapterRegistry.register('anthropic', anthropicAdapter);
      logger.info('Registered Anthropic adapter');
      adaptersRegistered++;
    } else {
      logger.debug('Anthropic API key not found, adapter not registered');
    }
    
    // Initialize Perplexity adapter if API key available
    const perplexityApiKey = aiConfig?.perplexity?.apiKey || process.env.PERPLEXITY_API_KEY;
    if (perplexityApiKey) {
      const perplexityAdapter = new PerplexityAdapter({
        apiKey: perplexityApiKey,
        baseURL: aiConfig?.perplexity?.baseURL,
        defaultModels: {
          text: aiConfig?.perplexity?.defaultTextModel || 'llama-3.1-sonar-small-128k-online',
          chat: aiConfig?.perplexity?.defaultChatModel || 'llama-3.1-sonar-small-128k-online'
        },
        priority: 30 // Lowest priority
      });
      
      adapterRegistry.register('perplexity', perplexityAdapter);
      logger.info('Registered Perplexity adapter');
      adaptersRegistered++;
    } else {
      logger.debug('Perplexity API key not found, adapter not registered');
    }
    
    // Get reference to the best adapter
    const bestAdapter = await adapterRegistry.getBestAdapter();
    if (bestAdapter) {
      logger.info(`Best available adapter: ${bestAdapter.constructor.name}`);
    } else {
      logger.warn('No adapters available');
    }
    
    return adaptersRegistered > 0;
  } catch (error) {
    logger.error('Error initializing AI adapters', { 
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

/**
 * Check adapter availability and status
 * @returns Promise resolving to adapter status mapping
 */
export async function checkAdapterAvailability(): Promise<Record<string, boolean>> {
  try {
    const results = await adapterRegistry.checkAllAdaptersHealth();
    const status: Record<string, boolean> = {};
    
    results.forEach((available, name) => {
      status[name] = available;
    });
    
    return status;
  } catch (error) {
    logger.error('Error checking adapter availability', { 
      error: error instanceof Error ? error.message : String(error)
    });
    return {};
  }
}

/**
 * Get a provider adapter by name, ensuring it's available
 * @param providerName Name of the provider
 * @returns The adapter if available, or null
 */
export async function getProviderAdapter(providerName: string) {
  const adapter = adapterRegistry.getAdapter(providerName);
  
  if (!adapter) {
    logger.warn(`Requested provider not found: ${providerName}`);
    return null;
  }
  
  const available = await adapterRegistry.checkAdapterHealth(providerName);
  
  if (!available) {
    logger.warn(`Requested provider not available: ${providerName}`);
    return null;
  }
  
  return adapter;
}

/**
 * Get the best available adapter based on priority and health
 * @param preferredProvider Optional preferred provider name
 * @returns The best available adapter or null if none available
 */
export async function getBestAdapter(preferredProvider?: string) {
  return adapterRegistry.getBestAdapter(preferredProvider);
}