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
      
      // Set up an elegant transition overlay
      overlay.className = 'fixed inset-0 pointer-events-none z-[100]';
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 450ms cubic-bezier(0.65, 0, 0.35, 1)';
      
      // Use gradient for more luxurious feel
      if (isDarkMode) {
        // Transitioning to dark
        overlay.style.background = 'radial-gradient(circle at center, rgba(15, 15, 15, 0) 0%, rgba(15, 15, 15, 0.2) 100%)';
      } else {
        // Transitioning to light
        overlay.style.background = 'radial-gradient(circle at center, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 100%)';
      }
      
      document.body.appendChild(overlay);
      
      // Trigger the transition immediately for optimal flow
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        
        // Apply the theme change after a brief, natural delay
        setTimeout(() => {
          if (isDarkMode) {
            html.classList.add('dark');
          } else {
            html.classList.remove('dark');
          }
          
          // Fade out the overlay elegantly
          setTimeout(() => {
            overlay.style.opacity = '0';
            
            // Remove overlay when transition completes
            setTimeout(() => {
              document.body.removeChild(overlay);
              
              // Remove the transition class to restore normal animations
              html.classList.remove('theme-transition');
            }, 350); // Clean up after fade out
          }, 200); // Start fade after colors have settled
        }, 100); // Short pause for visual elegance
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