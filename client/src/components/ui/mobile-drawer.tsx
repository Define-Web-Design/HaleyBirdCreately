
/**
 * Mobile Drawer Component
 * Provides off-canvas navigation for mobile devices
 */
import React, { useState, useEffect } from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  className?: string;
}

export function MobileDrawer({
  children,
  isOpen,
  onClose,
  position = 'left',
  className = ''
}: MobileDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { isMobile } = useMobile();
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scrolling when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling when drawer is closed
      document.body.style.overflow = '';
      
      // Delay hiding to allow for animation
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  if (!isVisible && !isOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Drawer panel */}
      <div
        className={`
          absolute top-0 bottom-0 w-3/4 max-w-xs bg-background p-4
          transition-transform duration-300 ease-in-out
          ${position === 'left' ? 'left-0' : 'right-0'}
          ${isOpen 
            ? 'translate-x-0' 
            : position === 'left' 
              ? '-translate-x-full' 
              : 'translate-x-full'
          }
          ${className}
        `}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted"
          aria-label="Close drawer"
        >
          <X size={20} />
        </button>
        <div className="h-full overflow-y-auto pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
