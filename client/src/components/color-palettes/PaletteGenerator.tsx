import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CopyIcon, Download, RefreshCcw, Check } from 'lucide-react';

// Types
interface ColorInfo {
  hex: string;
  name?: string;
}

interface GeneratedPalette {
  colors: ColorInfo[];
  moodDescription: string;
  suggestedTags: string[];
}

interface PaletteGeneratorProps {
  onSavePalette?: (palette: {
    name: string;
    mood: string;
    colors: string[];
    tags: string[];
    isFavorite: boolean;
  }) => void;
}

// Mood options for the generator
const MOODS = [
  { value: 'happy', label: 'Happy', color: '#FFD166' },
  { value: 'calm', label: 'Calm', color: '#457B9D' },
  { value: 'energetic', label: 'Energetic', color: '#EF476F' },
  { value: 'melancholic', label: 'Melancholic', color: '#2B2D42' },
  { value: 'professional', label: 'Professional', color: '#194B7E' },
  { value: 'playful', label: 'Playful', color: '#06D6A0' },
  { value: 'romantic', label: 'Romantic', color: '#D90429' },
  { value: 'serious', label: 'Serious', color: '#1D3557' },
  { value: 'creative', label: 'Creative', color: '#FF9F1C' },
  { value: 'luxurious', label: 'Luxurious', color: '#8338EC' },
  { value: 'natural', label: 'Natural', color: '#606C38' },
  { value: 'technological', label: 'Technological', color: '#03045E' },
];

export default function PaletteGenerator({ onSavePalette }: PaletteGeneratorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Generator form state
  const [mood, setMood] = useState('happy');
  const [description, setDescription] = useState('');
  const [colorCount, setColorCount] = useState(5);
  const [paletteName, setPaletteName] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Generated palette state
  const [generatedPalette, setGeneratedPalette] = useState<GeneratedPalette | null>(null);
  const [copiedColorIndex, setCopiedColorIndex] = useState<number | null>(null);
  
  // Mutation for generating palettes
  const generatePaletteMutation = useMutation({
    mutationFn: (data: { mood: string; description?: string; colorCount: number }) => 
      apiRequest('POST', '/api/color-palettes/generate', data),
    onSuccess: async (response) => {
      const data = await response.json();
      if (data.success && data.palette) {
        setGeneratedPalette(data.palette);
        
        // Auto-populate palette name if empty
        if (!paletteName) {
          setPaletteName(`${mood.charAt(0).toUpperCase() + mood.slice(1)} Palette`);
        }
      } else {
        toast({
          title: 'Generation Failed',
          description: data.message || 'Failed to generate palette',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to connect to AI service',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for saving the generated palette
  const savePaletteMutation = useMutation({
    mutationFn: (data: {
      name: string;
      mood: string;
      colors: string[];
      tags: string[];
      isFavorite: boolean;
    }) => apiRequest('POST', '/api/color-palettes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/color-palettes'] });
      toast({
        title: 'Success',
        description: 'Palette saved successfully',
      });
      
      // Reset form after saving
      setGeneratedPalette(null);
      setPaletteName('');
      setDescription('');
      setIsFavorite(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save palette',
        variant: 'destructive',
      });
    }
  });
  
  // Handle form submission
  const handleGeneratePalette = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    generatePaletteMutation.mutate({
      mood,
      description: description || undefined,
      colorCount
    });
  };
  
  // Handle palette saving
  const handleSavePalette = () => {
    if (!generatedPalette) return;
    
    if (!paletteName) {
      toast({
        title: 'Name Required',
        description: 'Please give your palette a name before saving',
        variant: 'destructive',
      });
      return;
    }
    
    const paletteData = {
      name: paletteName,
      mood,
      colors: generatedPalette.colors.map(c => c.hex),
      tags: generatedPalette.suggestedTags,
      isFavorite
    };
    
    if (onSavePalette) {
      onSavePalette(paletteData);
    } else {
      savePaletteMutation.mutate(paletteData);
    }
  };
  
  // Copy a color to clipboard
  const copyColorToClipboard = (color: string, index: number) => {
    navigator.clipboard.writeText(color);
    setCopiedColorIndex(index);
    
    toast({
      title: 'Color Copied',
      description: `${color} copied to clipboard`,
    });
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedColorIndex(null);
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Color Palette Generator</CardTitle>
              <CardDescription>
                Generate harmonious color palettes based on your mood and description
              </CardDescription>
            </div>
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGeneratePalette} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="mood">Mood</Label>
              <Select
                value={mood}
                onValueChange={setMood}
              >
                <SelectTrigger>
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
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the feeling, project, or context (e.g., 'Summer beach sunset with ocean blues and warm oranges')"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label htmlFor="colorCount">Number of Colors</Label>
                <span className="text-sm text-muted-foreground">{colorCount}</span>
              </div>
              <Slider
                id="colorCount"
                min={3}
                max={8}
                step={1}
                value={[colorCount]}
                onValueChange={(values: number[]) => setColorCount(values[0])}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={generatePaletteMutation.isPending}
            >
              {generatePaletteMutation.isPending ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Palette
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {generatedPalette && (
        <Card>
          <CardHeader>
            <CardTitle>Your Generated Palette</CardTitle>
            <CardDescription>
              {generatedPalette.moodDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-20 rounded-md overflow-hidden">
              {generatedPalette.colors.map((color, index) => (
                <div
                  key={index}
                  className="h-full flex-1 cursor-pointer hover:scale-105 transition-transform relative"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyColorToClipboard(color.hex, index)}
                  title={`Copy ${color.hex}`}
                >
                  {copiedColorIndex === index && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <Check className="text-white h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {generatedPalette.colors.map((color, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-2 bg-secondary/30 rounded-md"
                  onClick={() => copyColorToClipboard(color.hex, index)}
                >
                  <div 
                    className="w-6 h-6 rounded-md mr-2"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{color.name}</p>
                    <p className="text-xs text-muted-foreground">{color.hex}</p>
                  </div>
                  <CopyIcon className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>
              ))}
            </div>
            
            <div>
              <Label htmlFor="paletteName">Palette Name</Label>
              <Input
                id="paletteName"
                value={paletteName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaletteName(e.target.value)}
                placeholder="Give your palette a name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {generatedPalette.suggestedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="favorite"
                checked={isFavorite}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsFavorite(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="favorite">
                Add to favorites
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setGeneratedPalette(null)}
            >
              Discard
            </Button>
            <Button 
              onClick={handleSavePalette}
              disabled={savePaletteMutation.isPending}
            >
              {savePaletteMutation.isPending ? 'Saving...' : 'Save Palette'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}