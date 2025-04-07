import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ChevronRight, Copy, RefreshCw, Lightbulb, Sun, Moon, Palette, ArrowRight } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

// Predefined color psychology insights
const colorPsychology = {
  red: {
    emotion: 'Energy, Passion, Urgency',
    insight: 'Red can increase heart rate and evoke strong emotions. Great for calls-to-action, but use sparingly to avoid overwhelming users.',
    pairsWith: ['White', 'Black', 'Gray', 'Gold']
  },
  orange: {
    emotion: 'Enthusiasm, Creativity, Stimulation',
    insight: 'Orange combines the energy of red with the happiness of yellow. It can promote a sense of wellness and enthusiasm.',
    pairsWith: ['Blue', 'White', 'Green', 'Purple']
  },
  yellow: {
    emotion: 'Optimism, Clarity, Warmth',
    insight: 'Yellow captures attention and signifies positivity. It can enhance concentration but may cause eye fatigue in excess.',
    pairsWith: ['Purple', 'Blue', 'Gray', 'Black']
  },
  green: {
    emotion: 'Growth, Harmony, Safety',
    insight: 'Green balances heart and mind, creating equilibrium. Associated with nature and relaxation for easy viewing.',
    pairsWith: ['White', 'Beige', 'Brown', 'Blue']
  },
  blue: {
    emotion: 'Trust, Serenity, Intelligence',
    insight: 'Blue promotes feelings of calmness and security. Widely accepted and can improve focus and trust.',
    pairsWith: ['Orange', 'White', 'Gray', 'Yellow']
  },
  purple: {
    emotion: 'Creativity, Wisdom, Luxury',
    insight: 'Purple combines the stability of blue and energy of red. It suggests luxury, ambition, and creative thinking.',
    pairsWith: ['Gold', 'Green', 'White', 'Pink']
  },
  pink: {
    emotion: 'Nurturing, Compassion, Romance',
    insight: 'Pink is soothing and represents care and affection. It can reduce aggression and inspire comfort.',
    pairsWith: ['Gray', 'White', 'Navy', 'Mint']
  },
  brown: {
    emotion: 'Reliability, Support, Earthiness',
    insight: 'Brown suggests stability and reliability. It creates a sense of structure and support, connecting to nature.',
    pairsWith: ['Cream', 'Green', 'Turquoise', 'Gold']
  },
  black: {
    emotion: 'Sophistication, Authority, Elegance',
    insight: 'Black signifies power and sophistication. It can make other colors appear more vibrant when used as a background.',
    pairsWith: ['White', 'Gold', 'Red', 'Any bright color']
  },
  white: {
    emotion: 'Purity, Simplicity, Clarity',
    insight: 'White represents cleanliness and simplicity. It creates a sense of space and freedom in design.',
    pairsWith: ['Any color', 'Especially vibrant ones']
  },
  gray: {
    emotion: 'Balance, Neutrality, Sophistication',
    insight: 'Gray is the ultimate neutral, creating a sense of calm and balance. Perfect as a base for more vibrant accent colors.',
    pairsWith: ['Pink', 'Blue', 'Purple', 'Yellow']
  },
  teal: {
    emotion: 'Clarity, Balance, Refreshment',
    insight: 'Teal combines the calming properties of blue with the renewal qualities of green. It suggests clarity of thought.',
    pairsWith: ['Coral', 'White', 'Gold', 'Navy']
  }
};

