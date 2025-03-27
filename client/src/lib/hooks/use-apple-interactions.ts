
import { useEffect, useState, useRef, useCallback } from 'react';

interface UseAppleSmoothScrollOptions {
  duration?: number;
  easing?: (t: number) => number;
}

/**
 * Provides Apple-style smooth scrolling behavior
 */
export function useAppleSmoothScroll(options: UseAppleSmoothScrollOptions = {}) {
  const { 
    duration = 800,
    easing = (t: number) => (t < 0.5 
      ? 4 * t * t * t 
      : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
  } = options;

  const smoothScrollTo = useCallback((target: HTMLElement | number, offset = 0) => {
    const targetPosition = typeof target === 'number' 
      ? target 
      : target.getBoundingClientRect().top + window.pageYOffset;
    
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition - offset;
    let startTime: number | null = null;

    function step(currentTime: number) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easing(progress);
      
      window.scrollTo(0, startPosition + distance * easedProgress);
      
      if (timeElapsed < duration) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }, [duration, easing]);

  // Handle anchor links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      
      if (anchor) {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          e.preventDefault();
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            smoothScrollTo(targetElement as HTMLElement, 80);
          }
        }
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [smoothScrollTo]);

  return { smoothScrollTo };
}

/**
 * Detects scroll direction for implementing direction-aware animations
 */
export function useAppleScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const previousScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > previousScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < previousScrollY.current) {
        setScrollDirection('up');
      }
      
      previousScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollDirection;
}

/**
 * Provides Apple-style hover effects with interpolation
 */
export function useAppleHover() {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const targetProgress = useRef(0);
  
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    targetProgress.current = 1;
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    targetProgress.current = 0;
  }, []);
  
  useEffect(() => {
    const animate = () => {
      setHoverProgress(prev => {
        const diff = targetProgress.current - prev;
        const newProgress = prev + diff * 0.1;
        
        if (Math.abs(diff) < 0.001) {
          return targetProgress.current;
        }
        
        animationRef.current = requestAnimationFrame(animate);
        return newProgress;
      });
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return {
    isHovered,
    hoverProgress,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  };
}

/**
 * Provides Apple-style tilt effect based on mouse position
 */
export function useAppleTilt(options = { max: 10, perspective: 1000 }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { max, perspective } = options;
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = ((y - centerY) / centerY) * max * -1;
    const tiltY = ((x - centerX) / centerX) * max;
    
    setTilt({ x: tiltX, y: tiltY });
  }, [max]);
  
  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave, handleMouseMove]);
  
  const style = {
    transform: `perspective(${perspective}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
    transition: 'transform 0.1s ease'
  };
  
  return { ref, style };
}
