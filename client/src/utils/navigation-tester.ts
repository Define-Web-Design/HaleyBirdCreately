// Navigation testing utilities for auditing UI elements and interactions

/**
 * Comprehensive page accessibility check
export const checkPageAccessibility = async (pagePath: string): Promise<{
  score: number;
  issues: Array<{type: string, element: string, message: string, severity: 'critical' | 'serious' | 'moderate' | 'minor'}>;
  passingCriteria: string[];
  recommendations: string[];
}> => {
  return new Promise(resolve => {
    // Simulate navigation to the page
    window.history.pushState({}, '', pagePath);

    // Wait for any dynamic content to load
    setTimeout(() => {
      const issues: Array<{type: string, element: string, message: string, severity: 'critical' | 'serious' | 'moderate' | 'minor'}> = [];
      const passingCriteria: string[] = [];
      const recommendations: string[] = [];

      // Check for images without alt text
      const images = document.querySelectorAll('img');
      let imagesWithAlt = 0;

      images.forEach(img => {
        if (!img.hasAttribute('alt')) {
          issues.push({
            type: 'image-alt',
            element: `Image (src: ${img.getAttribute('src')?.substring(0, 30)}...)`,
            message: 'Image is missing alt text',
            severity: 'serious'
          });
        } else {
          imagesWithAlt++;
        }
      });

      if (images.length > 0 && imagesWithAlt === images.length) {
        passingCriteria.push('All images have alt text');
      } else if (images.length > 0) {
        recommendations.push(`Add alt text to ${images.length - imagesWithAlt} images`);
      }

      // Check for proper heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels: number[] = [];

      headings.forEach(heading => {
        const level = parseInt(heading.tagName.substring(1));
        headingLevels.push(level);

        // Check if headings are empty
        if (!heading.textContent?.trim()) {
          issues.push({
            type: 'empty-heading',
            element: heading.tagName,
            message: 'Heading has no content',
            severity: 'serious'
          });
        }
      });

      // Check for skipped heading levels
      for (let i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] > headingLevels[i-1] + 1) {
          issues.push({
            type: 'heading-order',
            element: `H${headingLevels[i-1]} to H${headingLevels[i]}`,
            message: `Skipped heading level from H${headingLevels[i-1]} to H${headingLevels[i]}`,
            severity: 'moderate'
          });
          recommendations.push(`Fix heading structure: don't skip from H${headingLevels[i-1]} to H${headingLevels[i]}`);
        }
      }

      if (headings.length > 0 && issues.filter(i => i.type === 'heading-order').length === 0) {
        passingCriteria.push('Proper heading structure');
      }

      // Check for interactive elements without labels
      const buttons = document.querySelectorAll('button');
      const links = document.querySelectorAll('a');
      const inputs = document.querySelectorAll('input:not([type="hidden"])');
      const selects = document.querySelectorAll('select');

      buttons.forEach(button => {
        if (!button.textContent?.trim() && !button.getAttribute('aria-label') && !button.getAttribute('title')) {
          issues.push({
            type: 'button-name',
            element: 'Button',
            message: 'Button has no accessible name',
            severity: 'critical'
          });
        }
      });

      links.forEach(link => {
        if (!link.textContent?.trim() && !link.getAttribute('aria-label') && !link.getAttribute('title')) {
          issues.push({
            type: 'link-name',
            element: `Link (href: ${link.getAttribute('href')})`,
            message: 'Link has no accessible name',
            severity: 'critical'
          });
        }

        // Check for links with problematic text
        const linkText = link.textContent?.trim().toLowerCase();
        if (linkText === 'click here' || linkText === 'read more' || linkText === 'more' || linkText === 'here') {
          issues.push({
            type: 'generic-link-text',
            element: `Link with text "${linkText}"`,
            message: 'Link uses generic text that does not describe its purpose',
            severity: 'moderate'
          });
          recommendations.push('Replace generic link text like "click here" with descriptive text');
        }
      });

      // Check form controls for labels
      inputs.forEach(input => {
        const id = input.getAttribute('id');
        const hasLabel = id ? document.querySelector(`label[for="${id}"]`) !== null : false;
        const hasAriaLabel = input.getAttribute('aria-label') !== null;
        const hasAriaLabelledBy = input.getAttribute('aria-labelledby') !== null;
        const hasPlaceholder = input.getAttribute('placeholder') !== null;

        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
          issues.push({
            type: 'form-label',
            element: `Input (type: ${input.getAttribute('type') || 'text'})`,
            message: 'Form control has no associated label',
            severity: 'critical'
          });

          if (hasPlaceholder) {
            recommendations.push('Use <label> elements instead of just placeholders for form controls');
          } else {
            recommendations.push('Add labels to form controls');
          }
        }
      });

      selects.forEach(select => {
        const id = select.getAttribute('id');
        const hasLabel = id ? document.querySelector(`label[for="${id}"]`) !== null : false;
        const hasAriaLabel = select.getAttribute('aria-label') !== null;
        const hasAriaLabelledBy = select.getAttribute('aria-labelledby') !== null;

        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
          issues.push({
            type: 'form-label',
            element: 'Select',
            message: 'Select control has no associated label',
            severity: 'critical'
          });
        }
      });

      // Check for proper color contrast (simple approximation)
      const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, label');
      let lowContrastElements = 0;

      textElements.forEach(element => {
        try {
          const style = window.getComputedStyle(element);
          const textColor = style.color;
          const bgColor = style.backgroundColor;

          // Skip if background is transparent - would need more complex calculation
          if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') return;

          // Simple contrast check (not comprehensive)
          const textRgb = textColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
          const bgRgb = bgColor.match(/\d+/g)?.map(Number) || [255, 255, 255];

          const textLuminance = (0.299 * textRgb[0] + 0.587 * textRgb[1] + 0.114 * textRgb[2]) / 255;
          const bgLuminance = (0.299 * bgRgb[0] + 0.587 * bgRgb[1] + 0.114 * bgRgb[2]) / 255;

          const contrastRatio = Math.abs(textLuminance - bgLuminance);

          if (contrastRatio < 0.5) { // Simple threshold
            lowContrastElements++;
            issues.push({
              type: 'color-contrast',
              element: element.tagName,
              message: 'Element may have insufficient color contrast',
              severity: 'serious'
            });
          }
        } catch (e) {
          // Skip elements with computation errors
        }
      });

      if (lowContrastElements > 0) {
        recommendations.push(`Improve color contrast for ${lowContrastElements} elements`);
      } else if (textElements.length > 0) {
        passingCriteria.push('Good color contrast');
      }

      // Check for keyboard accessibility
      const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      let hiddenFocusableElements = 0;

      focusableElements.forEach(element => {
        const style = window.getComputedStyle(element as Element);
        if (style.display === 'none' || style.visibility === 'hidden') {
          hiddenFocusableElements++;
          issues.push({
            type: 'keyboard-focus',
            element: (element as Element).tagName,
            message: 'Interactive element is hidden but still in the focus order',
            severity: 'moderate'
          });
        }
      });

      if (focusableElements.length > 0 && hiddenFocusableElements === 0) {
        passingCriteria.push('All focusable elements are visible');
      }

      // Check for ARIA attributes
      const elementsWithAria = document.querySelectorAll('[aria-*]');
      let invalidAriaCount = 0;

      elementsWithAria.forEach(element => {
        // Check for invalid role
        const role = element.getAttribute('role');
        if (role === 'button' && element.tagName !== 'BUTTON' && !element.hasAttribute('tabindex')) {
          invalidAriaCount++;
          issues.push({
            type: 'aria-role',
            element: `${element.tagName} with role="button"`,
            message: 'Element has role="button" but is not keyboard focusable',
            severity: 'serious'
          });
        }

        // Check for aria-expanded on non-expandable elements
        if (element.hasAttribute('aria-expanded') && 
            !['button', 'link'].includes(role || '') && 
            !element.classList.contains('dropdown') && 
            !element.classList.contains('accordion')) {
          invalidAriaCount++;
          issues.push({
            type: 'aria-attribute',
            element: element.tagName,
            message: 'Element uses aria-expanded but may not be expandable',
            severity: 'moderate'
          });
        }
      });

      if (elementsWithAria.length > 0 && invalidAriaCount === 0) {
        passingCriteria.push('Proper ARIA attribute usage');
      }

      // Calculate score based on issues and passing criteria
      const criticalIssues = issues.filter(i => i.severity === 'critical').length;
      const seriousIssues = issues.filter(i => i.severity === 'serious').length;
      const moderateIssues = issues.filter(i => i.severity === 'moderate').length;
      const minorIssues = issues.filter(i => i.severity === 'minor').length;

      // Base score calculation
      let score = 100;
      score -= criticalIssues * 15;
      score -= seriousIssues * 10;
      score -= moderateIssues * 5;
      score -= minorIssues * 2;

      // Bonus for passing criteria
      score += passingCriteria.length * 5;

      // Ensure score is within bounds
      score = Math.max(0, Math.min(100, score));

      // Add general recommendations based on score
      if (score < 70) {
        recommendations.push('Conduct a comprehensive accessibility audit');
      }

      if (criticalIssues > 0) {
        recommendations.push('Address critical accessibility issues first');
      }

      resolve({
        score,
        issues,
        passingCriteria,
        recommendations
      });
    }, 500);
  });
};

// Check interactive elements on a specific page
export const checkPageInteractiveElements = (pagePath: string): Promise<{
  success: boolean;
  elementsCount: number;
  interactiveElements: string[];
  hasKeyboardAccessibility: boolean;
  hasMobileOptimization: boolean;
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
      const dropdowns = document.querySelectorAll('[role="menu"], [role="listbox"]');
      const tabs = document.querySelectorAll('[role="tab"]');
      const accordions = document.querySelectorAll('[aria-expanded]');

      const interactiveElements: string[] = [];
      let keyboardAccessibleCount = 0;
      let touchTargetIssues = 0;

      // Check keyboard accessibility and touch target sizes
      const checkElementAccessibility = (el: Element, type: string, name: string) => {
        let hasKeyboardAccess = true;
        let hasSufficientTouchTarget = true;
        const issues: string[] = [];

        // Check keyboard accessibility
        if (el.getAttribute('tabindex') === '-1') {
          hasKeyboardAccess = false;
          issues.push('not keyboard accessible');
        }

        // Check touch target size for mobile optimization
        try {
          const rect = el.getBoundingClientRect();
          const width = rect.width;
          const height = rect.height;

          // Minimum recommended touch target size is 44x44px
          if (width < 44 || height < 44) {
            hasSufficientTouchTarget = false;
            issues.push(`small touch target (${Math.round(width)}x${Math.round(height)}px)`);
            touchTargetIssues++;
          }
        } catch (e) {
          // Skip size check on error
        }

        if (hasKeyboardAccess) {
          keyboardAccessibleCount++;
        }

        let description = `${type}: ${name}`;
        if (issues.length > 0) {
          description += ` (${issues.join(', ')})`;
        }

        interactiveElements.push(description);
      };

      // Collect and check information about interactive elements
      buttons.forEach(button => {
        const name = button.textContent?.trim() || button.getAttribute('aria-label') || 'Unnamed button';
        checkElementAccessibility(button, 'Button', name);
      });

      links.forEach(link => {
        const name = link.textContent?.trim() || link.getAttribute('aria-label') || 'Unnamed link';
        const href = link.getAttribute('href') || '#';
        checkElementAccessibility(link, 'Link', `${name} (${href})`);
      });

      inputs.forEach(input => {
        const name = input.getAttribute('name') || 
                    input.getAttribute('placeholder') || 
                    input.getAttribute('aria-label') || 
                    'Unnamed input';
        const type = input.getAttribute('type') || 'text';
        checkElementAccessibility(input, `Input (${type})`, name);
      });

      selects.forEach(select => {
        const name = select.getAttribute('name') || 
                    select.getAttribute('aria-label') || 
                    'Unnamed select';
        checkElementAccessibility(select, 'Select', name);
      });

      textareas.forEach(textarea => {
        const name = textarea.getAttribute('name') || 
                     textarea.getAttribute('placeholder') || 
                     textarea.getAttribute('aria-label') || 
                     'Unnamed textarea';
        checkElementAccessibility(textarea, 'Textarea', name);
      });

      dropdowns.forEach(dropdown => {
        const name = dropdown.getAttribute('aria-label') || 'Unnamed dropdown';
        checkElementAccessibility(dropdown, 'Dropdown', name);
      });

      tabs.forEach(tab => {
        const name = tab.getAttribute('aria-label') || tab.textContent?.trim() || 'Unnamed tab';
        checkElementAccessibility(tab, 'Tab', name);
      });

      accordions.forEach(accordion => {
        const name = accordion.getAttribute('aria-label') || 'Unnamed accordion';
        checkElementAccessibility(accordion, 'Accordion', name);
      });

      resolve({
        success: true,
        elementsCount: interactiveElements.length,
        interactiveElements,
        hasKeyboardAccessibility: keyboardAccessibleCount === interactiveElements.length,
        hasMobileOptimization: touchTargetIssues === 0
      });
    }, 500); // Wait 500ms for dynamic content
  });
};


/**
 * Verify toast notification behavior
export const verifyToastBehavior = async (): Promise<{ 
  automatic: boolean; 
  closable: boolean;
  recommendations: string[];
  accessibilityScore: number;
}> => {
  return new Promise(resolve => {
    // Check if auto-dismiss-toaster is being used
    let automatic = false;
    let closable = true;
    let hasAriaLive = false;
    let hasProperRole = false;
    let hasProperColor = false;
    const recommendations: string[] = [];

    // Check for AutoDismissToaster component in the DOM or imported modules
    try {
      // Check if the component is imported and available
      const imports = document.querySelectorAll('script[type="module"]');
      const importContent = Array.from(imports).map(script => script.textContent || '').join('');

      if (importContent.includes('AutoDismissToaster') || 
          document.querySelector('.auto-dismiss-toaster')) {
        automatic = true;
      } else {
        automatic = false;
        recommendations.push('Consider using AutoDismissToaster for better UX with automatic toast dismissal');
      }

      // Check toast accessibility features
      const toastComponents = document.querySelectorAll('[role="status"], [role="alert"]');
      if (toastComponents.length > 0) {
        // Check for close button
        const hasCloseButton = Array.from(toastComponents).some(toast => 
          toast.querySelector('button[aria-label="Close"], button[aria-label="Dismiss"], button[aria-label="Close notification"]') !== null
        );

        closable = hasCloseButton;

        if (!hasCloseButton) {
          recommendations.push('Add a close button to toast notifications for better accessibility');
        }

        // Check for aria-live attribute
        hasAriaLive = Array.from(toastComponents).some(toast => 
          toast.getAttribute('aria-live') === 'polite' || 
          toast.getAttribute('aria-live') === 'assertive'
        );

        if (!hasAriaLive) {
          recommendations.push('Add appropriate aria-live attributes to toast notifications');
        }

        // Check for proper role
        hasProperRole = Array.from(toastComponents).every(toast => 
          toast.getAttribute('role') === 'status' || 
          toast.getAttribute('role') === 'alert'
        );

        if (!hasProperRole) {
          recommendations.push('Ensure all toast notifications have appropriate roles (status or alert)');
        }

        // Check for color contrast
        try {
          const computedStyles = getComputedStyle(toastComponents[0]);
          const backgroundColor = computedStyles.backgroundColor;
          const color = computedStyles.color;

          // Simple contrast check (not comprehensive)
          const bgRgb = backgroundColor.match(/\d+/g)?.map(Number) || [255, 255, 255];
          const textRgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];

          const bgLuminance = (0.299 * bgRgb[0] + 0.587 * bgRgb[1] + 0.114 * bgRgb[2]) / 255;
          const textLuminance = (0.299 * textRgb[0] + 0.587 * textRgb[1] + 0.114 * textRgb[2]) / 255;

          const contrastRatio = Math.abs(bgLuminance - textLuminance);

          hasProperColor = contrastRatio > 0.5; // Simple threshold

          if (!hasProperColor) {
            recommendations.push('Improve color contrast in toast notifications for better readability');
          }
        } catch (e) {
          console.error('Error checking color contrast:', e);
        }
      } else {
        // No toasts found, provide general recommendations
        recommendations.push('Implement toast notifications with appropriate accessibility features');
      }

      // Calculate accessibility score
      let accessibilityScore = 0;
      accessibilityScore += automatic ? 25 : 0;
      accessibilityScore += closable ? 25 : 0;
      accessibilityScore += hasAriaLive ? 25 : 0;
      accessibilityScore += hasProperRole ? 25 : 0;
      accessibilityScore += hasProperColor ? 25 : 0;


    } catch (error) {
      recommendations.push(`Error checking toast behavior: ${error}`);
    }

    resolve({
      automatic,
      closable,
      recommendations,
      accessibilityScore
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