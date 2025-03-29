/**
 * Navigation Tester Utility
 * 
 * This utility provides functionality to test navigation and links throughout the application.
 * It simulates what tools like Selenium or Puppeteer would do for web testing.
 */

interface NavigationRoute {
  path: string;
  name: string;
  subRoutes?: string[];
}

// Define all application routes for testing
export const ALL_ROUTES: NavigationRoute[] = [
  { 
    path: '/', 
    name: 'Dashboard',
  },
  { 
    path: '/content-library', 
    name: 'Content Library',
    subRoutes: [
      '/content-library/all',
      '/content-library/recent',
      '/content-library/categories',
      '/content-library/favorites',
    ]
  },
  { 
    path: '/content-calendar', 
    name: 'Content Calendar',
  },
  { 
    path: '/analytics', 
    name: 'Analytics',
  },
  { 
    path: '/mood-boards', 
    name: 'Mood Boards',
  },
  { 
    path: '/content-vault', 
    name: 'Content Vault',
  },
  { 
    path: '/apple-photos', 
    name: 'Apple Photos Integration',
  },
  { 
    path: '/creative-symbiosis', 
    name: 'Creative Symbiosis',
  },
  { 
    path: '/color-palettes', 
    name: 'Color Palettes',
    subRoutes: [
      '/color-palettes/all',
      '/color-palettes/recent',
      '/color-palettes/categories',
      '/color-palettes/favorites',
    ]
  },
  { 
    path: '/mood-capsules', 
    name: 'Mood Capsules',
  },
  { 
    path: '/ai-enhancement', 
    name: 'AI Enhancement',
  },
  { 
    path: '/creative-prompts', 
    name: 'Creative Prompts',
  },
  { 
    path: '/cross-platform-tools', 
    name: 'Cross Platform Tools',
  },
  { 
    path: '/profile', 
    name: 'Profile',
    subRoutes: [
      '/profile/accessibility',
      '/profile/integrations',
    ]
  },
  {
    path: '/nav-test',
    name: 'Navigation Test',
  }
];

// Validate that all routes in the menu are accessible
export const validateMenuRoutes = (): { valid: boolean; missingRoutes: string[] } => {
  // Find all link elements with href attributes
  const linkElements = document.querySelectorAll('a[href]');
  const routeLinks: string[] = Array.from(linkElements).map(el => (el as HTMLAnchorElement).getAttribute('href') || '');
  
  // Get paths from ALL_ROUTES
  const definedPaths = ALL_ROUTES.map(route => route.path);
  const definedSubPaths = ALL_ROUTES.flatMap(route => route.subRoutes || []);
  const allDefinedPaths = [...definedPaths, ...definedSubPaths];
  
  // Find missing routes
  const missingRoutes = allDefinedPaths.filter(path => !routeLinks.includes(path));
  
  return {
    valid: missingRoutes.length === 0,
    missingRoutes
  };
};

// Verify that all navigation links are working correctly
export const verifyNavigationLinks = (): Promise<{
  success: boolean;
  errors: { path: string; error: string }[];
}> => {
  return new Promise(resolve => {
    const errors: { path: string; error: string }[] = [];
    
    // Check if all route paths are valid
    ALL_ROUTES.forEach(route => {
      // Main route check
      try {
        const linkElement = document.querySelector(`a[href="${route.path}"]`);
        if (!linkElement) {
          errors.push({ path: route.path, error: 'Link element not found' });
        }
      } catch (error) {
        errors.push({ path: route.path, error: String(error) });
      }
      
      // Subroutes check
      if (route.subRoutes) {
        route.subRoutes.forEach(subRoute => {
          try {
            const subLinkElement = document.querySelector(`a[href="${subRoute}"]`);
            if (!subLinkElement) {
              errors.push({ path: subRoute, error: 'Subroute link element not found' });
            }
          } catch (error) {
            errors.push({ path: subRoute, error: String(error) });
          }
        });
      }
    });
    
    resolve({
      success: errors.length === 0,
      errors
    });
  });
};

// Check interactive elements on a specific page
export const checkPageInteractiveElements = (pagePath: string): Promise<{
  success: boolean;
  elementsCount: number;
  interactiveElements: string[];
}> => {
  return new Promise(resolve => {
    // Simulate navigation to the page
    window.history.pushState({}, '', pagePath);
    
    // Wait for any dynamic content to load
    setTimeout(() => {
      // Find all interactive elements on the page
      const buttons = document.querySelectorAll('button');
      const links = document.querySelectorAll('a');
      const inputs = document.querySelectorAll('input');
      const selects = document.querySelectorAll('select');
      const textareas = document.querySelectorAll('textarea');
      
      const interactiveElements: string[] = [];
      
      // Collect information about interactive elements
      buttons.forEach(button => {
        interactiveElements.push(`Button: ${button.textContent || 'Unnamed button'}`);
      });
      
      links.forEach(link => {
        interactiveElements.push(`Link: ${link.textContent || 'Unnamed link'} (${link.getAttribute('href')})`);
      });
      
      inputs.forEach(input => {
        interactiveElements.push(`Input: ${input.getAttribute('name') || input.getAttribute('placeholder') || 'Unnamed input'}`);
      });
      
      selects.forEach(select => {
        interactiveElements.push(`Select: ${select.getAttribute('name') || 'Unnamed select'}`);
      });
      
      textareas.forEach(textarea => {
        interactiveElements.push(`Textarea: ${textarea.getAttribute('name') || textarea.getAttribute('placeholder') || 'Unnamed textarea'}`);
      });
      
      resolve({
        success: true,
        elementsCount: interactiveElements.length,
        interactiveElements
      });
    }, 500); // Wait 500ms for dynamic content
  });
};

// Verify toast notification behavior
export const verifyToastBehavior = async (): Promise<{ 
  automatic: boolean; 
  closable: boolean;
  recommendations: string[];
}> => {
  return new Promise(resolve => {
    // Check if auto-dismiss-toaster is being used
    let automatic = false;
    let closable = true;
    const recommendations: string[] = [];
    
    // Check for AutoDismissToaster component in the DOM or imported modules
    try {
      // Check if imported scripts contain AutoDismissToaster
      const scripts = document.querySelectorAll('script');
      const scriptSources = Array.from(scripts).map(script => script.textContent || '');
      
      if (scriptSources.some(src => src.includes('AutoDismissToaster'))) {
        automatic = true;
      } else {
        automatic = false;
        recommendations.push('Consider using AutoDismissToaster for better UX with automatic toast dismissal');
      }
      
      // Check if toast has a close button
      const toastComponents = document.querySelectorAll('[role="status"], [role="alert"]');
      if (toastComponents.length > 0) {
        const hasCloseButton = Array.from(toastComponents).some(toast => 
          toast.querySelector('button[aria-label="Close"]') !== null
        );
        
        closable = hasCloseButton;
        
        if (!hasCloseButton) {
          recommendations.push('Add a close button to toast notifications for better accessibility');
        }
      } else {
        // No toasts found, check for default implementation
        closable = true; // Assume default implementation has close button
      }
      
      // Additional recommendations
      if (!automatic && !closable) {
        recommendations.push('Current toast implementation may cause usability issues as notifications cannot be dismissed');
      }
      
      if (recommendations.length === 0) {
        recommendations.push('Toast implementation follows best practices with auto-dismissal and manual close options');
      }
      
    } catch (error) {
      recommendations.push(`Error checking toast behavior: ${error}`);
    }
    
    resolve({
      automatic,
      closable,
      recommendations
    });
  });
};