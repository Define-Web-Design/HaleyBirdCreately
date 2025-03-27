
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
/**
 * Accessibility utility functions
 */

/**
 * Checks if a color has sufficient contrast with another color
 * @param foreground Foreground color in hex format (e.g., "#ffffff")
 * @param background Background color in hex format (e.g., "#000000")
 * @returns Boolean indicating if contrast ratio is at least 4.5:1 (WCAG AA)
 */
export function hasGoodContrast(foreground: string, background: string): boolean {
  const foregroundLuminance = getLuminance(foreground);
  const backgroundLuminance = getLuminance(background);
  
  const ratio = calculateContrastRatio(foregroundLuminance, backgroundLuminance);
  return ratio >= 4.5; // WCAG AA standard
}

/**
 * Calculates the contrast ratio between two luminance values
 * @param luminance1 First luminance value
 * @param luminance2 Second luminance value
 * @returns Contrast ratio (1:1 to 21:1)
 */
export function calculateContrastRatio(luminance1: number, luminance2: number): number {
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculates the relative luminance of a color
 * @param color Color in hex format (e.g., "#ffffff")
 * @returns Luminance value (0 to 1)
 */
export function getLuminance(color: string): number {
  // Remove # if present
  color = color.replace('#', '');
  
  // Parse the RGB values
  const r = parseInt(color.substr(0, 2), 16) / 255;
  const g = parseInt(color.substr(2, 2), 16) / 255;
  const b = parseInt(color.substr(4, 2), 16) / 255;
  
  // Apply gamma correction
  const gammaCorrectedR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gammaCorrectedG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const gammaCorrectedB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate luminance using the formula from WCAG 2.0
  return 0.2126 * gammaCorrectedR + 0.7152 * gammaCorrectedG + 0.0722 * gammaCorrectedB;
}

/**
 * Adjusts the text size based on the user's font size preference
 * @param baseSize Base font size in pixels
 * @param fontSizePreference User's font size preference (default: 16)
 * @returns Adjusted font size
 */
export function getAdjustedFontSize(baseSize: number, fontSizePreference = 16): number {
  return (baseSize / 16) * fontSizePreference;
}

/**
 * Checks if an element is focusable
 * @param element HTML element to check
 * @returns Boolean indicating if the element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (!element) return false;
  
  // Elements that are always focusable if not disabled
  const focusableTags = ["a", "button", "input", "select", "textarea"];
  
  // Check tag name
  const tagName = element.tagName.toLowerCase();
  
  // Check if element has tabindex
  const tabIndex = parseInt(element.getAttribute("tabindex") || "-1", 10);
  
  // Check if element is disabled
  const isDisabled = element.hasAttribute("disabled") || 
                    element.getAttribute("aria-disabled") === "true";
  
  // Check if element is visible
  const isVisible = element.offsetWidth > 0 && 
                   element.offsetHeight > 0 && 
                   window.getComputedStyle(element).visibility !== "hidden";
  
  // Check conditions
  if (!isVisible || isDisabled) return false;
  
  // Links must have href
  if (tagName === "a" && !element.hasAttribute("href")) return false;
  
  return (
    focusableTags.includes(tagName) || 
    tabIndex >= 0 ||
    element.getAttribute("contenteditable") === "true"
  );
}
/**
 * Accessibility utilities for improving the user experience
 */

// Keyboard navigation support
export const handleAccessibleKeyDown = (
  event: React.KeyboardEvent,
  onEnter?: () => void,
  onSpace?: () => void
) => {
  if (event.key === 'Enter' && onEnter) {
    event.preventDefault();
    onEnter();
  } else if (event.key === ' ' && onSpace) {
    event.preventDefault();
    onSpace();
  }
};

// Screen reader text - visually hidden but accessible to screen readers
export const srOnly = `
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

// Utility function to toggle high contrast mode
export const toggleHighContrast = (enable: boolean) => {
  if (enable) {
    document.documentElement.classList.add('high-contrast');
  } else {
    document.documentElement.classList.remove('high-contrast');
  }
};

// Color blindness simulation modes
export type ColorBlindnessMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export const applyColorBlindnessMode = (mode: ColorBlindnessMode) => {
  // Remove all existing color blindness classes
  document.documentElement.classList.remove(
    'color-normal',
    'color-protanopia',
    'color-deuteranopia',
    'color-tritanopia'
  );
  
  // Apply the selected mode
  document.documentElement.classList.add(`color-${mode}`);
  
  // Store the preference for future sessions
  localStorage.setItem('colorBlindnessMode', mode);
};

// Initialize accessibility settings from stored preferences
export const initAccessibilitySettings = () => {
  // Initialize high contrast mode
  const highContrast = localStorage.getItem('highContrast') === 'true';
  toggleHighContrast(highContrast);
  
  // Initialize color blindness mode
  const colorMode = localStorage.getItem('colorBlindnessMode') as ColorBlindnessMode || 'normal';
  applyColorBlindnessMode(colorMode);
  
  // Initialize font size preferences
  const fontSize = localStorage.getItem('fontSize') || '16';
  document.documentElement.style.fontSize = `${fontSize}px`;
};
