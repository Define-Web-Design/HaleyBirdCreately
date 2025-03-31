
import { useEffect, useRef, useState } from 'react';

// Types for all interaction options
interface AppleInteractionOptions {
  // Common options
  element: HTMLElement | null;
  intensity?: number;
  disableAll?: boolean;
  
  // Specific effects
  enableTilt?: boolean;
  enableHoverScale?: boolean;
  enableMagnetic?: boolean;
  enableGlare?: boolean;
  enableHapticFeedback?: boolean;
  enableActiveScale?: boolean;
  enableDepthEffect?: boolean;
  
  // Effect specific options
  tiltMaxAngle?: number;
  scaleAmount?: number;
  magneticAmount?: number;
  glareOpacity?: number;
  glareSize?: number;
  activeScaleAmount?: number;
  depthDistance?: number;
}

export function useAppleInteractions({
  element,
  intensity = 1,
  disableAll = false,
  
  // Enable/disable specific effects
  enableTilt = true,
  enableHoverScale = true,
  enableMagnetic = false,
  enableGlare = true,
  enableHapticFeedback = false,
  enableActiveScale = true,
  enableDepthEffect = false,
  
  // Effect specific options
  tiltMaxAngle = 10,
  scaleAmount = 1.02,
  magneticAmount = 0.5,
  glareOpacity = 0.1,
  glareSize = 100,
  activeScaleAmount = 0.97,
  depthDistance = 20
}: AppleInteractionOptions) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: '50%', y: '50%' });
  
  const elementRef = useRef<HTMLElement | null>(null);
  
  // Update element ref when element changes
  useEffect(() => {
    elementRef.current = element;
  }, [element]);
  
  // Setup mouse event listeners
  useEffect(() => {
    if (disableAll || !elementRef.current) return;
    
    const el = elementRef.current;
    
    const handleMouseEnter = () => {
      setIsHovered(true);
    };
    
    const handleMouseLeave = () => {
      setIsHovered(false);
      setTilt({ x: 0, y: 0 });
      setPosition({ x: 0, y: 0 });
      setGlarePosition({ x: '50%', y: '50%' });
      
      // Reset all transformations
      if (el) {
        el.style.transform = '';
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!el) return;
      
      const rect = el.getBoundingClientRect();
      
      // Calculate mouse position relative to element center
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate relative position from -1 to 1
      const relativeX = (x - centerX) / centerX;
      const relativeY = (y - centerY) / centerY;
      
      // Apply tilt effect
      if (enableTilt) {
        const tiltX = -relativeY * tiltMaxAngle * intensity;
        const tiltY = relativeX * tiltMaxAngle * intensity;
        setTilt({ x: tiltX, y: tiltY });
      }
      
      // Apply magnetic effect
      if (enableMagnetic) {
        const magneticX = relativeX * magneticAmount * rect.width * intensity;
        const magneticY = relativeY * magneticAmount * rect.height * intensity;
        setPosition({ x: magneticX, y: magneticY });
      }
      
      // Apply glare effect
      if (enableGlare) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        setGlarePosition({ x: `${glareX}%`, y: `${glareY}%` });
      }
      
      // Combine all transformations
      applyTransformations(el);
    };
    
    const handleMouseDown = () => {
      setIsActive(true);
      
      // Apply haptic feedback if enabled
      if (enableHapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    };
    
    const handleMouseUp = () => {
      setIsActive(false);
    };
    
    // Add event listeners
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseup', handleMouseUp);
    
    // Cleanup
    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    disableAll, 
    enableTilt, 
    enableMagnetic, 
    enableGlare, 
    enableHapticFeedback,
    tiltMaxAngle,
    magneticAmount,
    intensity
  ]);
  
  // Apply all transformations when state changes
  useEffect(() => {
    if (elementRef.current) {
      applyTransformations(elementRef.current);
    }
  }, [isHovered, isActive, tilt, position]);
  
  // Apply CSS transformations based on current state
  const applyTransformations = (el: HTMLElement) => {
    if (disableAll) return;
    
    const transforms = [];
    
    // Apply tilt transformation
    if (enableTilt && isHovered) {
      transforms.push(`perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`);
    }
    
    // Apply magnetic transformation
    if (enableMagnetic && isHovered) {
      transforms.push(`translate(${position.x}px, ${position.y}px)`);
    }
    
    // Apply hover scale
    if (enableHoverScale && isHovered) {
      transforms.push(`scale(${scaleAmount})`);
    }
    
    // Apply active scale (when clicking)
    if (enableActiveScale && isActive) {
      transforms.push(`scale(${activeScaleAmount})`);
    }
    
    // Apply depth effect
    if (enableDepthEffect && isHovered) {
      const depthZ = isActive ? -depthDistance/2 : depthDistance;
      transforms.push(`translateZ(${depthZ}px)`);
    }
    
    // Combine all transformations
    if (transforms.length > 0) {
      el.style.transform = transforms.join(' ');
    } else {
      el.style.transform = '';
    }
    
    // Apply glare effect if enabled
    if (enableGlare) {
      // Check if glare element exists, if not create it
      let glareEl = el.querySelector('.apple-glare-effect') as HTMLElement;
      
      if (!glareEl && isHovered) {
        glareEl = document.createElement('div');
        glareEl.className = 'apple-glare-effect';
        glareEl.style.position = 'absolute';
        glareEl.style.top = '0';
        glareEl.style.left = '0';
        glareEl.style.right = '0';
        glareEl.style.bottom = '0';
        glareEl.style.pointerEvents = 'none';
        glareEl.style.borderRadius = 'inherit';
        glareEl.style.zIndex = '2';
        glareEl.style.overflow = 'hidden';
        
        // Make sure the parent has position relative
        if (getComputedStyle(el).position === 'static') {
          el.style.position = 'relative';
        }
        
        el.appendChild(glareEl);
      }
      
      if (glareEl) {
        if (isHovered) {
          glareEl.style.background = `radial-gradient(
            circle at ${glarePosition.x} ${glarePosition.y},
            rgba(255, 255, 255, ${glareOpacity * intensity}),
            transparent ${glareSize}%
          )`;
          glareEl.style.opacity = '1';
        } else {
          glareEl.style.opacity = '0';
        }
      }
    }
  };
  
  return {
    isHovered,
    isActive,
    tilt,
    position,
    glarePosition,
  };
}
