
/**
 * Enhanced Lazy Component Loading System
 * 
 * This module provides optimized lazy loading for React components
 * with built-in performance tracking, error handling, and prefetching.
 */

import React, { lazy, ComponentType, LazyExoticComponent } from 'react';
import { measureLazyLoad, PerformanceCategory, startMeasure, endMeasure } from './performance';

// Component loading states tracking
interface ComponentLoadingState {
  loaded: boolean;
  loading: boolean;
  error: Error | null;
  timestamp: number;
}

// Cache to track component loading states
const componentCache = new Map<string, ComponentLoadingState>();

// Component importers registry
const componentImporters = new Map<string, () => Promise<{ default: ComponentType<any> }>>();

/**
 * Register a component for lazy loading
 */
export function registerLazyComponent(
  name: string,
  importer: () => Promise<{ default: ComponentType<any> }>
): void {
  componentImporters.set(name, importer);
  componentCache.set(name, {
    loaded: false,
    loading: false,
    error: null,
    timestamp: 0
  });
}

/**
 * Enhanced lazy loading with performance tracking
 */
export function lazyWithPerf<T extends ComponentType<any>>(
  name: string,
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  // Register the component if not already registered
  if (!componentImporters.has(name)) {
    registerLazyComponent(name, importFn);
  }
  
  return lazy(() => {
    startMeasure(name, PerformanceCategory.LAZY_LOAD);
    
    // Update component state
    const state = componentCache.get(name) || {
      loaded: false,
      loading: false,
      error: null,
      timestamp: 0
    };
    
    componentCache.set(name, {
      ...state,
      loading: true,
      timestamp: Date.now()
    });
    
    return importFn()
      .then(module => {
        // Measure load time
        const duration = endMeasure(name, PerformanceCategory.LAZY_LOAD);
        console.debug(`Lazy loaded component ${name} in ${duration.toFixed(2)}ms`);
        
        // Update component state
        componentCache.set(name, {
          loaded: true,
          loading: false,
          error: null,
          timestamp: Date.now()
        });
        
        return module;
      })
      .catch(error => {
        console.error(`Error lazy loading component ${name}:`, error);
        
        // Update component state with error
        componentCache.set(name, {
          loaded: false,
          loading: false,
          error,
          timestamp: Date.now()
        });
        
        throw error;
      });
  });
}

/**
 * Preload a component without rendering it
 */
export function preloadComponent(name: string): Promise<void> {
  if (!componentImporters.has(name)) {
    console.warn(`Component ${name} not registered for lazy loading`);
    return Promise.reject(new Error(`Component ${name} not registered`));
  }
  
  const state = componentCache.get(name);
  if (state?.loaded) {
    return Promise.resolve();
  }
  
  if (state?.loading) {
    return new Promise((resolve, reject) => {
      // Check status every 100ms
      const interval = setInterval(() => {
        const currentState = componentCache.get(name);
        if (currentState?.loaded) {
          clearInterval(interval);
          resolve();
        } else if (currentState?.error) {
          clearInterval(interval);
          reject(currentState.error);
        }
      }, 100);
    });
  }
  
  startMeasure(`preload:${name}`, PerformanceCategory.LAZY_LOAD);
  
  // Update component state
  componentCache.set(name, {
    ...state!,
    loading: true,
    timestamp: Date.now()
  });
  
  const importFn = componentImporters.get(name)!;
  return importFn()
    .then(() => {
      const duration = endMeasure(`preload:${name}`, PerformanceCategory.LAZY_LOAD);
      console.debug(`Preloaded component ${name} in ${duration.toFixed(2)}ms`);
      
      // Update component state
      componentCache.set(name, {
        loaded: true,
        loading: false,
        error: null,
        timestamp: Date.now()
      });
    })
    .catch(error => {
      console.error(`Error preloading component ${name}:`, error);
      
      // Update component state
      componentCache.set(name, {
        loaded: false,
        loading: false,
        error,
        timestamp: Date.now()
      });
      
      throw error;
    });
}

/**
 * Check if a component is already loaded
 */
export function isComponentLoaded(name: string): boolean {
  const state = componentCache.get(name);
  return !!state?.loaded;
}

/**
 * Get loading state for a component
 */
export function getComponentLoadingState(name: string): ComponentLoadingState | undefined {
  return componentCache.get(name);
}

/**
 * Preload a group of components in parallel
 */
export function preloadComponentGroup(names: string[]): Promise<void[]> {
  return Promise.all(names.map(name => preloadComponent(name)));
}

/**
 * Get all registered component names
 */
export function getRegisteredComponents(): string[] {
  return Array.from(componentImporters.keys());
}

/**
 * Reset the loading state for a component
 */
export function resetComponentLoadingState(name: string): void {
  if (componentCache.has(name)) {
    componentCache.set(name, {
      loaded: false,
      loading: false,
      error: null,
      timestamp: 0
    });
  }
}

/**
 * Get performance metrics for all lazy-loaded components
 */
export function getLazyLoadingMetrics(): Record<string, {
  loaded: boolean;
  loadTime?: number;
  loadTimestamp?: number;
  error?: string;
}> {
  const metrics: Record<string, any> = {};
  
  componentCache.forEach((state, name) => {
    metrics[name] = {
      loaded: state.loaded,
      loadTime: state.timestamp > 0 ? state.timestamp : undefined,
      error: state.error ? state.error.message : undefined
    };
  });
  
  return metrics;
}
