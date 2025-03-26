import { useState, useEffect } from 'react';

export const useTheme = () => {
  // Check if user prefers dark mode
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Initialize state with localStorage value or system preference
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme !== null ? savedTheme === 'true' : prefersDark;
  });

  // Apply theme class to html element
  useEffect(() => {
    const htmlEl = document.documentElement;
    
    if (isDark) {
      htmlEl.classList.add('dark');
    } else {
      htmlEl.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDark.toString());
  }, [isDark]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDark(prevIsDark => !prevIsDark);
  };

  return { isDark, toggleTheme };
};

export default useTheme;
