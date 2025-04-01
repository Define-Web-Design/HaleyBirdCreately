import { useRef, useState, useCallback, useEffect } from 'react';

// Types for swipe gestures
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

// Types for general gestures
interface GestureHandlers {
  onPan?: (dx: number, dy: number, e: PointerEvent) => void;
  onPanEnd?: (e: PointerEvent) => void;
  onPinch?: (scale: number, e: PointerEvent) => void;
  onPinchEnd?: (e: PointerEvent) => void;
  onRotate?: (angle: number, e: PointerEvent) => void;
  onRotateEnd?: (e: PointerEvent) => void;
  onLongPress?: (e: PointerEvent) => void;
  onDoubleTap?: (e: PointerEvent) => void;
}

interface GestureOptions extends GestureHandlers {
  longPressDelay?: number;
  doubleTapDelay?: number;
  pinchThreshold?: number;
  panThreshold?: number;
  target?: React.RefObject<HTMLElement>;
  disabled?: boolean;
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

/**
 * Enhanced gesture hook that supports pan, pinch, rotate, long press, and double tap
 */
export const useGesture = ({
  onPan,
  onPanEnd,
  onPinch,
  onPinchEnd,
  onRotate,
  onRotateEnd,
  onLongPress,
  onDoubleTap,
  longPressDelay = 500,
  doubleTapDelay = 300,
  pinchThreshold = 0.05,
  panThreshold = 5,
  target,
  disabled = false,
}: GestureOptions = {}) => {
  // Pan gesture state
  const isPanning = useRef(false);
  const startPointerId = useRef<number | null>(null);
  const startPanPos = useRef({ x: 0, y: 0 });
  const currentPanPos = useRef({ x: 0, y: 0 });
  
  // Pinch and rotate gesture state
  const pointers = useRef<Map<number, PointerEvent>>(new Map());
  const initialDistance = useRef<number | null>(null);
  const initialAngle = useRef<number | null>(null);
  const currentScale = useRef(1);
  const currentRotation = useRef(0);
  
  // Long press state
  const longPressTimer = useRef<number | null>(null);
  
  // Double tap state
  const lastTapTime = useRef(0);
  const lastTapPosition = useRef({ x: 0, y: 0 });
  
  // Calculate distance between two points
  const getDistance = (p1: PointerEvent, p2: PointerEvent): number => {
    const dx = p1.clientX - p2.clientX;
    const dy = p1.clientY - p2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Calculate angle between two points
  const getAngle = (p1: PointerEvent, p2: PointerEvent): number => {
    return Math.atan2(
      p2.clientY - p1.clientY,
      p2.clientX - p1.clientX
    ) * 180 / Math.PI;
  };
  
  // Handle pointer down
  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (disabled) return;
    
    const element = e.currentTarget as HTMLElement;
    element.setPointerCapture(e.pointerId);
    
    // Store the pointer event
    pointers.current.set(e.pointerId, e);
    
    // If this is the first pointer, start tracking for pan and possibly long press
    if (pointers.current.size === 1) {
      startPointerId.current = e.pointerId;
      startPanPos.current = { x: e.clientX, y: e.clientY };
      currentPanPos.current = { x: e.clientX, y: e.clientY };
      
      // Start long press timer
      if (onLongPress) {
        clearTimeout(longPressTimer.current || undefined);
        longPressTimer.current = window.setTimeout(() => {
          onLongPress(e);
        }, longPressDelay);
      }
      
      // Check for double tap
      if (onDoubleTap) {
        const now = Date.now();
        const timeDiff = now - lastTapTime.current;
        const dx = e.clientX - lastTapPosition.current.x;
        const dy = e.clientY - lastTapPosition.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (timeDiff < doubleTapDelay && distance < 30) {
          onDoubleTap(e);
          // Reset to prevent triple tap triggering another double tap
          lastTapTime.current = 0;
        } else {
          lastTapTime.current = now;
          lastTapPosition.current = { x: e.clientX, y: e.clientY };
        }
      }
    }
    
    // If we have exactly two pointers, initialize pinch/rotate values
    if (pointers.current.size === 2) {
      const pointerValues = Array.from(pointers.current.values());
      initialDistance.current = getDistance(pointerValues[0], pointerValues[1]);
      initialAngle.current = getAngle(pointerValues[0], pointerValues[1]);
    }
  }, [disabled, onDoubleTap, onLongPress, longPressDelay, doubleTapDelay]);
  
