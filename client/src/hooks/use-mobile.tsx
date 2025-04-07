import { useState, useEffect } from 'react';

// Define mobile device detection thresholds
const MOBILE_WIDTH_THRESHOLD = 768;
const TABLET_WIDTH_THRESHOLD = 1024;

/**
 * Custom hook for detecting mobile devices and responsive design
 * @returns Object containing device type information and methods
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      setIsMobile(width < MOBILE_WIDTH_THRESHOLD);
      setIsTablet(width >= MOBILE_WIDTH_THRESHOLD && width < TABLET_WIDTH_THRESHOLD);

      // Set the --vh CSS variable for more accurate mobile viewport heights
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Initial check
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Provide methods to check different device types
  const isDesktop = !isMobile && !isTablet;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Helper method to get appropriate styles based on device
  const getResponsiveStyles = (mobileStyles: any, tabletStyles: any, desktopStyles: any) => {
    if (isMobile) return mobileStyles;
    if (isTablet) return tabletStyles;
    return desktopStyles;
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    viewportWidth,
    getResponsiveStyles
  };
}

// Default export for backward compatibility
export default useIsMobile;

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