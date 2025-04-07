import { useState, useRef, useEffect, TouchEvent } from 'react';
import { useIsMobile } from './use-mobile';

export interface SwipeProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultTouchmove?: boolean;
}

export function useTouchSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefaultTouchmove = true
}: SwipeProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const { isMobile, isTouchDevice } = useIsMobile();

  // Tracking if we're currently swiping to prevent other events
  const isSwipingRef = useRef(false);

  // Min distance to be considered a swipe
  const minSwipeDistance = threshold || 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    isSwipingRef.current = true;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (preventDefaultTouchmove && isSwipingRef.current) {
      e.preventDefault();
    }

    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      if (Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (distanceX < 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
    } else {
      if (Math.abs(distanceY) > minSwipeDistance) {
        if (distanceY > 0 && onSwipeUp) {
          onSwipeUp();
        } else if (distanceY < 0 && onSwipeDown) {
          onSwipeDown();
        }
      }
    }

    // Reset values
    setTouchEnd(null);
    setTouchStart(null);
    isSwipingRef.current = false;
  };

  // Only enable swipe detection on mobile/touch devices
  const enabled = isMobile || isTouchDevice;

  useEffect(() => {
    // Clean up any resources or event listeners if needed
    return () => {
      isSwipingRef.current = false;
    };
  }, []);

  return {
    onTouchStart: enabled ? onTouchStart : undefined,
    onTouchMove: enabled ? onTouchMove : undefined,
    onTouchEnd: enabled ? onTouchEnd : undefined,
    isSwiping: isSwipingRef.current,
    isEnabled: enabled
  };
}

export default useTouchSwipe;