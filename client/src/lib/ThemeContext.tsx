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

const ThemeContext = createContext<ThemeContextProps>(defaultThemeContext);

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

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeColor');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Update document with current theme settings
  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('themeColor', theme);
    localStorage.setItem('darkMode', String(isDarkMode));
    localStorage.setItem('colorBlindMode', String(isColorBlindMode));

    // Update theme.json via API
    const updateTheme = async () => {
      try {
        const response = await fetch('/api/theme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            primary: theme,
            appearance: isDarkMode ? 'dark' : 'light',
            variant: isColorBlindMode ? 'professional' : 'vibrant',
            radius: 0.5,
          }),
        });
        
        if (!response.ok) {
          // If authenticated endpoint fails, try the public endpoint
          console.log('Using public theme endpoint');
          await fetch('/api/public/theme', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
      } catch (error) {
        console.error('Failed to update theme:', error);
      }
    };

    updateTheme();

    // Apply color blind mode CSS modifications
    if (isColorBlindMode) {
      document.documentElement.classList.add('color-blind-mode');
    } else {
      document.documentElement.classList.remove('color-blind-mode');
    }

    // Apply dark/light mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;