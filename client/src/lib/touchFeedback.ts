/**
 * Touch Feedback System
 * Provides haptic-like visual feedback for touch interactions
 * and enhances the mobile experience with touch-driven animations
 */

import { useTouchPosition } from '@/hooks/use-mobile';

/**
 * Types of haptic feedback available
 */
export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Configuration options for touch feedback
 */
export interface TouchFeedbackOptions {
  enabled: boolean;
  intensity: number; // 0-100
  visualFeedback: boolean;
  trailEffect: boolean;
  hapticFeedback: boolean;
}

// Default feedback configuration
const defaultOptions: TouchFeedbackOptions = {
  enabled: true,
  intensity: 50,
  visualFeedback: true,
  trailEffect: true,
  hapticFeedback: true,
};

// Local storage key for storing user preferences
const TOUCH_FEEDBACK_STORAGE_KEY = 'creately_touch_feedback_options';

// Track if the system is initialized
let isInitialized = false;
let touchEventListeners: { element: HTMLElement; type: string; listener: EventListener; options?: boolean | AddEventListenerOptions }[] = [];

/**
 * Initialize the touch feedback system
 */
export function initTouchFeedback(enabled: boolean = true): void {
  if (isInitialized) {
    return;
  }
  
  // Set initial state
  saveTouchFeedbackOptions({ enabled });
  isInitialized = true;

  // Set up touch event listeners for interactive elements
  const setupTouchListeners = () => {
    const interactiveElements = document.querySelectorAll(
      'button, a, .interactive, [role="button"], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"]'
    );
    
    interactiveElements.forEach(el => {
      const element = el as HTMLElement;
      
      // Touch start handler
      const touchStartHandler = (e: TouchEvent) => {
        if (!loadTouchFeedbackOptions().enabled) return;
        
        const touch = e.touches[0];
        const rect = element.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        triggerFeedback(touch.clientX, touch.clientY, 'light');
        element.classList.add('touch-active');
      };
      
      // Touch end handler
      const touchEndHandler = () => {
        element.classList.remove('touch-active');
        
        // Success feedback removed as per user request to eliminate green dot feedback
      };
      
      // Add event listeners
      element.addEventListener('touchstart', touchStartHandler, { passive: true });
      element.addEventListener('touchend', touchEndHandler, { passive: true });
      
      // Track for cleanup
      touchEventListeners.push(
        { element, type: 'touchstart', listener: touchStartHandler as EventListener, options: { passive: true } },
        { element, type: 'touchend', listener: touchEndHandler as EventListener, options: { passive: true } }
      );
    });
  };
  
  // Set up listeners initially
  setupTouchListeners();
  
  // Set up mutation observer to handle dynamically added elements
  const observer = new MutationObserver((mutations) => {
    let shouldUpdateListeners = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any of the added nodes are interactive elements
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.querySelector('button, a, .interactive, [role="button"], input[type="submit"], input[type="button"]')) {
              shouldUpdateListeners = true;
            }
          }
        });
      }
    });
    
    if (shouldUpdateListeners) {
      // Clean up existing listeners
      cleanupTouchListeners();
      // Set up new listeners
      setupTouchListeners();
    }
  });
  
  // Start observing
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Handle body touch events for general feedback
  const bodyTouchHandler = (e: TouchEvent) => {
    if (!loadTouchFeedbackOptions().enabled) return;
    
    // Only trigger for direct body touches, not on interactive elements
    if (!(e.target instanceof HTMLElement) || 
        e.target.matches('button, a, .interactive, [role="button"], input')) {
      return;
    }
    
    const touch = e.touches[0];
    triggerFeedback(touch.clientX, touch.clientY, 'light');
  };
  
  document.body.addEventListener('touchstart', bodyTouchHandler, { passive: true });
  touchEventListeners.push({ element: document.body, type: 'touchstart', listener: bodyTouchHandler as EventListener, options: { passive: true } });
}

/**
 * Clean up touch event listeners
 */
function cleanupTouchListeners(): void {
  touchEventListeners.forEach(({ element, type, listener, options }) => {
    if (element && element.removeEventListener) {
      element.removeEventListener(type, listener, options);
    }
  });
  
  touchEventListeners = [];
}

/**
 * Clean up all touch feedback resources
 */
export function cleanupTouchFeedback(): void {
  cleanupTouchListeners();
  isInitialized = false;
  
  // Remove any remaining touch-related elements
  const touchElements = document.querySelectorAll('.haptic-feedback-ripple, .touch-trail');
  touchElements.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
}

