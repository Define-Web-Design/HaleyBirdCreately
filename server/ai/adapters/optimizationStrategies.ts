
/**
 * AI Provider Optimization Strategies
 * 
 * This module provides adaptive optimization strategies for different AI providers
 * based on their detected capabilities, response characteristics, and performance profiles.
 */

import { AIFeature, featureRegistry } from './featureDetection';
import { AIServiceAdapter } from './baseAdapter';
import { AIRequestOptions } from '../aiTypes';
import { Logger } from '../../utils/logger';
import { getConfig } from '../../../config/globalConfig';

// Optimization target types
export enum OptimizationTarget {
  LATENCY = 'latency',
  COST = 'cost',
  QUALITY = 'quality',
  RELIABILITY = 'reliability'
}

// Optimization strategy interface
export interface OptimizationStrategy {
  apply(adapter: AIServiceAdapter, options: AIRequestOptions): AIRequestOptions;
  getDescription(): string;
}

// Base optimization strategy class
abstract class BaseOptimizationStrategy implements OptimizationStrategy {
  protected logger: Logger;
  protected target: OptimizationTarget;
  
  constructor(target: OptimizationTarget) {
    this.logger = new Logger(`OptimizationStrategy:${this.constructor.name}`);
    this.target = target;
  }
  
  abstract apply(adapter: AIServiceAdapter, options: AIRequestOptions): AIRequestOptions;
  abstract getDescription(): string;
}

/**
 * Latency optimization strategy
 * Reduces response time at potential cost of quality
 */
export class LatencyOptimizationStrategy extends BaseOptimizationStrategy {
  constructor() {
    super(OptimizationTarget.LATENCY);
  }
  
  apply(adapter: AIServiceAdapter, options: AIRequestOptions): AIRequestOptions {
    const adapterKey = adapter.constructor.name.toLowerCase().replace('adapter', '');
    
    // Base optimization for all providers
    const optimizedOptions: AIRequestOptions = {
      ...options,
      maxTokens: Math.min(options.maxTokens || 2048, 1024), // Reduce max tokens
      temperature: Math.min(options.temperature || 0.7, 0.3) // Lower temperature for faster, more deterministic responses
    };
    
    // Provider-specific optimizations
    if (adapterKey.includes('openai')) {
      optimizedOptions.model = this.selectFastestModel(adapterKey, optimizedOptions.model);
    } else if (adapterKey.includes('anthropic')) {
      optimizedOptions.model = this.selectFastestModel(adapterKey, optimizedOptions.model);
    }
    
    this.logger.debug(`Applied latency optimization for ${adapterKey}`, { 
      original: { 
        model: options.model, 
        maxTokens: options.maxTokens,
        temperature: options.temperature 
      }, 
      optimized: { 
        model: optimizedOptions.model, 
        maxTokens: optimizedOptions.maxTokens,
        temperature: optimizedOptions.temperature 
      } 
    });
    
    return optimizedOptions;
  }
  
  private selectFastestModel(provider: string, currentModel?: string): string | undefined {
    // Model selection based on known performance characteristics
    // These could be loaded from a configuration or learned over time
    const fastModels: Record<string, string[]> = {
      'openai': ['gpt-3.5-turbo', 'gpt-3.5-turbo-instruct'],
      'anthropic': ['claude-instant'],
      'mistral': ['mistral-tiny']
    };
    
    // If the provider has fast models and the current model isn't already a fast one
    const providerFastModels = fastModels[provider];
    if (providerFastModels && 
        (!currentModel || !providerFastModels.includes(currentModel))) {
      return providerFastModels[0]; // Select the first (fastest) model
    }
    
    return currentModel;
  }
  
  getDescription(): string {
    return 'Optimizes for lowest latency, reducing token count and using faster models';
  }
}

/**
 * Cost optimization strategy
 * Reduces token usage and selects cheaper models
 */
export class CostOptimizationStrategy extends BaseOptimizationStrategy {
  constructor() {
    super(OptimizationTarget.COST);
  }
  
  apply(adapter: AIServiceAdapter, options: AIRequestOptions): AIRequestOptions {
    const adapterKey = adapter.constructor.name.toLowerCase().replace('adapter', '');
    
    // Base optimization for all providers
    const optimizedOptions: AIRequestOptions = {
      ...options,
      maxTokens: Math.min(options.maxTokens || 2048, 256), // Significantly reduce max tokens
      systemPrompt: this.optimizeSystemPrompt(options.systemPrompt) // Compress system prompt
    };
    
    // Provider-specific optimizations
    if (adapterKey.includes('openai')) {
      optimizedOptions.model = this.selectCheapestModel(adapterKey, optimizedOptions.model);
    } else if (adapterKey.includes('anthropic')) {
      optimizedOptions.model = this.selectCheapestModel(adapterKey, optimizedOptions.model);
    }
    
    this.logger.debug(`Applied cost optimization for ${adapterKey}`, { 
      original: { 
        model: options.model, 
        maxTokens: options.maxTokens,
        systemPromptLength: options.systemPrompt?.length
      }, 
      optimized: { 
        model: optimizedOptions.model, 
        maxTokens: optimizedOptions.maxTokens,
        systemPromptLength: optimizedOptions.systemPrompt?.length
      } 
    });
    
    return optimizedOptions;
  }
  
