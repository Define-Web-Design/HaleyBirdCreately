
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTouchSwipe } from '@/hooks/use-touch-swipe';
import { hapticFeedback } from '@/lib/touchFeedback';

interface MobileDrawerProps {
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  showCloseButton?: boolean;
  isDismissible?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function MobileDrawer({
  title = 'Menu',
  children,
  position = 'left',
  showCloseButton = true,
  isDismissible = true,
  isOpen,
  onOpenChange,
  className = '',
}: MobileDrawerProps) {
  const [open, setOpen] = useState(isOpen || false);
  const { isMobile } = useIsMobile();
  
  // Update internal state when external state changes
  useEffect(() => {
    if (isOpen !== undefined && isOpen !== open) {
      setOpen(isOpen);
    }
  }, [isOpen]);
  
  // Handle drawer state changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    
    // Provide haptic feedback on open/close
    if (isMobile) {
      if (newOpen) {
        hapticFeedback.light();
      } else {
        hapticFeedback.medium();
      }
    }
  };
  
  // Configure swipe to close for mobile
  const swipeProps = useTouchSwipe({
    onSwipeLeft: position === 'left' ? () => handleOpenChange(false) : undefined,
    onSwipeRight: position === 'right' ? () => handleOpenChange(false) : undefined,
    onSwipeUp: position === 'bottom' ? () => handleOpenChange(false) : undefined,
    onSwipeDown: position === 'top' ? () => handleOpenChange(false) : undefined,
    threshold: 50
  });

  // Only show drawer on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side={position} 
        className={`p-0 ${className}`}
        {...swipeProps}
      >
        <div className="mobile-drawer h-full flex flex-col">
          <SheetHeader className="border-b p-4">
            <div className="flex justify-between items-center">
              <SheetTitle>{title}</SheetTitle>
              {showCloseButton && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleOpenChange(false)}
                  className="touch-feedback"
                  aria-label="Close menu"
                >
                  <X />
                </Button>
              )}
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileDrawer;
