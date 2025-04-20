
import { AIServiceAdapter, AIRequestOptions, AIResponse } from './adapters/baseAdapter';
import { MistralAdapter } from './adapters/mistralAdapter';
import { OpenAIAdapter } from './adapters/openaiAdapter';
import { AIAdapterRegistry, adapterRegistry } from './adapters/adapterRegistry';
import { ServiceRegistry } from '../services/registry';
import { Logger } from '../utils/logger';

/**
 * Unified AI Service that automatically handles provider selection and fallback
 * with enhanced telemetry and diagnostics
 */
export class AIService {
  private registry: AIAdapterRegistry;
  private logger: Logger;
  private serviceHealth: {
    lastCheck: Date;
    healthy: boolean;
    message?: string;
    metrics?: {
      totalRequests: number;
      successRate: number;
      averageLatency: number;
      providerUsage: Record<string, number>;
    }
  } = {
    lastCheck: new Date(),
    healthy: false,
    metrics: {
      totalRequests: 0,
      successRate: 0,
      averageLatency: 0,
      providerUsage: {}
    }
  };
  
  constructor() {
    // Use the singleton adapter registry
    this.registry = adapterRegistry;
    this.logger = new Logger('AIService');
    
    // Initialize adapters
    const mistralAdapter = new MistralAdapter();
    const openaiAdapter = new OpenAIAdapter();
    
    // Register adapters with priority
    this.registry.registerAdapter('mistral', mistralAdapter, 1); // Primary
    this.registry.registerAdapter('openai', openaiAdapter, 2);   // Secondary/fallback
    
    // Register self in the service registry
    const serviceRegistry = ServiceRegistry.getInstance();
    serviceRegistry.registerService('ai', this);
    
    // Set up periodic health checks
    this.checkHealth();
    setInterval(() => this.checkHealth(), 10 * 60 * 1000); // Check every 10 minutes
  }
  
  /**
   * Generate text using the best available AI provider with enhanced telemetry
   */
  async generateText(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<string>> {
    const startTime = Date.now();
    this.serviceHealth.metrics!.totalRequests++;
    
    // Get all available adapters sorted by priority
    const adapters = this.registry.getAvailableAdapters();
    
    if (adapters.length === 0) {
      this.logger.error('No AI providers are available');
      throw new Error('No AI providers are available');
    }
    
    // Try each adapter in priority order
    let lastError: Error | null = null;
    let attempts = 0;
    
    for (const adapter of adapters) {
      attempts++;
      try {
        const adapterStartTime = Date.now();
        const result = await adapter.generateText(prompt, options);
        
        // Track metrics
        const adapterName = adapter.getStatus().name;
        this.serviceHealth.metrics!.providerUsage[adapterName] = 
          (this.serviceHealth.metrics!.providerUsage[adapterName] || 0) + 1;
          
        // Log success with provider info and latency
        this.logger.info(`AI request succeeded with ${adapterName} in ${Date.now() - adapterStartTime}ms`);
        
        // Update overall metrics
        this.updateSuccessMetrics(startTime);
        
        return result;
      } catch (error) {
        const adapterName = adapter.getStatus().name;
        this.logger.warn(`AI provider ${adapterName} failed, trying next provider`, error);
        lastError = error;
      }
    }
    
    // All providers failed
    this.updateFailureMetrics();
    throw lastError || new Error('All AI providers failed');
  }
  
  /**
   * Generate JSON using the best available AI provider with enhanced telemetry
   */
  async generateJson<T>(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<T>> {
    const startTime = Date.now();
    this.serviceHealth.metrics!.totalRequests++;
    
    // Get all available adapters sorted by priority
    const adapters = this.registry.getAvailableAdapters();
    
    if (adapters.length === 0) {
      this.logger.error('No AI providers are available');
      throw new Error('No AI providers are available');
    }
    
    // Try each adapter in priority order
    let lastError: Error | null = null;
    
    for (const adapter of adapters) {
      try {
        const adapterStartTime = Date.now();
        const result = await adapter.generateJson<T>(prompt, options);
        
        // Track metrics
        const adapterName = adapter.getStatus().name;
        this.serviceHealth.metrics!.providerUsage[adapterName] = 
          (this.serviceHealth.metrics!.providerUsage[adapterName] || 0) + 1;
          
        // Log success with provider info and latency
        this.logger.info(`AI JSON request succeeded with ${adapterName} in ${Date.now() - adapterStartTime}ms`);
        
        // Update overall metrics
        this.updateSuccessMetrics(startTime);
        
        return result;
      } catch (error) {
        const adapterName = adapter.getStatus().name;
        this.logger.warn(`AI provider ${adapterName} JSON generation failed, trying next provider`, error);
        lastError = error;
      }
    }
    
    // All providers failed
    this.updateFailureMetrics();
    throw lastError || new Error('All AI providers failed to generate JSON');
  }
  
  /**
   * Check the health of all AI providers
   */
  async checkHealth(): Promise<void> {
    const results = await this.registry.checkAllAdaptersHealth();
    const healthyCount = Array.from(results.values()).filter(healthy => healthy).length;
    
    this.serviceHealth = {
      ...this.serviceHealth,
      lastCheck: new Date(),
      healthy: healthyCount > 0,
      message: healthyCount > 0 
        ? `${healthyCount} AI providers available` 
        : 'No AI providers available'
    };
    
    this.logger.info(`AI service health: ${this.serviceHealth.healthy ? 'Healthy' : 'Unhealthy'} - ${this.serviceHealth.message}`);
  }
  
  /**
   * Get the health status of the AI service with detailed metrics
   */
  getServiceHealth() {
    return this.serviceHealth;
  }
  
  /**
   * Get detailed status of all AI providers
   */
  getProviderStatus() {
    return this.registry.getAvailableAdapters().map(adapter => adapter.getStatus());
  }
  
  /**
   * Register a new adapter at runtime
   */
  registerAdapter(key: string, adapter: AIServiceAdapter, priority: number): void {
    this.registry.registerAdapter(key, adapter, priority);
    this.logger.info(`New AI adapter registered: ${key} with priority ${priority}`);
  }
  
  /**
   * Update metrics after successful request
   */
  private updateSuccessMetrics(startTime: number): void {
    const latency = Date.now() - startTime;
    const metrics = this.serviceHealth.metrics!;
    
    // Update success rate
    const successfulRequests = Object.values(metrics.providerUsage)
      .reduce((sum, count) => sum + count, 0);
    metrics.successRate = (successfulRequests / metrics.totalRequests) * 100;
    
    // Update latency (weighted average)
    metrics.averageLatency = 
      ((metrics.averageLatency * (successfulRequests - 1)) + latency) / successfulRequests;
  }
  
  /**
   * Update metrics after failed request
   */
  private updateFailureMetrics(): void {
    const metrics = this.serviceHealth.metrics!;
    const successfulRequests = Object.values(metrics.providerUsage)
      .reduce((sum, count) => sum + count, 0);
    metrics.successRate = (successfulRequests / metrics.totalRequests) * 100;
  }
}

// Export a singleton instance
export const aiService = new AIService();

// Export a function to get the AI service from the registry
export function getAIService(): AIService {
  const registry = ServiceRegistry.getInstance();
  return registry.getService<AIService>('ai') || aiService;
}
