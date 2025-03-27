
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Types for motion components
type AppleRevealProps = {
  children: React.ReactNode;
  delay?: number;
  threshold?: number;
  className?: string;
};

type ApplePressProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

/**
 * AppleReveal - Reveals content with a subtle animation when it enters the viewport
 */
export function AppleReveal({ 
  children, 
  delay = 0, 
  threshold = 0.1,
  className 
}: AppleRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={cn(
        "apple-reveal",
        isVisible && "visible",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * AppleRevealGroup - Reveals children with a staggered animation
 */
export function AppleRevealGroup({ 
  children, 
  delay = 0, 
  threshold = 0.1,
  className 
}: AppleRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={cn(
        "apple-reveal-children",
        isVisible && "visible",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * ApplePress - Provides a subtle press animation for interactive elements
 */
export function ApplePress({ 
  children, 
  className,
  onClick 
}: ApplePressProps) {
  return (
    <div
      className={cn("apple-press", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * AppleLift - Provides a subtle lift animation on hover
 */
export function AppleLift({ 
  children, 
  className,
  onClick 
}: ApplePressProps) {
  return (
    <div
      className={cn("apple-lift", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * AppleFrosted - Creates a frosted glass effect container
 */
export function AppleFrosted({ 
  children, 
  className 
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("apple-frosted rounded-apple p-4", className)}>
      {children}
    </div>
  );
}

/**
 * ApplePulse - Adds a subtle pulse animation to draw attention
 */
export function ApplePulse({ 
  children, 
  className 
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("apple-pulse", className)}>
      {children}
    </div>
  );
}

/**
 * AppleCard - An enhanced card component with Apple-inspired visuals
 */
export function AppleCard({ 
  children, 
  className,
  interactive = true
}: { 
  children: React.ReactNode; 
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div 
      className={cn(
        "bg-white dark:bg-slate-800 rounded-apple shadow-apple-soft p-4",
        interactive && "apple-lift",
        className
      )}
    >
      {children}
    </div>
  );
}
