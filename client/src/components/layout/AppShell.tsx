import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TopNavigation from './TopNavigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen is mobile size on mount and window resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <TopNavigation 
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />
        <div className="flex flex-1 overflow-hidden">
          {/* Main content with responsive padding */}
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
            {/* Scroll to top button for mobile - only shows when scrolled down */}
            {isMobile && (
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-full p-2 shadow-lg z-50 opacity-80 hover:opacity-100 transition-opacity"
                aria-label="Scroll to top"
                style={{ 
                  display: 'none', 
                  // This will be controlled by JS (not included here) to show when scrolled
                }}
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