/**
 * Page Transition Component
 * Creates smooth transitions between pages to enhance user experience
 * with optimizations for mobile devices
 */

import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useMobile } from '@/hooks/use-mobile';

export type TransitionType = 'fade' | 'slide' | 'zoom' | 'parallax' | 'layered' | 'minimal' | 'none';

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
  duration: 280,
  direction: 'horizontal',
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  disabled: false
};

export function PageTransition({ 
  children, 
  options = {} 
}: { 
  children: React.ReactNode; 
  options?: PageTransitionOptions;
}) {
  const [location] = useLocation();
  const { isMobile } = useMobile();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentChildren, setCurrentChildren] = useState(children);
  const [previousLocation, setPreviousLocation] = useState(location);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Merge default options with provided options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    // Use shorter duration on mobile for better perceived performance
    duration: isMobile ? Math.min(options.duration || defaultOptions.duration, 220) : (options.duration || defaultOptions.duration),
    // Default to simpler transitions on mobile
    type: isMobile && !options.type ? 'fade' : (options.type || defaultOptions.type)
  };

  useEffect(() => {
    if (location !== previousLocation) {
      // Start transition
      setIsTransitioning(true);
      
      // After a short delay, update children to the new content
      const timer = setTimeout(() => {
        setCurrentChildren(children);
        setPreviousLocation(location);
        
        // End transition after animation completes
        const endTimer = setTimeout(() => {
          setIsTransitioning(false);
        }, mergedOptions.duration);
        
        return () => clearTimeout(endTimer);
      }, 50); // Small delay to ensure exit animation starts
      
      return () => clearTimeout(timer);
    }
  }, [children, location, previousLocation, mergedOptions.duration]);

  // Skip transitions if disabled
  if (mergedOptions.disabled) {
    return <div>{children}</div>;
  }

  // Determine transition classes based on options
  const getTransitionClasses = () => {
    if (isTransitioning) {
      switch (mergedOptions.type) {
        case 'fade':
          return 'opacity-0';
        case 'slide':
          return mergedOptions.direction === 'horizontal' 
            ? 'translate-x-full opacity-0' 
            : 'translate-y-full opacity-0';
        case 'zoom':
          return 'scale-95 opacity-0';
        case 'parallax':
          return mergedOptions.direction === 'horizontal'
            ? 'translate-x-1/4 opacity-0'
            : 'translate-y-1/4 opacity-0';
        case 'layered':
          return 'opacity-0 scale-[0.98] translate-y-2';
        case 'minimal':
          return 'opacity-90 scale-[0.99]';
        case 'none':
          return '';
        default:
          return 'opacity-0';
      }
    }
    return '';
  };

  const transitionStyle = {
    transition: `transform ${mergedOptions.duration}ms ${mergedOptions.easing}, opacity ${mergedOptions.duration}ms ${mergedOptions.easing}`,
    willChange: 'transform, opacity'
  };

  return (
    <div 
      ref={containerRef}
      className={`transition-container ${getTransitionClasses()}`}
      style={transitionStyle}
    >
      {currentChildren}
    </div>
  );
}
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
export const PageTransitionWrapper = ({
  children,
  options = {}
}: {
  children: React.ReactNode;
  options?: PageTransitionOptions;
}) => {
  const { transitionClass, transitionStyles } = usePageTransition(options);
  
  return (
    <div 
      className={`page-transition-wrapper ${transitionClass}`}
      style={transitionStyles as React.CSSProperties}
    >
      {children}
    </div>
  );
};