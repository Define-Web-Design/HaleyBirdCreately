
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

  // Initialize from localStorage on component mount
  useEffect(() => {
    const storedHighContrast = localStorage.getItem('highContrast') === 'true';
    const storedFontSize = parseInt(localStorage.getItem('fontSize') || '16');
    const storedColorMode = localStorage.getItem('colorBlindnessMode') as ColorBlindnessMode || 'normal';
    
    setHighContrast(storedHighContrast);
    setFontSize(storedFontSize);
    setColorMode(storedColorMode);
  }, []);

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`${className} hover:bg-apple-blue/10 hover:text-apple-blue transition-all`} aria-label="Accessibility Settings">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Accessibility Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] glass-panel border border-white/20 shadow-lg">
        <DropdownMenuLabel className="text-foreground/90 font-medium">Accessibility Settings</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        
        <div className="p-2">
          <div className="flex items-center justify-between mb-3 p-1 hover:bg-white/5 rounded-md transition-colors">
            <div className="flex items-center gap-2">
              <MoonStar className="h-4 w-4 text-apple-indigo" />
              <Label htmlFor="high-contrast" className="text-foreground/90">High Contrast</Label>
            </div>
            <Switch 
              id="high-contrast" 
              checked={highContrast} 
              onCheckedChange={handleHighContrastChange}
              className="data-[state=checked]:bg-apple-indigo"
            />
          </div>
          
          <div className="mb-4 p-1 hover:bg-white/5 rounded-md transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Type className="h-4 w-4 text-apple-blue" />
              <Label htmlFor="font-size" className="text-foreground/90">Font Size: {fontSize}px</Label>
            </div>
            <Slider
              id="font-size"
              value={[fontSize]}
              min={12}
              max={24}
              step={1}
              onValueChange={handleFontSizeChange}
              className="[&>[data-state=checked]]:bg-apple-blue"
            />
          </div>
          
          <div className="space-y-2 p-1 hover:bg-white/5 rounded-md transition-colors">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-apple-green" />
              <Label className="text-foreground/90">Color Vision Mode</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant={colorMode === 'normal' ? 'default' : 'outline'}
                onClick={() => handleColorModeChange('normal')}
                className={`w-full ${colorMode === 'normal' ? 'bg-apple-green text-white border-apple-green hover:bg-apple-green/90' : 'hover:border-apple-green/50 hover:text-apple-green'}`}
              >
                Normal
              </Button>
              <Button 
                size="sm" 
                variant={colorMode === 'protanopia' ? 'default' : 'outline'}
                onClick={() => handleColorModeChange('protanopia')}
                className={`w-full ${colorMode === 'protanopia' ? 'bg-apple-red text-white border-apple-red hover:bg-apple-red/90' : 'hover:border-apple-red/50 hover:text-apple-red'}`}
              >
                Protanopia
              </Button>
              <Button 
                size="sm" 
                variant={colorMode === 'deuteranopia' ? 'default' : 'outline'}
                onClick={() => handleColorModeChange('deuteranopia')}
                className={`w-full ${colorMode === 'deuteranopia' ? 'bg-apple-orange text-white border-apple-orange hover:bg-apple-orange/90' : 'hover:border-apple-orange/50 hover:text-apple-orange'}`}
              >
                Deuteranopia
              </Button>
              <Button 
                size="sm" 
                variant={colorMode === 'tritanopia' ? 'default' : 'outline'}
                onClick={() => handleColorModeChange('tritanopia')}
                className={`w-full ${colorMode === 'tritanopia' ? 'bg-apple-purple text-white border-apple-purple hover:bg-apple-purple/90' : 'hover:border-apple-purple/50 hover:text-apple-purple'}`}
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