/**
 * Enable or disable tactile feedback
 */
export function setTactileFeedback(enabled: boolean): void {
  saveTouchFeedbackOptions({ enabled });
  
  if (!isInitialized && enabled) {
    initTouchFeedback(enabled);
  }
}

/**
 * Load user's touch feedback preferences from storage
 */
export function loadTouchFeedbackOptions(): TouchFeedbackOptions {
  try {
    const storedOptions = localStorage.getItem(TOUCH_FEEDBACK_STORAGE_KEY);
    if (storedOptions) {
      return { ...defaultOptions, ...JSON.parse(storedOptions) };
    }
  } catch (error) {
    console.warn('Failed to load touch feedback settings:', error);
  }
  
  return defaultOptions;
}

/**
 * Save user's touch feedback preferences to storage
 */
export function saveTouchFeedbackOptions(options: Partial<TouchFeedbackOptions>): TouchFeedbackOptions {
  try {
    const currentOptions = loadTouchFeedbackOptions();
    const newOptions = { ...currentOptions, ...options };
    localStorage.setItem(TOUCH_FEEDBACK_STORAGE_KEY, JSON.stringify(newOptions));
    return newOptions;
  } catch (error) {
    console.warn('Failed to save touch feedback settings:', error);
    return loadTouchFeedbackOptions();
  }
}

/**
 * Trigger a visual feedback effect at the specified position
 */
export function triggerVisualFeedback(
  x: number, 
  y: number, 
  type: HapticFeedbackType = 'light',
  options: TouchFeedbackOptions = loadTouchFeedbackOptions()
): void {
  if (!options.enabled || !options.visualFeedback) {
    return;
  }
  
  // Create a ripple element
  const ripple = document.createElement('div');
  ripple.className = `haptic-feedback-ripple haptic-${type}`;
  
  // Set the position
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  
  // Set size and opacity based on intensity
  const size = 40 + (options.intensity / 100) * 60; // 40px to 100px based on intensity
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.marginLeft = `-${size / 2}px`;
  ripple.style.marginTop = `-${size / 2}px`;
  
  // Add to the DOM
  document.body.appendChild(ripple);
  
  // Clean up after animation completes
  setTimeout(() => {
    if (document.body.contains(ripple)) {
      document.body.removeChild(ripple);
    }
  }, 600); // Match the animation duration
}

/**
 * Trigger a haptic feedback if available on the device
 */
export function triggerHapticFeedback(
  type: HapticFeedbackType = 'light',
  options: TouchFeedbackOptions = loadTouchFeedbackOptions()
): void {
  if (!options.enabled || !options.hapticFeedback) {
    return;
  }
  
  // Use navigator.vibrate if available (most modern browsers/devices)
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(35);
        break;
      case 'success':
        navigator.vibrate([10, 30, 10]);
        break;
      case 'warning':
        navigator.vibrate([20, 30, 20]);
        break;
      case 'error':
        navigator.vibrate([30, 20, 30, 20, 30]);
        break;
    }
  }
}

/**
 * Combined function to trigger both visual and haptic feedback
 */
export function triggerFeedback(
  x: number,
  y: number,
  type: HapticFeedbackType = 'light',
  options: TouchFeedbackOptions = loadTouchFeedbackOptions()
): void {
  if (!options.enabled) {
    return;
  }
  
  if (options.visualFeedback) {
    triggerVisualFeedback(x, y, type, options);
  }
  
  if (options.hapticFeedback) {
    triggerHapticFeedback(type, options);
  }
}

/**
 * Hook to create a touch trail effect
 */
export function useTouchTrail() {
  const { touchPosition, isActive } = useTouchPosition();
  const options = loadTouchFeedbackOptions();
  
  const createTrailElement = (x: number, y: number) => {
    if (!options.enabled || !options.trailEffect || !isActive) {
      return;
    }
    
    const trail = document.createElement('div');
    trail.className = 'touch-trail';
    
    // Set position
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;
    
    // Add to DOM
    document.body.appendChild(trail);
    
    // Fade out and remove
    setTimeout(() => {
      trail.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(trail)) {
          document.body.removeChild(trail);
        }
      }, 300);
    }, 100);
  };
  
  // Create trail elements at the current touch position
  if (isActive && options.enabled && options.trailEffect) {
    createTrailElement(touchPosition.x, touchPosition.y);
  }
  
  return { touchPosition, isActive };
}