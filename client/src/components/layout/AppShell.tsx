import React, { useState, useEffect, useCallback } from 'react';
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
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (isMobileView) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
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
          isMobile={isMobile}
        />
        <div className="flex flex-1 overflow-hidden">
          {/* Backdrop overlay for mobile when sidebar is open */}
          {isMobile && sidebarOpen && (
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
          
          {/* Sidebar wrapper with fixed positioning to avoid layout issues */}
          <div className="flex">
            <div
              className={`${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } fixed z-40 h-[calc(100vh-4rem)] transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
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
          </div>

          {/* Main content with responsive padding */}
          <main 
            id="main-content"
            role="main"
            className={`flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 transition-all duration-300 ${
              sidebarOpen ? 'md:ml-64' : ''
            } ${reduced ? 'scroll-smooth' : ''} w-full`}
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
            
            {/* Footer with legal links */}
            <footer className="mt-16 pt-8 border-t border-border">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center py-6">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-[#F2994A] to-[#FF9DAE] h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-2">C</div>
                      <span className="text-lg font-semibold">Creately</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      A creative intelligence platform for design and content creation
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
                    <div>
                      <h3 className="font-medium mb-2">Legal</h3>
                      <ul className="space-y-2">
                        <li>
                          <a href="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Terms and Conditions
                          </a>
                        </li>
                        <li>
                          <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Privacy Policy
                          </a>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Contact</h3>
                      <ul className="space-y-2">
                        <li>
                          <a href="mailto:support@creately.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            support@creately.com
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="py-4 text-center border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} Creately. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}