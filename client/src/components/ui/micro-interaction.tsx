/**
 * Micro-Interaction Component
 * Adds subtle animations to interactive elements for more engaging user experience
 */

import React, { useState, useEffect, useRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { triggerFeedback } from '@/lib/touchFeedback';
import { useMobile } from '@/hooks/use-mobile';

const microInteractionVariants = cva(
  "transition-all duration-300", 
  {
    variants: {
      variant: {
        subtle: "hover:scale-[1.02] active:scale-[0.98]",
        medium: "hover:scale-[1.03] active:scale-[0.97]",
        pronounced: "hover:scale-[1.05] active:scale-[0.95]",
      },
      animation: {
        none: "",
        pulse: "hover:animate-pulse",
        bounce: "active:animate-entrance",
        glow: "hover:shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]",
      },
      touchFeedback: {
        none: "",
        light: "touch-feedback-light",
        medium: "touch-feedback-medium",
        heavy: "touch-feedback-heavy",
      }
    },
    defaultVariants: {
      variant: "subtle",
      animation: "none",
      touchFeedback: "light"
    }
  }
);

export interface MicroInteractionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "subtle" | "medium" | "pronounced";
  animation?: "none" | "pulse" | "bounce" | "glow";
  touchFeedback?: "none" | "light" | "medium" | "heavy";
  touchFeedbackType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  disabled?: boolean;
  withRipple?: boolean;
}

/**
 * MicroInteraction component adds subtle animations and touch feedback to any element
 */
export function MicroInteraction({
  children,
  className,
  variant = "subtle",
  animation = "none",
  touchFeedback = "light",
  touchFeedbackType = 'light',
  disabled = false,
  withRipple = false,
  ...props
}: MicroInteractionProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const { isMobile, isTouch } = useMobile();
  
  // Handle touch and mouse events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    // Add pressed state
    setIsPressed(true);
    
    // If it's a touch event (or we're on mobile) provide haptic feedback
    if (e.pointerType === 'touch' || isMobile) {
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX;
        const y = e.clientY;
        
        // Determine which feedback type to use based on props
        const feedbackType = touchFeedbackType || 
          (touchFeedback === 'light' ? 'light' : 
           touchFeedback === 'medium' ? 'medium' : 
           touchFeedback === 'heavy' ? 'heavy' : 'light');
        
        // Trigger the haptic and visual feedback
        triggerFeedback(x, y, feedbackType);
      }
    }
    
    // If ripple effect is enabled, create it
    if (withRipple && elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const posX = e.clientX - rect.left;
      const posY = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.className = 'micro-interaction-ripple';
      ripple.style.width = ripple.style.height = `${size * 2}px`;
      ripple.style.left = `${posX - size}px`;
      ripple.style.top = `${posY - size}px`;
      
      elementRef.current.appendChild(ripple);
      
      setTimeout(() => {
        if (ripple.parentNode === elementRef.current && elementRef.current) {
          elementRef.current.removeChild(ripple);
        }
      }, 600);
    }
  };
  
  const handlePointerUp = () => {
    if (disabled) return;
    setIsPressed(false);
  };
  
  const handlePointerLeave = () => {
    if (disabled) return;
    setIsPressed(false);
  };
  
  // Clean up any ripples on unmount
  useEffect(() => {
    return () => {
      if (elementRef.current) {
        const ripples = elementRef.current.querySelectorAll('.micro-interaction-ripple');
        ripples.forEach(ripple => {
          if (ripple.parentNode === elementRef.current && elementRef.current) {
            elementRef.current.removeChild(ripple);
          }
        });
      }
    };
  }, []);
  
  return (
    <div
      ref={elementRef}
      className={cn(
        microInteractionVariants({ variant, animation, touchFeedback }),
        isPressed && !disabled && "scale-[0.98]",
        disabled && "opacity-60 pointer-events-none",
        withRipple && "overflow-hidden relative",
        className
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
    </div>
  );
}

export default MicroInteraction;