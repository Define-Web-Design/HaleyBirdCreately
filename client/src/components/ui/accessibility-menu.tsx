
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  MoonStar, 
  SunMedium, 
  Type, 
  Settings
} from 'lucide-react';
import { 
  toggleHighContrast, 
  applyColorBlindnessMode, 
  ColorBlindnessMode 
} from '@/lib/a11y-utils';

interface AccessibilityMenuProps {
  className?: string;
}

export const AccessibilityMenu = ({ className }: AccessibilityMenuProps) => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [colorMode, setColorMode] = useState<ColorBlindnessMode>('normal');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Initialize from localStorage on component mount
  useEffect(() => {
    const storedHighContrast = localStorage.getItem('highContrast') === 'true';
    const storedFontSize = parseInt(localStorage.getItem('fontSize') || '16');
    const storedColorMode = localStorage.getItem('colorBlindnessMode') as ColorBlindnessMode || 'normal';
    const storedReducedMotion = localStorage.getItem('reducedMotion') === 'true';
    
    setHighContrast(storedHighContrast);
    setFontSize(storedFontSize);
    setColorMode(storedColorMode);
    setReducedMotion(storedReducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  
  // Announce changes to screen reader
  useEffect(() => {
    if (menuOpen) {
      announceToScreenReader('Accessibility menu opened', 'polite');
    }
  }, [menuOpen]);

  const handleHighContrastChange = (checked: boolean) => {
    setHighContrast(checked);
    toggleHighContrast(checked);
    localStorage.setItem('highContrast', checked.toString());
  };

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
    localStorage.setItem('fontSize', newSize.toString());
  };

  const handleColorModeChange = (mode: ColorBlindnessMode) => {
    setColorMode(mode);
    applyColorBlindnessMode(mode);
    localStorage.setItem('colorBlindnessMode', mode);
  };

  const handleReducedMotionChange = (checked: boolean) => {
    setReducedMotion(checked);
    if (checked) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    localStorage.setItem('reducedMotion', checked.toString());
    announceToScreenReader(`Reduced motion ${checked ? 'enabled' : 'disabled'}`, 'polite');
  };

  return (
    <DropdownMenu onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={className} 
          aria-label="Accessibility Settings"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setMenuOpen(!menuOpen);
            }
          }}
        >
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Accessibility Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[280px]"
        aria-label="Accessibility settings menu"
      >
        <DropdownMenuLabel>Accessibility Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MoonStar className="h-4 w-4" />
              <Label htmlFor="high-contrast">High Contrast</Label>
            </div>
            <Switch 
              id="high-contrast" 
              checked={highContrast} 
              onCheckedChange={handleHighContrastChange}
              aria-checked={highContrast}
              aria-describedby="high-contrast-description"
            />
            <span id="high-contrast-description" className="sr-only">
              {highContrast ? 'High contrast is enabled' : 'High contrast is disabled'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
            </div>
            <Switch 
              id="reduced-motion" 
              checked={reducedMotion} 
              onCheckedChange={handleReducedMotionChange}
              aria-checked={reducedMotion}
              aria-describedby="reduced-motion-description"
            />
            <span id="reduced-motion-description" className="sr-only">
              {reducedMotion ? 'Reduced motion is enabled' : 'Reduced motion is disabled'}
            </span>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Type className="h-4 w-4" />
              <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
            </div>
            <Slider
              id="font-size"
              value={[fontSize]}
              min={12}
              max={24}
              step={1}
              onValueChange={handleFontSizeChange}
              aria-valuemin={12}
              aria-valuemax={24}
              aria-valuenow={fontSize}
              aria-valuetext={`${fontSize} pixels`}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <Label id="color-vision-label">Color Vision Mode</Label>
            </div>
            <div 
              className="grid grid-cols-2 gap-2" 
              role="radiogroup" 
              aria-labelledby="color-vision-label"
            >
              <Button 
                size="sm" 
                variant={colorMode === 'normal' ? 'default' : 'outline'}
                onClick={() => handleColorModeChange('normal')}
                className="w-full"
                aria-checked={colorMode === 'normal'}
                role="radio"
              >
                Normal
              </Button>
              <Button 
                size="sm" 
                variant={colorMode === 'protanopia' ? 'default' : 'outline'}
                onClick={() => handleColorModeChange('protanopia')}
                className="w-full"
                aria-checked={colorMode === 'protanopia'}
                role="radio"
              >
                Protanopia
              </Button>
              <Button 
                size="sm" 
                variant={colorMode === 'deuteranopia' ? 'default' : 'outline'}
                onClick={() => handleColorModeChange('deuteranopia')}
                className="w-full"
                aria-checked={colorMode === 'deuteranopia'}
                role="radio"
              >
                Deuteranopia
              </Button>
              <Button 
                size="sm" 
                variant={colorMode === 'tritanopia' ? 'default' : 'outline'}
                onClick={() => handleColorModeChange('tritanopia')}
                className="w-full"
                aria-checked={colorMode === 'tritanopia'}
                role="radio"
              >
                Tritanopia
              </Button>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
