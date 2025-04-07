/**
 * Haptic feedback utility for tactile responses on mobile devices
 */

// Check if the device supports vibration
const supportsVibration = typeof navigator !== 'undefined' && 'vibrate' in navigator;

// Default durations for different intensities (in milliseconds)
const DURATIONS = {
  light: 10,
  medium: 20,
  strong: 35,
  error: [10, 30, 50], // Pattern for error feedback
  success: [15, 30, 15], // Pattern for success feedback
  warning: [10, 20, 10, 20], // Pattern for warning feedback
};

// Store preference
let isEnabled = true;

/**
 * Enable or disable haptic feedback
 * @param enabled - Whether feedback should be enabled
 */
export function setHapticFeedbackEnabled(enabled: boolean): void {
  isEnabled = enabled;
  localStorage.setItem('hapticFeedbackEnabled', enabled ? 'true' : 'false');
}

/**
 * Check if haptic feedback is enabled
 * @returns Whether haptic feedback is enabled
 */
export function getHapticFeedbackEnabled(): boolean {
  // Check localStorage first, then fall back to default
  const stored = localStorage.getItem('hapticFeedbackEnabled');
  return stored !== null ? stored === 'true' : isEnabled;
}

/**
 * Trigger haptic feedback with specified intensity
 * @param intensity - The intensity of the vibration
 * @returns Whether the vibration was triggered
 */
export function hapticFeedback(
  intensity: 'light' | 'medium' | 'strong' | 'error' | 'success' | 'warning' = 'medium'
): boolean {
  // Return early if disabled or not supported
  if (!isEnabled || !supportsVibration) return false;

  try {
    // Get the duration for the specified intensity
    const duration = DURATIONS[intensity];

    // Trigger vibration
    navigator.vibrate(duration);
    return true;
  } catch (error) {
    console.error('Haptic feedback error:', error);
    return false;
  }
}

/**
 * Initialize haptic feedback from saved preferences
 */
export function initHapticFeedback(): void {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('hapticFeedbackEnabled');
    isEnabled = stored !== null ? stored === 'true' : true;
  }
}

export default {
  hapticFeedback,
  setHapticFeedbackEnabled,
  getHapticFeedbackEnabled,
  initHapticFeedback,
};