  // Handle pointer move
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (disabled) return;
    
    // Update the stored pointer
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, e);
    }
    
    // If we're moving the first pointer, handle panning
    if (e.pointerId === startPointerId.current) {
      const dx = e.clientX - startPanPos.current.x;
      const dy = e.clientY - startPanPos.current.y;
      currentPanPos.current = { x: e.clientX, y: e.clientY };
      
      // Only start panning if we've moved beyond the threshold
      if (!isPanning.current && (Math.abs(dx) > panThreshold || Math.abs(dy) > panThreshold)) {
        isPanning.current = true;
        
        // Cancel long press if we start panning
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
      
      if (isPanning.current && onPan) {
        onPan(dx, dy, e);
      }
    }
    
    // Handle pinch and rotate with two fingers
    if (pointers.current.size === 2 && (onPinch || onRotate)) {
      const pointerValues = Array.from(pointers.current.values());
      const currentDistance = getDistance(pointerValues[0], pointerValues[1]);
      const currentAngle = getAngle(pointerValues[0], pointerValues[1]);
      
      if (initialDistance.current && onPinch) {
        const newScale = currentDistance / initialDistance.current;
        const scaleDiff = Math.abs(newScale - currentScale.current);
        
        if (scaleDiff > pinchThreshold) {
          currentScale.current = newScale;
          onPinch(newScale, e);
        }
      }
      
      if (initialAngle.current && onRotate) {
        const newRotation = currentAngle - initialAngle.current;
        const rotationDiff = Math.abs(newRotation - currentRotation.current);
        
        if (rotationDiff > 5) {  // 5 degree threshold for rotation events
          currentRotation.current = newRotation;
          onRotate(newRotation, e);
        }
      }
    }
  }, [disabled, onPan, onPinch, onRotate, panThreshold, pinchThreshold]);
  
  // Handle pointer up
  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (disabled) return;
    
    const element = e.currentTarget as HTMLElement;
    element.releasePointerCapture(e.pointerId);
    
    // Remove the pointer from tracking
    pointers.current.delete(e.pointerId);
    
    // Clear the long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Handle pan end
    if (isPanning.current && e.pointerId === startPointerId.current) {
      if (onPanEnd) {
        onPanEnd(e);
      }
      isPanning.current = false;
      startPointerId.current = null;
    }
    
    // Handle pinch/rotate end
    if (pointers.current.size < 2) {
      if (initialDistance.current !== null && onPinchEnd) {
        onPinchEnd(e);
      }
      
      if (initialAngle.current !== null && onRotateEnd) {
        onRotateEnd(e);
      }
      
      initialDistance.current = null;
      initialAngle.current = null;
      currentScale.current = 1;
      currentRotation.current = 0;
    }
  }, [disabled, onPanEnd, onPinchEnd, onRotateEnd]);
  
  // Handle pointer cancel
  const handlePointerCancel = useCallback((e: PointerEvent) => {
    handlePointerUp(e);
  }, [handlePointerUp]);
  
  // Set up event listeners on the target element
  useEffect(() => {
    if (disabled) return;
    
    const element = target?.current || document.body;
    
    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerCancel);
    
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerCancel);
      
      // Clean up any lingering timers
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [
    disabled,
    target,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel
  ]);
  
  return {
    isPanning: isPanning.current,
    // Expose more state if needed
  };
};

export default {
  useSwipe,
  useGesture
};