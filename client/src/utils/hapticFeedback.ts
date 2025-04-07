/**
 * Haptic Feedback Utilities
 * 
 * This module provides haptic feedback functionality for mobile devices
 * without creating circular dependencies.
 */

/**
 * Haptic feedback function for mobile devices
 * @param intensity - Type of haptic feedback to trigger
 */
export function triggerHapticFeedback(
  intensity: 'light' | 'medium' | 'heavy' | 'strong' | 'success' | 'warning' | 'error' = 'medium'
): void {
  if (!navigator.vibrate) return;

  try {
    // Check for navigator.vibrate support (most Android devices)
    if ('vibrate' in navigator) {
      switch (intensity) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(15);
          break;
        case 'heavy':
        case 'strong':
          navigator.vibrate([10, 20, 30]);
          break;
        case 'success':
          navigator.vibrate([10, 30, 10]);
          break;
        case 'warning':
          navigator.vibrate([30, 50, 30]);
          break;
        case 'error':
          navigator.vibrate([20, 40, 60, 20]);
          break;
        default:
          navigator.vibrate(15);
      }
    }
  } catch (error) {
    // Silent fail - many browsers don't support haptics
  }
}

/**
 * Set whether tactile feedback is enabled
 * @param enabled - Whether tactile feedback is enabled
 */
export function setTactileFeedbackEnabled(enabled: boolean): void {
  localStorage.setItem('tactileFeedbackEnabled', enabled ? 'true' : 'false');
  
  // Apply to document body for CSS styling
  if (enabled) {
    document.documentElement.classList.add('tactile-feedback-enabled');
  } else {
    document.documentElement.classList.remove('tactile-feedback-enabled');
  }
}

/**
 * Get whether tactile feedback is enabled
 * @returns boolean indicating if tactile feedback is enabled
 */
export function getTactileFeedbackEnabled(): boolean {
  return localStorage.getItem('tactileFeedbackEnabled') !== 'false';
}

/**
 * Check if device supports haptic feedback
 * @returns boolean indicating if device supports haptic feedback
 */
export function supportsHapticFeedback(): boolean {
  return 'vibrate' in navigator;
}