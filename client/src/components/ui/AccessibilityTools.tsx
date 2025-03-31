
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
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AccessibilityState {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexicFont: boolean;
  lineSpacing: number;
}

interface AccessibilityToolsProps {
  onSettingsChange: (settings: AccessibilityState) => void;
  initialSettings?: Partial<AccessibilityState>;
}

export default function AccessibilityTools({ 
  onSettingsChange, 
  initialSettings = {}
}: AccessibilityToolsProps) {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<AccessibilityState>({
    fontSize: initialSettings.fontSize || 16,
    highContrast: initialSettings.highContrast || false,
    reducedMotion: initialSettings.reducedMotion || false,
    dyslexicFont: initialSettings.dyslexicFont || false,
    lineSpacing: initialSettings.lineSpacing || 1.5,
  });

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  // Apply settings when they change
  useEffect(() => {
    onSettingsChange(settings);
    
    // Apply settings to document
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
    
    if (settings.highContrast) {
      document.documentElement.classList.add('contrast-high');
    } else {
      document.documentElement.classList.remove('contrast-high');
    }
    
    if (settings.reducedMotion) {
      document.documentElement.classList.add('motion-reduce');
    } else {
      document.documentElement.classList.remove('motion-reduce');
    }
    
    if (settings.dyslexicFont) {
      document.documentElement.classList.add('dyslexic-font');
      // Dynamically load OpenDyslexic font if not already loaded
      if (!document.getElementById('dyslexic-font')) {
        const link = document.createElement('link');
        link.id = 'dyslexic-font';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/dist/opendyslexic/opendyslexic.css';
        document.head.appendChild(link);
      }
    } else {
      document.documentElement.classList.remove('dyslexic-font');
    }
    
    document.documentElement.style.setProperty('--line-height-base', `${settings.lineSpacing}`);
    
  }, [settings, onSettingsChange]);

  const handleFontSizeChange = (value: number[]) => {
    setSettings(prev => ({ ...prev, fontSize: value[0] }));
  };

  const handleLineSpacingChange = (value: number[]) => {
    setSettings(prev => ({ ...prev, lineSpacing: value[0] }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => {
      const newValue = !prev.highContrast;
      if (newValue) {
        toast({
          title: "High contrast mode enabled",
          description: "Improving visibility of content",
          duration: 3000
        });
      }
      return { ...prev, highContrast: newValue };
    });
  };

  const toggleReducedMotion = () => {
    setSettings(prev => {
      const newValue = !prev.reducedMotion;
      if (newValue) {
        toast({
          title: "Reduced motion enabled",
          description: "Minimizing animations for comfort",
          duration: 3000
        });
      }
      return { ...prev, reducedMotion: newValue };
    });
  };

  const toggleDyslexicFont = () => {
    setSettings(prev => {
      const newValue = !prev.dyslexicFont;
      if (newValue) {
        toast({
          title: "Dyslexic friendly font enabled",
          description: "Using OpenDyslexic font for improved readability",
          duration: 3000
        });
      }
      return { ...prev, dyslexicFont: newValue };
    });
  };

  const resetDefaults = () => {
    setSettings({
      fontSize: 16,
      highContrast: false,
      reducedMotion: false,
      dyslexicFont: false,
      lineSpacing: 1.5,
    });
    
    toast({
      title: "Settings reset",
      description: "Accessibility settings have been reset to defaults",
      duration: 3000
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative"
          aria-label="Accessibility settings"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m4.93 4.93 4.24 4.24" />
            <path d="m14.83 9.17 4.24-4.24" />
            <path d="m14.83 14.83 4.24 4.24" />
            <path d="m9.17 14.83-4.24 4.24" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          {(settings.highContrast || settings.reducedMotion || settings.dyslexicFont) && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h3 className="font-medium text-lg mb-2">Accessibility Settings</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="font-size">Font Size: {settings.fontSize}px</Label>
            </div>
            <Slider
              id="font-size"
              min={12}
              max={24}
              step={1}
              value={[settings.fontSize]}
              onValueChange={handleFontSizeChange}
              aria-label="Adjust font size"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="line-spacing">Line Spacing: {settings.lineSpacing.toFixed(1)}</Label>
            </div>
            <Slider
              id="line-spacing"
              min={1}
              max={2.5}
              step={0.1}
              value={[settings.lineSpacing]}
              onValueChange={handleLineSpacingChange}
              aria-label="Adjust line spacing"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast">High Contrast</Label>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={toggleHighContrast}
              aria-label="Toggle high contrast mode"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="reduced-motion">Reduced Motion</Label>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={toggleReducedMotion}
              aria-label="Toggle reduced motion"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="dyslexic-font">Dyslexic Friendly Font</Label>
            <Switch
              id="dyslexic-font"
              checked={settings.dyslexicFont}
              onCheckedChange={toggleDyslexicFont}
              aria-label="Toggle dyslexic font"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetDefaults}
            className="w-full mt-2"
          >
            Reset to Defaults
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
