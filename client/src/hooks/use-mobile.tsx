/**
 * Hooks for detecting and optimizing for mobile devices
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the device is mobile based on screen width and user agent
 * @returns An object with mobile detection results
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    // Detect mobile based on screen width
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Detect touch capability
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    // Initial checks
    checkMobile();
    checkTouch();
    
    // Setup event listeners for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  return { isMobile, isTouch };
}

/**
 * Simple hook that just returns the isMobile boolean
 * @returns boolean indicating if the device is mobile
 */
export function useIsMobile() {
  const { isMobile } = useMobile();
  return isMobile;
}

/**
 * Hook for tracking touch positions for effects like touch trails
 * @returns An object with touch coordinates and methods
 */
export function useTouchPosition() {
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setTouchPosition({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        });
        setIsActive(true);
      }
    };
    
    const handleTouchEnd = () => {
      // Small delay before hiding the touch trail
      setTimeout(() => {
        setIsActive(false);
      }, 100);
    };
    
    // Add event listeners
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    
    // Cleanup
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  
  return { touchPosition, isActive };
}

/**
 * Hook to detect device orientation changes
 * @returns The current orientation state
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState({
    angle: 0,
    type: 'portrait' // 'portrait' or 'landscape'
  });
  
  useEffect(() => {
    const handleOrientationChange = () => {
      // Get screen orientation if available, otherwise calculate from dimensions
      if (window.screen.orientation) {
        setOrientation({
          angle: window.screen.orientation.angle,
          type: window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape'
        });
      } else {
        // Fallback for browsers without Screen Orientation API
        const isPortrait = window.innerHeight > window.innerWidth;
        setOrientation({
          angle: isPortrait ? 0 : 90,
          type: isPortrait ? 'portrait' : 'landscape'
        });
      }
    };
    
    // Initial check
    handleOrientationChange();
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);
  
  return orientation;
}

/**
 * Hook to handle device motion for interactive effects
 * @returns Device motion data for creating responsive effects
 */
export function useDeviceMotion() {
  const [motion, setMotion] = useState({
    acceleration: { x: 0, y: 0, z: 0 },
    rotationRate: { alpha: 0, beta: 0, gamma: 0 },
    isSupported: false
  });
  
  useEffect(() => {
    // Check if DeviceMotionEvent is supported
    const isSupported = 'DeviceMotionEvent' in window;
    
    if (!isSupported) {
      setMotion(prev => ({ ...prev, isSupported: false }));
      return;
    }
    
    const handleMotion = (event: DeviceMotionEvent) => {
      if (event.acceleration && event.rotationRate) {
        setMotion({
          acceleration: {
            x: event.acceleration.x || 0,
            y: event.acceleration.y || 0,
            z: event.acceleration.z || 0
          },
          rotationRate: {
            alpha: event.rotationRate.alpha || 0,
            beta: event.rotationRate.beta || 0,
            gamma: event.rotationRate.gamma || 0
          },
          isSupported: true
        });
      }
    };
    
    // Try to add the event listener
    try {
      window.addEventListener('devicemotion', handleMotion);
    } catch (error) {
      console.warn('Device motion not available:', error);
      setMotion(prev => ({ ...prev, isSupported: false }));
    }
    
    // Cleanup
    return () => {
      try {
        window.removeEventListener('devicemotion', handleMotion);
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);
  
  return motion;
}