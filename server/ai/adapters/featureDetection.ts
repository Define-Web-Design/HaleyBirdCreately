
/**
 * AI Service Feature Detection System
 * 
 * This module provides automated detection of AI provider capabilities
 * and maintains a registry of provider-specific feature support.
 */

import { AIServiceAdapter } from './baseAdapter';
import { Logger } from '../../utils/logger';

// Feature enumeration
export enum AIFeature {
  TEXT_GENERATION = 'textGeneration',
  JSON_GENERATION = 'jsonGeneration',
  IMAGE_GENERATION = 'imageGeneration',
  STREAMING = 'streaming', 
  FUNCTION_CALLING = 'functionCalling',
  EMBEDDINGS = 'embeddings',
  VISION = 'vision',
  AUDIO = 'audio',
  FINE_TUNING = 'fineTuning'
}

// Feature discovery result
export interface FeatureDetectionResult {
  supportedFeatures: Set<AIFeature>;
  unsupportedFeatures: Set<AIFeature>;
  indeterminateFeatures: Set<AIFeature>;
  error?: Error;
}

// Feature support registry
export class AIFeatureRegistry {
  private static instance: AIFeatureRegistry;
  private featureMap: Map<string, Map<AIFeature, boolean>> = new Map();
  private logger: Logger = new Logger('AIFeatureRegistry');
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): AIFeatureRegistry {
    if (!AIFeatureRegistry.instance) {
      AIFeatureRegistry.instance = new AIFeatureRegistry();
    }
    return AIFeatureRegistry.instance;
  }
  
  /**
   * Register feature support for an adapter
   */
  public registerFeatureSupport(
    adapterKey: string, 
    feature: AIFeature, 
    supported: boolean
  ): void {
    if (!this.featureMap.has(adapterKey)) {
      this.featureMap.set(adapterKey, new Map());
    }
    
    const adapterFeatures = this.featureMap.get(adapterKey)!;
    adapterFeatures.set(feature, supported);
    
    this.logger.debug(`Registered feature ${feature} as ${supported ? 'supported' : 'unsupported'} for ${adapterKey}`);
  }
  
  /**
   * Check if a feature is supported by an adapter
   */
  public isFeatureSupported(
    adapterKey: string,
    feature: AIFeature
  ): boolean | undefined {
    const adapterFeatures = this.featureMap.get(adapterKey);
    if (!adapterFeatures) {
      return undefined; // Unknown adapter
    }
    
    return adapterFeatures.get(feature);
  }
  
  /**
   * Get all adapters supporting a specific feature
   */
  public getAdaptersSupportingFeature(feature: AIFeature): string[] {
    const supportingAdapters: string[] = [];
    
    for (const [adapterKey, features] of this.featureMap.entries()) {
      if (features.get(feature) === true) {
        supportingAdapters.push(adapterKey);
      }
    }
    
    return supportingAdapters;
  }
  
  /**
   * Auto-detect features for an adapter
   */
  public async detectFeatures(
    adapterKey: string,
    adapter: AIServiceAdapter
  ): Promise<FeatureDetectionResult> {
    const supportedFeatures = new Set<AIFeature>();
    const unsupportedFeatures = new Set<AIFeature>();
    const indeterminateFeatures = new Set<AIFeature>();
    
    try {
      // Get adapter status which may contain capability info
      const status = adapter.getStatus();
      
      // Check capabilities from status if available
      if (status.capabilities) {
        for (const [feature, supported] of Object.entries(status.capabilities)) {
          if (supported) {
            supportedFeatures.add(feature as AIFeature);
            this.registerFeatureSupport(adapterKey, feature as AIFeature, true);
          } else {
            unsupportedFeatures.add(feature as AIFeature);
            this.registerFeatureSupport(adapterKey, feature as AIFeature, false);
          }
        }
      } else {
        // Detect capabilities through interface inspection
        
        // Text generation is guaranteed by base interface
        supportedFeatures.add(AIFeature.TEXT_GENERATION);
        this.registerFeatureSupport(adapterKey, AIFeature.TEXT_GENERATION, true);
        
        // JSON generation is guaranteed by base interface
        supportedFeatures.add(AIFeature.JSON_GENERATION);
        this.registerFeatureSupport(adapterKey, AIFeature.JSON_GENERATION, true);
        
        // Check for streaming capability
        if (adapter.streamText) {
          supportedFeatures.add(AIFeature.STREAMING);
          this.registerFeatureSupport(adapterKey, AIFeature.STREAMING, true);
        } else {
          unsupportedFeatures.add(AIFeature.STREAMING);
          this.registerFeatureSupport(adapterKey, AIFeature.STREAMING, false);
        }
        
        // Check for image generation
        if (adapter.generateImage) {
          supportedFeatures.add(AIFeature.IMAGE_GENERATION);
          this.registerFeatureSupport(adapterKey, AIFeature.IMAGE_GENERATION, true);
        } else {
          unsupportedFeatures.add(AIFeature.IMAGE_GENERATION);
          this.registerFeatureSupport(adapterKey, AIFeature.IMAGE_GENERATION, false);
        }
        
        // Other features require deeper inspection or test calls
        indeterminateFeatures.add(AIFeature.FUNCTION_CALLING);
        indeterminateFeatures.add(AIFeature.EMBEDDINGS);
        indeterminateFeatures.add(AIFeature.VISION);
        indeterminateFeatures.add(AIFeature.AUDIO);
        indeterminateFeatures.add(AIFeature.FINE_TUNING);
      }
      
      this.logger.info(`Feature detection for ${adapterKey} complete`, {
        supported: Array.from(supportedFeatures),
        unsupported: Array.from(unsupportedFeatures),
        indeterminate: Array.from(indeterminateFeatures)
      });
      
      return { supportedFeatures, unsupportedFeatures, indeterminateFeatures };
    } catch (error) {
      this.logger.error(`Error detecting features for ${adapterKey}`, error);
      return { 
        supportedFeatures, 
        unsupportedFeatures, 
        indeterminateFeatures,
        error: error as Error
      };
    }
  }
  
  /**
   * Get feature support map for all adapters
   */
  public getFeatureSupportMap(): Record<string, Record<string, boolean>> {
    const result: Record<string, Record<string, boolean>> = {};
    
    for (const [adapterKey, features] of this.featureMap.entries()) {
      result[adapterKey] = {};
      
      for (const [feature, supported] of features.entries()) {
        result[adapterKey][feature] = supported;
      }
    }
    
    return result;
  }
}

// Export singleton instance
export const featureRegistry = AIFeatureRegistry.getInstance();
