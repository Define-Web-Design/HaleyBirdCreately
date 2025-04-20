
import { AIServiceAdapter } from './baseAdapter';
import { ServiceRegistry } from '../../services/registry';

/**
 * AI Adapter Registry for managing multiple AI service providers
 * with dynamic registration and prioritization capabilities
 */
export class AIAdapterRegistry {
  private static instance: AIAdapterRegistry;
  private adapters: Map<string, AIServiceAdapter> = new Map();
  private priorityOrder: string[] = [];
  
  private constructor() {
    // Register in the service registry
    const registry = ServiceRegistry.getInstance();
    registry.registerService('ai:registry', this);
  }
  
  /**
   * Get the singleton instance of AIAdapterRegistry
   */
  public static getInstance(): AIAdapterRegistry {
    if (!AIAdapterRegistry.instance) {
      AIAdapterRegistry.instance = new AIAdapterRegistry();
    }
    return AIAdapterRegistry.instance;
  }
  
  /**
   * Register an AI service adapter
   */
  public registerAdapter(key: string, adapter: AIServiceAdapter, priority: number = 999): void {
    this.adapters.set(key, adapter);
    
    // Add to priority list based on provided priority
    this.updatePriorityOrder(key, priority);
  }
  
  /**
   * Update the priority of a registered adapter
   */
  public setPriority(key: string, priority: number): void {
    if (this.adapters.has(key)) {
      this.updatePriorityOrder(key, priority);
    }
  }
  
  /**
   * Get an adapter by key
   */
  public getAdapter(key: string): AIServiceAdapter | undefined {
    return this.adapters.get(key);
  }
  
  /**
   * Get all available adapters sorted by priority
   */
  public getAvailableAdapters(): AIServiceAdapter[] {
    return this.priorityOrder
      .map(key => this.adapters.get(key))
      .filter(adapter => adapter && adapter.getStatus().available) as AIServiceAdapter[];
  }
  
  /**
   * Get the highest priority available adapter
   */
  public getPrimaryAdapter(): AIServiceAdapter | undefined {
    const availableAdapters = this.getAvailableAdapters();
    return availableAdapters.length > 0 ? availableAdapters[0] : undefined;
  }
  
  /**
   * Helper method to update priority order
   */
  private updatePriorityOrder(key: string, priority: number): void {
    // Remove key if it already exists in the priority order
    this.priorityOrder = this.priorityOrder.filter(k => k !== key);
    
    // Store adapter's priority internally
    const adapter = this.adapters.get(key);
    if (adapter) {
      Object.defineProperty(adapter, '_priority', { value: priority, writable: true });
    }
    
    // Find position to insert based on priority
    let insertIndex = this.priorityOrder.length;
    for (let i = 0; i < this.priorityOrder.length; i++) {
      const currentAdapter = this.adapters.get(this.priorityOrder[i]);
      const currentPriority = currentAdapter ? (currentAdapter as any)._priority || 999 : 999;
      
      if (priority < currentPriority) {
        insertIndex = i;
        break;
      }
    }
    
    // Insert at the appropriate position
    this.priorityOrder.splice(insertIndex, 0, key);
  }
  
  /**
   * Check health of all registered adapters
   */
  public async checkAllAdaptersHealth(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    const healthChecks = Array.from(this.adapters.entries()).map(async ([key, adapter]) => {
      const isHealthy = await adapter.testConnection();
      results.set(key, isHealthy);
    });
    
    await Promise.all(healthChecks);
    return results;
  }
}

// Export a singleton instance
export const adapterRegistry = AIAdapterRegistry.getInstance();
