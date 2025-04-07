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

  // Create custom swipe handlers for this component
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    initialX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || initialX.current === null) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - initialX.current;
    
    // Get the initial touch Y position if available
    const initialTouchY = e.touches[0].clientY;
    
    // Detect vertical scrolling - if the user is primarily scrolling vertically, don't interfere
    if (Math.abs(diffX) < 15) {
      // Small horizontal movement, likely a vertical scroll - abort swiping
      return;
    }
    
    // Only prevent default for clear horizontal swipes with significant movement
    // This helps ensure normal page scrolling works properly
    if (Math.abs(diffX) > 50) {
      // Carefully prevent default only for obviously horizontal swipes
      // This helps ensure we don't block vertical scrolling
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
    >
      {/* Left action indicator */}
      {leftAction && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white px-4"
          style={{
            transform: `translateX(100%) ${offset < 0 ? `translateX(${offset}px)` : ''}`,
            opacity: offset < 0 ? Math.min(Math.abs(offset) / effectiveThreshold, 1) : 0,
            width: effectiveThreshold,
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
            opacity: offset > 0 ? Math.min(offset / effectiveThreshold, 1) : 0,
            width: effectiveThreshold,
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

// Default export for backward compatibility
export default SwipeableContainer;
