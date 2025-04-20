
/**
 * Utility Function Registry
 * 
 * This module provides a centralized registry for utility functions with 
 * versioning, dependency tracking, and automated diagnostics.
 */

import { Logger } from '../../server/utils/logger';

// Utility function metadata
export interface UtilityMeta {
  name: string;
  version: string;
  description: string;
  category: string;
  deprecated?: boolean;
  replacedBy?: string;
  author?: string;
  dependencies?: string[];
  tags?: string[];
  platform?: 'server' | 'client' | 'shared';
  usageCount?: number;
  lastUsed?: Date;
}

// Registry storage
interface UtilityRegistry {
  [key: string]: {
    meta: UtilityMeta;
    fn: Function;
  };
}

/**
 * Utility Registry Service
 */
export class UtilityRegistryService {
  private static instance: UtilityRegistryService;
  private registry: UtilityRegistry = {};
  private logger: Logger;
  
  private constructor() {
    this.logger = new Logger('UtilityRegistry');
    this.logger.info('Utility Registry initialized');
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): UtilityRegistryService {
    if (!UtilityRegistryService.instance) {
      UtilityRegistryService.instance = new UtilityRegistryService();
    }
    return UtilityRegistryService.instance;
  }
  
  /**
   * Register a utility function
   */
  public register<T extends Function>(fn: T, meta: UtilityMeta): T {
    const key = `${meta.category}.${meta.name}`;
    
    // Check if this is an update to an existing utility
    const isUpdate = this.registry[key] !== undefined;
    
    // Store in registry
    this.registry[key] = {
      meta: {
        ...meta,
        usageCount: 0,
        lastUsed: new Date()
      },
      fn
    };
    
    this.logger.debug(`${isUpdate ? 'Updated' : 'Registered'} utility: ${key} (v${meta.version})`);
    
    // Create a wrapped function to track usage
    const wrappedFn = (...args: any[]) => {
      this.trackUsage(key);
      return fn(...args);
    };
    
    // Copy properties from original function
    Object.defineProperties(wrappedFn, Object.getOwnPropertyDescriptors(fn));
    
    // Return the wrapped function
    return wrappedFn as T;
  }
  
  /**
   * Track usage of a utility function
   */
  private trackUsage(key: string): void {
    if (this.registry[key]) {
      // Update usage statistics
      this.registry[key].meta.usageCount = (this.registry[key].meta.usageCount || 0) + 1;
      this.registry[key].meta.lastUsed = new Date();
    }
  }
  
  /**
   * Get a utility function by name and category
   */
  public get(category: string, name: string): Function | undefined {
    const key = `${category}.${name}`;
    
    if (!this.registry[key]) {
      this.logger.warn(`Utility not found: ${key}`);
      return undefined;
    }
    
    // Check if deprecated
    if (this.registry[key].meta.deprecated) {
      const replacementMsg = this.registry[key].meta.replacedBy 
        ? `Use ${this.registry[key].meta.replacedBy} instead.`
        : '';
        
      this.logger.warn(
        `Using deprecated utility: ${key}. ${replacementMsg}`
      );
    }
    
    // Track usage
    this.trackUsage(key);
    
    return this.registry[key].fn;
  }
  
  /**
   * Get metadata for a utility function
   */
  public getMeta(category: string, name: string): UtilityMeta | undefined {
    const key = `${category}.${name}`;
    
    if (!this.registry[key]) {
      return undefined;
    }
    
    return { ...this.registry[key].meta };
  }
  
  /**
   * List all registered utilities with optional category filter
   */
  public list(category?: string): UtilityMeta[] {
    return Object.entries(this.registry)
      .filter(([key]) => !category || key.startsWith(`${category}.`))
      .map(([_, value]) => ({ ...value.meta }));
  }
  
  /**
   * Mark a utility function as deprecated
   */
  public deprecate(category: string, name: string, replacedBy?: string): boolean {
    const key = `${category}.${name}`;
    
    if (!this.registry[key]) {
      this.logger.warn(`Cannot deprecate non-existent utility: ${key}`);
      return false;
    }
    
    this.registry[key].meta.deprecated = true;
    
    if (replacedBy) {
      this.registry[key].meta.replacedBy = replacedBy;
    }
    
    this.logger.info(`Marked utility as deprecated: ${key}`);
    return true;
  }
  
