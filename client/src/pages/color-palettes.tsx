import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ColorPaletteGenerator from '@/components/color/ColorPaletteGenerator';
import VoiceColorSelector from '@/components/color-palettes/VoiceColorSelector';
import AdaptiveThemeGenerator from '@/components/color-palettes/AdaptiveThemeGenerator';
import { Info, HelpCircle, Palette, Mic, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTheme } from '@/lib/ThemeContext';
import { useSwipe } from '@/lib/useGestures';

const ColorPalettesPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('standard');
  const [voiceGeneratedPalette, setVoiceGeneratedPalette] = useState<string[]>([]);
  const { updateThemeColor } = useTheme();

  const { swipeHandlers } = useSwipe({
    onSwipeLeft: () => {
      if (selectedTab === 'standard') setSelectedTab('voice');
      else if (selectedTab === 'voice') setSelectedTab('adaptive');
    },
    onSwipeRight: () => {
      if (selectedTab === 'adaptive') setSelectedTab('voice');
      else if (selectedTab === 'voice') setSelectedTab('standard');
    }
  });

  // Handle palette from voice
  const handleVoicePaletteGenerated = (palette: string[]) => {
    if (palette && palette.length > 0) {
      setVoiceGeneratedPalette(palette);
      toast({
        title: "New Voice Palette",
        description: "Your voice-generated palette is ready to use.",
      });
    }
  };

  // Apply voice-generated palette to theme
  const applyVoicePaletteToTheme = () => {
    if (voiceGeneratedPalette && voiceGeneratedPalette.length > 0) {
      updateThemeColor(voiceGeneratedPalette[0]); // Use primary color
      toast({
        title: "Theme Updated",
        description: "Voice palette applied to app theme.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6" {...swipeHandlers}>
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Color Palette Tools</h1>
        <p className="text-muted-foreground">
          Create, explore, and apply color palettes to enhance your creative projects
        </p>
      </header>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        {/* Tab Buttons */}
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="standard" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Standard</span>
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Voice</span>
          </TabsTrigger>
          <TabsTrigger value="adaptive" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Adaptive</span>
          </TabsTrigger>
        </TabsList>

        {/* Standard Color Palette Generator Tab */}
        <TabsContent value="standard" className="space-y-6 animate-fadeIn">
          <ColorPaletteGenerator />
        </TabsContent>

        {/* Voice Color Explorer Tab */}
        <TabsContent value="voice" className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <VoiceColorSelector onPaletteGenerated={handleVoicePaletteGenerated} />
              
              {/* Voice-generated palette display */}
              {voiceGeneratedPalette.length > 0 && (
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Your Voice Palette</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex rounded-md overflow-hidden mb-3">
                      {voiceGeneratedPalette.map((color, index) => (
                        <div
                          key={index}
                          className="h-16 w-full cursor-pointer relative group"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            navigator.clipboard.writeText(color);
                            toast({
                              title: "Color Copied",
                              description: `${color} copied to clipboard`,
                            });
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20">
                            <span className="text-white text-xs font-mono">{color}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={applyVoicePaletteToTheme}
                      className="w-full"
                    >
                      Apply to Theme
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>How Voice Color Works</CardTitle>
                  <CardDescription>
                    Create unique color palettes by simply describing what you want
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="usage">
                      <AccordionTrigger>How to use voice commands</AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <p>Click "Start Voice Input" and speak clearly to describe the colors or mood you want.</p>
                        <p>You can:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Describe emotional states: "I want a calming palette"</li>
                          <li>Reference natural elements: "Colors like a tropical sunset"</li>
                          <li>Specify color combinations: "Deep blues with gold accents"</li>
                          <li>Describe feelings: "Something that feels energetic and bold"</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">The AI will interpret your description and generate a suitable color palette.</p>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="tips">
                      <AccordionTrigger>Tips for better results</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Speak clearly and at a moderate pace</li>
                          <li>Be specific about color relationships (contrast, harmony)</li>
                          <li>Try referencing familiar scenes or objects</li>
                          <li>Describe the feeling you want the colors to evoke</li>
                          <li>Mention color temperature (warm/cool)</li>
                          <li>Specify if you need light or dark shades</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="examples">
                      <AccordionTrigger>Example voice commands</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="border rounded-md p-2 bg-muted/30">
                            "Create a palette inspired by a forest at dusk"
                          </div>
                          <div className="border rounded-md p-2 bg-muted/30">
                            "I need vibrant, energetic colors for a sports app"
                          </div>
                          <div className="border rounded-md p-2 bg-muted/30">
                            "Make a soothing palette with pastel blues and greens"
                          </div>
                          <div className="border rounded-md p-2 bg-muted/30">
                            "Generate colors that feel luxurious and elegant"
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="troubleshooting">
                      <AccordionTrigger>Troubleshooting</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <h4 className="font-medium">If the microphone doesn't work:</h4>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>Ensure you've granted microphone permissions in your browser</li>
                            <li>Try refreshing the page</li>
                            <li>Check if your microphone is working in other applications</li>
                            <li>Try using Chrome or Edge for best compatibility</li>
                          </ul>
                          
                          <h4 className="font-medium mt-3">If results aren't what you expected:</h4>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>Try being more specific in your description</li>
                            <li>Mention specific colors you want included</li>
                            <li>Specify the purpose of the palette</li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Adaptive Theme Generator Tab */}
        <TabsContent value="adaptive" className="space-y-6 animate-fadeIn">
          <AdaptiveThemeGenerator />
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-dashed border-primary/30 bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Info className="h-5 w-5 mr-2 text-primary" />
            Did you know?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Colors evoke emotions and can significantly impact how users perceive and interact with your content.
            Our AI-powered tools help you create palettes that align with your intended emotional tone.
          </p>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground pt-0">
          <HelpCircle className="h-4 w-4 mr-1" />
          Swipe left/right on mobile to navigate between tools
        </CardFooter>
      </Card>
    </div>
  );
};

export default ColorPalettesPage;