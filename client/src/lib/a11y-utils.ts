
/**
 * Accessibility utilities for improving keyboard navigation and screen reader support
 */

/**
 * Handle keyboard events for interactive elements that aren't native buttons
 * This allows div/span elements to be accessible via keyboard
 * @param handler The click handler function to execute
 * @returns A keyboard event handler
 */
export const handleKeyboardEvent = (handler: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handler();
  }
};

/**
 * Trap focus within a modal for better keyboard accessibility
 * @param modalRef React ref to the modal element
 * @returns Function to clean up event listeners
 */
export const trapFocus = (modalRef: React.RefObject<HTMLElement>) => {
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // If shift + tab and on first element, move to last element
    if (e.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    } 
    // If tab and on last element, move to first element
    else if (!e.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  };
  
  document.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Check if the current environment is a browser with prefers-reduced-motion enabled
 * This helps respect user preferences for reduced animations
 * @returns Boolean indicating if reduced motion is preferred
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Announce messages to screen readers using ARIA live regions
 * @param message The message to announce
 * @param priority The announcement priority ('polite' or 'assertive')
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  // Get or create the announcer element
  let announcer = document.getElementById('a11y-announcer');
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'a11y-announcer';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }
  
  // Set the message to announce
  announcer.textContent = message;
  
  // Clear the announcer after a delay to prevent repeated announcements
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
};
