import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import only the necessary functions to avoid circular dependencies
// These functions will be lazily imported in the useEffect to prevent initialization errors
let initTouchFeedback: (enabled: boolean) => void;
let setTactileFeedback: (enabled: boolean) => void;
let cleanupTouchFeedback: () => void;

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
          // Try authenticated endpoint first with cache control
          let themeResponse = await fetch('/api/theme', {
            credentials: 'include', // Include cookies for authentication
            cache: 'no-cache', // Prevent browser caching
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          }).catch((error) => {
            console.log('Authenticated theme fetch error:', error);
            return null;
          }); // Catch and return null if it fails
          
          // If authenticated endpoint fails, fallback to public theme with cache control
          if (!themeResponse || !themeResponse.ok) {
            console.log('Trying public theme endpoint instead...');
            themeResponse = await fetch('/api/public/theme', {
              cache: 'no-cache', // Prevent browser caching
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              }
            }).catch((error) => {
              console.log('Public theme fetch error:', error);
              return null;
            });
          }
          
          // If we got a successful response from either endpoint
          if (themeResponse && themeResponse.ok) {
            const themeData = await themeResponse.json();
            console.log('Fetched initial theme from API:', themeData);
            
            // Check if the theme data has the expected properties
            if (themeData && themeData.primary) {
              setTheme(themeData.primary);
              localStorage.setItem('themeColor', themeData.primary);
            } else {
              console.error('Theme data missing primary color');
            }
          } else {
            // If both API calls fail, use default theme from context
            console.log('Using fallback theme from default context');
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
    localStorage.setItem('tactileFeedback', String(isTactileFeedbackEnabled));
    localStorage.setItem('transitionSpeed', transitionSpeed);

    // Update theme via API
    const updateTheme = async () => {
      try {
        // First, try using the publicly accessible theme endpoint
        const response = await fetch('/api/theme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          credentials: 'include', // Include cookies for authentication if available
          cache: 'no-cache', // Prevent browser caching
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
          const publicResponse = await fetch('/api/public/theme', {
            cache: 'no-cache', // Prevent browser caching
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          
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
    // perfectly synchronized with haptic feedback rates
    const html = document.documentElement;
    const body = document.body;
    
    // Make sure we have transition class before toggling to enable all transition effects
    html.classList.add('theme-transition');
    
    // Create a more elegant transition with proper timing aligned with haptic feedback
    requestAnimationFrame(() => {
      // Create a luxury gradient overlay with haptic-synchronized animation
      const overlay = document.createElement('div');
      
      // Set up a haptic-like visual transition overlay with hardware acceleration
      overlay.className = 'fixed inset-0 pointer-events-none z-[100]';
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 230ms cubic-bezier(0.22, 1, 0.36, 1)'; // Haptic-synchronized easing
      overlay.style.transform = 'translateZ(0)'; // Hardware acceleration
      overlay.setAttribute('aria-hidden', 'true'); // Accessibility
      
      // Create a subtle pulsing effect that mimics haptic feedback patterns
      // using CSS animations matching the precise timing of device haptics
      const primaryColorRaw = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#7c3aed';
      const primaryColor = primaryColorRaw.trim();
      
      // Dynamic animation based on mode to create a sensorial experience
      if (isDarkMode) {
        // Transitioning to dark - subtle radial pulse effect with primary color influence
        overlay.style.background = `
          radial-gradient(circle at center, 
            rgba(15, 15, 15, 0) 0%, 
            rgba(15, 15, 15, 0.03) 30%,
            rgba(15, 15, 15, 0.07) 60%, 
            rgba(15, 15, 15, 0.1) 100%), 
          linear-gradient(to bottom, 
            rgba(${parseInt(primaryColor.slice(1, 3), 16)}, 
                  ${parseInt(primaryColor.slice(3, 5), 16)}, 
                  ${parseInt(primaryColor.slice(5, 7), 16)}, 0.02),
            rgba(0, 0, 0, 0.05))
        `;
        // Add animation that syncs with iOS haptic feedback rate
        overlay.style.animation = 'pulse 500ms cubic-bezier(0.19, 1, 0.22, 1)';
      } else {
        // Transitioning to light - subtle radial pulse with ambient feel
        overlay.style.background = `
          radial-gradient(circle at center, 
            rgba(255, 255, 255, 0) 0%, 
            rgba(255, 255, 255, 0.03) 30%,
            rgba(255, 255, 255, 0.07) 60%, 
            rgba(255, 255, 255, 0.1) 100%),
          linear-gradient(to bottom, 
            rgba(${parseInt(primaryColor.slice(1, 3), 16)}, 
                  ${parseInt(primaryColor.slice(3, 5), 16)}, 
                  ${parseInt(primaryColor.slice(5, 7), 16)}, 0.01), 
            rgba(255, 255, 255, 0.05))
        `;
        // Add animation that syncs with iOS haptic feedback rate
        overlay.style.animation = 'pulse 500ms cubic-bezier(0.19, 1, 0.22, 1)';
      }
      
      document.body.appendChild(overlay);
      
      // Add ambient sound for enhanced luxury feel - use subtle animation instead
      // to create a synesthetic experience without actual sound
      document.documentElement.style.setProperty('--theme-transition-speed', '280ms');
      
      // Trigger the transition immediately for optimal flow with haptic timing
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        
        // Sequence of carefully timed transitions that match haptic feedback intervals
        
        // Apply theme change matching standard haptic feedback timing (~50ms response)
        setTimeout(() => {
          // Apply theme change - this triggers all CSS transitions defined in theme-transition class
          if (isDarkMode) {
            html.classList.add('dark');
          } else {
            html.classList.remove('dark');
          }
          
          // Update UI elements with staggered animation to create a cascading effect
          const interactiveElements = document.querySelectorAll(
            'button, a, .card, .panel, input, select, textarea, .theme-aware'
          );
          
          // Stagger the animations of interactive elements to create a wave-like effect
          // that mimics the ripple pattern of haptic feedback
          interactiveElements.forEach((el, index) => {
            const delay = 30 + (index % 5) * 15; // Stagger in groups of 5 elements
            (el as HTMLElement).style.transitionDelay = `${delay}ms`;
            // Reset the delay after the transition
            setTimeout(() => {
              (el as HTMLElement).style.transitionDelay = '0ms';
            }, 350); // Slightly longer than transition duration
          });
          
          // Fade out using haptic-synchronized timing (~100ms)
          setTimeout(() => {
            overlay.style.opacity = '0';
            
            // Remove overlay on completion (haptic feedback resolution ~200ms)
            setTimeout(() => {
              if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
              }
              
              // Allow a brief moment for the cascade of changes to complete
              // then restore normal animations - this matches the haptic feedback resolution time
              setTimeout(() => {
                html.classList.remove('theme-transition');
                // Reset any transition delays
                document.documentElement.style.removeProperty('--theme-transition-speed');
              }, 50); // Final resolution timing
            }, 180); // Aligned with touch response threshold
          }, 100); // Haptic-synchronized fade timing
        }, 50); // Touch response timing standard - Android/iOS haptic response time
      });
    });
  }, [theme, isDarkMode, isColorBlindMode, isTactileFeedbackEnabled, transitionSpeed]);

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
  
  // Toggle tactile feedback
  const toggleTactileFeedback = () => {
    const newValue = !isTactileFeedbackEnabled;
    setIsTactileFeedbackEnabled(newValue);
    
    // Apply or remove tactile feedback classes and initialize touch feedback system
    if (newValue) {
      document.documentElement.classList.add('tactile-feedback-enabled');
      // Initialize the touch feedback system if the function exists
      if (initTouchFeedback) {
        initTouchFeedback(true);
      }
    } else {
      document.documentElement.classList.remove('tactile-feedback-enabled');
      // Set tactile feedback to disabled if the function exists
      if (setTactileFeedback) {
        setTactileFeedback(false);
      }
    }
  };
  
  // Set transition speed
  const setTransitionSpeedFn = (speed: 'default' | 'fast' | 'luxurious') => {
    setTransitionSpeed(speed);
    
    // Apply appropriate CSS variables based on selected speed
    if (speed === 'fast') {
      document.documentElement.style.setProperty('--theme-transition-speed', '180ms');
    } else if (speed === 'luxurious') {
      document.documentElement.style.setProperty('--theme-transition-speed', '450ms');
    } else {
      document.documentElement.style.setProperty('--theme-transition-speed', '280ms');
    }
  };

  // Initialize touch feedback system on mount with dynamic imports
  useEffect(() => {
    // Dynamically import the touch feedback functions to prevent circular dependencies
    const loadTouchFeedback = async () => {
      try {
        const touchModule = await import('./touchFeedback');
        initTouchFeedback = touchModule.initTouchFeedback;
        setTactileFeedback = touchModule.setTactileFeedback;
        cleanupTouchFeedback = touchModule.cleanupTouchFeedback;
        
        // Now that the functions are loaded, initialize the touch feedback system
        initTouchFeedback(isTactileFeedbackEnabled);
      } catch (error) {
        console.error('Failed to load touch feedback module:', error);
      }
    };
    
    loadTouchFeedback();
    
    // Clean up event listeners on component unmount
    return () => {
      if (cleanupTouchFeedback) {
        cleanupTouchFeedback();
      }
    };
  }, [isTactileFeedbackEnabled]);
  
  // Apply tactile feedback settings on mount and effect change
  useEffect(() => {
    const html = document.documentElement;
    
    // Handle tactile feedback toggle
    if (isTactileFeedbackEnabled) {
      html.classList.add('tactile-feedback-enabled');
      // Update the touch feedback system if the function is available
      if (setTactileFeedback) {
        setTactileFeedback(true);
      }
    } else {
      html.classList.remove('tactile-feedback-enabled');
      // Update the touch feedback system if the function is available
      if (setTactileFeedback) {
        setTactileFeedback(false);
      }
    }
    
    // Set transition speed CSS variable and data attribute
    let transitionSpeedValue = '280ms'; // default
    if (transitionSpeed === 'fast') {
      transitionSpeedValue = '180ms';
      html.setAttribute('data-transition-speed', 'fast');
    } else if (transitionSpeed === 'luxurious') {
      transitionSpeedValue = '450ms';
      html.setAttribute('data-transition-speed', 'luxurious');
    } else {
      html.setAttribute('data-transition-speed', 'default');
    }
    
    html.style.setProperty('--theme-transition-speed', transitionSpeedValue);
    
    // Update body class for enhanced mobile specific animations
    if (window.matchMedia('(max-width: 768px)').matches) {
      document.body.classList.add('mobile-device');
      
      // Add enhanced touch-reactive behavior on mobile
      if (isTactileFeedbackEnabled) {
        document.body.classList.add('enhanced-touch');
      } else {
        document.body.classList.remove('enhanced-touch');
      }
    } else {
      document.body.classList.remove('mobile-device');
      document.body.classList.remove('enhanced-touch');
    }
  }, [isTactileFeedbackEnabled, transitionSpeed]);

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