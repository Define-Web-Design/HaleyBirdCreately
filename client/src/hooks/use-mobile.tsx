import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
import { useEffect, useState } from 'react';

/**
 * Hook to detect if the current device is mobile
 * Returns a boolean and information about the viewport
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [viewportInfo, setViewportInfo] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    orientation: ''
  });

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobileDevice = width <= 768;
      
      setIsMobile(isMobileDevice);
      setViewportInfo({
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait'
      });
    };

    // Check on mount
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { 
    isMobile, 
    viewportInfo,
    isTablet: viewportInfo.width > 768 && viewportInfo.width <= 1024,
    isDesktop: viewportInfo.width > 1024
  };
}

export default useMobile;
