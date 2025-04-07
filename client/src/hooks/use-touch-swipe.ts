
/**
 * Touch Swipe Hook
 * Detects swipe gestures on touch devices
 */
import { useState, useEffect, useRef } from 'react';
import { useMobile } from './use-mobile';

interface SwipeOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchPosition {
  x: number;
  y: number;
}

export function useTouchSwipe(
  ref: React.RefObject<HTMLElement>,
  options: SwipeOptions = {}
) {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = options;
  
  const { isTouch } = useMobile();
  const [swiping, setSwiping] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const touchStart = useRef<TouchPosition | null>(null);
  
  useEffect(() => {
    if (!isTouch || !ref.current) return;
    
    const element = ref.current;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
        setSwiping(true);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart.current || !swiping) return;
      
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const diffX = touchStart.current.x - touchX;
      const diffY = touchStart.current.y - touchY;
      
      // Determine swipe direction based on the greatest difference
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (Math.abs(diffX) > threshold) {
          setDirection(diffX > 0 ? 'left' : 'right');
        }
      } else {
        // Vertical swipe
        if (Math.abs(diffY) > threshold) {
          setDirection(diffY > 0 ? 'up' : 'down');
        }
      }
    };
    
    const handleTouchEnd = () => {
      if (direction === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (direction === 'right' && onSwipeRight) {
        onSwipeRight();
      } else if (direction === 'up' && onSwipeUp) {
        onSwipeUp();
      } else if (direction === 'down' && onSwipeDown) {
        onSwipeDown();
      }
      
      // Reset state
      touchStart.current = null;
      setSwiping(false);
      setDirection(null);
    };
    
    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);
    
    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, isTouch, threshold, direction, swiping, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);
  
  return { swiping, direction };
}
