import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { SkipLink } from '../accessibility/SkipLink';
import { AccessibilityToolbar } from '../accessibility/AccessibilityToolbar';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark, toggleTheme, setHighContrast } = useTheme();
  const { triggerHaptic } = useHapticFeedback();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    triggerHaptic('medium');
  };

  const [isOnline, setIsOnline] = useState(true);
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


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SkipLink />
      <AccessibilityToolbar 
        onThemeToggle={toggleTheme}
        onContrastToggle={setHighContrast}
      />

      <div className="flex h-screen overflow-hidden">
        <nav
          className={`transform transition-transform duration-300 ease-in-out 
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 fixed md:relative w-64 h-full z-20`}
          aria-label="Main navigation"
        >
          {/* Sidebar content */}
          <Sidebar onClose={() => setIsMenuOpen(false)} />
        </nav>

        <main id="main-content" className="flex-1 overflow-auto">
          <div className="spacing-grid">
            {!isOnline && (
              <div className="fixed top-0 left-0 w-full bg-yellow-500 text-black p-2 text-center z-50">
                You are currently offline. Some features may be limited.
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};