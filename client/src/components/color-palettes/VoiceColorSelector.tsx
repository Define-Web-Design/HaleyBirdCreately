import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Define a color mapping object for common color names to hex
const COLOR_MAPPING: Record<string, string> = {
  red: '#FF0000',
  orange: '#FFA500',
  yellow: '#FFFF00',
  green: '#008000',
  blue: '#0000FF',
  purple: '#800080',
  pink: '#FFC0CB',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#808080',
  grey: '#808080',
  brown: '#A52A2A',
  teal: '#008080',
  navy: '#000080',
  lavender: '#E6E6FA',
  mint: '#98FB98',
  coral: '#FF7F50',
  magenta: '#FF00FF',
  cyan: '#00FFFF',
  gold: '#FFD700',
  silver: '#C0C0C0',
  maroon: '#800000',
  olive: '#808000',
  turquoise: '#40E0D0',
  violet: '#EE82EE',
  indigo: '#4B0082',
  crimson: '#DC143C',
  beige: '#F5F5DC',
  // Add more color mappings as needed
};

// Function to extract colors from transcript
const extractColorsFromText = (text: string): string[] => {
  // Normalize the text
  const normalizedText = text.toLowerCase().trim();
  
  // Split into words and check for color names
  const words = normalizedText.split(/\s+/);
  const foundColors: string[] = [];
  
  words.forEach(word => {
    // Remove any punctuation
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    if (COLOR_MAPPING[cleanWord]) {
      foundColors.push(COLOR_MAPPING[cleanWord]);
    }
  });
  
  return foundColors;
};

interface VoiceColorSelectorProps {
  onColorSelected: (color: string) => void;
}

const VoiceColorSelector: React.FC<VoiceColorSelectorProps> = ({ onColorSelected }) => {
  const [isListening, setIsListening] = useState(false);
  const [detectedColors, setDetectedColors] = useState<string[]>([]);
  const [listeningProgress, setListeningProgress] = useState(0);
  const { toast } = useToast();
  
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  
  // Effect to handle color detection and progress when listening
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | undefined;
    
    if (isListening) {
      // Reset progress and detected colors when starting to listen
      setListeningProgress(0);
      
      // Set up interval to update progress bar
      progressInterval = setInterval(() => {
        setListeningProgress(prev => {
          // Cap at 100
          const newValue = prev + 2;
          return newValue > 100 ? 100 : newValue;
        });
      }, 100);
      
      // Process transcript to find colors
      const colors = extractColorsFromText(transcript);
      setDetectedColors(colors);
      
      // If colors are detected, add them to a set to avoid duplicates
      if (colors.length > 0) {
        // Update detected colors
        setDetectedColors(colors);
      }
    } else if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isListening, transcript]);
  
  // Stop listening automatically after 10 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    
    if (isListening) {
      timeoutId = setTimeout(() => {
        stopListening();
      }, 10000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isListening]);
  
  // Function to start listening
  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support speech recognition.",
        variant: "destructive"
      });
      return;
    }
    
    resetTranscript();
    setDetectedColors([]);
    setIsListening(true);
    SpeechRecognition.startListening({ continuous: true });
    
    toast({
      title: "Listening for colors...",
      description: "Say color names like 'red', 'blue', or 'purple'.",
    });
  };
  
  // Function to stop listening
  const stopListening = () => {
    SpeechRecognition.stopListening();
    setIsListening(false);
    setListeningProgress(100);
    
    // If colors were detected, notify the user
    if (detectedColors.length > 0) {
      toast({
        title: `Detected ${detectedColors.length} color${detectedColors.length === 1 ? '' : 's'}`,
        description: "Click on a color to select it."
      });
    } else {
      toast({
        title: "No colors detected",
        description: "Try again and say color names clearly.",
        variant: "destructive"
      });
    }
  };
  
  // Handler for when a user selects a detected color
  const handleColorSelect = (color: string) => {
    onColorSelected(color);
    toast({
      title: "Color Selected",
      description: `Selected color: ${color}`,
    });
  };
  
  // If the browser doesn't support speech recognition
  if (!browserSupportsSpeechRecognition) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-destructive">Your browser does not support speech recognition.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try using Chrome, Edge, or Safari for the best experience.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Voice Color Selection</h3>
            <Button
              variant={isListening ? "destructive" : "default"}
              size="sm"
              onClick={isListening ? stopListening : startListening}
              className="flex items-center gap-2"
            >
              {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isListening ? "Stop" : "Start"}
            </Button>
          </div>
          
          {isListening && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground animate-pulse">
                Listening... Say color names like "red" or "blue"
              </p>
              <Progress value={listeningProgress} className="h-2" />
            </div>
          )}
          
          {transcript && (
            <div className="p-3 bg-secondary/30 rounded-md">
              <p className="text-sm font-medium">Transcript:</p>
              <p className="text-sm text-muted-foreground">{transcript}</p>
            </div>
          )}
          
          {detectedColors.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Detected Colors:</p>
              <div className="flex flex-wrap gap-2">
                {detectedColors.map((color, index) => (
                  <Badge
                    key={`${color}-${index}`}
                    style={{ backgroundColor: color, color: isLightColor(color) ? '#000' : '#fff' }}
                    className="cursor-pointer hover:scale-110 transition-transform py-1.5 px-2"
                    onClick={() => handleColorSelect(color)}
                  >
                    {getColorName(color)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to determine if a color is light (for text contrast)
const isLightColor = (color: string): boolean => {
  // Convert hex to RGB
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  // Calculate the perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return true if the color is light
  return brightness > 125;
};

// Helper function to get a color name for a hex value
const getColorName = (hexColor: string): string => {
  // Find the color name by hex value
  for (const [name, hex] of Object.entries(COLOR_MAPPING)) {
    if (hex.toLowerCase() === hexColor.toLowerCase()) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  
  // If no match is found, return the hex value
  return hexColor;
};

export default VoiceColorSelector;