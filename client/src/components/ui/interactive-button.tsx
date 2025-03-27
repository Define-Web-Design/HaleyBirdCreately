
import React, { useState } from "react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

interface InteractiveButtonProps extends ButtonProps {
  glowColor?: string;
  glowIntensity?: "subtle" | "medium" | "strong";
  pressEffect?: boolean;
  rippleEffect?: boolean;
  pulseOnMount?: boolean;
}

export const InteractiveButton = ({
  className,
  glowColor = "rgba(98, 0, 234, 0.5)",
  glowIntensity = "medium",
  pressEffect = true, 
  rippleEffect = true,
  pulseOnMount = false,
  children,
  ...props
}: InteractiveButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  // Get CSS variable based on intensity
  const getIntensityValue = () => {
    switch (glowIntensity) {
      case "subtle": return "0.2";
      case "strong": return "0.6";
      default: return "0.4";
    }
  };
  
  // Handle ripple effect
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (rippleEffect) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = {
        id: Date.now(),
        x,
        y
      };
      
      setRipples([...ripples, newRipple]);
      
      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples(currentRipples => 
          currentRipples.filter(ripple => ripple.id !== newRipple.id)
        );
      }, 600);
    }
    
    if (pressEffect) {
      setIsPressed(true);
    }
  };
  
  // Handle button release
  const handleMouseUp = () => {
    if (pressEffect) {
      setIsPressed(false);
    }
  };

  return (
    <Button
      className={cn(
        "relative overflow-hidden transition-all", 
        isPressed && pressEffect && "transform scale-[0.97]",
        pulseOnMount && "animate-pulse",
        className
      )}
      style={{
        boxShadow: isPressed ? `0 0 12px ${getIntensityValue()} ${glowColor}` : undefined
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      {...props}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white opacity-25 animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: "120px",
            height: "120px",
            marginLeft: "-60px",
            marginTop: "-60px",
            transform: "scale(0)",
            animation: "ripple 0.6s linear"
          }}
        />
      ))}
      {children}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </Button>
  );
};

export default InteractiveButton;
