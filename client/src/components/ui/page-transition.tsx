
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageTransitionProps {
  children: React.ReactNode;
  location?: string;
  transitionKey?: string;
  className?: string;
  duration?: number;
  disabled?: boolean;
}

export function PageTransition({
  children,
  location,
  transitionKey,
  className = '',
  duration = 0.3,
  disabled = false
}: PageTransitionProps) {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const { isMobile } = useIsMobile();
  
  // Skip animation on first render for better initial load performance
  useEffect(() => {
    if (isFirstRender) {
      const timer = setTimeout(() => {
        setIsFirstRender(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFirstRender]);
  
  // Choose appropriate animation based on device type
  const getAnimationVariants = () => {
    // Skip animations if disabled or on first render
    if (disabled || isFirstRender) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 }
      };
    }
    
    // Mobile-specific slide animations
    if (isMobile) {
      return {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
      };
    }
    
    // Desktop fade animations
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    };
  };
  
  const variants = getAnimationVariants();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey || location}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration, ease: "easeInOut" }}
        className={`page-transition ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransition;
