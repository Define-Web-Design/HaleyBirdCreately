
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AmbientCardProps {
  children: React.ReactNode;
  className?: string;
  glareEffect?: boolean;
  tiltEffect?: boolean;
  colorShift?: boolean;
  intensity?: 'subtle' | 'medium' | 'strong';
  baseColor?: string;
}

export const AmbientCard = ({
  children,
  className,
  glareEffect = true,
  tiltEffect = true,
  colorShift = true,
  intensity = 'medium',
  baseColor,
}: AmbientCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  // Determine the intensity multiplier
  const intensityMultiplier = {
    subtle: 0.5,
    medium: 1,
    strong: 1.5,
  }[intensity];

  // Calculate max rotation amount based on intensity
  const maxRotation = 3 * intensityMultiplier;

  // Handle mouse movement over the card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !tiltEffect) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center as a percentage
    const distanceX = (e.clientX - centerX) / (rect.width / 2);
    const distanceY = (e.clientY - centerY) / (rect.height / 2);
    
    // Calculate rotation based on mouse position
    setRotation({
      x: -distanceY * maxRotation,
      y: distanceX * maxRotation,
    });
    
    // Update glare position
    if (glareEffect) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      setGlarePosition({ x: glareX, y: glareY });
    }
  };

  // Reset card position on mouse leave
  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
    setGlarePosition({ x: 50, y: 50 });
  };

  // Initialize the color based on props
  const defaultColor = baseColor || 'rgba(255, 255, 255, 0.08)';
  
  // Color shift styles based on rotation
  const colorShiftStyle = colorShift ? {
    background: `
      linear-gradient(
        135deg,
        ${isHovering ? 'rgba(255, 255, 255, 0.15)' : defaultColor}, 
        ${isHovering 
          ? `rgba(${120 + rotation.x * 5}, ${140 + rotation.y * 5}, ${200 + (rotation.x + rotation.y) * 5}, 0.1)` 
          : defaultColor}
      )
    `,
  } : {};

  return (
    <div
      ref={cardRef}
      className={cn(
        'overflow-hidden rounded-xl border border-white/20 bg-opacity-50 p-6 backdrop-blur-lg transition-all duration-300',
        isHovering && tiltEffect ? 'shadow-xl' : 'shadow-md',
        className
      )}
      style={{
        transform: tiltEffect ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : undefined,
        ...colorShiftStyle
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glare effect overlay */}
      {glareEffect && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: isHovering 
              ? `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${0.15 * intensityMultiplier}), transparent 50%)`
              : 'none',
            opacity: isHovering ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
      
      {/* Card content */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};
