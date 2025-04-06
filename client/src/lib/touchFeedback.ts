/**
 * Touch Feedback System
 * Enhances touch and pointer interactions with visual feedback that follows the user's finger
 * or cursor position for a more natural, tactile experience, especially on mobile devices.
 */

// Track whether the tactile feedback is enabled
let isTactileFeedbackEnabled = false;

// Initialize interaction tracking
export const initTouchFeedback = (enabled: boolean = true) => {
  isTactileFeedbackEnabled = enabled;
  
  if (typeof window !== 'undefined') {
    // Add event listeners for mouse and touch events
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    // Initialize mobile detection
    checkIfMobile();
    
    // Listen for window resize to update mobile detection
    window.addEventListener('resize', checkIfMobile);
    
    return true;
  }
  
  return false;
};

// Clean up event listeners when no longer needed
export const cleanupTouchFeedback = () => {
  if (typeof window !== 'undefined') {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('resize', checkIfMobile);
  }
};

// Update tactile feedback state
export const setTactileFeedback = (enabled: boolean) => {
  isTactileFeedbackEnabled = enabled;
  
  if (enabled) {
    document.documentElement.classList.add('tactile-feedback-enabled');
  } else {
    document.documentElement.classList.remove('tactile-feedback-enabled');
  }
};

// Handle mouse movement for desktop interactions
const handleMouseMove = (event: MouseEvent) => {
  if (!isTactileFeedbackEnabled) return;
  
  const { clientX, clientY } = event;
  const hoveredElement = document.elementFromPoint(clientX, clientY);
  
  if (hoveredElement && (
    hoveredElement.classList.contains('interactive-element') || 
    hoveredElement.classList.contains('card-transition')
  )) {
    updateCoordinateProperties(hoveredElement as HTMLElement, clientX, clientY);
  }
};

// Handle touch movement for mobile interactions
const handleTouchMove = (event: TouchEvent) => {
  if (!isTactileFeedbackEnabled || event.touches.length === 0) return;
  
  const { clientX, clientY } = event.touches[0];
  const touchedElement = document.elementFromPoint(clientX, clientY);
  
  if (touchedElement && (
    touchedElement.classList.contains('interactive-element') || 
    touchedElement.classList.contains('card-transition')
  )) {
    updateCoordinateProperties(touchedElement as HTMLElement, clientX, clientY);
  }
};

// Handle initial touch for mobile interactions
const handleTouchStart = (event: TouchEvent) => {
  if (!isTactileFeedbackEnabled || event.touches.length === 0) return;
  
  const { clientX, clientY } = event.touches[0];
  const touchedElement = document.elementFromPoint(clientX, clientY);
  
  if (touchedElement && (
    touchedElement.classList.contains('interactive-element') || 
    touchedElement.classList.contains('card-transition')
  )) {
    updateCoordinateProperties(touchedElement as HTMLElement, clientX, clientY);
    
    // Add a subtle haptic pulse effect
    touchedElement.classList.add('haptic-pulse');
    setTimeout(() => {
      touchedElement.classList.remove('haptic-pulse');
    }, 300);
  }
};

// Update CSS custom properties with the current coordinates
const updateCoordinateProperties = (element: HTMLElement, x: number, y: number) => {
  const rect = element.getBoundingClientRect();
  const relativeX = x - rect.left;
  const relativeY = y - rect.top;
  
  // Set CSS variables for the radial gradient position
  element.style.setProperty('--x', `${relativeX}px`);
  element.style.setProperty('--y', `${relativeY}px`);
};

// Check if the device is mobile and add appropriate class
const checkIfMobile = () => {
  if (window.matchMedia('(max-width: 768px)').matches) {
    document.body.classList.add('mobile-device');
    
    // Add enhanced touch feedback for mobile only if enabled
    if (isTactileFeedbackEnabled) {
      document.body.classList.add('enhanced-touch');
    }
  } else {
    document.body.classList.remove('mobile-device');
    document.body.classList.remove('enhanced-touch');
  }
};

// Export a hook-compatible version of the tactile feedback state
export const useTouchFeedback = () => {
  return {
    isTactileFeedbackEnabled,
    setTactileFeedback,
    initTouchFeedback,
    cleanupTouchFeedback
  };
};

export default {
  initTouchFeedback,
  cleanupTouchFeedback,
  setTactileFeedback,
  useTouchFeedback
};
/**
 * Utility for providing haptic feedback on mobile devices
 */

// Check if the device supports vibration
export const supportsHapticFeedback = (): boolean => {
  return 'vibrate' in navigator;
};

// Provide short vibration feedback (for button presses, etc.)
export const shortFeedback = (): void => {
  if (supportsHapticFeedback()) {
    navigator.vibrate(10);
  }
};

// Provide medium vibration feedback (for selections, confirmations)
export const mediumFeedback = (): void => {
  if (supportsHapticFeedback()) {
    navigator.vibrate(30);
  }
};

// Provide error/warning vibration feedback (for errors, warnings)
export const errorFeedback = (): void => {
  if (supportsHapticFeedback()) {
    navigator.vibrate([30, 50, 30]);
  }
};

// Provide success vibration feedback (for successful actions)
export const successFeedback = (): void => {
  if (supportsHapticFeedback()) {
    navigator.vibrate([10, 30, 10, 30]);
  }
};

// Enhanced button press feedback
export const buttonFeedback = (): void => {
  shortFeedback();
};

// Apply this feedback to interactive elements
export function applyTouchFeedback(): void {
  if (!supportsHapticFeedback()) return;
  
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    
    // Check if the clicked element is a button or other interactive element
    if (
      target.tagName === 'BUTTON' ||
      target.getAttribute('role') === 'button' ||
      target.classList.contains('interactive')
    ) {
      buttonFeedback();
    }
  });
}

export default {
  shortFeedback,
  mediumFeedback,
  errorFeedback,
  successFeedback,
  buttonFeedback,
  applyTouchFeedback,
  supportsHapticFeedback
};
