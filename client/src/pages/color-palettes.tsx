import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/lib/hooks/use-theme';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Edit, Download, Plus, Sparkles, PanelLeftOpen, Palette, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import PaletteGenerator from '@/components/color-palettes/PaletteGenerator';
import VoiceColorSelector from '@/components/color-palettes/VoiceColorSelector';
import ColorTheoryTutorial from '@/components/color-palettes/ColorTheoryTutorial';
import AdaptiveThemeGenerator from '@/components/color-palettes/AdaptiveThemeGenerator';
import SocialMediaSharing from '@/components/color-palettes/SocialMediaSharing';
import { MoodLoadingGroup } from '@/components/ui/mood-loading';

// Define the ColorPalette type
interface ColorPalette {
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

// Define interface for new palette creation
interface NewPalette {
  name: string;
  mood: string;
  colors: string[];
  tags: string[];
  isFavorite: boolean;
}

// Mock moods for the mood selector
const MOODS = [
  { value: 'happy', label: 'Happy', color: '#FFD166' },
  { value: 'calm', label: 'Calm', color: '#457B9D' },
  { value: 'energetic', label: 'Energetic', color: '#EF476F' },
  { value: 'melancholic', label: 'Melancholic', color: '#2B2D42' },
  { value: 'professional', label: 'Professional', color: '#194B7E' },
  { value: 'playful', label: 'Playful', color: '#06D6A0' },
  { value: 'romantic', label: 'Romantic', color: '#D90429' },
  { value: 'serious', label: 'Serious', color: '#1D3557' },
];

const ColorPalettesPage = (props: { params?: { section?: string } }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  
  // Set activeTab based on URL path
  const determineActiveTab = () => {
    if (location.includes('/recent')) return 'recent';
    if (location.includes('/categories')) return 'categories';
    if (location.includes('/favorites')) return 'favorites';
    return 'all';
  };
  
  const [activeTab, setActiveTab] = useState(determineActiveTab());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('#FFD166');
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [newPalette, setNewPalette] = useState<NewPalette>({
    name: '',
    mood: 'happy',
    colors: ['#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#073B4C'],
    tags: [],
    isFavorite: false
  });
  const [currentTag, setCurrentTag] = useState('');

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(determineActiveTab());
  }, [location]);

  // Get theme management functions
  const { setActivePalette, resetPalette, activePalette } = useTheme();

  // Query to fetch color palettes
  const { data: colorPalettes, isLoading } = useQuery({
    queryKey: ['/api/color-palettes'],
    // The default getQueryFn will be used automatically
  });

  // Mutation to create a new color palette
  const createPaletteMutation = useMutation({
    mutationFn: (palette: Omit<ColorPalette, 'id' | 'userId' | 'usageCount' | 'createdAt' | 'updatedAt'>) => 
      apiRequest({
        method: 'POST',
        url: '/api/color-palettes',
        data: palette
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/color-palettes'] });
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Color palette created successfully',
      });
      resetNewPaletteForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create color palette',
        variant: 'destructive',
      });
    }
  });

  // Mutation to toggle favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: number, isFavorite: boolean }) => 
      apiRequest({
        method: 'PUT',
        url: `/api/color-palettes/${id}`,
        data: { isFavorite }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/color-palettes'] });
    }
  });

  // Mutation to increment usage count
  const incrementUsageMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest({
        method: 'POST',
        url: `/api/color-palettes/${id}/increment-usage`
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/color-palettes'] });
    }
  });

  // Helper function to reset the new palette form
  const resetNewPaletteForm = () => {
    setNewPalette({
      name: '',
      mood: 'happy',
      colors: ['#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#073B4C'],
      tags: [],
      isFavorite: false
    });
  };

  // Helper function to add a tag to the new palette
  const addTag = () => {
    if (currentTag && !newPalette.tags.includes(currentTag)) {
      setNewPalette({
        ...newPalette,
        tags: [...newPalette.tags, currentTag]
      });
      setCurrentTag('');
    }
  };

  // Helper function to remove a tag from the new palette
  const removeTag = (tagToRemove: string) => {
    setNewPalette({
      ...newPalette,
      tags: newPalette.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Helper function to handle color input change
  const handleColorChange = (index: number, color: string) => {
    const newColors = [...newPalette.colors];
    newColors[index] = color;
    setNewPalette({
      ...newPalette,
      colors: newColors
    });
  };

  // Helper function to copy a color to clipboard
  const copyColorToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: 'Color Copied',
      description: `${color} copied to clipboard`,
    });
  };
  
  // Helper function to apply a palette to the application theme
  const applyPaletteToTheme = (palette: ColorPalette) => {
    if (palette.colors.length > 0) {
      setActivePalette({
        primary: palette.colors[0],
        accent: palette.colors.length > 1 ? palette.colors[1] : undefined,
        background: palette.colors.length > 2 ? palette.colors[2] : undefined,
      });
      
      toast({
        title: 'Palette Applied',
        description: `${palette.name} applied to application theme`,
      });
      
      // Increment usage count
      incrementUsageMutation.mutate(palette.id);
    }
  };
  
  // Helper function to reset the application theme
  const resetApplicationTheme = () => {
    resetPalette();
    toast({
      title: 'Theme Reset',
      description: 'Application theme has been reset to default',
    });
  };

  // Helper function to filter palettes based on active tab
  const getFilteredPalettes = () => {
    if (!colorPalettes || !Array.isArray(colorPalettes)) return [];
    
    switch (activeTab) {
      case 'favorites':
        return colorPalettes.filter((palette: ColorPalette) => palette.isFavorite);
      case 'recent':
        // Sort by date and get the most recent palettes
        return [...colorPalettes].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 12);
      case 'categories':
        // Get URL parameters for potential mood filter
        const urlParams = new URLSearchParams(window.location.search);
        const moodFilter = urlParams.get('mood');
        
        if (moodFilter && MOODS.some(m => m.value === moodFilter)) {
          return colorPalettes.filter((palette: ColorPalette) => palette.mood === moodFilter);
        }
        
        // If no specific mood filter, group by mood for the categories page
        // We'll just return all here but in a real app you might want to organize differently
        return colorPalettes;
      case 'happy':
      case 'calm':
      case 'energetic':
      case 'melancholic':
      case 'professional':
      case 'playful':
      case 'romantic':
      case 'serious':
        return colorPalettes.filter((palette: ColorPalette) => palette.mood === activeTab);
      default:
        return colorPalettes;
    }
  };

  // Helper function to download palette as JSON
  const downloadPalette = (palette: ColorPalette) => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(palette, null, 2)
    )}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${palette.name.replace(/\s+/g, '-').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    // Increment usage count
    incrementUsageMutation.mutate(palette.id);
  };

  // Handle form submission for creating a new palette
  const handleCreatePalette = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPalette.name || !newPalette.mood || newPalette.colors.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill out all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    createPaletteMutation.mutate(newPalette);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Color Palettes</h1>
          <p className="text-muted-foreground">
            Create and manage mood-based color palettes for your creative projects
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Palette
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreatePalette}>
              <DialogHeader>
                <DialogTitle>Create New Color Palette</DialogTitle>
                <DialogDescription>
                  Design a new color palette based on your mood or project needs
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="My Awesome Palette"
                    className="col-span-3"
                    value={newPalette.name}
                    onChange={(e) => setNewPalette({ ...newPalette, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mood" className="text-right">
                    Mood
                  </Label>
                  <Select
                    value={newPalette.mood}
                    onValueChange={(value) => setNewPalette({ ...newPalette, mood: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOODS.map((mood) => (
                        <SelectItem key={mood.value} value={mood.value}>
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: mood.color }}
                            />
                            {mood.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Colors</Label>
                  <div className="col-span-3">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newPalette.colors.map((color, index) => (
                        <div key={index} className="relative">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => handleColorChange(index, e.target.value)}
                            className="h-10 w-10 cursor-pointer rounded-md border p-0"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Use voice color selection to add colors from speech, or pick them manually.
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">
                    Tags
                  </Label>
                  <div className="col-span-3">
                    <div className="flex space-x-2">
                      <Input
                        id="tags"
                        placeholder="Add a tag"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newPalette.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="px-2 py-1">
                          {tag}
                          <button
                            type="button"
                            className="ml-1"
                            onClick={() => removeTag(tag)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="favorite" className="text-right">
                    Favorite
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <input
                      type="checkbox"
                      id="favorite"
                      checked={newPalette.isFavorite}
                      onChange={(e) => setNewPalette({ ...newPalette, isFavorite: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="favorite" className="ml-2">
                      Add to favorites
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPaletteMutation.isPending}>
                  {createPaletteMutation.isPending ? 'Creating...' : 'Create Palette'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Palette Indicator */}
      {activePalette.isPaletteActive && (
        <div className="bg-secondary/40 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="w-6 h-6 rounded-full border shadow-sm" 
              style={{ backgroundColor: activePalette.primary }}
            />
            <div>
              <h3 className="text-sm font-medium">Active Theme Palette</h3>
              <p className="text-xs text-muted-foreground">Colors from your palette are being applied to the app theme</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={resetApplicationTheme}>
            Reset Theme
          </Button>
        </div>
      )}
      
      {/* Advanced Color Tools Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Color Palettes</h2>
        <Button 
          variant="outline" 
          onClick={() => setShowAdvancedTools(!showAdvancedTools)}
          className="flex items-center gap-2"
        >
          <Sliders className="h-4 w-4" />
          {showAdvancedTools ? "Hide Tools" : "Show Advanced Tools"}
        </Button>
      </div>
      
      {/* Advanced Color Tools */}
      {showAdvancedTools && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <VoiceColorSelector 
              onColorSelected={(color) => {
                setSelectedColor(color);
                
                // Add the color to the new palette if creating one
                if (isCreateDialogOpen && newPalette.colors.length < 8) {
                  // Replace the last color with the new one or add it if there's room
                  const newColors = [...newPalette.colors];
                  if (newColors.length < 8) {
                    newColors.push(color);
                  } else {
                    newColors[newColors.length - 1] = color;
                  }
                  
                  setNewPalette({
                    ...newPalette,
                    colors: newColors
                  });
                }
                
                toast({
                  title: "Color Selected",
                  description: `Selected ${color} using voice recognition!`,
                });
                
                // If dialog isn't open, let's apply it to the theme directly
                if (!isCreateDialogOpen) {
                  setActivePalette({
                    primary: color,
                    accent: undefined,
                    background: undefined,
                  });
                }
              }} 
            />
            
            <ColorTheoryTutorial />
            
            {/* Mood Animations preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Mood Animations</CardTitle>
                <CardDescription>Visualize your moods with playful animations</CardDescription>
              </CardHeader>
              <CardContent>
                <MoodLoadingGroup moods={['happy', 'calm', 'energetic', 'melancholic']} className="flex justify-center gap-4 py-4" />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <AdaptiveThemeGenerator 
              onThemeGenerated={(theme) => {
                setActivePalette({
                  primary: theme.primary,
                  accent: theme.secondary,
                  background: theme.background,
                });
                toast({
                  title: "Theme Applied",
                  description: "Generated theme has been applied to the application",
                });
              }} 
            />
            
            <SocialMediaSharing 
              paletteName="My Creative Palette" 
              paletteColors={newPalette.colors}
            />
          </div>
        </div>
      )}

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value);
          // Update URL based on selected tab
          let newPath = '/color-palettes';
          if (value === 'all') {
            newPath = '/color-palettes';
          } else if (['recent', 'categories', 'favorites'].includes(value)) {
            newPath = `/color-palettes/${value}`;
          } else {
            newPath = `/color-palettes/categories?mood=${value}`;
          }
          
          // Navigate to the new path using wouter
          window.history.pushState(null, '', newPath);
        }} 
        className="w-full"
      >
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All Palettes</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <Separator orientation="vertical" className="mx-2 h-5" />
          {MOODS.slice(0, 5).map((mood) => (
            <TabsTrigger key={mood.value} value={mood.value}>
              {mood.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="w-full opacity-60 animate-pulse">
                  <CardHeader className="h-24 bg-muted rounded-t-lg" />
                  <CardContent className="p-4">
                    <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredPalettes().length > 0 ? (
                getFilteredPalettes().map((palette) => (
                  <Card key={palette.id} className="w-full overflow-hidden transition-all hover:shadow-md">
                    <div className="flex h-16">
                      {palette.colors.map((color: string, index: number) => (
                        <div
                          key={index}
                          className="h-full flex-1 cursor-pointer hover:scale-105 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => copyColorToClipboard(color)}
                          title={`Copy ${color}`}
                        />
                      ))}
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{palette.name}</CardTitle>
                          <CardDescription>
                            {new Date(palette.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavoriteMutation.mutate({ 
                            id: palette.id, 
                            isFavorite: !palette.isFavorite 
                          })}
                        >
                          <Heart 
                            className={cn(
                              "h-5 w-5", 
                              palette.isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                            )} 
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant="outline">{palette.mood}</Badge>
                        {palette.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {palette.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{palette.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className="text-xs apple-press">
                          Used {palette.usageCount} {palette.usageCount === 1 ? 'time' : 'times'}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => applyPaletteToTheme(palette)}
                            title="Apply to theme"
                            className="apple-press apple-focus-ring"
                          >
                            <Palette className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadPalette(palette)}
                            title="Download palette"
                            className="apple-press apple-focus-ring"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit palette"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No color palettes found. Create your first palette to get started.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Palette
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ColorPalettesPage;