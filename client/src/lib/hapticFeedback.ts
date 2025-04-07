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
  return 'navigator' in window && 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback with specified pattern
 */
export function triggerHapticFeedback(pattern: number | number[]): Promise<void> {
  if (!hasVibrationSupport()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    navigator.vibrate(pattern);
    // Resolve after the vibration is complete
    const totalDuration = Array.isArray(pattern)
      ? pattern.reduce((sum, val) => sum + val, 0)
      : pattern;
    setTimeout(resolve, totalDuration);
  });
}

/**
 * Haptic feedback patterns for different intensities
 */
export const hapticFeedback = {
  light: async (): Promise<void> => triggerHapticFeedback(15),
  medium: async (): Promise<void> => triggerHapticFeedback([20, 15, 20]),
  heavy: async (): Promise<void> => triggerHapticFeedback([30, 20, 40, 20, 30]),
  success: async (): Promise<void> => triggerHapticFeedback([10, 15, 30]),
  warning: async (): Promise<void> => triggerHapticFeedback([20, 30, 40, 30, 20]),
  error: async (): Promise<void> => triggerHapticFeedback([30, 20, 50, 20, 60, 20, 30]),
  // Pattern for user interactions
  buttonPress: async (): Promise<void> => triggerHapticFeedback(15),
  toggle: async (): Promise<void> => triggerHapticFeedback(20),
  sliderMove: async (): Promise<void> => triggerHapticFeedback(10),
  sliderRelease: async (): Promise<void> => triggerHapticFeedback(25),
  // Pattern for system events
  notification: async (): Promise<void> => triggerHapticFeedback([20, 30, 40]),
  alert: async (): Promise<void> => triggerHapticFeedback([30, 20, 50, 20, 30]),
  selectItem: async (): Promise<void> => triggerHapticFeedback([10, 10]),
  refresh: async (): Promise<void> => triggerHapticFeedback([15, 10, 15]),
};

/**
 * Add haptic feedback to an HTML element
 */
export function addTouchFeedback(
  element: HTMLElement,
  options: HapticFeedbackOptions = {}
): () => void {
  const { 
    haptic = true, 
    visualFeedback = true, 
    intensity = 'light' 
  } = options;

  // Add touch ripple effect class to element for styling
  element.classList.add('touch-feedback-target');

  // Configure element for feedback behavior
  if (visualFeedback) {
    element.dataset.feedbackVisual = 'true';
  }

  if (haptic) {
    element.dataset.feedbackHaptic = intensity;
  }

  // Event handler to trigger feedback
  const touchHandler = (e: TouchEvent) => {
    // Apply visual feedback if enabled
    if (visualFeedback) {
      applyVisualFeedback(element, e);
    }

    // Apply haptic feedback if enabled and supported
    if (haptic && hasVibrationSupport()) {
      hapticFeedback[intensity as keyof typeof hapticFeedback]();
    }
  };

  // Add event listener
  element.addEventListener('touchstart', touchHandler, { passive: true });

  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', touchHandler);
    element.classList.remove('touch-feedback-target');
    delete element.dataset.feedbackVisual;
    delete element.dataset.feedbackHaptic;
  };
}

/**
 * Apply visual feedback to simulate a touch/tap
 */
function applyVisualFeedback(
  element: HTMLElement,
  event: TouchEvent
): void {
  // Create a ripple element
  const ripple = document.createElement('span');
  ripple.classList.add('touch-ripple-effect');

  // Position the ripple where the user touched
  const rect = element.getBoundingClientRect();
  const touchX = event.touches[0].clientX - rect.left;
  const touchY = event.touches[0].clientY - rect.top;

  // Calculate ripple size (should be larger of width/height to cover element)
  const size = Math.max(rect.width, rect.height) * 1.5;

  // Apply size and position
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${touchX - (size / 2)}px`;
  ripple.style.top = `${touchY - (size / 2)}px`;

  // Add ripple to element
  element.appendChild(ripple);

  // Remove ripple after animation completes
  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}

export default hapticFeedback;