  /**
   * Get utility usage statistics
   */
  public getUsageStats(): Record<string, { usageCount: number; lastUsed: Date }> {
    const stats: Record<string, { usageCount: number; lastUsed: Date }> = {};
    
    for (const [key, value] of Object.entries(this.registry)) {
      stats[key] = {
        usageCount: value.meta.usageCount || 0,
        lastUsed: value.meta.lastUsed || new Date(0)
      };
    }
    
    return stats;
  }
  
  /**
   * Find utilities by tag
   */
  public findByTag(tag: string): UtilityMeta[] {
    return Object.values(this.registry)
      .filter(utility => utility.meta.tags && utility.meta.tags.includes(tag))
      .map(utility => ({ ...utility.meta }));
  }
  
  /**
   * Get dependency graph for utilities
   */
  public getDependencyGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {};
    
    for (const [key, value] of Object.entries(this.registry)) {
      if (value.meta.dependencies && value.meta.dependencies.length > 0) {
        graph[key] = [...value.meta.dependencies];
      } else {
        graph[key] = [];
      }
    }
    
    return graph;
  }
  
  /**
   * Detect circular dependencies
   */
  public detectCircularDependencies(): string[][] {
    const graph = this.getDependencyGraph();
    const circularPaths: string[][] = [];
    
    // Helper function for DFS
    function findCycles(node: string, visited: Set<string>, path: string[]) {
      if (visited.has(node)) {
        // Find where in the path this node was first visited
        const index = path.indexOf(node);
        if (index >= 0) {
          // Extract the cycle
          circularPaths.push(path.slice(index).concat(node));
        }
        return;
      }
      
      visited.add(node);
      path.push(node);
      
      for (const dependency of graph[node] || []) {
        findCycles(dependency, new Set(visited), [...path]);
      }
    }
    
    // Check each node
    for (const node of Object.keys(graph)) {
      findCycles(node, new Set<string>(), []);
    }
    
    return circularPaths;
  }
  
  /**
   * Generate utility function health report
   */
  public generateHealthReport(): any {
    // Get usage statistics
    const usageStats = this.getUsageStats();
    
    // Find unused utilities
    const unused = Object.entries(usageStats)
      .filter(([_, stats]) => stats.usageCount === 0)
      .map(([key]) => key);
    
    // Find deprecated utilities still in use
    const deprecatedInUse = Object.entries(this.registry)
      .filter(([_, utility]) => 
        utility.meta.deprecated && 
        utility.meta.usageCount && 
        utility.meta.usageCount > 0
      )
      .map(([key]) => key);
    
    // Detect circular dependencies
    const circularDependencies = this.detectCircularDependencies();
    
    // Generate report
    return {
      timestamp: new Date().toISOString(),
      totalUtilities: Object.keys(this.registry).length,
      categoryCounts: this.getCategoryCounts(),
      platformCounts: this.getPlatformCounts(),
      warnings: {
        unusedUtilities: unused,
        deprecatedInUse,
        circularDependencies
      },
      mostUsed: Object.entries(usageStats)
        .sort((a, b) => b[1].usageCount - a[1].usageCount)
        .slice(0, 10)
        .map(([key, stats]) => ({
          utility: key,
          usageCount: stats.usageCount
        }))
    };
  }
  
  /**
   * Get utility count by category
   */
  private getCategoryCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const utility of Object.values(this.registry)) {
      const category = utility.meta.category;
      counts[category] = (counts[category] || 0) + 1;
    }
    
    return counts;
  }
  
  /**
   * Get utility count by platform
   */
  private getPlatformCounts(): Record<string, number> {
    const counts: Record<string, number> = {
      server: 0,
      client: 0,
      shared: 0,
      unknown: 0
    };
    
    for (const utility of Object.values(this.registry)) {
      const platform = utility.meta.platform || 'unknown';
      counts[platform] = (counts[platform] || 0) + 1;
    }
    
    return counts;
  }
}

// Export singleton instance
export const utilityRegistry = UtilityRegistryService.getInstance();

/**
 * Decorator for registering utility functions
 */
export function registerUtility(meta: Omit<UtilityMeta, 'name'>) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Get the original function
    const originalFunction = descriptor.value;
    
    // Register the function
    const registry = UtilityRegistryService.getInstance();
    const wrappedFn = registry.register(originalFunction, {
      ...meta,
      name: propertyKey
    });
    
    // Replace the function with the wrapped version
    descriptor.value = wrappedFn;
    
    return descriptor;
  };
}
