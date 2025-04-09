import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setTactileFeedbackEnabled } from '../utils/hapticFeedback';
import { initTouchFeedback, cleanupTouchFeedback } from './touchFeedback';

interface ThemeContextProps {
  theme: string;
  isDarkMode: boolean;
  isColorBlindMode: boolean;
  isTactileFeedbackEnabled: boolean;
  transitionSpeed: 'default' | 'fast' | 'luxurious';
  updateThemeColor: (color: string) => void;
  toggleDarkMode: () => void;
  toggleColorBlindMode: () => void;
  toggleTactileFeedback: () => void;
  setTransitionSpeed: (speed: 'default' | 'fast' | 'luxurious') => void;
}

const defaultThemeContext: ThemeContextProps = {
  theme: '#7c3aed', // Default purple
  isDarkMode: false,
  isColorBlindMode: false,
  isTactileFeedbackEnabled: true, // Enable by default for mobile users
  transitionSpeed: 'default',
  updateThemeColor: () => {},
  toggleDarkMode: () => {},
  toggleColorBlindMode: () => {},
  toggleTactileFeedback: () => {},
  setTransitionSpeed: () => {},
};

// Using named export instead of default export to fix Fast Refresh issues
export const ThemeContext = createContext<ThemeContextProps>(defaultThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<string>(defaultThemeContext.theme);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    () => localStorage.getItem('darkMode') === 'true' || 
          window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [isColorBlindMode, setIsColorBlindMode] = useState<boolean>(
    localStorage.getItem('colorBlindMode') === 'true'
  );
  const [isTactileFeedbackEnabled, setIsTactileFeedbackEnabled] = useState<boolean>(
    () => {
      const stored = localStorage.getItem('tactileFeedback');
      // Default to true on mobile devices, false on desktop
      if (stored === null) {
        return window.matchMedia('(max-width: 768px)').matches;
      }
      return stored === 'true';
    }
  );
  const [transitionSpeed, setTransitionSpeed] = useState<'default' | 'fast' | 'luxurious'>(
    () => {
      const stored = localStorage.getItem('transitionSpeed');
      return (stored as 'default' | 'fast' | 'luxurious') || 'default';
    }
  );

  // Load theme from localStorage or API on mount
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = localStorage.getItem('themeColor');
      
      if (savedTheme) {
        // If we have a saved theme, use it
        setTheme(savedTheme);
      } else {
        // Otherwise, try to get default theme from the API
        try {
          const themeResponse = await fetch('/api/public/theme', {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          if (themeResponse.ok) {
            const themeData = await themeResponse.json();
            console.log('Fetched initial theme from API:', themeData);
            
            if (themeData && themeData.primary) {
              setTheme(themeData.primary);
              localStorage.setItem('themeColor', themeData.primary);
            }
          } else {
            console.log('Using fallback theme from default context');
          }
        } catch (error) {
          console.error('Failed to fetch initial theme from API:', error);
        }
      }
    };
    
    loadTheme();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('themeColor', theme);
    localStorage.setItem('darkMode', String(isDarkMode));
    localStorage.setItem('colorBlindMode', String(isColorBlindMode));
    localStorage.setItem('tactileFeedback', String(isTactileFeedbackEnabled));
    localStorage.setItem('transitionSpeed', transitionSpeed);
  }, [theme, isDarkMode, isColorBlindMode, isTactileFeedbackEnabled, transitionSpeed]);

  // Handle theme updates via API - debounced to prevent too many requests
  useEffect(() => {
    // Skip API call on initial mount
    if (theme === defaultThemeContext.theme) {
      return;
    }
    
    const updateTimeout = setTimeout(async () => {
      try {
        // Only make API call if we have a non-default theme to update
        const response = await fetch('/api/theme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            primary: theme,
            appearance: isDarkMode ? 'dark' : 'light',
            variant: isColorBlindMode ? 'professional' : 'vibrant',
            radius: 0.5
          })
        });
        
        if (!response.ok) {
          console.log('Theme update response not OK:', response.status);
        }
      } catch (error) {
        console.error('Failed to update theme:', error);
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(updateTimeout);
  }, [theme, isDarkMode, isColorBlindMode]);
  
  // Handle dark mode and color blind mode changes
  useEffect(() => {
    // Apply color blind mode
    if (isColorBlindMode) {
      document.documentElement.classList.add('color-blind-mode');
    } else {
      document.documentElement.classList.remove('color-blind-mode');
    }

    // Apply dark mode with transition
    const html = document.documentElement;
    html.classList.add('theme-transition');
    
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    // Remove transition class after transition completes
    const timer = setTimeout(() => {
      html.classList.remove('theme-transition');
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isDarkMode, isColorBlindMode]);

  // Handle tactile feedback settings
  useEffect(() => {
    initTouchFeedback(isTactileFeedbackEnabled);
    
    const html = document.documentElement;
    if (isTactileFeedbackEnabled) {
      html.classList.add('tactile-feedback-enabled');
    } else {
      html.classList.remove('tactile-feedback-enabled');
    }
    
    // Mobile specific settings
    if (window.matchMedia('(max-width: 768px)').matches) {
      document.body.classList.add('mobile-device');
      if (isTactileFeedbackEnabled) {
        document.body.classList.add('enhanced-touch');
      } else {
        document.body.classList.remove('enhanced-touch');
      }
    } else {
      document.body.classList.remove('mobile-device');
      document.body.classList.remove('enhanced-touch');
    }
    
    return () => {
      cleanupTouchFeedback();
    };
  }, [isTactileFeedbackEnabled]);
  
  // Handle transition speed changes
  useEffect(() => {
    const html = document.documentElement;
    let speedValue = '280ms'; // default
    
    if (transitionSpeed === 'fast') {
      speedValue = '180ms';
      html.setAttribute('data-transition-speed', 'fast');
    } else if (transitionSpeed === 'luxurious') {
      speedValue = '450ms';
      html.setAttribute('data-transition-speed', 'luxurious');
    } else {
      html.setAttribute('data-transition-speed', 'default');
    }
    
    html.style.setProperty('--theme-transition-speed', speedValue);
  }, [transitionSpeed]);

  // Update theme color
  const updateThemeColor = (color: string) => {
    setTheme(color);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Toggle color blind mode
  const toggleColorBlindMode = () => {
    setIsColorBlindMode(prev => !prev);
  };
  
  // Toggle tactile feedback
  const toggleTactileFeedback = () => {
    const newValue = !isTactileFeedbackEnabled;
    setIsTactileFeedbackEnabled(newValue);
    setTactileFeedbackEnabled(newValue);
  };
  
  // Set transition speed
  const setTransitionSpeedFn = (speed: 'default' | 'fast' | 'luxurious') => {
    setTransitionSpeed(speed);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        isColorBlindMode,
        isTactileFeedbackEnabled,
        transitionSpeed,
        updateThemeColor,
        toggleDarkMode,
        toggleColorBlindMode,
        toggleTactileFeedback,
        setTransitionSpeed: setTransitionSpeedFn,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing theme context more easily
export const useTheme = () => useContext(ThemeContext);