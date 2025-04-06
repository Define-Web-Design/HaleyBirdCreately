/**
 * Page Transition System
 * Creates smooth, customizable transitions between pages to enhance user experience,
 * with optimizations for mobile devices.
 */

import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useMobile } from '@/hooks/use-mobile';

export type TransitionType = 'fade' | 'slide' | 'zoom' | 'none';

export interface PageTransitionOptions {
  type?: TransitionType;
  duration?: number;
  direction?: 'horizontal' | 'vertical';
  easing?: string;
  disabled?: boolean;
}

// Default transition options with mobile-friendly settings
const defaultOptions: PageTransitionOptions = {
  type: 'fade',
  duration: 300,
  direction: 'horizontal',
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // Spring-like easing
  disabled: false
};

/**
 * Hook to manage page transitions
 */
export function usePageTransition(options: PageTransitionOptions = {}) {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(location);
  const [previousLocation, setPreviousLocation] = useState('');
  const [transitionClass, setTransitionClass] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { isMobile } = useMobile();

  // Merge default options with provided options
  const mergedOptions: PageTransitionOptions = {
    ...defaultOptions,
    ...options,
    // Adjust duration for mobile devices to improve perceived performance
    duration: isMobile ? Math.min(options.duration || defaultOptions.duration!, 250) : (options.duration || defaultOptions.duration),
  };

  // Update transition state when location changes
  useEffect(() => {
    if (mergedOptions.disabled) return;
    
    if (location !== currentLocation) {
      // Set transitioning state
      setIsTransitioning(true);
      setPreviousLocation(currentLocation);
      
      // Apply exit transition
      const exitClass = getTransitionClass(mergedOptions.type!, 'exit');
      setTransitionClass(exitClass);
      
      // Schedule enter transition
      timeoutRef.current = setTimeout(() => {
        setCurrentLocation(location);
        const enterClass = getTransitionClass(mergedOptions.type!, 'enter');
        setTransitionClass(enterClass);
        
        // Clear transition state after animation
        timeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          setTransitionClass('');
        }, mergedOptions.duration! + 50);
      }, mergedOptions.duration);
    }
    
    // Clean up timeout on unmount or when location changes again
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location, currentLocation, mergedOptions]);

  // Generate CSS classes based on transition type and state
  const getTransitionClass = (type: TransitionType, state: 'enter' | 'exit'): string => {
    if (type === 'none') return '';
    
    const directionClass = mergedOptions.direction === 'vertical' ? 'vertical' : 'horizontal';
    return `transition-${type} transition-${state} transition-${directionClass}`;
  };

  // Generate inline styles for the transition
  const getTransitionStyles = () => {
    // Don't apply styles if disabled
    if (mergedOptions.disabled) return {};
    
    return {
      '--transition-duration': `${mergedOptions.duration}ms`,
      '--transition-easing': mergedOptions.easing,
    };
  };

  // Return values and functions for the component
  return {
    isTransitioning,
    currentLocation,
    previousLocation,
    transitionClass,
    transitionStyles: getTransitionStyles(),
    options: mergedOptions
  };
}

// Wrapper component for page transitions
// This would be used in App.tsx to wrap the Route content
export function PageTransitionWrapper({ 
  children, 
  options = {} 
}: { 
  children: React.ReactNode, 
  options?: PageTransitionOptions 
}) {
  const { transitionClass, transitionStyles, isTransitioning } = usePageTransition(options);
  
  return (
    <div 
      className={`page-transition-wrapper ${transitionClass}`}
      style={transitionStyles as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// Export default configuration object
export default {
  usePageTransition,
  PageTransitionWrapper
};