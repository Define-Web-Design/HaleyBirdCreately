/**
 * AI Service Adapter Registry
 * 
 * This module provides centralized management for AI service adapters,
 * supporting dynamic registration, priority-based selection, and health monitoring.
 */

import { 
  AIServiceAdapter, 
  AIAdapterStatus,
  AIAdapterMetrics
} from './adapters/baseAdapter';
import { EventEmitter } from 'events';
import winston from 'winston';

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'adapter-registry' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/ai-adapter-registry.log',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
    })
  ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Adapter availability check interval (in milliseconds)
const AVAILABILITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Interface for registry configuration
interface AdapterRegistryConfig {
  autoAvailabilityCheck?: boolean;
  availabilityCheckInterval?: number;
  preferredProvider?: string;
}

// Default configuration
const DEFAULT_CONFIG: AdapterRegistryConfig = {
  autoAvailabilityCheck: true,
  availabilityCheckInterval: AVAILABILITY_CHECK_INTERVAL,
  preferredProvider: undefined
};

/**
 * AI Service Adapter Registry for centralized adapter management
 */
export class AdapterRegistry extends EventEmitter {
  private adapters: Map<string, AIServiceAdapter> = new Map();
  private adapterId: number = 0;
  private adapterStatus: Map<string, AIAdapterStatus> = new Map();
  private healthCheckTimer?: NodeJS.Timeout;
  private config: AdapterRegistryConfig;
  
  /**
   * Create a new Adapter Registry
   * @param config Registry configuration
   */
  constructor(config: Partial<AdapterRegistryConfig> = {}) {
    super();
    
    // Merge provided config with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
    
    // Start automatic health checks if enabled
    if (this.config.autoAvailabilityCheck) {
      this.startHealthChecks();
    }
    
    logger.info('AI Adapter Registry initialized', { config: this.config });
  }
  
  /**
   * Register a new adapter
   * @param name Provider name
   * @param adapter Adapter implementation
   * @param priority Optional priority (lower number = higher priority)
   * @returns The registered adapter name
   */
  register(name: string, adapter: AIServiceAdapter, priority?: number): string {
    // Generate a unique adapter ID if not provided
    const adapterKey = name.toLowerCase();
    
    // Store the adapter
    this.adapters.set(adapterKey, adapter);
    
    // Initialize adapter status
    const status = adapter.getStatus();
    
    // Update priority if provided
    if (typeof priority === 'number') {
      status.priority = priority;
    }
    
    // Store initial status
    this.adapterStatus.set(adapterKey, status);
    
    logger.info(`Adapter registered: ${adapterKey}`, { 
      name: adapterKey,
      priority: status.priority,
      capabilities: status.capabilities
    });
    
    // Emit event
    this.emit('adapter:registered', { name: adapterKey, adapter });
    
    // Run immediate health check
    this.checkAdapterHealth(adapterKey);
    
    return adapterKey;
  }
  
  /**
   * Unregister an adapter
   * @param name Provider name
   * @returns True if adapter was unregistered, false if not found
   */
  unregister(name: string): boolean {
    const adapterKey = name.toLowerCase();
    
    if (!this.adapters.has(adapterKey)) {
      logger.warn(`Attempted to unregister non-existent adapter: ${adapterKey}`);
      return false;
    }
    
    // Remove adapter
    this.adapters.delete(adapterKey);
    this.adapterStatus.delete(adapterKey);
    
    logger.info(`Adapter unregistered: ${adapterKey}`);
    
    // Emit event
    this.emit('adapter:unregistered', { name: adapterKey });
    
    return true;
  }
  
  /**
   * Get an adapter by name
   * @param name Provider name
   * @returns The adapter or undefined if not found
   */
  getAdapter(name: string): AIServiceAdapter | undefined {
    return this.adapters.get(name.toLowerCase());
  }
  
  /**
   * Get all registered adapters
   * @returns Map of provider names to adapters
   */
  getAllAdapters(): Map<string, AIServiceAdapter> {
    return new Map(this.adapters);
  }
  
  /**
   * Get list of registered provider names
   * @returns Array of provider names
   */
  getProviderNames(): string[] {
    return Array.from(this.adapters.keys());
  }
  
  /**
   * Start automatic health checks
   */
  startHealthChecks(): void {
    // Clear any existing timer
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    // Set new timer
    this.healthCheckTimer = setInterval(
      () => this.checkAllAdaptersHealth(),
      this.config.availabilityCheckInterval
    );
    
    logger.info('Automatic health checks started', { 
      interval: this.config.availabilityCheckInterval
    });
  }
  
