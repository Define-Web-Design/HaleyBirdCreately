import { useState, useEffect } from 'react';

export interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  touchEnabled: boolean;
}

/**
 * Custom hook to detect device type and capabilities for responsive design
 */
export function useMobile(): MobileState {
  const [state, setState] = useState<MobileState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    touchEnabled: false
  });

  useEffect(() => {
    // Function to determine current device and orientation
    const updateDeviceState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;

      // Define breakpoints for device types
      // These values should match your application's responsive breakpoints
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      // Check if touch is available
      const touchEnabled = 'ontouchstart' in window || 
                          navigator.maxTouchPoints > 0 ||
                          (navigator as any).msMaxTouchPoints > 0;

      setState({
        isMobile,
        isTablet,
        isDesktop,
        orientation: isPortrait ? 'portrait' : 'landscape',
        touchEnabled
      });
    };

    // Initialize on mount
    updateDeviceState();

    // Update when window is resized
    window.addEventListener('resize', updateDeviceState);

    // Update on orientation change (mainly for mobile)
    window.addEventListener('orientationchange', updateDeviceState);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('resize', updateDeviceState);
      window.removeEventListener('orientationchange', updateDeviceState);
    };
  }, []);

  return state;
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

export default useMobile;