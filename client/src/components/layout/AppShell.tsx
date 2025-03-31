import React, { useState, useEffect, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TopNavigation from './TopNavigation';
import Sidebar from './Sidebar';
import { useAppleInteractions } from '@/lib/hooks/use-apple-interactions';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { triggerHapticFeedback } = useAppleInteractions();
  const mainContentRef = useRef<HTMLElement>(null);
  
  // Use media query hook instead of manual state
  const isMobile = useMediaQuery('(max-width: 768px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  // Set reduced motion based on user preference
  useEffect(() => {
    setReduceMotion(prefersReducedMotion);
  }, [prefersReducedMotion]);

  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else if (!isMobile && !sidebarOpen) {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Alt+S
      if (e.altKey && e.key === 's') {
        toggleSidebar();
        e.preventDefault();
      }
      
      // Focus on search with Ctrl+K or Command+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        const searchInput = document.querySelector('input[type="text"][placeholder="Search..."]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          e.preventDefault();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show/hide scroll-to-top button on mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const scrollButton = document.getElementById('scroll-to-top-button');
    
    const handleScroll = () => {
      if (!scrollButton) return;
      
      if (window.scrollY > 300) {
        scrollButton.style.display = 'flex';
        scrollButton.style.opacity = '1';
      } else {
        scrollButton.style.opacity = '0';
        setTimeout(() => {
          if (window.scrollY <= 300) {
            scrollButton.style.display = 'none';
          }
        }, 200);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(prevState => !prevState);
    triggerHapticFeedback('light');
    
    // Focus on main content when sidebar is closed
    if (sidebarOpen && mainContentRef.current) {
      mainContentRef.current.focus();
    }
  };
  
  // Handler for the scroll to top button
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    triggerHapticFeedback('medium');
  };
  
  // Track theme changes
  useEffect(() => {
    // Set data attributes for high contrast mode
    if (highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
    
    // Set font size on root element
    document.documentElement.style.fontSize = `${fontSize / 16}rem`;
  }, [highContrast, fontSize]);

  return (
    <SidebarProvider>
      <div 
        className={`flex flex-col min-h-screen bg-background ${highContrast ? 'contrast-high' : ''} ${reduceMotion ? 'motion-reduce' : ''}`}
        data-sidebar-open={sidebarOpen}
        data-is-mobile={isMobile}
      >
        <TopNavigation 
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar overlay for mobile - only visible when sidebar is open */}
          {isMobile && sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-20 backdrop-blur-sm transition-opacity duration-300"
              onClick={toggleSidebar}
              aria-hidden="true"
            />
          )}
          
          {/* Sidebar with improved accessibility */}
          <aside
            className={`${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } fixed md:relative z-30 h-[calc(100vh-3.5rem)] transition-transform ${reduceMotion ? '' : 'duration-300 ease-in-out'} md:translate-x-0 focus:outline-none`}
            aria-label="Sidebar navigation"
            role="navigation"
          >
            <Sidebar 
              fontSize={fontSize}
              setFontSize={setFontSize}
              highContrast={highContrast}
              setHighContrast={setHighContrast}
              expanded={sidebarOpen}
              setExpanded={setSidebarOpen}
              reduceMotion={reduceMotion}
              setReduceMotion={setReduceMotion}
            />
          </aside>

          {/* Main content with responsive padding and accessibility improvements */}
          <main 
            ref={mainContentRef}
            className={`flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 transition-all ${reduceMotion ? '' : 'duration-300'} ${
              sidebarOpen ? 'md:ml-64' : ''
            }`}
            tabIndex={-1}
            id="main-content"
            aria-label="Main content"
          >
            {/* Skip to content link for keyboard users */}
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:z-50 focus:rounded"
            >
              Skip to content
            </a>
            
            {/* Scroll to top button with improved accessibility and animations */}
            <button 
              onClick={scrollToTop}
              className="fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-full p-2 shadow-lg z-50 transition-all flex items-center justify-center"
              aria-label="Scroll to top"
              id="scroll-to-top-button"
              style={{ display: 'none', opacity: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </button>
            
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}