/**
 * Lazy Component Loading Utilities
 * 
 * Provides tools for efficient lazy loading of React components with
 * performance tracking and error handling.
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { startPerformanceMarker, endPerformanceMarker } from './performance';

// Component load status
export type ComponentLoadStatus = 'pending' | 'loading' | 'loaded' | 'error';

// Component cache entry
interface ComponentCacheEntry<T = any> {
  component: LazyExoticComponent<ComponentType<T>>;
  status: ComponentLoadStatus;
  error?: Error;
  loadTime?: number;
}

// Component cache
const componentCache = new Map<string, ComponentCacheEntry>();

// Options for lazy loading
export interface LazyLoadOptions {
  trackPerformance?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  errorFallback?: React.ComponentType<any>;
  onLoad?: (name: string, loadTime: number) => void;
  onError?: (name: string, error: Error) => void;
}

// Default options
const defaultOptions: LazyLoadOptions = {
  trackPerformance: true,
  retryOnError: false,
  maxRetries: 3,
  retryDelay: 1000,
};

/**
 * Create a lazy-loaded component with performance tracking
 * @param importFn Function that imports the component
 * @param name Component name for tracking
 * @param options Lazy loading options
 * @returns Lazy component
 */
export function createLazyComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  name: string,
  options: LazyLoadOptions = {}
): LazyExoticComponent<ComponentType<T>> {
  // Merge options with defaults
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Check if component is already in cache
  if (componentCache.has(name)) {
    return componentCache.get(name)!.component;
  }
  
  // Create wrapper around import function with performance tracking
  const wrappedImport = async () => {
    // Start tracking if enabled
    let marker;
    if (mergedOptions.trackPerformance) {
      marker = startPerformanceMarker(`lazyLoad:${name}`);
    }
    
    // Update status
    if (componentCache.has(name)) {
      componentCache.get(name)!.status = 'loading';
    }
    
    let retries = 0;
    let component: { default: ComponentType<T> };
    
    while (true) {
      try {
        // Import component
        component = await importFn();
        
        // End tracking if enabled
        if (mergedOptions.trackPerformance && marker) {
          const loadTime = endPerformanceMarker(`lazyLoad:${name}`);
          
          // Update cache with load time
          if (componentCache.has(name)) {
            const entry = componentCache.get(name)!;
            entry.loadTime = loadTime;
            entry.status = 'loaded';
          }
          
          // Call onLoad callback if provided
          if (mergedOptions.onLoad) {
            mergedOptions.onLoad(name, loadTime);
          }
        }
        
        break;
      } catch (error) {
        // Update cache with error
        if (componentCache.has(name)) {
          const entry = componentCache.get(name)!;
          entry.error = error instanceof Error ? error : new Error(String(error));
          entry.status = 'error';
        }
        
        // Call onError callback if provided
        if (mergedOptions.onError) {
          mergedOptions.onError(name, error instanceof Error ? error : new Error(String(error)));
        }
        
        // Retry if enabled and not exceeded max retries
        if (mergedOptions.retryOnError && retries < (mergedOptions.maxRetries || 3)) {
          retries++;
          
          // Wait before retry
          await new Promise(resolve => 
            setTimeout(resolve, mergedOptions.retryDelay || 1000)
          );
          
          // Log retry
          console.info(`Retrying to load component ${name} (${retries}/${mergedOptions.maxRetries})`);
          
          // Try again
          continue;
        }
        
        // Rethrow error if no more retries
        throw error;
      }
    }
    
    return component;
  };
  
  // Create lazy component
  const lazyComponent = lazy(wrappedImport);
  
  // Store in cache
  componentCache.set(name, {
    component: lazyComponent,
    status: 'pending',
  });
  
  return lazyComponent;
}

/**
 * Get the load status of a component
 * @param name Component name
 * @returns Load status or null if component not in cache
 */
export function getComponentStatus(name: string): ComponentLoadStatus | null {
  return componentCache.has(name) ? componentCache.get(name)!.status : null;
}

/**
 * Get the load time of a component
 * @param name Component name
 * @returns Load time in milliseconds or null if component not loaded
 */
export function getComponentLoadTime(name: string): number | null {
  if (!componentCache.has(name)) return null;
  
  const entry = componentCache.get(name)!;
  return entry.loadTime ?? null;
}

/**
 * Get all component load statistics
 * @returns Object with component load statistics
 */
export function getComponentLoadStats(): Record<string, { status: ComponentLoadStatus, loadTime?: number, error?: string }> {
  const stats: Record<string, { status: ComponentLoadStatus, loadTime?: number, error?: string }> = {};
  
  // Collect stats from cache
  for (const [name, entry] of componentCache.entries()) {
    stats[name] = {
      status: entry.status,
      loadTime: entry.loadTime,
      error: entry.error?.message
    };
  }
  
  return stats;
}

/**
 * Preload a component
 * @param name Component name
 * @returns Promise that resolves when component is loaded
 */
export async function preloadComponent(name: string): Promise<void> {
  if (!componentCache.has(name)) {
    throw new Error(`Component ${name} not registered for lazy loading`);
  }
  
  const entry = componentCache.get(name)!;
  
  // Only preload if not already loaded or loading
  if (entry.status === 'pending' || entry.status === 'error') {
    // Trigger load
    try {
      const componentModule = (entry.component as any)._payload;
      await componentModule._load();
    } catch (error) {
      console.error(`Failed to preload component ${name}:`, error);
    }
  }
}

/**
 * Create a bundle of lazy-loaded components
 * @param components Object with component import functions
 * @param options Lazy loading options
 * @returns Object with lazy components
 */
export function createLazyBundle<T extends Record<string, () => Promise<{ default: ComponentType<any> }>>>(
  components: T,
  options: LazyLoadOptions = {}
): { [K in keyof T]: LazyExoticComponent<ComponentType<any>> } {
  const bundle = {} as { [K in keyof T]: LazyExoticComponent<ComponentType<any>> };
  
  // Create lazy components for each entry
  for (const [name, importFn] of Object.entries(components)) {
    bundle[name as keyof T] = createLazyComponent(
      importFn as () => Promise<{ default: ComponentType<any> }>,
      name,
      options
    );
  }
  
  return bundle;
}