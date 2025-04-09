import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TopNavigation from './TopNavigation';
import Sidebar from './Sidebar';
import Footer from './Footer';
import useGestureHelpers from '@/lib/useGestures';
import { useMobile } from '@/hooks/use-mobile';
import { MenuIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Default sidebar to closed for all devices as per user request
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState('none');
  const [reduced, setReducedMotion] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const mobile = useMobile();


  // Setup gesture detection for the main content area
  const { useSwipe } = useGestureHelpers;
  const { swipeHandlers } = useSwipe({
    onSwipeRight: () => {
      // Only open the sidebar on right swipe if we're on mobile and the sidebar is closed
      if (mobile.isMobile && !sidebarOpen) {
        setSidebarOpen(true);
        sessionStorage.setItem('sidebarToggled', 'true');
      }
    },
    onSwipeLeft: () => {
      // Only close the sidebar on left swipe if we're on mobile and the sidebar is open
      if (mobile.isMobile && sidebarOpen) {
        setSidebarOpen(false);
        sessionStorage.setItem('sidebarToggled', 'false');
      }
    },
    threshold: 80, // Larger threshold for more intentional swipes
    preventDefaultTouchmove: false, // Don't prevent default to allow scrolling
  });

  // Improved check for mobile size on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(mobile.isMobile);

      // Check for user preference before auto-collapsing
      const userToggled = sessionStorage.getItem('sidebarToggled');

      // Always ensure sidebar starts closed by default for better UX
      if (!userToggled) {
        setSidebarOpen(false);
        // Store this preference
        sessionStorage.setItem('sidebarToggled', 'false');
      }

      // Add touch-specific class to body for touch-specific CSS
      if (mobile.isMobile || 'ontouchstart' in window) {
        document.body.classList.add('touch-device');
      } else {
        document.body.classList.remove('touch-device');
      }
    };

    // Initial check
    checkMobile();

    // Add event listener with improved debounce for better performance
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 100);
    };

    window.addEventListener('resize', handleResize);

    // Also check on orientation change specifically for mobile
    window.addEventListener('orientationchange', checkMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', checkMobile);
      clearTimeout(resizeTimer);
    };
  }, [mobile.isMobile]);

  // Add scroll event listener to show/hide the scroll-to-top button on mobile
  useEffect(() => {
    if (!mobile.isMobile) return;

    const scrollButton = document.getElementById('scroll-to-top-button');

    // Debounce the scroll handler for better performance
    let scrollTimer: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (!scrollButton) return;

        if (window.scrollY > 300) {
          scrollButton.style.display = 'block';
        } else {
          scrollButton.style.display = 'none';
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [mobile.isMobile]);

  // Add touch event for doubletap to scroll to top
  useEffect(() => {
    if (!mobile.isMobile || !mainContentRef.current) return;

    let lastTap = 0;
    const handleDoubleTap = (e: TouchEvent) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        // Double tap detected
        window.scrollTo({ top: 0, behavior: 'smooth' });
        e.preventDefault();
      }
      lastTap = currentTime;
    };

    mainContentRef.current.addEventListener('touchend', handleDoubleTap);

    return () => {
      if (mainContentRef.current) {
        mainContentRef.current.removeEventListener('touchend', handleDoubleTap);
      }
    };
  }, [mobile.isMobile, mainContentRef]);

  const toggleSidebar = useCallback(() => {
    // Toggle sidebar state
    setSidebarOpen(prevState => {
      const newState = !prevState;
      // Save the new state to sessionStorage so it persists
      sessionStorage.setItem('sidebarToggled', newState ? 'true' : 'false');
      return newState;
    });
  }, []);

  // CSS filter values for different color blind modes
  const getColorBlindFilter = () => {
    switch(colorBlindMode) {
      case 'protanopia': 
        return 'saturate(0.5) sepia(0.2) brightness(1.1) hue-rotate(320deg)';
      case 'deuteranopia': 
        return 'saturate(0.85) sepia(0.15) hue-rotate(60deg)';
      case 'tritanopia': 
        return 'saturate(0.8) sepia(0.2) hue-rotate(180deg)';
      case 'achromatopsia': 
        return 'grayscale(1)';
      default: 
        return 'none';
    }
  };

  return (
    <SidebarProvider>
      <div className={`flex flex-col min-h-screen bg-background ${highContrast ? 'contrast-high' : ''} ${reduced ? 'motion-reduce' : ''}`}
           style={{ 
             fontSize: `${fontSize}px`,
             filter: getColorBlindFilter()
           }}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
          Skip to main content
        </a>
        <TopNavigation 
          toggleSidebar={toggleSidebar}
          isMobile={mobile.isMobile}
        />
        <div className="flex flex-1 overflow-hidden">
          {/* Backdrop overlay for mobile when sidebar is open */}
          {mobile.isMobile && sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ease-in-out animate-in fade-in"
              onClick={() => {
                setSidebarOpen(false);
                // Update sessionStorage to reflect the closed state
                sessionStorage.setItem('sidebarToggled', 'false');
              }}
              aria-hidden="true"
            />
          )}

          {/* Sidebar wrapper with optimized positioning for improved performance */}
          <div className={`flex shrink-0 ${mobile.isMobile ? 'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ' + (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}`}>
            <Sidebar 
              fontSize={fontSize}
              setFontSize={setFontSize}
              highContrast={highContrast}
              setHighContrast={setHighContrast}
              colorBlindMode={colorBlindMode}
              setColorBlindMode={setColorBlindMode}
              expanded={sidebarOpen}
              setExpanded={setSidebarOpen}
            />
          </div>

          {/* Main content with responsive padding and swipe gestures for mobile */}
          <main 
            ref={mainContentRef}
            id="main-content"
            role="main"
            className={`flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 transition-all duration-300 ${
              sidebarOpen ? 'md:ml-64' : 'ml-0'
            } ${reduced ? 'scroll-smooth' : ''} w-full max-w-full ${mobile.isMobile && sidebarOpen ? 'opacity-50' : ''}`}
            style={{ 
              scrollbarWidth: 'thin', 
              scrollbarGutter: 'stable', 
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y', // Explicitly allow vertical panning/scrolling
              overscrollBehavior: 'auto', // Allow normal overscroll behavior for better UX
              height: 'auto', // Allow natural content height for better scrolling
              position: 'relative',
              willChange: 'scroll-position', // Performance optimization hint
              contain: 'content', // Help with performance optimization
            }}
            aria-live="polite"
            data-mobile-view={mobile.isMobile ? 'true' : 'false'}
          >
            {/* Scroll to top button for mobile - only shows when scrolled down */}
            {mobile.isMobile && (
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-full p-2 shadow-lg z-50 opacity-80 hover:opacity-100 transition-opacity"
                aria-label="Scroll to top"
                id="scroll-to-top-button"
                style={{ display: 'none' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              </button>
            )}
            {children}
            
            {/* Full-featured Footer with comprehensive links */}
            <Footer />
          </main>
          {mobile.isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="fixed bottom-4 right-4 z-50 rounded-full bg-primary text-primary-foreground shadow-lg"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? (
                <XIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}