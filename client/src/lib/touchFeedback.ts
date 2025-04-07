/**
 * Touch Feedback System
 * Provides haptic-like visual feedback for touch interactions
 * and enhances the mobile experience with touch-driven animations
 */

import { useTouchPosition } from '@/hooks/use-mobile';

/**
 * Utility for providing haptic-like feedback on touch devices
 */

interface TouchFeedbackOptions {
  element: HTMLElement;
  intensity?: 'light' | 'medium' | 'strong';
  duration?: number;
  visualFeedback?: boolean;
}

class TouchFeedbackManager {
  private supportsVibration: boolean = false;

  constructor() {
    // Check for vibration support
    this.supportsVibration = 'vibrate' in navigator;
  }

  /**
   * Trigger haptic-like feedback on a touch device
   */
  public provideFeedback({ 
    element, 
    intensity = 'medium', 
    duration = 20,
    visualFeedback = true 
  }: TouchFeedbackOptions): void {
    // Apply vibration if supported
    try {
      if (this.supportsVibration) {
        // Different durations based on intensity
        const vibrationDuration = 
          intensity === 'light' ? duration / 2 : 
          intensity === 'strong' ? duration * 2 : 
          duration;

        navigator.vibrate(vibrationDuration);
      }

      // Apply visual feedback if enabled
      if (visualFeedback) {
        this.applyVisualFeedback(element, intensity);
      }
    } catch (error) {
      console.error('Error providing touch feedback:', error);
    }
  }

  /**
   * Apply visual feedback to simulate a touch/tap
   */
  private applyVisualFeedback(element: HTMLElement, intensity: 'light' | 'medium' | 'strong'): void {
    try {
      // Save original transition
      const originalTransition = element.style.transition;

      // Add animation class based on intensity
      const className = `touch-feedback-${intensity}`;
      element.classList.add(className);

      // Remove class after animation completes
      setTimeout(() => {
        element.classList.remove(className);
        element.style.transition = originalTransition;
      }, 150);
    } catch (error) {
      console.error('Error applying visual feedback:', error);
    }
  }

  /**
   * Check if device supports haptic feedback
   */
  public supportsHapticFeedback(): boolean {
    return this.supportsVibration;
  }
}

// Export singleton instance
export const touchFeedback = new TouchFeedbackManager();

// Function to add touch feedback to an element
export function addTouchFeedback(
  element: HTMLElement, 
  options: Omit<TouchFeedbackOptions, 'element'> = {}
): () => void {
  if (!element) return () => {}; // Exit if no element

  const handleTouchStart = () => {
    touchFeedback.provideFeedback({
      element,
      ...options
    });
  };

  // Add event listener
  element.addEventListener('touchstart', handleTouchStart, { passive: true });

  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
  };
}


// Haptic feedback intensity levels
export enum HapticIntensity {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

/**
 * Trigger haptic feedback on supported devices
 * @param intensity The intensity/type of haptic feedback
 * @returns Promise that resolves when feedback is complete
 */
export function triggerHapticFeedback(intensity: HapticIntensity = HapticIntensity.MEDIUM): Promise<void> {
  // Check if the device supports vibration
  if (!window.navigator.vibrate) {
    return Promise.resolve();
  }

  // Map intensity to vibration pattern in milliseconds
  const patterns = {
    [HapticIntensity.LIGHT]: [10],
    [HapticIntensity.MEDIUM]: [35],
    [HapticIntensity.HEAVY]: [75],
    [HapticIntensity.SUCCESS]: [10, 30, 30],
    [HapticIntensity.WARNING]: [30, 50, 30],
    [HapticIntensity.ERROR]: [50, 100, 50, 100, 50]
  };

  // Trigger vibration with the selected pattern
  return new Promise(resolve => {
    window.navigator.vibrate(patterns[intensity]);

    // Calculate total duration of the pattern
    const totalDuration = patterns[intensity].reduce((sum, duration) => sum + duration, 0);

    // Resolve promise after the vibration completes
    setTimeout(resolve, totalDuration);
  });
}

/**
 * Enable haptic feedback system-wide
 * @param enabled Whether haptic feedback should be enabled
 */
export function setHapticFeedbackEnabled(enabled: boolean): void {
  localStorage.setItem('hapticFeedbackEnabled', enabled ? 'true' : 'false');
}

/**
 * Check if haptic feedback is enabled
 * @returns Boolean indicating if haptic feedback is enabled
 */
export function isHapticFeedbackEnabled(): boolean {
  return localStorage.getItem('hapticFeedbackEnabled') !== 'false';
}

/**
 * Apply touch feedback to all interactive elements in a container
 * @param container The parent element to search within
 */
export function applyTouchFeedbackToInteractiveElements(
  container: HTMLElement = document.body
): () => void {
  // Find all interactive elements
  const elements = container.querySelectorAll<HTMLElement>(
    'button, a, [role="button"], .btn, .interactive, .clickable, .card'
  );

  // Store cleanup functions
  const cleanupFunctions: (() => void)[] = [];

  // Add touch feedback to each element
  elements.forEach(element => {
    // Skip elements that already have touch feedback
    if (element.classList.contains('touch-feedback')) {
      return;
    }

    const cleanup = addTouchFeedback(element, {
      haptic: isHapticFeedbackEnabled(),
      visualFeedback: true
    });

    cleanupFunctions.push(cleanup);
  });

  // Return a function that cleans up all event listeners
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}



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

        touchFeedback.provideFeedback({ element, intensity: 'light' }); //Use new trigger function

      };

      // Touch end handler
      const touchEndHandler = () => {
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
    touchFeedback.provideFeedback({ element: document.body, intensity: 'light' }); //Use new trigger function
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

export default {
  triggerHapticFeedback,
  addTouchFeedback,
  setHapticFeedbackEnabled,
  isHapticFeedbackEnabled,
  applyTouchFeedbackToInteractiveElements,
  HapticIntensity,
  initTouchFeedback,
  cleanupTouchFeedback,
  setTactileFeedback,
  loadTouchFeedbackOptions,
  saveTouchFeedbackOptions,
  useTouchTrail,
  touchFeedback
};