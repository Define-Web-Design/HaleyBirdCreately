
import { AIServiceAdapter, AIRequestOptions, AIResponse } from './adapters/baseAdapter';
import { MistralAdapter } from './adapters/mistralAdapter';
import { OpenAIAdapter } from './adapters/openaiAdapter';
import { ServiceRegistry } from '../services/registry';

/**
 * Unified AI Service that automatically handles provider selection and fallback
 */
export class AIService {
  private adapters: AIServiceAdapter[] = [];
  private serviceHealth: {
    lastCheck: Date;
    healthy: boolean;
    message?: string;
  } = {
    lastCheck: new Date(),
    healthy: false
  };
  
  constructor() {
    // Initialize adapters - order determines fallback priority
    this.adapters = [
      new MistralAdapter(), // Primary
      new OpenAIAdapter()   // Secondary/fallback
    ];
    
    // Register self in the service registry
    const registry = ServiceRegistry.getInstance();
    registry.registerService('ai', this);
    
    // Set up periodic health checks
    this.checkHealth();
    setInterval(() => this.checkHealth(), 10 * 60 * 1000); // Check every 10 minutes
  }
  
  /**
   * Generate text using the best available AI provider
   */
  async generateText(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<string>> {
    // Sort adapters by priority and availability
    const sortedAdapters = this.getSortedAdapters();
    
    if (sortedAdapters.length === 0) {
      throw new Error('No AI providers are available');
    }
    
    // Try each adapter in priority order
    let lastError: Error | null = null;
    
    for (const adapter of sortedAdapters) {
      try {
        const result = await adapter.generateText(prompt, options);
        return result;
      } catch (error) {
        console.warn(`AI provider ${adapter.getStatus().name} failed, trying next provider`, error);
        lastError = error;
      }
    }
    
    // If we get here, all providers failed
    throw lastError || new Error('All AI providers failed');
  }
  
  /**
   * Generate JSON using the best available AI provider
   */
  async generateJson<T>(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<T>> {
    // Sort adapters by priority and availability
    const sortedAdapters = this.getSortedAdapters();
    
    if (sortedAdapters.length === 0) {
      throw new Error('No AI providers are available');
    }
    
    // Try each adapter in priority order
    let lastError: Error | null = null;
    
    for (const adapter of sortedAdapters) {
      try {
        const result = await adapter.generateJson<T>(prompt, options);
        return result;
      } catch (error) {
        console.warn(`AI provider ${adapter.getStatus().name} failed, trying next provider`, error);
        lastError = error;
      }
    }
    
    // If we get here, all providers failed
    throw lastError || new Error('All AI providers failed');
  }
  
  /**
   * Check the health of all AI providers
   */
  async checkHealth(): Promise<void> {
    let healthyAdapters = 0;
    
    for (const adapter of this.adapters) {
      const isAvailable = await adapter.testConnection();
      if (isAvailable) {
        healthyAdapters++;
      }
    }
    
    this.serviceHealth = {
      lastCheck: new Date(),
      healthy: healthyAdapters > 0,
      message: healthyAdapters > 0 
        ? `${healthyAdapters} AI providers available` 
        : 'No AI providers available'
    };
    
    console.log(`AI service health: ${this.serviceHealth.healthy ? 'Healthy' : 'Unhealthy'} - ${this.serviceHealth.message}`);
  }
  
  /**
   * Get the health status of the AI service
   */
  getServiceHealth() {
    return this.serviceHealth;
  }
  
  /**
   * Get detailed status of all AI providers
   */
  getProviderStatus() {
    return this.adapters.map(adapter => adapter.getStatus());
  }
  
  /**
   * Helper to sort adapters by priority and availability
   */
  private getSortedAdapters(): AIServiceAdapter[] {
    return [...this.adapters]
      .filter(adapter => adapter.getStatus().available)
      .sort((a, b) => a.getStatus().priority - b.getStatus().priority);
  }
}

// Export a singleton instance
export const aiService = new AIService();

// Export a function to get the AI service from the registry
export function getAIService(): AIService {
  const registry = ServiceRegistry.getInstance();
  return registry.getService<AIService>('ai') || aiService;
}
