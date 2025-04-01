import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextProps {
  theme: string;
  isDarkMode: boolean;
  isColorBlindMode: boolean;
  updateThemeColor: (color: string) => void;
  toggleDarkMode: () => void;
  toggleColorBlindMode: () => void;
}

const defaultThemeContext: ThemeContextProps = {
  theme: '#7c3aed', // Default purple
  isDarkMode: false,
  isColorBlindMode: false,
  updateThemeColor: () => {},
  toggleDarkMode: () => {},
  toggleColorBlindMode: () => {},
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
          const response = await fetch('/api/public/theme');
          if (response.ok) {
            const themeData = await response.json();
            console.log('Fetched initial theme from API:', themeData);
            setTheme(themeData.primary);
          }
        } catch (error) {
          console.error('Failed to fetch initial theme from API:', error);
        }
      }
    };
    
    loadTheme();
  }, []);

  // Update document with current theme settings
  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('themeColor', theme);
    localStorage.setItem('darkMode', String(isDarkMode));
    localStorage.setItem('colorBlindMode', String(isColorBlindMode));

    // Update theme via API
    const updateTheme = async () => {
      try {
        // First, try using the publicly accessible theme endpoint
        const response = await fetch('/api/theme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication if available
          body: JSON.stringify({
            primary: theme,
            appearance: isDarkMode ? 'dark' : 'light',
            variant: isColorBlindMode ? 'professional' : 'vibrant',
            radius: 0.5,
          }),
        });
        
        if (!response.ok) {
          console.log('Theme update response not OK, status:', response.status);
        }
      } catch (error) {
        console.error('Failed to update theme:', error);
        
        // For any errors, try to fetch default theme from the public endpoint
        try {
          console.log('Fetching from public theme endpoint');
          const publicResponse = await fetch('/api/public/theme');
          if (publicResponse.ok) {
            const publicTheme = await publicResponse.json();
            console.log('Loaded public theme:', publicTheme);
            
            // Only update if we didn't have a value already
            if (!localStorage.getItem('themeColor')) {
              setTheme(publicTheme.primary);
            }
          }
        } catch (fallbackError) {
          console.error('Failed to fetch public theme:', fallbackError);
        }
      }
    };

    updateTheme();

    // Apply color blind mode CSS modifications
    if (isColorBlindMode) {
      document.documentElement.classList.add('color-blind-mode');
    } else {
      document.documentElement.classList.remove('color-blind-mode');
    }

    // Apply dark/light mode with an elegant, sensual and luxurious transition
    const html = document.documentElement;
    const body = document.body;
    
    // Make sure we have transition class before toggling
    html.classList.add('theme-transition');
    
    // Create a more elegant transition with proper timing
    requestAnimationFrame(() => {
      // Create a luxurious gradient overlay for smooth transition
      const overlay = document.createElement('div');
      
      // Set up a haptic-like visual transition overlay
      overlay.className = 'fixed inset-0 pointer-events-none z-[100]';
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 230ms cubic-bezier(0.19, 1, 0.22, 1)'; // Fast haptic-synchronized transition
      
      // Create a subtle pulsing effect that mimics haptic feedback patterns
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary') || '#7c3aed';
      
      // Use a gradient with primary color influence for a brand-consistent feedback
      if (isDarkMode) {
        // Transitioning to dark - subtle pulse effect
        overlay.style.background = `
          radial-gradient(circle at center, 
            rgba(15, 15, 15, 0) 0%, 
            rgba(15, 15, 15, 0.05) 30%,
            rgba(15, 15, 15, 0.1) 60%, 
            rgba(15, 15, 15, 0.15) 100%), 
          linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.1))
        `;
      } else {
        // Transitioning to light - subtle pulse effect
        overlay.style.background = `
          radial-gradient(circle at center, 
            rgba(255, 255, 255, 0) 0%, 
            rgba(255, 255, 255, 0.05) 30%,
            rgba(255, 255, 255, 0.1) 60%, 
            rgba(255, 255, 255, 0.15) 100%),
          linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.1))
        `;
      }
      
      document.body.appendChild(overlay);
      
      // Trigger the transition immediately for optimal flow
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        
        // Apply theme change matching standard haptic feedback timing (~50ms response)
        setTimeout(() => {
          if (isDarkMode) {
            html.classList.add('dark');
          } else {
            html.classList.remove('dark');
          }
          
          // Fade out using haptic-synchronized timing (~100ms)
          setTimeout(() => {
            overlay.style.opacity = '0';
            
            // Remove overlay on completion (haptic feedback resolution ~200ms)
            setTimeout(() => {
              document.body.removeChild(overlay);
              
              // Restore normal animations
              html.classList.remove('theme-transition');
            }, 180); // Aligned with touch response threshold
          }, 100); // Haptic-synchronized fade timing
        }, 50); // Touch response timing standard
      });
    });
  }, [theme, isDarkMode, isColorBlindMode]);

  // Update theme color
  const updateThemeColor = (color: string) => {
    setTheme(color);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Toggle color blind mode
  const toggleColorBlindMode = () => {
    setIsColorBlindMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        isColorBlindMode,
        updateThemeColor,
        toggleDarkMode,
        toggleColorBlindMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing theme context more easily
export const useTheme = () => useContext(ThemeContext);