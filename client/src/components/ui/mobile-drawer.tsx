import React, { useState, useRef, useEffect } from 'react';
import { useTouchSwipe } from '@/hooks/use-touch-swipe';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileDrawerProps {
  children: React.ReactNode;
  position?: 'left' | 'right';
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  overlayClassName?: string;
}

export function MobileDrawer({
  children,
  position = 'left',
  className,
  isOpen,
  onClose,
  overlayClassName,
}: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isAnimating, setIsAnimating] = useState(false);

  // Get swipe direction based on drawer position
  const swipeHandler = position === 'left' 
    ? { onSwipeLeft: onClose } 
    : { onSwipeRight: onClose };

  // Use our touch swipe hook
  const { swiping } = useTouchSwipe({
    element: drawerRef,
    ...swipeHandler,
    threshold: 40,
    preventDefaultTouchmove: false // Don't prevent default to allow scrolling inside the drawer
  });

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Allow body to be fixed when drawer is open to prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Match transition duration
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Don't render if not mobile and not animating
  if (!isMobile && !isAnimating && !isOpen) {
    return null;
  }

  return (
    <div 
      className={cn(
        'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        overlayClassName
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden={!isOpen}
    >
      <div
        ref={drawerRef}
        className={cn(
          'fixed inset-y-0 bg-background p-4 shadow-lg transition-transform duration-300 ease-in-out w-[75%] max-w-xs',
          position === 'left' ? 'left-0' : 'right-0',
          isOpen 
            ? 'translate-x-0' 
            : position === 'left' 
              ? '-translate-x-full' 
              : 'translate-x-full',
          className
        )}
        aria-modal="true"
        role="dialog"
      >
        <div className={cn('h-full flex flex-col overflow-auto', swiping ? 'touch-none' : '')}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default MobileDrawer;