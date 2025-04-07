
import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const interactiveButtonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-apple-blue text-white hover:bg-apple-blue/90 active:scale-[0.98] shadow-sm",
        destructive: "bg-apple-red text-white hover:bg-apple-red/90 active:scale-[0.98] shadow-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        secondary: "bg-apple-indigo text-white hover:bg-apple-indigo/90 active:scale-[0.98] shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        link: "text-apple-blue underline-offset-4 hover:underline active:scale-[0.98]",
        primary: "bg-gradient-to-br from-apple-blue to-apple-blue/80 text-white hover:opacity-90 active:scale-[0.98] shadow-md hover:shadow-lg",
        glass: "bg-white/30 backdrop-blur-lg border border-white/20 text-foreground shadow-sm hover:bg-white/40 active:scale-[0.98]",
        elevated: "bg-white shadow-md border border-gray-100 text-gray-900 hover:shadow-lg active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8",
        icon: "h-10 w-10",
        pill: "h-10 px-6 rounded-full",
      },
      magnetic: {
        true: "magnetic-button",
        false: "",
      },
      glare: {
        true: "overflow-hidden",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      magnetic: false,
      glare: false,
    },
  }
);

export interface InteractiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof interactiveButtonVariants> {
  asChild?: boolean;
}

const InteractiveButton = React.forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ className, variant, size, magnetic, glare, ...props }, ref) => {
    const [glarePosition, setGlarePosition] = React.useState({ x: "50%", y: "50%" });
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    
    // Handle magnetic effect
    React.useEffect(() => {
      if (!magnetic || !buttonRef.current) return;
      
      const button = buttonRef.current;
      
      const handleMouseMove = (e: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const maxDistance = 15; // Maximum magnetic pull in pixels
        
        const distanceX = (x - centerX) / (rect.width / 2) * maxDistance;
        const distanceY = (y - centerY) / (rect.height / 2) * maxDistance;
        
        button.style.transform = `translate(${distanceX}px, ${distanceY}px)`;
      };
      
      const handleMouseLeave = () => {
        button.style.transform = "translate(0, 0)";
      };
      
      button.addEventListener("mousemove", handleMouseMove);
      button.addEventListener("mouseleave", handleMouseLeave);
      
      return () => {
        button.removeEventListener("mousemove", handleMouseMove);
        button.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, [magnetic]);
    
    // Handle glare effect
    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!glare) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setGlarePosition({ x: `${x}%`, y: `${y}%` });
    };
    
    // Combine refs
    const combinedRef = (node: HTMLButtonElement) => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else {
          ref.current = node;
        }
      }
      buttonRef.current = node;
    };

    return (
      <button
        className={cn(interactiveButtonVariants({ variant, size, magnetic, glare, className }))}
        ref={combinedRef}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {props.children}
        
        {/* Add glare effect if enabled */}
        {glare && (
          <span 
            className="absolute inset-0 pointer-events-none transition-opacity" 
            style={{
              background: `radial-gradient(circle at ${glarePosition.x} ${glarePosition.y}, rgba(255, 255, 255, 0.25), transparent 80%)`,
              opacity: 0.6,
            }}
          />
        )}
      </button>
    );
  }
);

InteractiveButton.displayName = "InteractiveButton";

export { InteractiveButton };
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { shortFeedback } from '@/lib/touchFeedback';
import { useMobile } from '@/hooks/use-mobile';

interface InteractiveButtonProps extends ButtonProps {
  feedbackType?: 'short' | 'medium' | 'success' | 'error';
  onLongPress?: () => void;
  longPressDelay?: number;
}

export function InteractiveButton({
  children,
  feedbackType = 'short',
  onLongPress,
  longPressDelay = 500,
  onClick,
  className,
  ...props
}: InteractiveButtonProps) {
  const mobile = useMobile();
  const pressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const [isPressing, setIsPressing] = React.useState(false);

  // Handle touch feedback
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isMobile) {
      shortFeedback();
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  // Handle long press for mobile
  const handleTouchStart = () => {
    if (!onLongPress) return;
    
    setIsPressing(true);
    pressTimer.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress();
        shortFeedback();
      }
    }, longPressDelay);
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    setIsPressing(false);
  };

  return (
    <Button
      className={`${className} ${isPressing ? 'scale-95' : ''}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      {...props}
    >
      {children}
    </Button>
  );
}

export default InteractiveButton;
