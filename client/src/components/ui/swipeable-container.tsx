import React, { useState, useRef, useEffect } from 'react';
import { useSwipe } from '@/lib/useGestures';

interface SwipeableContainerProps {
  children: React.ReactNode;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  disabled?: boolean;
}

export const SwipeableContainer: React.FC<SwipeableContainerProps> = ({
  children,
  className = '',
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 100,
  leftAction,
  rightAction,
  disabled = false,
}) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const initialX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset offset when actions change or component mounts
  useEffect(() => {
    setOffset(0);
  }, [leftAction, rightAction]);

  // Create custom swipe handlers for this component
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    initialX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || initialX.current === null) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = currentX - initialX.current;
    
    // Limit the offset based on actions available
    if ((diffX > 0 && !rightAction) || (diffX < 0 && !leftAction)) {
      setOffset(0);
      return;
    }
    
    // Apply resistance as we move further
    const resistance = Math.abs(diffX) > 50 ? 0.5 : 1;
    setOffset(diffX * resistance);
  };

  const handleTouchEnd = () => {
    if (disabled || initialX.current === null) return;
    
    // Check if swipe was long enough to trigger action
    if (offset > swipeThreshold && onSwipeRight) {
      onSwipeRight();
    } else if (offset < -swipeThreshold && onSwipeLeft) {
      onSwipeLeft();
    }
    
    // Reset state
    initialX.current = null;
    setOffset(0);
    setIsDragging(false);
  };

  // For click outside to cancel swiping
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node) && offset !== 0) {
        setOffset(0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [offset]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left action indicator */}
      {leftAction && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white px-4"
          style={{
            transform: `translateX(100%) ${offset < 0 ? `translateX(${offset}px)` : ''}`,
            opacity: offset < 0 ? Math.min(Math.abs(offset) / swipeThreshold, 1) : 0,
            width: swipeThreshold,
          }}
        >
          {leftAction}
        </div>
      )}

      {/* Right action indicator */}
      {rightAction && (
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-center bg-green-500 text-white px-4"
          style={{
            transform: `translateX(-100%) ${offset > 0 ? `translateX(${offset}px)` : ''}`,
            opacity: offset > 0 ? Math.min(offset / swipeThreshold, 1) : 0,
            width: swipeThreshold,
          }}
        >
          {rightAction}
        </div>
      )}

      {/* Main content */}
      <div 
        style={{ 
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';

interface SwipeableContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export function SwipeableContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  className = '',
}: SwipeableContainerProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate direction and distance
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
    
    const distance = touchStart - e.targetTouches[0].clientX;
    setSwipeDistance(distance);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;
    
    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
    
    // Reset state
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
    setSwipeDistance(0);
  };

  // Apply visual feedback during swipe
  const swipeStyle = isSwiping ? {
    transform: `translateX(${-swipeDistance * 0.2}px)`,
    transition: 'transform 0.1s ease',
  } : {};

  return (
    <div
      ref={containerRef}
      className={`touch-manipulation ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={swipeStyle}
    >
      {children}
    </div>
  );
}

export default SwipeableContainer;
