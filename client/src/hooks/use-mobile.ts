import { useEffect, useState, useCallback } from 'react';

/**
 * Hook to detect if the current device is a mobile device
 * @returns boolean indicating if the device is mobile
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    // Check immediately
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * Check if the device is likely a mobile device by screen size
 * @returns true if the device is likely mobile
 */
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

/**
 * Haptic feedback function for mobile devices
 * @param intensity - 'light', 'medium', or 'heavy'
 */
export function hapticFeedback(intensity: 'light' | 'medium' | 'heavy' | 'strong' | 'success' | 'warning' | 'error' = 'medium'): void {
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
export function setTactileFeedback(enabled: boolean): void {
  localStorage.setItem('tactileFeedbackEnabled', enabled ? 'true' : 'false');
}

/**
 * Get whether tactile feedback is enabled
 * @returns boolean indicating if tactile feedback is enabled
 */
export function getTactileFeedback(): boolean {
  return localStorage.getItem('tactileFeedbackEnabled') !== 'false';
}

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
}

/**
 * Hook to access mobile-specific functionality
 */
export function useMobile(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLandscape: false,
    isPortrait: true,
    isTouchDevice: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const checkDevice = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Check if device is mobile (smaller than 768px)
    const isMobile = width < 768;

    // Check if device is tablet (between 768px and 1023px)
    const isTablet = width >= 768 && width <= 1023;

    // Check if device is desktop (larger than 1024px)
    const isDesktop = width > 1023;

    // Check orientation
    const isLandscape = width > height;
    const isPortrait = !isLandscape;

    // Check if device supports touch
    const isTouchDevice = 'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;

    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop,
      isLandscape,
      isPortrait,
      isTouchDevice,
      screenWidth: width,
      screenHeight: height,
    });
  }, []);

  useEffect(() => {
    // Initial check
    checkDevice();

    // Set up event listeners for changes
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, [checkDevice]);

  return deviceInfo;
}

/**
 * Utility function to check if current device is mobile without using a hook
 * Useful in utility functions outside of components
 */
export function checkIsMobile(): boolean {
  if (typeof window === 'undefined') return false;

  const width = window.innerWidth;
  return width < 768 || ('ontouchstart' in window && width < 1024);
}

/**
 * Hook for tracking touch position
 * Useful for creating touch-based interactions
 */
export function useTouchPosition() {
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        setTouchPosition({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        });
        setIsActive(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        setTouchPosition({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        });
      }
    };

    const handleTouchEnd = () => {
      setIsActive(false);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return { touchPosition, isActive };
}