import { useState, useRef, useEffect } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

// Touch interface compatible with React's Touch type
interface TouchPoint {
  clientX: number;
  clientY: number;
  identifier: number;
}

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface GestureHandlers extends SwipeHandlers {
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

interface UseGesturesProps extends GestureHandlers {
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  disabled?: boolean;
}

/**
 * Custom hook for handling mobile touch gestures like swipe, pinch, rotate, double tap, and long press
 */
export function useGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onRotate,
  onDoubleTap,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500,
  doubleTapDelay = 300,
  disabled = false,
}: UseGesturesProps = {}) {
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const multiTouchStartRef = useRef<{ touches: TouchPoint[] } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);
  
  // Gesture detection handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    
    // If multiple touches, store for pinch/rotate
    if (e.touches.length > 1) {
      // Convert React.Touch objects to our TouchPoint interface
      const touchPoints: TouchPoint[] = Array.from(e.touches).map(touch => ({
        clientX: touch.clientX,
        clientY: touch.clientY,
        identifier: touch.identifier
      }));
      
      multiTouchStartRef.current = {
        touches: touchPoints
      };
    }
    
    // Set up long press
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress();
      }, longPressDelay);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !touchStartRef.current) return;
    
    // Cancel long press on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Handle pinch gesture
    if (onPinch && e.touches.length > 1 && multiTouchStartRef.current) {
      const startTouches = multiTouchStartRef.current.touches;
      
      // Create TouchPoint objects for current touches
      const currentTouch1: TouchPoint = {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        identifier: e.touches[0].identifier
      };
      
      const currentTouch2: TouchPoint = {
        clientX: e.touches[1].clientX,
        clientY: e.touches[1].clientY,
        identifier: e.touches[1].identifier
      };
      
      const startDistance = getDistance(startTouches[0], startTouches[1]);
      const currentDistance = getDistance(currentTouch1, currentTouch2);
      const scale = currentDistance / startDistance;
      
      onPinch(scale);
    }
    
    // Handle rotate gesture
    if (onRotate && e.touches.length > 1 && multiTouchStartRef.current) {
      const startTouches = multiTouchStartRef.current.touches;
      
      // Create TouchPoint objects for current touches
      const currentTouch1: TouchPoint = {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        identifier: e.touches[0].identifier
      };
      
      const currentTouch2: TouchPoint = {
        clientX: e.touches[1].clientX,
        clientY: e.touches[1].clientY,
        identifier: e.touches[1].identifier
      };
      
      const startAngle = getAngle(startTouches[0], startTouches[1]);
      const currentAngle = getAngle(currentTouch1, currentTouch2);
      const rotation = currentAngle - startAngle;
      
      onRotate(rotation);
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled || !touchStartRef.current) return;
    
    // Cancel long press
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    const { x: startX, y: startY, time: startTime } = touchStartRef.current;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = Date.now() - startTime;
    
    // Check for double tap
    if (onDoubleTap) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;
      
      if (timeSinceLastTap < doubleTapDelay) {
        onDoubleTap();
        lastTapRef.current = 0; // Reset to prevent triple tap
      } else {
        lastTapRef.current = now;
      }
    }
    
    // Check swipe gesture
    // Must be a quick gesture and exceed threshold
    if (deltaTime < 250) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) >= swipeThreshold) {
          if (deltaX > 0) {
            setSwipeDirection('right');
            onSwipeRight?.();
          } else {
            setSwipeDirection('left');
            onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) >= swipeThreshold) {
          if (deltaY > 0) {
            setSwipeDirection('down');
            onSwipeDown?.();
          } else {
            setSwipeDirection('up');
            onSwipeUp?.();
          }
        }
      }
    }
    
    // Reset
    touchStartRef.current = null;
    multiTouchStartRef.current = null;
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);
  
  // Return the gesture handlers and current swipe direction
  return {
    gestureHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    swipeDirection,
  };
}

// Helper functions
function getDistance(touch1: TouchPoint, touch2: TouchPoint): number {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getAngle(touch1: TouchPoint, touch2: TouchPoint): number {
  const dy = touch2.clientY - touch1.clientY;
  const dx = touch2.clientX - touch1.clientX;
  return Math.atan2(dy, dx) * 180 / Math.PI;
}

/**
 * Simple hook for swipe gestures only
 */
export function useSwipe(handlers: SwipeHandlers & { threshold?: number, disabled?: boolean } = {}) {
  const { gestureHandlers, swipeDirection } = useGestures({
    onSwipeLeft: handlers.onSwipeLeft,
    onSwipeRight: handlers.onSwipeRight,
    onSwipeUp: handlers.onSwipeUp,
    onSwipeDown: handlers.onSwipeDown,
    swipeThreshold: handlers.threshold,
    disabled: handlers.disabled,
  });
  
  return {
    swipeHandlers: gestureHandlers,
    swipeDirection,
  };
}