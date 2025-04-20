
import React, { lazy, ComponentType, LazyExoticComponent } from 'react';

// Map to store preloaded components to avoid multiple network requests
const preloadedComponents = new Map<string, Promise<{ default: ComponentType<any> }>>();

/**
 * Creates a lazily loaded component with prefetching capabilities
 * 
 * @param importFunction Function that imports the component
 * @param displayName Optional display name for debugging
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  displayName?: string
): LazyExoticComponent<T> {
  // Create lazy component
  const LazyComponent = lazy(() => {
    // Store the import promise to allow preloading
    const importPromise = importFunction();
    if (displayName) {
      preloadedComponents.set(displayName, importPromise);
    }
    return importPromise;
  });
  
  // Set display name for better debugging
  if (displayName) {
    LazyComponent.displayName = displayName;
  }
  
  return LazyComponent;
}

/**
 * Preloads a component to avoid loading delay when it's rendered
 * 
 * @param displayName The display name of the component to preload
 */
export function preloadComponent(displayName: string): void {
  const componentImport = preloadedComponents.get(displayName);
  if (!componentImport) {
    console.warn(`Component ${displayName} not found for preloading`);
    return;
  }
  
  // Trigger the import but don't await it
  componentImport.catch(err => {
    console.error(`Error preloading component ${displayName}:`, err);
  });
}

/**
 * Preloads multiple components at once
 * 
 * @param displayNames Array of component display names to preload
 */
export function preloadComponents(displayNames: string[]): void {
  displayNames.forEach(name => preloadComponent(name));
}

/**
 * Creates route object with lazy-loaded component
 */
export function createLazyRoute(
  path: string,
  importFunction: () => Promise<{ default: ComponentType<any> }>,
  displayName: string
) {
  return {
    path,
    element: createLazyComponent(importFunction, displayName),
    displayName
  };
}
