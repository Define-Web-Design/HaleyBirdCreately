import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Save, Loader2, RefreshCw, ChevronRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useSwipe } from '@/lib/useGestures';
import { useTheme } from '@/lib/ThemeContext';

// Color mood options
const colorMoods = [
  { value: 'ENERGETIC', label: 'Energetic' },
  { value: 'CALM', label: 'Calm' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'PLAYFUL', label: 'Playful' },
  { value: 'ELEGANT', label: 'Elegant' },
  { value: 'NOSTALGIC', label: 'Nostalgic' },
  { value: 'MYSTERIOUS', label: 'Mysterious' },
  { value: 'BOLD', label: 'Bold' },
];

interface Color {
  hex: string;
  name: string;
  role: string;
}

interface Palette {
  colors: Color[];
  moodName: string;
  description?: string;
}

interface SavedPalette {
  id: number;
  userId: number;
  name: string;
  mood: string;
  colors: string[];
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

const ColorPaletteGenerator: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>('ENERGETIC');
  const [description, setDescription] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('preset');
  const [customPalette, setCustomPalette] = useState<string[]>(['#FF5252', '#FFBC00', '#FF914D', '#FFFFFF', '#333333']);
  const [activeColorIndex, setActiveColorIndex] = useState<number>(0);
  const [paletteName, setPaletteName] = useState<string>('');
  const [paletteTags, setPaletteTags] = useState<string>('');
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { updateThemeColor } = useTheme();

  // For mobile swipe functionality
  const { swipeHandlers } = useSwipe({
    onSwipeLeft: () => {
      if (activeTab === 'preset') setActiveTab('custom');
      else if (activeTab === 'custom') setActiveTab('saved');
    },
    onSwipeRight: () => {
      if (activeTab === 'saved') setActiveTab('custom');
      else if (activeTab === 'custom') setActiveTab('preset');
    }
  });

  // Query preset palettes by mood
  const presetPalettesQuery = useQuery({
    queryKey: ['/api/color-palettes/by-mood', selectedMood],
    queryFn: () => apiRequest({
      url: `/api/color-palettes/by-mood/${selectedMood}`,
      method: 'GET'
    }),
    enabled: activeTab === 'preset',
  });

  // Query saved palettes
  const savedPalettesQuery = useQuery({
    queryKey: ['/api/color-palettes'],
    queryFn: () => apiRequest({
      url: '/api/color-palettes',
      method: 'GET'
    }),
    enabled: activeTab === 'saved',
  });

