// Site Audit Utility
// This utility helps audit the site for navigation issues and 404 errors

import { useLocation } from 'wouter';

// Define all valid routes in the application
export const validRoutes = [
  '/',
  '/content-library',
  '/content-library/all',
  '/content-library/recent',
  '/content-library/categories',
  '/content-library/favorites',
  '/content-calendar',
  '/analytics',
  '/mood-boards',
  '/content-vault',
  '/apple-photos',
  '/creative-symbiosis',
  '/color-palettes',
  '/color-palettes/all',
  '/color-palettes/recent',
  '/color-palettes/categories',
  '/color-palettes/favorites',
  '/mood-capsules',
  '/ai-enhancement',
  '/creative-prompts',
  '/creative-tools',
  '/cross-platform-tools',
  '/profile',
  '/profile/accessibility',
  '/profile/integrations',
  '/legal',
  '/privacy',
  '/terms-of-service',
  '/settings',
  '/nav-test'
];

// Regular expression patterns for dynamic routes
export const dynamicRoutePatterns = [
  /^\/content\/[a-zA-Z0-9-_]+$/  // Content detail pages with ID
];

/**
 * Check if a URL path is valid according to our application routes
 * @param path The URL path to check
 * @returns boolean indicating if the path is valid
 */
export const isValidPath = (path: string): boolean => {
  // Direct match with valid routes
  if (validRoutes.includes(path)) {
    return true;
  }
  
  // Check against dynamic route patterns
  return dynamicRoutePatterns.some(pattern => pattern.test(path));
};

/**
 * Hook to check if the current route is valid
 * @returns Object containing current location and whether it's valid
 */
export const useRouteValidation = () => {
  const [location] = useLocation();
  const isValid = isValidPath(location);
  
  return { 
    currentPath: location,
    isValidRoute: isValid 
  };
};

/**
 * Log any navigation to invalid routes
 * @param path The path that was navigated to
 */
export const logNavigationError = (path: string): void => {
  console.error(`Navigation Error: Invalid route "${path}" accessed`);
  
  // In a production environment, you would send this to your error monitoring service
  if (typeof window !== 'undefined' && window.navigator.sendBeacon) {
    // Example of sending to a hypothetical error tracking endpoint
    try {
      const errorData = new Blob(
        [JSON.stringify({ type: '404_error', path, timestamp: new Date().toISOString() })],
        { type: 'application/json' }
      );
      window.navigator.sendBeacon('/api/error-logging', errorData);
    } catch (e) {
      console.error('Failed to send error beacon', e);
    }
  }
};

/**
 * Check all links in a given DOM element for validity
 * @param container The DOM element to check links within (defaults to document.body)
 * @returns An array of objects representing invalid links
 */
export const auditPageLinks = (container: HTMLElement = document.body): { element: HTMLAnchorElement; href: string }[] => {
  const invalidLinks: { element: HTMLAnchorElement; href: string }[] = [];
  const links = container.querySelectorAll('a');
  
  links.forEach((link) => {
    const anchor = link as HTMLAnchorElement;
    const href = anchor.getAttribute('href');
    
    if (!href) return; // Skip links without href
    
    // Skip external links or anchor links
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      return;
    }
    
    // Check if internal link is valid
    if (!isValidPath(href)) {
      invalidLinks.push({ element: anchor, href });
    }
  });
  
  return invalidLinks;
};

/**
 * Run a comprehensive site audit for navigation issues
 * This should be run from the browser console or a dedicated audit page
 */
export const runComprehensiveSiteAudit = async (): Promise<{
  invalidInternalLinks: { url: string; invalidLinks: { href: string; text: string }[] }[]
}> => {
  const results = {
    invalidInternalLinks: [] as { url: string; invalidLinks: { href: string; text: string }[] }[]
  };
  
  // Function to audit a single page
  const auditPage = async (url: string): Promise<void> => {
    console.log(`Auditing page: ${url}`);
    
    try {
      // In a real implementation, we would navigate to the page or use a headless browser
      // For now, we'll just simulate by checking the current page
      
      const invalidLinks = auditPageLinks().map(item => ({
        href: item.href,
        text: item.element.textContent || '[No text]'
      }));
      
      if (invalidLinks.length > 0) {
        results.invalidInternalLinks.push({
          url,
          invalidLinks
        });
      }
    } catch (error) {
      console.error(`Error auditing ${url}:`, error);
    }
  };
  
  // Start with the homepage, and in a real implementation would recursively visit all pages
  await auditPage(window.location.pathname);
  
  return results;
};

// Event listener for navigation errors
export const setupNavigationErrorTracking = (): void => {
  if (typeof window !== 'undefined') {
    const originalPushState = window.history.pushState;
    
    // Override pushState to track navigation
    window.history.pushState = function(state, title, url) {
      if (url && typeof url === 'string') {
        const path = url.startsWith(window.location.origin) 
          ? url.slice(window.location.origin.length) 
          : url;
        
        if (!isValidPath(path)) {
          logNavigationError(path);
        }
      }
      
      return originalPushState.apply(this, [state, title, url]);
    };
  }
};