  /**
   * Stop automatic health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
      
      logger.info('Automatic health checks stopped');
    }
  }
  
  /**
   * Check health of a specific adapter
   * @param name Provider name
   * @returns Promise resolving to the adapter's health status
   */
  async checkAdapterHealth(name: string): Promise<boolean> {
    const adapterKey = name.toLowerCase();
    const adapter = this.adapters.get(adapterKey);
    
    if (!adapter) {
      logger.warn(`Cannot check health of non-existent adapter: ${adapterKey}`);
      return false;
    }
    
    try {
      // Get current status
      const status = { ...adapter.getStatus() };
      
      // Test connection
      const available = await adapter.testConnection();
      
      // Update status
      status.available = available;
      status.lastCheck = new Date();
      
      // Store updated status
      this.adapterStatus.set(adapterKey, status);
      
      logger.debug(`Adapter health check: ${adapterKey}`, { 
        name: adapterKey,
        available,
        lastCheck: status.lastCheck
      });
      
      // Emit events
      this.emit('adapter:health', { name: adapterKey, available });
      
      if (available) {
        this.emit('adapter:available', { name: adapterKey });
      } else {
        this.emit('adapter:unavailable', { name: adapterKey });
      }
      
      return available;
    } catch (error) {
      logger.error(`Error checking adapter health: ${adapterKey}`, { error });
      
      // Update status on error
      const status = { ...adapter.getStatus() };
      status.available = false;
      status.lastCheck = new Date();
      status.errorMessage = error.message;
      
      // Store updated status
      this.adapterStatus.set(adapterKey, status);
      
      // Emit event
      this.emit('adapter:error', { name: adapterKey, error });
      
      return false;
    }
  }
  
  /**
   * Check health of all registered adapters
   * @returns Promise resolving to a map of adapter names to health status
   */
  async checkAllAdaptersHealth(): Promise<Map<string, boolean>> {
    logger.debug('Checking health of all adapters');
    
    const results = new Map<string, boolean>();
    
    // Check each adapter
    for (const name of this.adapters.keys()) {
      const result = await this.checkAdapterHealth(name);
      results.set(name, result);
    }
    
    // Log results
    const availableCount = Array.from(results.values()).filter(v => v).length;
    logger.info(`Health check completed for ${results.size} adapters`, { 
      availableCount,
      unavailableCount: results.size - availableCount 
    });
    
    return results;
  }
  
  /**
   * Get the most suitable adapter based on availability and priority
   * @param preferredProvider Optional name of preferred provider
   * @returns The best available adapter or null if none available
   */
  async getBestAdapter(preferredProvider?: string): Promise<AIServiceAdapter | null> {
    // If preferred provider specified by method call
    if (preferredProvider) {
      const adapter = this.adapters.get(preferredProvider.toLowerCase());
      
      if (adapter) {
        const available = await this.checkAdapterHealth(preferredProvider);
        
        if (available) {
          logger.debug(`Using explicitly requested provider: ${preferredProvider}`);
          return adapter;
        }
        
        logger.warn(`Requested provider ${preferredProvider} is not available`);
      } else {
        logger.warn(`Requested provider ${preferredProvider} is not registered`);
      }
    }
    
    // If preferred provider specified in config
    if (this.config.preferredProvider) {
      const adapter = this.adapters.get(this.config.preferredProvider.toLowerCase());
      
      if (adapter) {
        const available = await this.checkAdapterHealth(this.config.preferredProvider);
        
        if (available) {
          logger.debug(`Using preferred provider from config: ${this.config.preferredProvider}`);
          return adapter;
        }
        
        logger.warn(`Preferred provider ${this.config.preferredProvider} from config is not available`);
      }
    }
    
    // Get all adapters sorted by priority
    const sortedAdapters = Array.from(this.adapters.entries())
      .sort((a, b) => {
        const statusA = this.adapterStatus.get(a[0]) || a[1].getStatus();
        const statusB = this.adapterStatus.get(b[0]) || b[1].getStatus();
        
        return statusA.priority - statusB.priority;
      });
    
    // Find first available adapter
    for (const [name, adapter] of sortedAdapters) {
      const available = await this.checkAdapterHealth(name);
      
      if (available) {
        logger.debug(`Using adapter by priority: ${name}`);
        return adapter;
      }
    }
    
    logger.error('No available AI adapters found');
    return null;
  }
  
  /**
   * Get current status of all adapters
   * @returns Map of adapter names to status
   */
  getAdapterStatus(): Record<string, AIAdapterStatus> {
    const result: Record<string, AIAdapterStatus> = {};
    
    for (const [name, adapter] of this.adapters.entries()) {
      // Get cached status or fresh status
      const status = this.adapterStatus.get(name) || adapter.getStatus();
      result[name] = { ...status };
    }
    
    return result;
  }
  
  /**
   * Get metrics for all adapters that support it
   * @returns Map of adapter names to metrics
   */
  getAdapterMetrics(): Record<string, AIAdapterMetrics | null> {
    const result: Record<string, AIAdapterMetrics | null> = {};
    
    for (const [name, adapter] of this.adapters.entries()) {
      if (typeof adapter.getMetrics === 'function') {
        result[name] = adapter.getMetrics();
      } else {
        result[name] = null;
      }
    }
    
    return result;
  }
  
  /**
   * Reset metrics for all adapters that support it
   */
  resetAllMetrics(): void {
    for (const adapter of this.adapters.values()) {
      if (typeof adapter.resetMetrics === 'function') {
        adapter.resetMetrics();
      }
    }
    
    logger.info('Reset metrics for all adapters');
  }
}

// Export singleton instance
export const adapterRegistry = new AdapterRegistry();