  // Mutation for generating AI palette
  const generatePaletteMutation = useMutation({
    mutationFn: (data: { mood: string, description?: string }) => 
      apiRequest({
        url: '/api/color-palettes/generate',
        method: 'POST',
        data
      }),
    onSuccess: (data) => {
      if (data.palette && data.palette.colors) {
        setCustomPalette(data.palette.colors.map((color: Color) => color.hex));
        toast({
          title: 'Palette Generated',
          description: data.palette.description || 'Your color palette has been generated.',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate color palette. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Mutation for saving palette
  const savePaletteMutation = useMutation({
    mutationFn: (data: { name: string, mood: string, colors: string[], tags: string[] }) => 
      apiRequest({
        url: '/api/color-palettes',
        method: 'POST',
        data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/color-palettes'] });
      setShowSaveForm(false);
      setPaletteName('');
      setPaletteTags('');
      toast({
        title: 'Palette Saved',
        description: 'Your color palette has been saved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Save Failed',
        description: 'Failed to save color palette. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Handle mood selection change
  const handleMoodChange = (value: string) => {
    setSelectedMood(value);
    if (activeTab === 'preset') {
      queryClient.invalidateQueries({ queryKey: ['/api/color-palettes/by-mood', value] });
    }
  };

  // Generate AI palette
  const handleGeneratePalette = () => {
    generatePaletteMutation.mutate({
      mood: selectedMood,
      description: description.trim() || undefined,
    });
  };

  // Save custom palette
  const handleSavePalette = () => {
    if (!paletteName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please provide a name for your palette.',
        variant: 'destructive',
      });
      return;
    }

    savePaletteMutation.mutate({
      name: paletteName,
      mood: selectedMood,
      colors: customPalette,
      tags: paletteTags.split(',').map(tag => tag.trim()).filter(tag => tag),
    });
  };

  // Copy color to clipboard
  const copyColorToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: 'Color Copied',
      description: `${color} copied to clipboard.`,
    });
  };

  // Apply palette to theme
  const applyPaletteToTheme = (colors: string[]) => {
    if (colors && colors.length > 0) {
      // Use the first (primary) color for the theme
      updateThemeColor(colors[0]);
      toast({
        title: 'Theme Updated',
        description: 'The color palette has been applied to the app theme.',
      });
    }
  };

  // Update custom color
  const handleColorChange = (newColor: string) => {
    const updatedPalette = [...customPalette];
    updatedPalette[activeColorIndex] = newColor;
    setCustomPalette(updatedPalette);
  };

  // Reset the form state
  useEffect(() => {
    if (activeTab === 'preset') {
      setShowSaveForm(false);
    }
  }, [activeTab]);

  // Define color role labels
  const colorRoles = ['Primary', 'Secondary', 'Accent', 'Background', 'Text'];

  return (
    <div 
      className="space-y-6 p-1 md:p-4 transition-all duration-300 ease-out" 
      style={{ transform: 'translateZ(0)' }} // Hardware acceleration for smoother animations
      {...swipeHandlers}>
      <Card>
        <CardHeader>
          <CardTitle>Mood-Based Color Palette Generator</CardTitle>
          <CardDescription>
            Create color palettes based on emotional tones to enhance your designs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mood Selection */}
          <div className="space-y-2">
            <Label htmlFor="mood">Select Emotional Mood</Label>
            <Select value={selectedMood} onValueChange={handleMoodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a mood" />
              </SelectTrigger>
              <SelectContent>
                {colorMoods.map((mood) => (
                  <SelectItem key={mood.value} value={mood.value}>
                    {mood.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabs for different palette features */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="preset">Preset Palettes</TabsTrigger>
              <TabsTrigger value="custom">Generate Custom</TabsTrigger>
              <TabsTrigger value="saved">Saved Palettes</TabsTrigger>
            </TabsList>

            {/* Preset Palettes Tab */}
            <TabsContent value="preset" className="space-y-4">
              {presetPalettesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading palettes...</span>
                </div>
              ) : presetPalettesQuery.isError ? (
                <div className="text-center py-8 text-red-500">
                  Failed to load palettes. Please try again.
                </div>
              ) : (
                <>
                  {/* Preset palette display */}
                  {presetPalettesQuery.data?.length > 0 ? (
                    <div className="space-y-6">
                      {presetPalettesQuery.data.map((palette: SavedPalette) => (
                        <div key={palette.id} className="border rounded-lg p-4 hover:shadow-md card-transition theme-aware">
                          <h3 className="font-medium mb-2">{palette.name}</h3>
                          <div className="flex mb-3">
                            {palette.colors.map((color, index) => (
                              <div
                                key={index}
                                className="h-16 w-full first:rounded-l-md last:rounded-r-md cursor-pointer relative group color-palette-item touch-responsive"
                                style={{ backgroundColor: color }}
                                onClick={() => copyColorToClipboard(color)}
                              >
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity spring-out">
                                  <Copy className="h-4 w-4 text-white haptic-pulse" />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              {palette.tags.join(', ')}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => applyPaletteToTheme(palette.colors)}
                            >
                              Apply to Theme
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No preset palettes found for this mood.
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Custom Palette Generation Tab */}
            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Describe Your Palette (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="E.g. A summer sunset by the beach, or a cozy winter evening"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleGeneratePalette}
                  disabled={generatePaletteMutation.isPending}
                  className="w-full"
                >
                  {generatePaletteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate Palette
                    </>
                  )}
                </Button>

                {/* Custom palette display */}
                <div className="pt-4">
                  <h3 className="font-medium mb-2">Your Custom Palette</h3>
                  <div className="flex mb-4 stagger-children">
                    {customPalette.map((color, index) => (
                      <div
                        key={index}
                        className={`h-16 w-full first:rounded-l-md last:rounded-r-md cursor-pointer relative group color-palette-item touch-responsive ${
                          index === activeColorIndex ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setActiveColorIndex(index)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity spring-out">
                          <div className="text-xs font-bold text-white bg-black/50 px-1 rounded haptic-pulse">
                            {colorRoles[index]}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Color picker - basic implementation without the HexColorPicker component */}
                  <div className="mb-4">
                    <Label className="mb-2 block">Adjust {colorRoles[activeColorIndex]} Color</Label>
                    <div className="flex flex-col items-center sm:flex-row sm:space-x-4">
                      <div className="w-full space-y-2">
                        <Label htmlFor="hexInput">Hex Value</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="hexInput"
                            value={customPalette[activeColorIndex]}
                            onChange={(e) => handleColorChange(e.target.value)}
                            maxLength={7}
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => copyColorToClipboard(customPalette[activeColorIndex])}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => applyPaletteToTheme(customPalette)}
                      className="flex-1"
                    >
                      Apply to Theme
                    </Button>
                    <Button onClick={() => setShowSaveForm(!showSaveForm)} className="flex-1">
                      {showSaveForm ? 'Cancel' : 'Save Palette'}
                    </Button>
                  </div>

                  {/* Save form */}
                  {showSaveForm && (
                    <div className="mt-4 p-4 border rounded-lg space-y-4">
                      <h3 className="font-medium">Save Your Palette</h3>
                      <div className="space-y-2">
                        <Label htmlFor="paletteName">Palette Name</Label>
                        <Input
                          id="paletteName"
                          value={paletteName}
                          onChange={(e) => setPaletteName(e.target.value)}
                          placeholder="My Custom Palette"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paletteTags">Tags (comma separated)</Label>
                        <Input
                          id="paletteTags"
                          value={paletteTags}
                          onChange={(e) => setPaletteTags(e.target.value)}
                          placeholder="summer, beach, sunset"
                        />
                      </div>
                      <Button
                        onClick={handleSavePalette}
                        disabled={savePaletteMutation.isPending}
                        className="w-full"
                      >
                        {savePaletteMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Palette
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Saved Palettes Tab */}
            <TabsContent value="saved" className="space-y-4">
              {savedPalettesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading your palettes...</span>
                </div>
              ) : savedPalettesQuery.isError ? (
                <div className="text-center py-8 text-red-500">
                  Failed to load your palettes. Please try again.
                </div>
              ) : (
                <>
                  {savedPalettesQuery.data?.length > 0 ? (
                    <div className="space-y-6">
                      {savedPalettesQuery.data.map((palette: SavedPalette) => (
                        <div key={palette.id} className="border rounded-lg p-4 hover:shadow-md card-transition theme-aware">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">{palette.name}</h3>
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full spring-in">
                              {palette.mood}
                            </span>
                          </div>
                          <div className="flex mb-3">
                            {palette.colors.map((color, index) => (
                              <div
                                key={index}
                                className="h-16 w-full first:rounded-l-md last:rounded-r-md cursor-pointer relative group color-palette-item touch-responsive"
                                style={{ backgroundColor: color }}
                                onClick={() => copyColorToClipboard(color)}
                              >
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity spring-out">
                                  <Copy className="h-4 w-4 text-white haptic-pulse" />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              {palette.tags.join(', ')}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => applyPaletteToTheme(palette.colors)}
                            >
                              Apply to Theme
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      You haven't saved any palettes yet. Generate and save a custom palette to see it here.
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Tip:</span> Use a palette that matches the emotional tone of your content.
          </div>
          <div className="text-sm text-muted-foreground hidden md:block">
            Swipe left/right on mobile for more options.
          </div>
        </CardFooter>
      </Card>

      {/* Mobile instructions */}
      <div className="md:hidden flex items-center justify-center text-sm text-muted-foreground">
        <ChevronRight className="h-4 w-4 transform rotate-180" />
        <span className="mx-2">Swipe to navigate tabs</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
};

export default ColorPaletteGenerator;