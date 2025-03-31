
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ZoomIn, ZoomOut, Eye, Sun, Moon } from "lucide-react";
import { useTheme } from '@/lib/hooks/use-theme';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface AccessibilityPanelProps {
  fontSize: number;
  setFontSize: (size: number | ((prev: number) => number)) => void;
  highContrast: boolean;
  setHighContrast: (contrast: boolean | ((prev: boolean) => boolean)) => void;
  reducedMotion: boolean;
  setReducedMotion: (motion: boolean | ((prev: boolean) => boolean)) => void;
}

export function AccessibilityPanel({
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  reducedMotion,
  setReducedMotion
}: AccessibilityPanelProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Accessibility Settings</CardTitle>
        <CardDescription>Customize your experience for better accessibility</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Dark Mode</label>
            <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-gray-500" />
            <Switch 
              checked={isDark} 
              onCheckedChange={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="data-[state=checked]:bg-primary"
            />
            <Moon className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">High Contrast</label>
            <p className="text-sm text-muted-foreground">Increase contrast for better readability</p>
          </div>
          <Switch 
            checked={highContrast} 
            onCheckedChange={setHighContrast}
            aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
            className="data-[state=checked]:bg-primary"
          />
        </div>
        
        <div className="space-y-2">
          <label className="font-medium">Text Size</label>
          <p className="text-sm text-muted-foreground">Adjust the size of text throughout the application</p>
          <div className="flex items-center gap-4 mt-2">
            <Button 
              variant="outline" 
              onClick={() => setFontSize(s => Math.max(s - 2, 12))}
              aria-label="Decrease text size"
            >
              <ZoomOut className="h-4 w-4 mr-2" />
              Smaller
            </Button>
            <span className="min-w-[60px] text-center">{fontSize}px</span>
            <Button 
              variant="outline"
              onClick={() => setFontSize(s => Math.min(s + 2, 24))}
              aria-label="Increase text size"
            >
              <ZoomIn className="h-4 w-4 mr-2" />
              Larger
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Reduced Motion</label>
            <p className="text-sm text-muted-foreground">Minimize animations throughout the interface</p>
          </div>
          <Switch 
            checked={reducedMotion} 
            onCheckedChange={setReducedMotion}
            aria-label={reducedMotion ? "Enable animations" : "Reduce animations"}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </CardContent>
    </Card>
  );
}