  private optimizeSystemPrompt(systemPrompt?: string): string | undefined {
    if (!systemPrompt) return undefined;
    
    // Remove any verbose language, keep essential instructions
    return systemPrompt
      .replace(/\s+/g, ' ')
      .replace(/please\s/gi, '')
      .replace(/kindly\s/gi, '')
      .replace(/I'd like you to\s/gi, '')
      .replace(/\s+\./g, '.')
      .trim();
  }
  
  private selectCheapestModel(provider: string, currentModel?: string): string | undefined {
    // Model selection based on known cost characteristics
    const cheapModels: Record<string, string[]> = {
      'openai': ['gpt-3.5-turbo'],
      'anthropic': ['claude-instant'],
      'mistral': ['mistral-tiny', 'open-mixtral'] 
    };
    
    const providerCheapModels = cheapModels[provider];
    if (providerCheapModels && 
        (!currentModel || !providerCheapModels.includes(currentModel))) {
      return providerCheapModels[0]; // Select the first (cheapest) model
    }
    
    return currentModel;
  }
  
  getDescription(): string {
    return 'Optimizes for lowest cost, using cheaper models and reducing token usage';
  }
}

/**
 * Quality optimization strategy
 * Maximizes response quality regardless of cost or latency
 */
export class QualityOptimizationStrategy extends BaseOptimizationStrategy {
  constructor() {
    super(OptimizationTarget.QUALITY);
  }
  
  apply(adapter: AIServiceAdapter, options: AIRequestOptions): AIRequestOptions {
    const adapterKey = adapter.constructor.name.toLowerCase().replace('adapter', '');
    
    // Base optimization for all providers
    const optimizedOptions: AIRequestOptions = {
      ...options,
      temperature: Math.max(options.temperature || 0.7, 0.8), // Higher temperature for more creative responses
      topP: 0.95 // High top_p to allow wider distribution of token probabilities
    };
    
    // Provider-specific optimizations
    if (adapterKey.includes('openai')) {
      optimizedOptions.model = this.selectHighestQualityModel(adapterKey, optimizedOptions.model);
    } else if (adapterKey.includes('anthropic')) {
      optimizedOptions.model = this.selectHighestQualityModel(adapterKey, optimizedOptions.model);
    }
    
    this.logger.debug(`Applied quality optimization for ${adapterKey}`, { 
      original: { 
        model: options.model, 
        temperature: options.temperature
      }, 
      optimized: { 
        model: optimizedOptions.model, 
        temperature: optimizedOptions.temperature,
        topP: optimizedOptions.topP
      } 
    });
    
    return optimizedOptions;
  }
  
  private selectHighestQualityModel(provider: string, currentModel?: string): string | undefined {
    // Model selection based on known quality characteristics
    const qualityModels: Record<string, string[]> = {
      'openai': ['gpt-4-turbo', 'gpt-4'],
      'anthropic': ['claude-3-opus', 'claude-3-sonnet'],
      'mistral': ['mistral-large', 'mistral-medium']
    };
    
    const providerQualityModels = qualityModels[provider];
    if (providerQualityModels && currentModel !== providerQualityModels[0]) {
      return providerQualityModels[0]; // Select the first (highest quality) model
    }
    
    return currentModel;
  }
  
  getDescription(): string {
    return 'Optimizes for highest response quality, using advanced models and creative settings';
  }
}

/**
 * Reliability optimization strategy
 * Maximizes chance of successful completion and error-free responses
 */
export class ReliabilityOptimizationStrategy extends BaseOptimizationStrategy {
  constructor() {
    super(OptimizationTarget.RELIABILITY);
  }
  
  apply(adapter: AIServiceAdapter, options: AIRequestOptions): AIRequestOptions {
    const adapterKey = adapter.constructor.name.toLowerCase().replace('adapter', '');
    
    // Base optimization for all providers - conservative settings
    const optimizedOptions: AIRequestOptions = {
      ...options,
      temperature: 0.2, // Low temperature for deterministic responses
      maxTokens: Math.min(options.maxTokens || 2048, 1024), // Reasonable token limit
      timeout: (options.timeout || 30000) * 1.5 // 50% more time for completion
    };
    
    // Add retry logic hint if adapter supports it
    optimizedOptions.retries = 2;
    
    this.logger.debug(`Applied reliability optimization for ${adapterKey}`, { 
      original: { 
        temperature: options.temperature,
        timeout: options.timeout
      }, 
      optimized: { 
        temperature: optimizedOptions.temperature,
        timeout: optimizedOptions.timeout,
        retries: optimizedOptions.retries
      } 
    });
    
    return optimizedOptions;
  }
  
  getDescription(): string {
    return 'Optimizes for reliability and consistent completions with deterministic settings and retry logic';
  }
}

/**
 * Get the appropriate optimization strategy based on the current context
 */
export function getOptimizationStrategy(target?: OptimizationTarget): OptimizationStrategy {
  // If no target specified, get from config
  const config = getConfig();
  const configTarget = config.ai?.optimizationTarget as OptimizationTarget;
  const effectiveTarget = target || configTarget || OptimizationTarget.QUALITY;
  
  // Select strategy based on target
  switch (effectiveTarget) {
    case OptimizationTarget.LATENCY:
      return new LatencyOptimizationStrategy();
    case OptimizationTarget.COST:
      return new CostOptimizationStrategy();
    case OptimizationTarget.RELIABILITY:
      return new ReliabilityOptimizationStrategy();
    case OptimizationTarget.QUALITY:
    default:
      return new QualityOptimizationStrategy();
  }
}

/**
 * Apply the appropriate optimization strategy to request options
 */
export function optimizeRequestOptions(
  adapter: AIServiceAdapter,
  options: AIRequestOptions,
  target?: OptimizationTarget
): AIRequestOptions {
  // Skip optimization if explicitly disabled
  if (options.skipOptimization) {
    return options;
  }
  
  const strategy = getOptimizationStrategy(target);
  return strategy.apply(adapter, options);
}
