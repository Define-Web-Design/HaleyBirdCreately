import React, { createContext, useState, useContext, useEffect } from 'react';
import { applyColorBlindMode, ColorBlindModeType } from './colorBlindUtils';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
  fontSize: number;
  setFontSize: (size: number) => void;
  highContrast: boolean;
  setHighContrast: (contrast: boolean) => void;
  colorBlindMode: ColorBlindModeType;
  setColorBlindMode: (mode: ColorBlindModeType) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'system',
  setTheme: () => {},
  isDark: false,
  fontSize: 16,
  setFontSize: () => {},
  highContrast: false,
  setHighContrast: () => {},
  colorBlindMode: 'none',
  setColorBlindMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load settings from localStorage or use defaults
  const [theme, setThemeState] = useState<ThemeType>(
    () => (localStorage.getItem('theme') as ThemeType) || 'system'
  );
  
  const [isDark, setIsDark] = useState(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [fontSize, setFontSizeState] = useState(() => {
    return parseInt(localStorage.getItem('fontSize') || '16', 10);
  });
  
  const [highContrast, setHighContrastState] = useState(() => {
    return localStorage.getItem('highContrast') === 'true';
  });
  
  const [colorBlindMode, setColorBlindModeState] = useState<ColorBlindModeType>(() => {
    return (localStorage.getItem('colorBlindMode') as ColorBlindModeType) || 'none';
  });

  // Update theme when system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setIsDark(mediaQuery.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme changes to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Apply high contrast
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Apply font size
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // Apply color blind mode
  useEffect(() => {
    applyColorBlindMode(colorBlindMode);
  }, [colorBlindMode]);

  // Setters with localStorage persistence
  const setTheme = (newTheme: ThemeType) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
    
    if (newTheme === 'dark') {
      setIsDark(true);
    } else if (newTheme === 'light') {
      setIsDark(false);
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  };

  const setFontSize = (size: number) => {
    localStorage.setItem('fontSize', size.toString());
    setFontSizeState(size);
  };

  const setHighContrast = (contrast: boolean) => {
    localStorage.setItem('highContrast', contrast.toString());
    setHighContrastState(contrast);
  };

  const setColorBlindMode = (mode: ColorBlindModeType) => {
    localStorage.setItem('colorBlindMode', mode);
    setColorBlindModeState(mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDark,
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        colorBlindMode,
        setColorBlindMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;