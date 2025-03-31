
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useAppleInteractions } from '@/lib/hooks/use-apple-interactions';

interface InteractiveElementProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'card' | 'glass';
  intensity?: 'light' | 'medium' | 'strong';
  enableHaptics?: boolean;
  animate?: boolean;
  children: React.ReactNode;
}

export function InteractiveElement({
  variant = 'default',
  intensity = 'medium',
  enableHaptics = true,
  animate = true,
  className,
  children,
  ...props
}: InteractiveElementProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const { triggerHapticFeedback } = useAppleInteractions();

  // Scale factors based on intensity
  const getScaleFactor = () => {
    if (!animate) return 1;
    
    const scales = {
      light: isPressed ? 0.98 : 1,
      medium: isPressed ? 0.96 : 1,
      strong: isPressed ? 0.94 : 1
    };
    
    return scales[intensity];
  };

  // Glow effects based on variant
  const getGlowEffect = () => {
    if (!isHovered || !animate) return '';
    
    const glows = {
      default: 'shadow-md hover:shadow-lg',
      subtle: 'hover:bg-opacity-80',
      card: 'shadow-md hover:shadow-lg',
      glass: 'backdrop-blur-sm hover:backdrop-blur-md bg-white/10 hover:bg-white/20 dark:bg-black/10 dark:hover:bg-black/20'
    };
    
    return glows[variant];
  };

  // Base styles based on variant
  const getBaseStyles = () => {
    const styles = {
      default: 'bg-card text-card-foreground',
      subtle: 'bg-accent/50 text-accent-foreground',
      card: 'bg-card text-card-foreground border border-border',
      glass: 'bg-background/80 backdrop-blur-sm border border-border/50'
    };
    
    return styles[variant];
  };

  // Handle pointer events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsPressed(true);
    if (enableHaptics) {
      triggerHapticFeedback('light');
    }
    props.onPointerDown?.(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsPressed(false);
    props.onPointerUp?.(e);
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsHovered(true);
    props.onPointerEnter?.(e);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsHovered(false);
    setIsPressed(false);
    props.onPointerLeave?.(e);
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        'relative rounded-lg p-4 transition-all duration-200 ease-out transform',
        getBaseStyles(),
        getGlowEffect(),
        className
      )}
      style={{
        transform: `scale(${getScaleFactor()})`,
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease-out, background-color 0.2s ease-out'
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
      
      {/* Subtle highlight effect on hover */}
      {isHovered && animate && (
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(var(--highlight-color), 0.1), transparent 40%)',
            '--highlight-color': '255, 255, 255',
            opacity: isPressed ? 0.05 : 0.1,
            transition: 'opacity 0.3s ease'
          } as React.CSSProperties}
        />
      )}
    </div>
  );
}
