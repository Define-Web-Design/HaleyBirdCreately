
// Navigation testing utilities for auditing UI elements and interactions

/**
 * Check interactive elements on a specific page
 * @param pagePath The URL path to check
 * @returns Promise with results of the check
 */
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
        interactiveElements.push(`Button: ${button.textContent || button.getAttribute('aria-label') || 'Unnamed button'}`);
      });
      
      links.forEach(link => {
        interactiveElements.push(`Link: ${link.textContent || link.getAttribute('aria-label') || 'Unnamed link'} (${link.getAttribute('href')})`);
      });
      
      inputs.forEach(input => {
        interactiveElements.push(`Input: ${input.getAttribute('name') || input.getAttribute('placeholder') || input.getAttribute('aria-label') || 'Unnamed input'}`);
      });
      
      selects.forEach(select => {
        interactiveElements.push(`Select: ${select.getAttribute('name') || select.getAttribute('aria-label') || 'Unnamed select'}`);
      });
      
      textareas.forEach(textarea => {
        interactiveElements.push(`Textarea: ${textarea.getAttribute('name') || textarea.getAttribute('placeholder') || textarea.getAttribute('aria-label') || 'Unnamed textarea'}`);
      });
      
      resolve({
        success: true,
        elementsCount: interactiveElements.length,
        interactiveElements
      });
    }, 500); // Wait 500ms for dynamic content
  });
};

/**
 * Verify toast notification behavior
 * @returns Promise with analysis of toast implementation
 */
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

/**
 * Verify all links on the page to detect broken links
 * @returns Promise with a list of potential broken links
 */
export const verifyPageLinks = async (): Promise<{
  totalLinks: number;
  potentialBrokenLinks: Array<{href: string, text: string}>;
  recommendations: string[];
}> => {
  return new Promise(resolve => {
    const links = document.querySelectorAll('a');
    const potentialBrokenLinks: Array<{href: string, text: string}> = [];
    const recommendations: string[] = [];
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      const text = link.textContent || 'Unnamed link';
      
      // Check for potentially broken links
      if (!href || href === '#' || href === 'javascript:void(0)') {
        potentialBrokenLinks.push({ href: href || 'empty', text });
      } else if (href.startsWith('/') && !href.includes('.')) {
        // Check client-side routes by making sure they match defined routes
        // This is a simplified check and would need to be adjusted based on your routing system
        const validRoutes = [
          '/', '/dashboard', '/mood-capsules', '/content-library', 
          '/analytics', '/ai-enhancement', '/color-palettes', 
          '/creative-symbiosis', '/apple-photos', '/mood-boards',
          '/content-calendar', '/creative-prompts', '/content-vault',
          '/cross-platform-tools', '/legal-verification', '/nav-test'
        ];
        
        if (!validRoutes.includes(href)) {
          potentialBrokenLinks.push({ href, text });
        }
      }
    });
    
    // Generate recommendations
    if (potentialBrokenLinks.length > 0) {
      recommendations.push('Fix broken or empty links to improve navigation and SEO');
      
      if (potentialBrokenLinks.some(link => link.href === 'empty' || link.href === '#')) {
        recommendations.push('Replace placeholder links with proper routes or use buttons instead of anchor tags');
      }
    } else {
      recommendations.push('All links appear to be properly configured');
    }
    
    resolve({
      totalLinks: links.length,
      potentialBrokenLinks,
      recommendations
    });
  });
};

/**
 * Test keyboard navigation through the application
 * @returns Promise with results of keyboard navigation test
 */
export const testKeyboardNavigation = async (): Promise<{
  success: boolean;
  focusableElements: number;
  tabbableElements: number;
  issues: string[];
  recommendations: string[];
}> => {
  return new Promise(resolve => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check for elements that should be focusable but aren't
    const interactiveNotFocusable = document.querySelectorAll(
      'div[onclick], div[role="button"], span[onclick], span[role="button"]'
    );
    
    if (interactiveNotFocusable.length > 0) {
      issues.push(`Found ${interactiveNotFocusable.length} interactive elements that are not properly focusable`);
      recommendations.push('Convert div/span elements with click handlers to buttons or add tabindex="0" and keyboard event handlers');
    }
    
    // Check for proper focus styling
    const customFocusStyles = window.getComputedStyle(document.documentElement).getPropertyValue('--focus-visible-ring');
    if (!customFocusStyles) {
      recommendations.push('Add custom focus styles for better keyboard navigation visibility');
    }
    
    // Check for skip links
    const skipLinks = document.querySelectorAll('a[href="#main"], a[href="#content"]');
    if (skipLinks.length === 0) {
      issues.push('No skip links found for keyboard users to bypass navigation');
      recommendations.push('Add a skip link at the beginning of the page to allow keyboard users to skip to the main content');
    }
    
    // Calculate tabbable elements (tabindex >= 0)
    const tabbableElements = Array.from(focusableElements).filter(el => {
      const tabIndex = parseInt(el.getAttribute('tabindex') || '0', 10);
      return tabIndex >= 0;
    });
    
    resolve({
      success: issues.length === 0,
      focusableElements: focusableElements.length,
      tabbableElements: tabbableElements.length,
      issues,
      recommendations
    });
  });
};

/**
 * Run a comprehensive accessibility audit on the current page
 */
export const runAccessibilityAudit = async (): Promise<{
  score: number;
  issues: string[];
  recommendations: string[];
}> => {
  // In a real implementation, this would use axe-core or similar
  // For now, we'll implement basic checks
  
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check for images without alt text
  const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
  if (imagesWithoutAlt.length > 0) {
    issues.push(`Found ${imagesWithoutAlt.length} images without alt text`);
    recommendations.push('Add descriptive alt text to all images');
  }
  
  // Check for proper heading structure
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.substring(1), 10));
  
  let hasH1 = false;
  let previousLevel = 0;
  let headingIssues = 0;
  
  headingLevels.forEach(level => {
    if (level === 1) hasH1 = true;
    
    // Check for skipped heading levels
    if (previousLevel > 0 && level > previousLevel + 1) {
      headingIssues++;
    }
    
    previousLevel = level;
  });
  
  if (!hasH1) {
    issues.push('No H1 heading found on the page');
    recommendations.push('Add an H1 heading to properly structure the page content');
  }
  
  if (headingIssues > 0) {
    issues.push(`Found ${headingIssues} instances of skipped heading levels`);
    recommendations.push('Ensure heading levels are sequential (H1 → H2 → H3) without skipping levels');
  }
  
  // Check color contrast (simplified)
  const contrastIssues = document.querySelectorAll('[style*="color"]').length;
  recommendations.push('Verify color contrast meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)');
  
  // Check for ARIA roles
  const elementsWithAriaRoles = document.querySelectorAll('[role]');
  if (elementsWithAriaRoles.length > 0) {
    recommendations.push('Verify ARIA roles are used correctly and necessary');
  }
  
  // Calculate a simple score
  const totalChecks = 4; // Images, headings, color, ARIA
  const issuesFound = (imagesWithoutAlt.length > 0 ? 1 : 0) + 
                     ((!hasH1 || headingIssues > 0) ? 1 : 0) +
                     (contrastIssues > 0 ? 1 : 0);
  
  const score = Math.round(((totalChecks - issuesFound) / totalChecks) * 100);
  
  return {
    score,
    issues,
    recommendations
  };
};
