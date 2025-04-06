import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/lib/hooks/use-theme';
import { ImageIcon, Sparkles, RefreshCw, Download, CheckIcon, PanelLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface AdaptiveThemeGeneratorProps {
  onThemeGenerated?: (theme: ColorTheme) => void;
}

// Function to convert HSL to Hex color
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Function to generate complementary color
const getComplementaryColor = (hex: string): string => {
  // Remove the # if present
  const cleanHex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);
  
  // Get complementary colors (255 - color)
  const compR = 255 - r;
  const compG = 255 - g;
  const compB = 255 - b;
  
  // Convert back to hex
  return `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
};

// Function to adjust color brightness
const adjustBrightness = (hex: string, percent: number): string => {
  // Remove the # if present
  const cleanHex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);
  
  // Adjust brightness
  const adjustR = Math.max(0, Math.min(255, Math.round(r * (1 + percent / 100))));
  const adjustG = Math.max(0, Math.min(255, Math.round(g * (1 + percent / 100))));
  const adjustB = Math.max(0, Math.min(255, Math.round(b * (1 + percent / 100))));
  
  // Convert back to hex
  return `#${adjustR.toString(16).padStart(2, '0')}${adjustG.toString(16).padStart(2, '0')}${adjustB.toString(16).padStart(2, '0')}`;
};

