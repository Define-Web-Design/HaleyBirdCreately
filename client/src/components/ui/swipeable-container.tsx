import React, { useState, useRef, useEffect } from 'react';
import { useSwipe } from '@/lib/useGestures';

interface SwipeableContainerProps {
  children: React.ReactNode;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
  threshold?: number; // For backwards compatibility
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  disabled?: boolean;
}

export const SwipeableContainer: React.FC<SwipeableContainerProps> = ({
  children,
  className = '',
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold,
  threshold = 100, // For backwards compatibility
  leftAction,
  rightAction,
  disabled = false,
}) => {
  // Use provided swipeThreshold or fall back to threshold for backwards compatibility
  const effectiveThreshold = swipeThreshold || threshold;
  
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const initialX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset offset when actions change or component mounts
  useEffect(() => {
    setOffset(0);
  }, [leftAction, rightAction]);

  // Track initial touch position for both X and Y coordinates
  const initialTouchRef = useRef<{ x: number; y: number } | null>(null);
  const initialScrollRef = useRef<number>(0);
  
  // Create custom swipe handlers for this component
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    initialX.current = touch.clientX;
    initialTouchRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    // Store initial scroll position to detect if user is trying to scroll
    if (e.currentTarget.parentElement) {
      initialScrollRef.current = e.currentTarget.parentElement.scrollTop || 0;
    }
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || initialX.current === null || !initialTouchRef.current) return;
    
    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    const diffX = currentX - initialTouchRef.current.x;
    const diffY = currentY - initialTouchRef.current.y;
    
    // If vertical movement is significant compared to horizontal, abort swiping
    // This prevents interference with vertical scrolling
    if (Math.abs(diffY) > Math.abs(diffX) * 1.2) {
      return;
    }
    
    // Check if parent element has scrolled
    const parentElement = e.currentTarget.parentElement;
    if (parentElement && Math.abs(parentElement.scrollTop - initialScrollRef.current) > 5) {
      // User is trying to scroll vertically, abort swiping
      return;
    }
    
    // Only prevent default for clear horizontal swipes
    // This is critical to not interfere with normal scrolling
    if (Math.abs(diffX) > 30 && Math.abs(diffY) < Math.abs(diffX) * 0.8) {
      e.preventDefault();
    }
    
    // Limit the offset based on actions available
    if ((diffX > 0 && !rightAction) || (diffX < 0 && !leftAction)) {
      setOffset(0);
      return;
    }
    
    // Apply resistance as we move further for a more natural feel
    const resistance = Math.abs(diffX) > 50 ? 0.5 : 1;
    setOffset(diffX * resistance);
  };

  const handleTouchEnd = () => {
    if (disabled || initialX.current === null) return;
    
    // Check if swipe was long enough to trigger action
    if (offset > effectiveThreshold && onSwipeRight) {
      onSwipeRight();
    } else if (offset < -effectiveThreshold && onSwipeLeft) {
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
      style={{
        // Add containment for performance optimization
        contain: 'content',
        // Hint to the browser about upcoming animations for performance
        willChange: disabled ? 'auto' : 'transform',
        // Only capture touch events when not disabled
        touchAction: disabled ? 'auto' : 'pan-y pinch-zoom',
      }}
      aria-disabled={disabled}
    >
      {/* Accessibility indicator for swipeable state */}
      <span className="sr-only">
        {leftAction && 'Swipe left for action'}
        {rightAction && 'Swipe right for action'}
      </span>

      {/* Left action indicator with improved animations */}
      {leftAction && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white px-4 shadow-lg rounded-l-md"
          style={{
            transform: `translateX(100%) ${offset < 0 ? `translateX(${offset}px)` : ''}`,
            opacity: offset < 0 ? Math.min(Math.abs(offset) / effectiveThreshold, 1) : 0,
            width: effectiveThreshold,
            // Performance optimizations
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            transition: isDragging ? 'none' : 'opacity 0.2s ease',
          }}
          aria-hidden={offset >= 0}
        >
          {leftAction}
        </div>
      )}

      {/* Right action indicator with improved animations */}
      {rightAction && (
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-center bg-green-500 text-white px-4 shadow-lg rounded-r-md"
          style={{
            transform: `translateX(-100%) ${offset > 0 ? `translateX(${offset}px)` : ''}`,
            opacity: offset > 0 ? Math.min(offset / effectiveThreshold, 1) : 0,
            width: effectiveThreshold,
            // Performance optimizations
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            transition: isDragging ? 'none' : 'opacity 0.2s ease',
          }}
          aria-hidden={offset <= 0}
        >
          {rightAction}
        </div>
      )}

      {/* Main content with hardware acceleration and optimized animation */}
      <div 
        style={{ 
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)', // Spring-like easing
          // Performance optimizations
          willChange: offset !== 0 ? 'transform' : 'auto',
          backfaceVisibility: 'hidden',
          // Use transform3d to activate hardware acceleration for smoother animations
          transform: `translate3d(${offset}px, 0, 0)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Default export for backward compatibility
export default SwipeableContainer;
