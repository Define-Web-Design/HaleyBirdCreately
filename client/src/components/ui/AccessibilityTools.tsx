
import React, { useState, useEffect } from 'react';

interface AccessibilityToolsProps {
  className?: string;
}

export default function AccessibilityTools({ className = '' }: AccessibilityToolsProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'x-large'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>('none');
  
  useEffect(() => {
    // Check for user's preferred color scheme
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
    
    // Load other accessibility settings from localStorage
    const savedFontSize = localStorage.getItem('fontSize') as 'normal' | 'large' | 'x-large' | null;
    if (savedFontSize) {
      setFontSize(savedFontSize);
      applyFontSize(savedFontSize);
    }
    
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    if (savedHighContrast) {
      setHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
    
    const savedColorBlindMode = localStorage.getItem('colorBlindMode') as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | null;
    if (savedColorBlindMode && savedColorBlindMode !== 'none') {
      setColorBlindMode(savedColorBlindMode);
      document.documentElement.setAttribute('data-color-blind-mode', savedColorBlindMode);
    }
    
    // Add keyboard shortcut listener for accessibility toggles
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt+T for theme toggle
      if (event.altKey && event.key === 't') {
        toggleTheme();
      }
      
      // Alt+F for font size increase
      if (event.altKey && event.key === 'f') {
        const nextSize = fontSize === 'normal' ? 'large' : 
                        fontSize === 'large' ? 'x-large' : 'normal';
        setFontSize(nextSize);
        applyFontSize(nextSize);
      }
      
      // Alt+C for high contrast toggle
      if (event.altKey && event.key === 'c') {
        setHighContrast(!highContrast);
        document.documentElement.classList.toggle('high-contrast');
        localStorage.setItem('highContrast', (!highContrast).toString());
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [theme, fontSize, highContrast, colorBlindMode]);
  
  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference
    localStorage.theme = newTheme;
  };
  
  // Apply font size
  const applyFontSize = (size: 'normal' | 'large' | 'x-large') => {
    const rootElement = document.documentElement;
    
    // Remove existing size classes
    rootElement.classList.remove('text-normal', 'text-large', 'text-x-large');
    
    // Add new size class
    rootElement.classList.add(`text-${size}`);
    
    // Save preference
    localStorage.setItem('fontSize', size);
  };
      document.documentElement.classList.add(savedColorBlindMode);
    }
  }, []);
  
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };
  
  const changeFontSize = (size: 'normal' | 'large' | 'x-large') => {
    setFontSize(size);
    applyFontSize(size);
    localStorage.setItem('fontSize', size);
  };
  
  const applyFontSize = (size: 'normal' | 'large' | 'x-large') => {
    // Remove existing font size classes
    document.documentElement.classList.remove('text-normal', 'text-large', 'text-x-large');
    // Add new font size class
    document.documentElement.classList.add(`text-${size}`);
  };
  
  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    if (!highContrast) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('highContrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('highContrast', 'false');
    }
  };
  
  const changeColorBlindMode = (mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => {
    // Remove existing color blind mode classes
    document.documentElement.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    
    if (mode !== 'none') {
      document.documentElement.classList.add(mode);
    }
    
    setColorBlindMode(mode);
    localStorage.setItem('colorBlindMode', mode);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-medium text-gray-800 dark:text-gray-200">Accessibility Tools</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </span>
          <button
            onClick={toggleTheme}
            className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-pressed={theme === 'dark'}
            aria-labelledby="theme-toggle"
          >
            <span className="sr-only" id="theme-toggle">
              {theme === 'light' ? 'Enable dark mode' : 'Enable light mode'}
            </span>
            <span
              className={`${
                theme === 'dark' ? 'bg-primary' : 'bg-gray-200'
              } inline-block h-6 w-11 rounded-full transition-colors`}
            />
            <span
              className={`${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </button>
        </div>
        
        {/* Font Size Controls */}
        <div>
          <span className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
            Text Size
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => changeFontSize('normal')}
              className={`px-3 py-1 text-sm rounded-md ${
                fontSize === 'normal'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => changeFontSize('large')}
              className={`px-3 py-1 text-sm rounded-md ${
                fontSize === 'large'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Large
            </button>
            <button
              onClick={() => changeFontSize('x-large')}
              className={`px-3 py-1 text-sm rounded-md ${
                fontSize === 'x-large'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              X-Large
            </button>
          </div>
        </div>
        
        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            High Contrast
          </span>
          <button
            onClick={toggleHighContrast}
            className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-pressed={highContrast}
            aria-labelledby="contrast-toggle"
          >
            <span className="sr-only" id="contrast-toggle">
              {highContrast ? 'Disable high contrast' : 'Enable high contrast'}
            </span>
            <span
              className={`${
                highContrast ? 'bg-primary' : 'bg-gray-200'
              } inline-block h-6 w-11 rounded-full transition-colors`}
            />
            <span
              className={`${
                highContrast ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </button>
        </div>
        
        {/* Color Blind Modes */}
        <div>
          <span className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
            Color Blind Mode
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => changeColorBlindMode('none')}
              className={`px-3 py-1 text-sm rounded-md ${
                colorBlindMode === 'none'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              None
            </button>
            <button
              onClick={() => changeColorBlindMode('protanopia')}
              className={`px-3 py-1 text-sm rounded-md ${
                colorBlindMode === 'protanopia'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Protanopia
            </button>
            <button
              onClick={() => changeColorBlindMode('deuteranopia')}
              className={`px-3 py-1 text-sm rounded-md ${
                colorBlindMode === 'deuteranopia'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Deuteranopia
            </button>
            <button
              onClick={() => changeColorBlindMode('tritanopia')}
              className={`px-3 py-1 text-sm rounded-md ${
                colorBlindMode === 'tritanopia'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Tritanopia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
