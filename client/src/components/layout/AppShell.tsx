
import { useState, useEffect, createContext } from 'react';
import { useLocation } from 'wouter';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';

export const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  highContrast: false,
  toggleHighContrast: () => {},
});

export default function AppShell({ children }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [location] = useLocation();

  // Theme handling
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.classList.toggle('high-contrast');
  };

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mobile gesture handling
  useEffect(() => {
    let touchStart = 0;
    const handleTouchStart = (e) => {
      touchStart = e.touches[0].clientX;
    };
    
    const handleTouchMove = (e) => {
      if (touchStart - e.touches[0].clientX > 100) {
        setMobileMenuOpen(false);
      } else if (e.touches[0].clientX - touchStart > 100) {
        setMobileMenuOpen(true);
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, highContrast, toggleHighContrast }}>
      <div className={`flex h-screen overflow-hidden ${highContrast ? 'high-contrast' : ''}`}>
        {/* Skip link for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4">
          Skip to main content
        </a>
        
        {/* Offline indicator */}
        {!isOnline && (
          <div className="fixed top-0 left-0 w-full bg-yellow-500 text-black p-2 text-center z-50">
            You are currently offline. Some features may be limited.
          </div>
        )}

        {/* Sidebar with enhanced mobile support */}
        <div
          className={`transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 md:flex fixed md:relative z-20 md:z-auto w-64 h-full`}
        >
          <Sidebar onClose={() => setMobileMenuOpen(false)} />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavigation onMenuToggle={() => setMobileMenuOpen(!isMobileMenuOpen)} />
          
          <main id="main-content" className="flex-1 overflow-auto p-4 md:p-6">
            <div className="animate-slideIn">
              {children}
            </div>
          </main>
        </div>

        {/* Quick action floating menu */}
        <div className="fixed bottom-4 right-4 glass rounded-full p-2 shadow-lg z-30">
          <button
            onClick={toggleTheme}
            className="btn-press touch-target p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {isDark ? '🌞' : '🌙'}
          </button>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
