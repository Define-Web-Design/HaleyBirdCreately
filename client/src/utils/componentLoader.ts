
/**
 * Component Loader with Performance Tracking
 * 
 * This module provides a declarative API for loading components with
 * performance tracking, route-based preloading, and smart prefetching.
 */

import { ComponentType } from 'react';
import { lazyWithPerf, preloadComponent, preloadComponentGroup } from './lazyComponents';
import { PerformanceCategory, measureComponentRender } from './performance';

// Track components associated with routes for preloading
const routeComponentMap = new Map<string, string[]>();

// Register component hooks for performance tracking
const componentHooks = new Map<string, {
  onRender?: (duration: number) => void;
  onMount?: () => void;
  onUnmount?: () => void;
}>();

/**
 * Register a component for a specific route
 */
export function registerComponentForRoute(
  routePath: string,
  componentName: string
): void {
  const components = routeComponentMap.get(routePath) || [];
  if (!components.includes(componentName)) {
    components.push(componentName);
    routeComponentMap.set(routePath, components);
  }
}

/**
 * Register multiple components for a route
 */
export function registerComponentsForRoute(
  routePath: string,
  componentNames: string[]
): void {
  const existing = routeComponentMap.get(routePath) || [];
  const uniqueComponents = [...new Set([...existing, ...componentNames])];
  routeComponentMap.set(routePath, uniqueComponents);
}

/**
 * Preload components for a specific route
 */
export function preloadComponentsForRoute(routePath: string): Promise<void[]> {
  const components = routeComponentMap.get(routePath) || [];
  if (components.length === 0) {
    return Promise.resolve([]);
  }
  
  return preloadComponentGroup(components);
}

/**
 * Create a lazy-loaded component with performance tracking
 */
export function createTrackedComponent<P>(
  name: string,
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    preload?: boolean;
    onRender?: (duration: number) => void;
    onMount?: () => void;
    onUnmount?: () => void;
  }
): ComponentType<P> {
  // Register component hooks if provided
  if (options) {
    componentHooks.set(name, {
      onRender: options.onRender,
      onMount: options.onMount,
      onUnmount: options.onUnmount
    });
  }
  
  // Create lazy component
  const LazyComponent = lazyWithPerf<ComponentType<P>>(name, importFn);
  
  // Preload immediately if requested
  if (options?.preload) {
    preloadComponent(name).catch(error => {
      console.warn(`Failed to preload component ${name}:`, error);
    });
  }
  
  // Create wrapper component with performance tracking
  const TrackedComponent = (props: P) => {
    const [startMeasure, endMeasure] = measureComponentRender(name, duration => {
      const hooks = componentHooks.get(name);
      if (hooks?.onRender) {
        hooks.onRender(duration);
      }
    });
    
    // Start measuring render time
    startMeasure();
    
    // Measure mount/unmount with React hooks
    React.useEffect(() => {
      const hooks = componentHooks.get(name);
      if (hooks?.onMount) {
        hooks.onMount();
      }
      
      return () => {
        if (hooks?.onUnmount) {
          hooks.onUnmount();
        }
      };
    }, []);
    
    // Render the lazy component and end measurement after render
    const result = <LazyComponent {...props} />;
    
    // Use useEffect to ensure we capture the full render time
    React.useEffect(() => {
      // End measuring render time on next frame
      requestAnimationFrame(() => {
        endMeasure();
      });
    }, []);
    
    return result;
  };
  
  // Add display name for debugging
  TrackedComponent.displayName = `Tracked(${name})`;
  
  return TrackedComponent as ComponentType<P>;
}

/**
 * Register performance hooks for an existing component
 */
export function trackExistingComponent(
  name: string,
  options: {
    onRender?: (duration: number) => void;
    onMount?: () => void;
    onUnmount?: () => void;
  }
): void {
  componentHooks.set(name, options);
}

/**
 * Higher-order component for tracking performance of any component
 */
export function withPerformanceTracking<P>(
  WrappedComponent: ComponentType<P>,
  name: string = WrappedComponent.displayName || WrappedComponent.name || 'AnonymousComponent'
): ComponentType<P> {
  const TrackedComponent = (props: P) => {
    const [startMeasure, endMeasure] = measureComponentRender(name);
    
    // Start measuring render time
    startMeasure();
    
    // Render the component
    const result = <WrappedComponent {...props} />;
    
    // Use useEffect to ensure we capture the full render time
    React.useEffect(() => {
      // End measuring render time on next frame
      requestAnimationFrame(() => {
        endMeasure();
      });
    }, []);
    
    return result;
  };
  
  // Add display name for debugging
  TrackedComponent.displayName = `Tracked(${name})`;
  
  return TrackedComponent;
}

/**
 * Get performance data for all tracked components
 */
export function getComponentPerformanceData(): Record<string, any> {
  // Implementation will depend on how you're storing component performance data
  return {};
}

/**
 * Smart preloading for components based on user behavior patterns
 */
export function enableSmartPreloading(): void {
  // Use IntersectionObserver to track which components are visible
  // and preload components that are likely to be needed next
  
  // This is a placeholder for implementation
  console.log('Smart preloading enabled');
}
