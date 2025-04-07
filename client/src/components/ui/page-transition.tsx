import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useMobile } from "@/hooks/use-mobile";

interface PageTransitionProps {
  children: React.ReactNode;
  mode?: "fade" | "slide" | "scale" | "none";
  className?: string;
}

export function PageTransition({
  children,
  mode = "fade",
  className = "",
}: PageTransitionProps) {
  const [location] = useLocation();
  const [key, setKey] = useState(location);
  const { isMobile } = useMobile();

  // Update the key when location changes to trigger animation
  useEffect(() => {
    setKey(location);
  }, [location]);

  // Handle disabling transitions based on user preference (prefers-reduced-motion)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // If user prefers reduced motion or mode is none, just render children
  if (prefersReducedMotion || mode === "none") {
    return <>{children}</>;
  }

  // Different transition variants based on the selected mode
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    },
    slide: {
      initial: { opacity: 0, x: isMobile ? 20 : 50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: isMobile ? -20 : -50 },
      transition: { duration: isMobile ? 0.2 : 0.3, ease: "easeInOut" }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
      transition: { duration: 0.3 }
    }
  };

  const selectedVariant = variants[mode];

  return (
    <div className={`page-transition-container ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={selectedVariant.initial}
          animate={selectedVariant.animate}
          exit={selectedVariant.exit}
          transition={selectedVariant.transition}
          className="page-transition-content"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default PageTransition;