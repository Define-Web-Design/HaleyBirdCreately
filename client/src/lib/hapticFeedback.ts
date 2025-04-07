/**
 * Haptic Feedback System
 * Provides physical vibration feedback for touch interactions on supported devices
 */

/**
 * Interface for haptic feedback options
 */
export interface HapticFeedbackOptions {
  haptic?: boolean;
  visualFeedback?: boolean;
  intensity?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
}

/**
 * Check if the device supports vibration API
 */
export function hasVibrationSupport(): boolean {
  return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in window.navigator;
}

/**
 * Trigger haptic feedback with specified pattern
 */
export function triggerHapticFeedback(pattern: number | number[]): Promise<void> {
  if (!hasVibrationSupport()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    try {
      window.navigator.vibrate(pattern);
      
      // For a single duration
      if (typeof pattern === 'number') {
        setTimeout(resolve, pattern);
      } 
      // For a pattern array
      else {
        const totalDuration = pattern.reduce((total, duration) => total + duration, 0);
        setTimeout(resolve, totalDuration);
      }
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
      resolve();
    }
  });
}

/**
 * Haptic feedback patterns for different intensities
 */
export const hapticFeedback = {
  // Light feedback (subtle)
  light: () => triggerHapticFeedback(10),
  
  // Medium feedback (standard)
  medium: () => triggerHapticFeedback(25),
  
  // Heavy feedback (stronger)
  heavy: () => triggerHapticFeedback(50),
  
  // Success feedback (double pulse)
  success: () => triggerHapticFeedback([10, 30, 20]),
  
  // Warning feedback (triple pulse)
  warning: () => triggerHapticFeedback([20, 40, 20, 40, 20]),
  
  // Error feedback (longer vibration)
  error: () => triggerHapticFeedback([30, 50, 30, 50, 30]),

  // Custom pattern
  custom: (pattern: number | number[]) => triggerHapticFeedback(pattern)
};

/**
 * Add haptic feedback to an HTML element
 */
export function addTouchFeedback(
  element: HTMLElement,
  options: HapticFeedbackOptions = {}
): () => void {
  if (!element) return () => {};

  const {
    haptic = true,
    visualFeedback = true,
    intensity = 'medium'
  } = options;

  // Handle touch start
  const handleTouchStart = () => {
    try {
      // Trigger haptic feedback if enabled
      if (haptic && hasVibrationSupport()) {
        switch (intensity) {
          case 'light':
            hapticFeedback.light();
            break;
          case 'medium':
            hapticFeedback.medium();
            break;
          case 'heavy':
            hapticFeedback.heavy();
            break;
          case 'success':
            hapticFeedback.success();
            break;
          case 'warning':
            hapticFeedback.warning();
            break;
          case 'error':
            hapticFeedback.error();
            break;
        }
      }

      // Add visual feedback if enabled
      if (visualFeedback) {
        applyVisualFeedback(element, intensity);
      }
    } catch (error) {
      console.error('Error in haptic feedback:', error);
    }
  };

  // Add event listener
  element.addEventListener('touchstart', handleTouchStart, { passive: true });

  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
  };
}

/**
 * Apply visual feedback to simulate a touch/tap
 */
function applyVisualFeedback(
  element: HTMLElement,
  intensity: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
): void {
  // Save original styles
  const originalTransform = element.style.transform;
  const originalTransition = element.style.transition;

  // Map intensity to visual effect strength
  const scaleMap = {
    light: 0.98,
    medium: 0.95,
    heavy: 0.92,
    success: 0.95,
    warning: 0.94,
    error: 0.93
  };

  const scale = scaleMap[intensity];
  
  // Apply scale effect
  element.style.transition = 'transform 100ms ease-in-out';
  element.style.transform = `scale(${scale})`;

  // Add appropriate class based on type
  if (['success', 'warning', 'error'].includes(intensity)) {
    element.classList.add(`haptic-${intensity}`);
  }

  // Reset after animation
  setTimeout(() => {
    element.style.transform = originalTransform;
    
    setTimeout(() => {
      element.style.transition = originalTransition;
      
      // Remove any added classes
      if (['success', 'warning', 'error'].includes(intensity)) {
        element.classList.remove(`haptic-${intensity}`);
      }
    }, 100);
  }, 100);
}

export default {
  hasVibrationSupport,
  triggerHapticFeedback,
  hapticFeedback,
  addTouchFeedback
};