import { useState, useEffect, RefObject, useCallback } from 'react';

export interface SwipeParams {
  element: RefObject<HTMLElement>;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance required for swipe
  preventDefaultTouchmove?: boolean; // Whether to prevent default touchmove behavior
}

export interface SwipeState {
  swiping: boolean;
  direction: string | null;
  distance: number;
}

export function useTouchSwipe({
  element,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefaultTouchmove = true,
}: SwipeParams): SwipeState {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [swiping, setSwiping] = useState<boolean>(false);
  const [direction, setDirection] = useState<string | null>(null);
  const [distance, setDistance] = useState<number>(0);

  // Safe event handler to prevent errors when accessing element.current
  const safeAddEventListener = useCallback((eventName: string, handler: EventListener): (() => void) => {
    if (element.current) {
      element.current.addEventListener(eventName, handler, { passive: !preventDefaultTouchmove });
      return () => {
        if (element.current) {
          element.current.removeEventListener(eventName, handler);
        }
      };
    }
    return () => {};
  }, [element, preventDefaultTouchmove]);

  // Handle touch start
  useEffect(() => {
    if (!element.current) return;

    const handleTouchStart = (e: TouchEvent) => {
      try {
        // Only process single-touch events to avoid multi-touch gesture conflicts
        if (e.touches.length === 1) {
          setTouchEnd(null); // Reset end position
          setTouchStart({
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
          });
          setSwiping(true);
          setDirection(null);
          setDistance(0);
        }
      } catch (error) {
        console.error('Error in touch start handler:', error);
      }
    };

    return safeAddEventListener('touchstart', handleTouchStart);
  }, [element, safeAddEventListener]);

  // Handle touch move
  useEffect(() => {
    if (!element.current) return;

    const handleTouchMove = (e: TouchEvent) => {
      try {
        // Prevent default only when configured to do so
        if (preventDefaultTouchmove) {
          e.preventDefault();
        }

        if (!touchStart) return;

        setTouchEnd({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        });
      } catch (error) {
        console.error('Error in touch move handler:', error);
      }
    };

    return safeAddEventListener('touchmove', handleTouchMove);
  }, [element, touchStart, preventDefaultTouchmove, safeAddEventListener]);

  // Handle touch end
  useEffect(() => {
    if (!element.current) return;

    const handleTouchEnd = () => {
      try {
        if (!touchStart || !touchEnd) {
          setSwiping(false);
          return;
        }

        // Calculate distances
        const horizontalDistance = touchEnd.x - touchStart.x;
        const verticalDistance = touchEnd.y - touchStart.y;
        const absHorizontal = Math.abs(horizontalDistance);
        const absVertical = Math.abs(verticalDistance);

        // Set distance to the larger of horizontal or vertical movement
        const maxDistance = Math.max(absHorizontal, absVertical);
        setDistance(maxDistance);

        // Determine swipe direction
        let swipeDirection = null;
        let callback = null;

        if (absHorizontal > absVertical && absHorizontal > threshold) {
          // Horizontal swipe
          swipeDirection = horizontalDistance > 0 ? 'right' : 'left';
          callback = horizontalDistance > 0 ? onSwipeRight : onSwipeLeft;
        } else if (absVertical > threshold) {
          // Vertical swipe
          swipeDirection = verticalDistance > 0 ? 'down' : 'up';
          callback = verticalDistance > 0 ? onSwipeDown : onSwipeUp;
        }

        setDirection(swipeDirection);
        setSwiping(false);

        // Call the appropriate callback if a swipe was detected
        if (callback) {
          callback();
        }

        // Reset touch data
        setTouchStart(null);
        setTouchEnd(null);
      } catch (error) {
        console.error('Error in touch end handler:', error);
        setSwiping(false);
      }
    };

    return safeAddEventListener('touchend', handleTouchEnd);
  }, [element, touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, safeAddEventListener]);

  return { swiping, direction, distance };
}

export default useTouchSwipe;