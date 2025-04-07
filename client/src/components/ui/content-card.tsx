
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { hapticFeedback } from '@/lib/touchFeedback';

interface ContentCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  linkTo?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onTap?: () => void;
}

export function ContentCard({
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt,
  linkTo,
  actions,
  children,
  className = '',
  interactive = true,
  onTap
}: ContentCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const { isMobile, isTouchDevice } = useIsMobile();

  // Handle tap/click with haptic feedback
  const handleTap = () => {
    if (isTouchDevice) {
      hapticFeedback.light();
    }
    
    if (onTap) {
      onTap();
    }
  };

  // Determine appropriate animation properties based on device
  const getAnimationProps = () => {
    if (!interactive) {
      return {};
    }
    
    // Touch-specific animations for mobile
    if (isTouchDevice) {
      return {
        whileTap: { scale: 0.98 },
        transition: { duration: 0.2 },
        onTapStart: () => {
          setIsPressed(true);
          hapticFeedback.light();
        },
        onTapCancel: () => setIsPressed(false),
        onTap: handleTap,
        onTapEnd: () => setIsPressed(false)
      };
    }
    
    // Mouse hover animations for desktop
    return {
      whileHover: { scale: 1.02 },
      transition: { duration: 0.2 }
    };
  };

  // Wrap card content for interactive cards
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    // If link is provided, wrap with Link component
    if (linkTo) {
      return (
        <Link href={linkTo} className="no-underline">
          <motion.div 
            className={`content-card w-full cursor-pointer ${isPressed ? 'shadow-sm' : 'shadow'} ${className}`} 
            {...getAnimationProps()}
          >
            {children}
          </motion.div>
        </Link>
      );
    }
    
    // Otherwise just use motion div
    return (
      <motion.div 
        className={`content-card w-full ${interactive ? 'cursor-pointer' : ''} ${isPressed ? 'shadow-sm' : 'shadow'} ${className}`} 
        {...(interactive ? getAnimationProps() : {})}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <CardWrapper>
      <Card className="border overflow-hidden h-full">
        {imageSrc && (
          <div className="w-full aspect-video overflow-hidden">
            <img 
              src={imageSrc} 
              alt={imageAlt || title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
        <CardContent>
          {description && <p className="text-sm">{description}</p>}
          {children}
        </CardContent>
        {actions && (
          <CardFooter className="flex justify-end gap-2">
            {actions}
          </CardFooter>
        )}
      </Card>
    </CardWrapper>
  );
}

export default ContentCard;
