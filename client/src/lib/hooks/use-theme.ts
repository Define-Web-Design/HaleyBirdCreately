import { useState, useEffect } from 'react';
import { ActivePalette } from '@/lib/types';

export const useTheme = () => {
  // Check if user prefers dark mode
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Initialize dark mode state with localStorage value or system preference
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme !== null ? savedTheme === 'true' : prefersDark;
  });

  // Initialize active palette state
  const [activePalette, setActivePaletteState] = useState<ActivePalette>(() => {
    const savedPalette = localStorage.getItem('activePalette');
    if (savedPalette) {
      try {
        return JSON.parse(savedPalette);
      } catch (e) {
        return { primary: '', isPaletteActive: false };
      }
    }
    return { primary: '', isPaletteActive: false };
  });

  // Apply theme class to html element
  useEffect(() => {
    const htmlEl = document.documentElement;
    htmlEl.classList.remove('light', 'dark'); //Added to remove previous classes

    if (isDark) {
      htmlEl.classList.add('dark');
    } else {
      htmlEl.classList.add('light'); // Added to explicitly set light mode
    }

    // Save preference to localStorage
    localStorage.setItem('darkMode', isDark.toString());
  }, [isDark]);

  // Apply palette colors to CSS variables
  useEffect(() => {
    const htmlEl = document.documentElement;

    if (activePalette.isPaletteActive && activePalette.primary) {
      // Set CSS variables for palette colors
      htmlEl.style.setProperty('--palette-primary', activePalette.primary);

      if (activePalette.accent) {
        htmlEl.style.setProperty('--palette-accent', activePalette.accent);
      }

      if (activePalette.background) {
        htmlEl.style.setProperty('--palette-background', activePalette.background);
      }

      // Add class to indicate a palette is active
      htmlEl.classList.add('palette-active');
    } else {
      // Remove palette CSS variables and class
      htmlEl.style.removeProperty('--palette-primary');
      htmlEl.style.removeProperty('--palette-accent');
      htmlEl.style.removeProperty('--palette-background');
      htmlEl.classList.remove('palette-active');
    }

    // Save active palette to localStorage
    localStorage.setItem('activePalette', JSON.stringify(activePalette));
  }, [activePalette]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDark(prevIsDark => !prevIsDark);
  };

  // Set active palette
  const setActivePalette = (palette: Partial<ActivePalette>) => {
    setActivePaletteState(prev => ({
      ...prev,
      ...palette,
      isPaletteActive: true
    }));
  };

  // Reset active palette
  const resetPalette = () => {
    setActivePaletteState({ primary: '', isPaletteActive: false });
  };

  return { 
    isDark, 
    toggleTheme, 
    activePalette, 
    setActivePalette, 
    resetPalette 
  };
};

export default useTheme;