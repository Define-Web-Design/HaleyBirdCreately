import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useMobile } from '@/hooks/use-mobile';

type PageTransitionProps = {
  children: React.ReactNode;
  location: string;
  transitionStyle?: 'fade' | 'slide' | 'scale' | 'none';
  duration?: number;
};

const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.1 },
  },
  none: {
    initial: { opacity: 1 },
    in: { opacity: 1 },
    out: { opacity: 1 },
  },
};

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  location,
  transitionStyle = 'fade',
  duration = 0.3
}) => {
  const [currentStyle, setCurrentStyle] = useState(transitionStyle);
  const [currentDuration, setCurrentDuration] = useState(duration);
  const { isMobile } = useMobile();

  // Adjust transition for mobile devices for better performance
  useEffect(() => {
    if (isMobile) {
      // On mobile, use simpler transitions and shorter duration
      setCurrentStyle(transitionStyle === 'none' ? 'none' : 'fade');
      setCurrentDuration(duration > 0.2 ? 0.2 : duration);
    } else {
      setCurrentStyle(transitionStyle);
      setCurrentDuration(duration);
    }
  }, [isMobile, transitionStyle, duration]);

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: currentDuration,
  };

  // Skip animation completely if style is none
  if (currentStyle === 'none') {
    return <div className="page-content">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        initial="initial"
        animate="in"
        exit="out"
        variants={transitionVariants[currentStyle]}
        transition={pageTransition}
        className="page-transition"
        data-testid="page-transition"
      >
        <div className="page-content">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};