const AdaptiveThemeGenerator: React.FC<AdaptiveThemeGeneratorProps> = ({ onThemeGenerated }) => {
  const [baseColor, setBaseColor] = useState('#3498DB');
  const [isGenerating, setIsGenerating] = useState(false);
  const [contrast, setContrast] = useState(50);
  const [harmony, setHarmony] = useState('complementary');
  const [brightness, setBrightness] = useState(0);
  const [applyToAppTheme, setApplyToAppTheme] = useState(false);
  const [generatedTheme, setGeneratedTheme] = useState<ColorTheme | null>(null);
  
  const { toast } = useToast();
  const { setActivePalette } = useTheme();
  
  // Generate a theme based on current settings
  const generateTheme = () => {
    setIsGenerating(true);
    
    // Simulate processing delay for effect
    setTimeout(() => {
      let primaryColor = baseColor;
      let secondaryColor = '';
      let accentColor = '';
      let backgroundColor = '';
      let textColor = '';
      
      // Generate theme based on selected harmony
      switch (harmony) {
        case 'complementary':
          secondaryColor = getComplementaryColor(primaryColor);
          accentColor = adjustBrightness(primaryColor, 20);
          break;
        case 'analogous':
          // Convert to HSL, adjust hue by 30 degrees
          secondaryColor = adjustHue(primaryColor, 30);
          accentColor = adjustHue(primaryColor, -30);
          break;
        case 'triadic':
          secondaryColor = adjustHue(primaryColor, 120);
          accentColor = adjustHue(primaryColor, 240);
          break;
        case 'monochromatic':
          secondaryColor = adjustBrightness(primaryColor, 30);
          accentColor = adjustBrightness(primaryColor, -30);
          break;
        default:
          secondaryColor = getComplementaryColor(primaryColor);
          accentColor = adjustBrightness(primaryColor, 20);
      }
      
      // Adjust for contrast preference
      if (contrast > 50) {
        // Higher contrast
        backgroundColor = '#FFFFFF';
        textColor = '#000000';
      } else {
        // Lower contrast
        backgroundColor = '#F8F9FA';
        textColor = '#212529';
      }
      
      // Adjust brightness
      if (brightness !== 0) {
        primaryColor = adjustBrightness(primaryColor, brightness);
        secondaryColor = adjustBrightness(secondaryColor, brightness);
        accentColor = adjustBrightness(accentColor, brightness);
      }
      
      const theme: ColorTheme = {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        background: backgroundColor,
        text: textColor
      };
      
      setGeneratedTheme(theme);
      
      // Notify with toast
      toast({
        title: "Theme Generated",
        description: "Your adaptive theme has been created",
      });
      
      // Apply to app theme if selected
      if (applyToAppTheme) {
        applyThemeToApp(theme);
      }
      
      // Pass to parent if callback provided
      if (onThemeGenerated) {
        onThemeGenerated(theme);
      }
      
      setIsGenerating(false);
    }, 800);
  };
  
  // Apply the generated theme to the application
  const applyThemeToApp = (theme: ColorTheme) => {
    setActivePalette({
      primary: theme.primary,
      accent: theme.accent,
      background: theme.background,
      isPaletteActive: true
    });
    
    toast({
      title: "Theme Applied",
      description: "The generated theme has been applied to the application",
    });
  };
  
  // Download theme as JSON
  const downloadThemeJson = () => {
    if (!generatedTheme) return;
    
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(generatedTheme, null, 2)
    )}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'adaptive-theme.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Theme Downloaded",
      description: "Your adaptive theme has been downloaded as JSON",
    });
  };
  
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Adaptive Theme Generator
        </CardTitle>
        <CardDescription>
          Create a cohesive theme based on a single color, automatically calculating complementary and accent colors
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="baseColor">Base Color</Label>
          <div className="flex gap-2">
            <Input
              id="baseColor"
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-14 h-10 p-1"
            />
            <Input
              type="text"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="flex-1"
              placeholder="#3498DB"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Color Harmony</Label>
          <div className="flex flex-wrap gap-2">
            {['complementary', 'analogous', 'triadic', 'monochromatic'].map((mode) => (
              <Badge
                key={mode}
                variant={harmony === mode ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 capitalize"
                onClick={() => setHarmony(mode)}
              >
                {mode}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="contrast">Contrast</Label>
            <span className="text-xs text-muted-foreground">{contrast}%</span>
          </div>
          <Slider
            id="contrast"
            min={0}
            max={100}
            step={1}
            value={[contrast]}
            onValueChange={(value) => setContrast(value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Subtle</span>
            <span>Strong</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="brightness">Brightness</Label>
            <span className="text-xs text-muted-foreground">{brightness > 0 ? '+' : ''}{brightness}%</span>
          </div>
          <Slider
            id="brightness"
            min={-30}
            max={30}
            step={5}
            value={[brightness]}
            onValueChange={(value) => setBrightness(value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Darker</span>
            <span>Brighter</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="applyToAppTheme"
            checked={applyToAppTheme}
            onCheckedChange={setApplyToAppTheme}
          />
          <Label htmlFor="applyToAppTheme">Apply to application theme</Label>
        </div>
        
        <Button
          className="w-full"
          onClick={generateTheme}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Adaptive Theme
            </>
          )}
        </Button>
        
        {generatedTheme && (
          <div className="pt-2 space-y-4">
            <h3 className="text-lg font-medium">Generated Theme</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {Object.entries(generatedTheme).map(([key, color]) => (
                <div key={key} className="space-y-1">
                  <div 
                    className="h-10 sm:h-12 rounded-md cursor-pointer hover:transform hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                    title={`${key}: ${color}`}
                    onClick={() => {
                      navigator.clipboard.writeText(color);
                      toast({
                        title: "Color Copied",
                        description: `${color} copied to clipboard`,
                      });
                    }}
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between text-xs">
                    <span className="capitalize truncate">{key}</span>
                    <span className="text-muted-foreground text-xs">{color}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={downloadThemeJson}
              >
                <Download className="h-4 w-4" />
                Download Theme
              </Button>
              
              {!applyToAppTheme && (
                <Button
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => applyThemeToApp(generatedTheme)}
                >
                  <CheckIcon className="h-4 w-4" />
                  Apply Theme
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to adjust hue
const adjustHue = (hex: string, degrees: number): string => {
  // Remove the # if present
  const cleanHex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
  const b = parseInt(cleanHex.substr(4, 2), 16) / 255;
  
  // Find max and min values to determine hue
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  // Convert to degrees (0-360)
  h = Math.round(h * 360);
  
  // Adjust hue
  h = (h + degrees) % 360;
  if (h < 0) h += 360; // Handle negative values
  
  // Convert back to hex
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return hslToHex(h, s, l);
};

export default AdaptiveThemeGenerator;