// Color personalities for adaptive themes
const colorPersonalities = [
  { 
    name: 'Professional', 
    description: 'Clean, trustworthy, and structured palette',
    primary: '#0A66C2',
    lightBg: '#F5F9FF',
    darkBg: '#1A1A2E',
    accent: '#38BDF8'
  },
  { 
    name: 'Creative', 
    description: 'Vibrant, inspiring, and energetic colors',
    primary: '#8B5CF6',
    lightBg: '#F9F5FF',
    darkBg: '#2D1B69',
    accent: '#FB7185'
  },
  { 
    name: 'Peaceful', 
    description: 'Calming, balanced, and gentle tones',
    primary: '#10B981',
    lightBg: '#ECFDF5',
    darkBg: '#064E3B',
    accent: '#A7F3D0'
  },
  { 
    name: 'Elegant', 
    description: 'Sophisticated, luxurious, and refined',
    primary: '#9333EA',
    lightBg: '#F5F3FF',
    darkBg: '#3B0764',
    accent: '#D8B4FE'
  },
  { 
    name: 'Energetic', 
    description: 'Bold, dynamic, and attention-grabbing',
    primary: '#F43F5E',
    lightBg: '#FFF1F2',
    darkBg: '#881337',
    accent: '#FCA5A5'
  },
  { 
    name: 'Natural', 
    description: 'Earthy, organic, and grounding palette',
    primary: '#65A30D',
    lightBg: '#F7FEE7',
    darkBg: '#365314',
    accent: '#BEF264'
  },
];

interface AdaptiveThemeProps {}

