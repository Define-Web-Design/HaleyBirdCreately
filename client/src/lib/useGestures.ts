import { useRef, useState, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions extends SwipeHandlers {
  threshold?: number;
  preventDefaultTouchmove?: boolean;
}

interface SwipeResult {
  swipeHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
  swiping: boolean;
  direction: string | null;
}

/**
 * A hook that detects swipe gestures for mobile interactions
 */
export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefaultTouchmove = true,
}: SwipeOptions = {}): SwipeResult => {
  const [swiping, setSwiping] = useState(false);
  const [direction, setDirection] = useState<string | null>(null);
  
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const moveX = useRef<number>(0);
  const moveY = useRef<number>(0);

  // Handle touch start event
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setDirection(null);
    setSwiping(true);
  }, []);

  // Handle touch move event
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (startX.current === null || startY.current === null) return;

      moveX.current = e.touches[0].clientX - startX.current;
      moveY.current = e.touches[0].clientY - startY.current;

      if (preventDefaultTouchmove) {
        const absX = Math.abs(moveX.current);
        const absY = Math.abs(moveY.current);

        // If we're swiping horizontally more than vertically, prevent default
        // to avoid page scrolling while swiping
        if (absX > absY && absX > 10) {
          e.preventDefault();
        }
      }
    },
    [preventDefaultTouchmove]
  );

  // Handle touch end event and determine swipe direction
  const handleTouchEnd = useCallback(() => {
    if (startX.current === null || startY.current === null) return;

    const absX = Math.abs(moveX.current);
    const absY = Math.abs(moveY.current);

    if (absX > absY && absX > threshold) {
      // Horizontal swipe
      if (moveX.current > 0) {
        setDirection('right');
        onSwipeRight?.();
      } else {
        setDirection('left');
        onSwipeLeft?.();
      }
    } else if (absY > absX && absY > threshold) {
      // Vertical swipe
      if (moveY.current > 0) {
        setDirection('down');
        onSwipeDown?.();
      } else {
        setDirection('up');
        onSwipeUp?.();
      }
    }

    startX.current = null;
    startY.current = null;
    moveX.current = 0;
    moveY.current = 0;
    setSwiping(false);
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return {
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    swiping,
    direction,
  };
};

export default useSwipe;