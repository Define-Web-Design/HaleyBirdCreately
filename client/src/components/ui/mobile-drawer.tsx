
import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useTouchSwipe } from "@/hooks/use-touch-swipe";

interface MobileDrawerProps {
  children: React.ReactNode;
  title?: string;
  position?: "left" | "right" | "top" | "bottom";
  className?: string;
}

export function MobileDrawer({
  children,
  title = "Menu",
  position = "left",
  className = "",
}: MobileDrawerProps) {
  const { isMobile } = useMobile();
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  // Automatically close drawer when route changes
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Enable swipe to open/close
  const { ref: swipeRef } = useTouchSwipe({
    onSwipeRight: () => {
      if (position === "left" && !open) {
        setOpen(true);
      }
    },
    onSwipeLeft: () => {
      if (position === "left" && open) {
        setOpen(false);
      } else if (position === "right" && !open) {
        setOpen(true);
      }
    },
    onSwipeUp: () => {
      if (position === "bottom" && open) {
        setOpen(false);
      } else if (position === "top" && !open) {
        setOpen(true);
      }
    },
    onSwipeDown: () => {
      if (position === "top" && open) {
        setOpen(false);
      } else if (position === "bottom" && !open) {
        setOpen(true);
      }
    },
  });

  useEffect(() => {
    // Attach swipe ref to body or main content area
    const mainElement = document.querySelector("main") || document.body;
    if (mainElement && swipeRef.current !== mainElement) {
      swipeRef.current = mainElement;
    }
    
    // Handle body scroll locking when drawer is open
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, swipeRef]);

  // Add keyboard event listener to close drawer on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.addEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!isMobile) {
    // On non-mobile devices, render only the children without the drawer
    return <>{children}</>;
  }

  return (
    <div className={`mobile-drawer ${className}`} data-swipe-handler>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden touch-feedback"
            aria-label="Open menu"
          >
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent
          side={position}
          className="overflow-y-auto pb-safe-area-bottom"
          aria-label={title}
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: position === "left" ? -20 : position === "right" ? 20 : 0, y: position === "top" ? -20 : position === "bottom" ? 20 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="py-4"
            >
              {title && (
                <h2 className="text-lg font-semibold mb-4 px-1">{title}</h2>
              )}
              <div className="mobile-drawer-content">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileDrawer;
