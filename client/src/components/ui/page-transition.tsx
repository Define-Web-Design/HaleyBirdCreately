import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [location] = useLocation();
  const [key, setKey] = useState(location);
  const isMobile = useIsMobile();

  // Update key when location changes to trigger animation
  useEffect(() => {
    // Short delay to ensure any in-progress state changes are completed
    const timer = setTimeout(() => {
      setKey(location);
    }, 10);
    return () => clearTimeout(timer);
  }, [location]);

  // Mobile-optimized slide transition
  const variants = isMobile ? {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  } : {
    // Desktop fade transition
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.2 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransition;