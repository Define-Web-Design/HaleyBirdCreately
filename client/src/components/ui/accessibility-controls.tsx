
import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from './button';
import { Tooltip } from './tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';

type ColorBlindnessMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export function AccessibilityControls() {
  const [mode, setMode] = React.useState<ColorBlindnessMode>('normal');

  React.useEffect(() => {
    const root = document.documentElement;
    
    // Remove all previous modes
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia');
    
    // Add the selected mode
    if (mode !== 'normal') {
      root.classList.add(mode);
    }
    
    // Save preference
    localStorage.setItem('colorBlindnessMode', mode);
  }, [mode]);

  // Initialize from localStorage on component mount
  React.useEffect(() => {
    const savedMode = localStorage.getItem('colorBlindnessMode') as ColorBlindnessMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  return (
    <DropdownMenu>
      <Tooltip content="Accessibility Options">
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Accessibility options">
            <Eye className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setMode('normal')}>
          Normal Vision
          {mode === 'normal' && " ✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('protanopia')}>
          Red-Blind (Protanopia)
          {mode === 'protanopia' && " ✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('deuteranopia')}>
          Green-Blind (Deuteranopia)
          {mode === 'deuteranopia' && " ✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('tritanopia')}>
          Blue-Blind (Tritanopia)
          {mode === 'tritanopia' && " ✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('achromatopsia')}>
          Complete Color Blindness
          {mode === 'achromatopsia' && " ✓"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
