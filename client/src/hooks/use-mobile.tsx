import { useState, useEffect, useCallback } from 'react';

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
 * Hook specifically for checking if the device is mobile
 * Simplified version of useMobile for components that only need this information
 */
export function useIsMobile(): boolean {
  const deviceInfo = useMobile();
  return deviceInfo.isMobile;
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

export default useMobile;