const AdaptiveThemeGenerator: React.FC<AdaptiveThemeProps> = () => {
  const { updateThemeColor, isDarkMode } = useTheme();
  const [selectedColor, setSelectedColor] = useState<string>('#3B82F6');
  const [saturation, setSaturation] = useState<number>(100);
  const [lightness, setLightness] = useState<number>(50);
  const [activeTab, setActiveTab] = useState<string>('personality');
  const [selectedPersonality, setSelectedPersonality] = useState<string>('Professional');
  const [autoAdapt, setAutoAdapt] = useState<boolean>(false);
  const [customColorName, setCustomColorName] = useState<string>('');
  const [showInsights, setShowInsights] = useState<boolean>(true);
  
  // Detect dominant color family for psychology insights
  const dominantColorFamily = useMemo(() => {
    // Convert hex to RGB
    const hex = selectedColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Determine the dominant color family
    const max = Math.max(r, g, b);
    if (r === g && g === b) return 'gray';
    if (max < 50) return 'black';
    if (max > 200 && r > 200 && g > 200 && b > 200) return 'white';
    
    if (r === max) {
      if (g > 150) return 'yellow';
      if (g > 100) return 'orange';
      return 'red';
    }
    if (g === max) {
      if (b > 150) return 'teal';
      if (r > 150) return 'yellow';
      return 'green';
    }
    if (b === max) {
      if (r > 150) return 'purple';
      if (r > 100) return 'purple';
      return 'blue';
    }
    
    // Default fallback
    return 'blue';
  }, [selectedColor]);
  
  // Color psychology insights based on selected color
  const colorInsights = useMemo(() => {
    return colorPsychology[dominantColorFamily as keyof typeof colorPsychology] || 
           colorPsychology.blue; // Fallback to blue if not found
  }, [dominantColorFamily]);
  
  // Generate derived color palette based on primary color
  const derivedPalette = useMemo(() => {
    // Convert hex to HSL for easier manipulation
    const hex = selectedColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h = h / 6;
    }
    
    // Adjust hue to create complementary colors
    const hueComplementary = (h + 0.5) % 1;
    const hueAnalogous1 = (h + 0.083) % 1; // +30 degrees
    const hueAnalogous2 = (h - 0.083 + 1) % 1; // -30 degrees
    const hueSplit1 = (h + 0.417) % 1; // +150 degrees
    const hueSplit2 = (h - 0.417 + 1) % 1; // -150 degrees
    
    // Helper to convert HSL to hex
    const hslToHex = (h: number, s: number, l: number) => {
      let r, g, b;
      
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };
    
    // Generate shades of primary color
    const lighter = hslToHex(h, s, Math.min(0.9, l + 0.2));
    const darker = hslToHex(h, s, Math.max(0.2, l - 0.2));
    
    // Generate complementary and accent colors
    const complementary = hslToHex(hueComplementary, s, l);
    const analogous1 = hslToHex(hueAnalogous1, s, l);
    const analogous2 = hslToHex(hueAnalogous2, s, l);
    const split1 = hslToHex(hueSplit1, s * 0.8, l);
    const split2 = hslToHex(hueSplit2, s * 0.8, l);
    
    // Background colors for light/dark modes
    const lightBg = hslToHex(h, 0.05, 0.98);
    const darkBg = hslToHex(h, 0.3, 0.1);
    
    return {
      primary: selectedColor,
      lighter,
      darker,
      complementary,
      analogous1,
      analogous2,
      split1,
      split2,
      lightBg,
      darkBg
    };
  }, [selectedColor]);
  
  // Generate a personalized theme
  const personalityTheme = useMemo(() => {
    const personality = colorPersonalities.find(p => p.name === selectedPersonality);
    if (!personality) return derivedPalette;
    
    // Use the personality's primary color to derive everything else
    const baseColor = personality.primary;
    // We need to compute a derived palette for this specific personality color
    // but then combine it with the explicit personality colors
    
    // Convert to a derived palette (this is a simplified version to avoid code duplication)
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h = h / 6;
    }
    
    // Get derived values from personality primary color
    const personalityDerived = {
      complementary: derivedPalette.complementary,
      analogous1: derivedPalette.analogous1, 
      analogous2: derivedPalette.analogous2,
      split1: derivedPalette.split1,
      split2: derivedPalette.split2,
      lighter: derivedPalette.lighter,
      darker: derivedPalette.darker
    };
    
    return {
      // Explicitly defined personality colors take precedence
      primary: personality.primary,
      lightBg: personality.lightBg,
      darkBg: personality.darkBg,
      accent: personality.accent,
      // Include derived colors
      ...personalityDerived
    };
  }, [selectedPersonality, derivedPalette]);
  
  // Handle primary color change
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };
  
  // Apply theme to app
  const applyTheme = (color: string = selectedColor) => {
    updateThemeColor(color);
    toast({
      title: "Theme Applied",
      description: "Your custom theme has been applied to the application.",
    });
  };
  
  // Apply adaptive personality theme
  const applyPersonalityTheme = () => {
    const personality = colorPersonalities.find(p => p.name === selectedPersonality);
    if (personality) {
      updateThemeColor(personality.primary);
      toast({
        title: `${personality.name} Theme Applied`,
        description: personality.description,
      });
    }
  };
  
  // Apply color with adjusted saturation and lightness
  const applyAdjustedColor = () => {
    // Convert hex to HSL
    const hex = selectedColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h = h / 6;
    }
    
    // Apply saturation and lightness adjustments
    s = saturation / 100;
    l = lightness / 100;
    
    // Convert back to hex
    const hslToHex = (h: number, s: number, l: number) => {
      let r, g, b;
      
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };
    
    const adjustedColor = hslToHex(h, s, l);
    updateThemeColor(adjustedColor);
    setSelectedColor(adjustedColor);
    
    toast({
      title: "Adjusted Theme Applied",
      description: `Color adjusted to ${adjustedColor.toUpperCase()}`,
    });
  };
  
  // Copy a color to clipboard
  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: "Color Copied",
      description: `${color.toUpperCase()} copied to clipboard.`,
    });
  };
  
  // Auto-adapt to current color on tab switch
  useEffect(() => {
    if (autoAdapt && activeTab === 'personality') {
      applyPersonalityTheme();
    }
  }, [autoAdapt, activeTab, selectedPersonality]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adjustable Color Section */}
        <Card>
          <CardHeader>
            <CardTitle>Adaptive Theme Generator</CardTitle>
            <CardDescription>
              Create harmonious color themes that adapt to different contexts
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="personality">
                  <Palette className="h-4 w-4 mr-2" />
                  Theme Personalities
                </TabsTrigger>
                <TabsTrigger value="custom">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Custom Adjustment
                </TabsTrigger>
              </TabsList>
              
              {/* Theme Personalities Tab */}
              <TabsContent value="personality" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personality">Select a Theme Personality</Label>
                  <Select 
                    value={selectedPersonality} 
                    onValueChange={setSelectedPersonality}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a personality" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorPersonalities.map((personality) => (
                        <SelectItem 
                          key={personality.name} 
                          value={personality.name}
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: personality.primary }}
                            />
                            {personality.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-2">
                  {colorPersonalities
                    .filter(p => p.name === selectedPersonality)
                    .map((personality) => (
                      <div key={personality.name} className="space-y-3">
                        <p className="text-sm text-muted-foreground">{personality.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="mb-1 block text-xs">Light Mode</Label>
                            <div className="h-20 rounded-md p-3 flex items-end"
                                style={{ backgroundColor: personality.lightBg }}>
                              <div className="flex space-x-1">
                                <div className="w-6 h-6 rounded-full"
                                    style={{ backgroundColor: personality.primary }} />
                                <div className="w-6 h-6 rounded-full"
                                    style={{ backgroundColor: personality.accent }} />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="mb-1 block text-xs">Dark Mode</Label>
                            <div className="h-20 rounded-md p-3 flex items-end"
                                style={{ backgroundColor: personality.darkBg }}>
                              <div className="flex space-x-1">
                                <div className="w-6 h-6 rounded-full"
                                    style={{ backgroundColor: personality.primary }} />
                                <div className="w-6 h-6 rounded-full"
                                    style={{ backgroundColor: personality.accent }} />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full"
                          onClick={applyPersonalityTheme}
                        >
                          Apply {personality.name} Theme
                        </Button>
                      </div>
                    ))}
                </div>
                
                <div className="pt-2 flex items-center space-x-2">
                  <Switch
                    id="autoAdapt"
                    checked={autoAdapt}
                    onCheckedChange={setAutoAdapt}
                  />
                  <Label htmlFor="autoAdapt">Auto-adapt when switching themes</Label>
                </div>
              </TabsContent>
              
              {/* Custom Color Adjustment Tab */}
              <TabsContent value="custom" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="colorInput">Primary Color</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        id="colorInput"
                        type="color"
                        value={selectedColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-12 h-12 p-1 cursor-pointer"
                      />
                      <Input
                        value={selectedColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        maxLength={7}
                        placeholder="#RRGGBB"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(selectedColor)}
                        title="Copy hex code"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="saturation">Saturation: {saturation}%</Label>
                    </div>
                    <Slider
                      id="saturation"
                      min={0}
                      max={100}
                      step={1}
                      value={[saturation]}
                      onValueChange={(value) => setSaturation(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="lightness">Lightness: {lightness}%</Label>
                    </div>
                    <Slider
                      id="lightness"
                      min={0}
                      max={100}
                      step={1}
                      value={[lightness]}
                      onValueChange={(value) => setLightness(value[0])}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button
                      className="w-full"
                      onClick={applyAdjustedColor}
                    >
                      Apply Adjusted Color
                    </Button>
                  </div>
                  
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSaturation(100);
                        setLightness(50);
                      }}
                    >
                      Reset Adjustments
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Color Psychology Insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <span>Color Psychology</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto" 
                onClick={() => setShowInsights(!showInsights)}
              >
                <Lightbulb className="h-5 w-5" />
              </Button>
            </CardTitle>
            <CardDescription>
              Understand the emotional impact of your color choices
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-5">
            {showInsights && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-full" 
                    style={{ backgroundColor: selectedColor }}
                  />
                  <div>
                    <div className="text-sm font-medium">
                      {customColorName || dominantColorFamily.charAt(0).toUpperCase() + dominantColorFamily.slice(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedColor.toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-auto">
                    {isDarkMode ? (
                      <Moon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Sun className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Evokes:</div>
                  <div className="bg-primary/10 px-3 py-2 rounded-md text-sm">
                    {colorInsights.emotion}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Insight:</div>
                  <div className="bg-muted px-3 py-2 rounded-md text-sm">
                    {colorInsights.insight}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Pairs well with:</div>
                  <div className="flex flex-wrap gap-1">
                    {colorInsights && colorInsights.pairsWith && Array.isArray(colorInsights.pairsWith) ? 
                      colorInsights.pairsWith.map((color: string, index: number) => (
                        <div key={index} className="text-xs bg-muted px-2 py-1 rounded-md">
                          {color}
                        </div>
                      ))
                    : (
                      <div className="text-xs bg-muted px-2 py-1 rounded-md">
                        Neutral colors
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Display Generated Palette */}
            <div className="pt-2 space-y-2">
              <Label className="flex items-center justify-between">
                <span>Generated Palette</span>
                <span className="text-xs text-muted-foreground">
                  Click any color to copy
                </span>
              </Label>
              
              <div className="grid grid-cols-5 gap-1 mb-2">
                <div
                  className="h-12 col-span-2 rounded-l-md cursor-pointer"
                  style={{ backgroundColor: derivedPalette.primary }}
                  onClick={() => copyToClipboard(derivedPalette.primary)}
                  title="Primary"
                />
                <div
                  className="h-12 col-span-1 cursor-pointer"
                  style={{ backgroundColor: derivedPalette.analogous1 }}
                  onClick={() => copyToClipboard(derivedPalette.analogous1)}
                  title="Analogous 1"
                />
                <div
                  className="h-12 col-span-1 cursor-pointer"
                  style={{ backgroundColor: derivedPalette.analogous2 }}
                  onClick={() => copyToClipboard(derivedPalette.analogous2)}
                  title="Analogous 2"
                />
                <div
                  className="h-12 col-span-1 rounded-r-md cursor-pointer"
                  style={{ backgroundColor: derivedPalette.complementary }}
                  onClick={() => copyToClipboard(derivedPalette.complementary)}
                  title="Complementary"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <div
                  className="h-8 rounded-l-md cursor-pointer"
                  style={{ backgroundColor: derivedPalette.lighter }}
                  onClick={() => copyToClipboard(derivedPalette.lighter)}
                  title="Lighter shade"
                />
                <div
                  className="h-8 rounded-r-md cursor-pointer"
                  style={{ backgroundColor: derivedPalette.darker }}
                  onClick={() => copyToClipboard(derivedPalette.darker)}
                  title="Darker shade"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-1 mt-1">
                <div
                  className="h-8 rounded-l-md cursor-pointer"
                  style={{ backgroundColor: derivedPalette.split1 }}
                  onClick={() => copyToClipboard(derivedPalette.split1)}
                  title="Split complementary 1"
                />
                <div
                  className="h-8 rounded-r-md cursor-pointer"
                  style={{ backgroundColor: derivedPalette.split2 }}
                  onClick={() => copyToClipboard(derivedPalette.split2)}
                  title="Split complementary 2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-1 mt-1">
                <div className="h-8 rounded-l-md cursor-pointer relative overflow-hidden"
                     style={{ backgroundColor: derivedPalette.lightBg }}
                     onClick={() => copyToClipboard(derivedPalette.lightBg)}
                     title="Light mode background">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="h-8 rounded-r-md cursor-pointer relative overflow-hidden"
                     style={{ backgroundColor: derivedPalette.darkBg }}
                     onClick={() => copyToClipboard(derivedPalette.darkBg)}
                     title="Dark mode background">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Moon className="h-4 w-4 text-white/70" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button
              className="w-full"
              onClick={() => applyTheme()}
            >
              Apply Theme to App
            </Button>
            
            <div className="text-xs text-center text-muted-foreground py-1">
              Switch between light and dark mode to see how your theme adapts
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Mobile Instructions */}
      <div className="md:hidden flex items-center justify-center text-sm text-muted-foreground">
        <ChevronRight className="h-4 w-4 transform rotate-180" />
        <span className="mx-2">Swipe to navigate tabs</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
};

export default AdaptiveThemeGenerator;