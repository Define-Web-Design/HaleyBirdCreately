import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TopNavigation from './TopNavigation';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState('none');
  const [reduced, setReducedMotion] = useState(false);

  // Check if the screen is mobile size on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add scroll event listener to show/hide the scroll-to-top button on mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const scrollButton = document.getElementById('scroll-to-top-button');
    
    const handleScroll = () => {
      if (!scrollButton) return;
      
      if (window.scrollY > 300) {
        scrollButton.style.display = 'block';
      } else {
        scrollButton.style.display = 'none';
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(prevState => !prevState);
  };

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
          isMobile={isMobile}
        />
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - conditionally shown based on sidebarOpen state */}
          <div
            className={`${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } fixed md:relative z-10 h-full transition-transform duration-300 ease-in-out md:translate-x-0`}
          >
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

          {/* Main content with responsive padding */}
          <main 
            id="main-content"
            role="main"
            className={`flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 transition-padding duration-300 ${
              sidebarOpen ? 'md:ml-64' : ''
            } ${reduced ? 'scroll-smooth' : ''}`}
            aria-live="polite"
          >
            {/* Scroll to top button for mobile - only shows when scrolled down */}
            {isMobile && (
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}