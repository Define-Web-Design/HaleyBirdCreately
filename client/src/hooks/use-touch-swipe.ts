
import { useRef, useEffect, useState } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeState {
  swiping: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
}

interface UseTouchSwipeOptions {
  threshold?: number;
  preventDefaultTouchmove?: boolean;
  disableContextMenu?: boolean;
}

const DEFAULT_THRESHOLD = 50; // Minimum swipe distance in pixels

/**
 * Hook to detect swipe gestures on touch devices
 */
export const useTouchSwipe = (
  handlers: SwipeHandlers,
  options: UseTouchSwipeOptions = {}
) => {
  const {
    threshold = DEFAULT_THRESHOLD,
    preventDefaultTouchmove = true,
    disableContextMenu = false
  } = options;

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  
  const [state, setState] = useState<SwipeState>({
    swiping: false,
    direction: null,
    distance: 0
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      try {
        if (e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY
        };
        
        setState({
          swiping: true,
          direction: null,
          distance: 0
        });
      } catch (error) {
        console.error('Error in touch start handler:', error);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      try {
        if (!touchStartRef.current || e.touches.length !== 1) return;
        
        if (preventDefaultTouchmove) {
          e.preventDefault();
        }
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        
        // Determine primary direction of swipe
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        let direction: 'left' | 'right' | 'up' | 'down' | null = null;
        let distance = 0;
        
        if (absX > absY) {
          // Horizontal swipe
          direction = deltaX > 0 ? 'right' : 'left';
          distance = absX;
        } else {
          // Vertical swipe
          direction = deltaY > 0 ? 'down' : 'up';
          distance = absY;
        }
        
        setState({
          swiping: true,
          direction,
          distance
        });
      } catch (error) {
        console.error('Error in touch move handler:', error);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      try {
        if (!touchStartRef.current) return;
        
        if (state.distance >= threshold && state.direction) {
          // Trigger the appropriate handler if threshold is met
          switch (state.direction) {
            case 'left':
              handlers.onSwipeLeft?.();
              break;
            case 'right':
              handlers.onSwipeRight?.();
              break;
            case 'up':
              handlers.onSwipeUp?.();
              break;
            case 'down':
              handlers.onSwipeDown?.();
              break;
          }
        }
        
        // Reset state
        touchStartRef.current = null;
        setState({
          swiping: false,
          direction: null,
          distance: 0
        });
      } catch (error) {
        console.error('Error in touch end handler:', error);
        
        // Reset on error to prevent getting stuck
        touchStartRef.current = null;
        setState({
          swiping: false,
          direction: null,
          distance: 0
        });
      }
    };

    const handleTouchCancel = () => {
      // Reset on cancel
      touchStartRef.current = null;
      setState({
        swiping: false,
        direction: null,
        distance: 0
      });
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (disableContextMenu) {
        e.preventDefault();
      }
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefaultTouchmove });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouchmove });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchCancel);
    
    if (disableContextMenu) {
      element.addEventListener('contextmenu', handleContextMenu);
    }

    // Clean up
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      
      if (disableContextMenu) {
        element.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, [handlers, threshold, preventDefaultTouchmove, disableContextMenu, state.distance, state.direction]);

  // Return the ref to be attached to the element and current state
  return {
    ref: elementRef,
    state
  };
};

export default useTouchSwipe;
