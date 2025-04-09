import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ColorPaletteGenerator from '@/components/color/ColorPaletteGenerator';
import VoiceColorSelector from '@/components/color-palettes/VoiceColorSelector';
import AdaptiveThemeGenerator from '@/components/color-palettes/AdaptiveThemeGenerator';
import { WebsiteColorExtractor } from '@/components/color/WebsiteColorExtractor';
import { Info, HelpCircle, Palette, Mic, Zap, Globe } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<string>('standard');
  const [voiceGeneratedPalette, setVoiceGeneratedPalette] = useState<string[]>([]);
  const { updateThemeColor } = useTheme();

  const { swipeHandlers } = useSwipe({
    onSwipeLeft: () => {
      if (activeTab === 'standard') setActiveTab('voice');
      else if (activeTab === 'voice') setActiveTab('website');
      else if (activeTab === 'website') setActiveTab('adaptive');
    },
    onSwipeRight: () => {
      if (activeTab === 'adaptive') setActiveTab('website');
      else if (activeTab === 'website') setActiveTab('voice');
      else if (activeTab === 'voice') setActiveTab('standard');
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
        <h1 className="text-3xl font-bold mb-2 sf-pro-display">Color Palette Tools</h1>
        <p className="text-muted-foreground sf-pro-text">
          Create, explore, and apply color palettes to enhance your creative projects
        </p>
      </header>

      {/* Enhanced Navigation UI with Accessible Tabs */}
      <div className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold sf-pro-display">Color Tools</h2>
              <p className="text-sm text-muted-foreground">Choose a tool below to get started</p>
            </div>
          </div>
          
          {/* Mobile Navigation Indicator */}
          <div className="flex md:hidden items-center bg-muted/30 rounded-full px-3 py-1.5 border border-border/50">
            <span className="text-xs text-muted-foreground mr-2">Swipe to navigate</span>
            <div className="flex space-x-1.5">
              {['standard', 'voice', 'website', 'adaptive'].map((tab) => (
                <div 
                  key={tab} 
                  className={`w-2 h-2 rounded-full ${activeTab === tab ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Enhanced Tool Selection with Better Visual Hierarchy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button
            className={`p-5 border rounded-xl flex flex-col items-center text-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40 
              ${activeTab === 'standard' 
                ? 'border-primary bg-primary/5 shadow-sm siri-glow' 
                : 'border-border hover:border-primary/30'}`}
            onClick={() => setActiveTab('standard')}
            aria-pressed={activeTab === 'standard'}
            aria-label="Standard color palette generator"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Palette className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold mb-2 text-lg">Standard</h3>
            <p className="text-sm text-muted-foreground">Create mood-based color palettes with AI</p>
            
            {activeTab === 'standard' && (
              <div className="mt-3 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                Currently Active
              </div>
            )}
          </button>
          
          <button
            className={`p-5 border rounded-xl flex flex-col items-center text-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40 
              ${activeTab === 'voice' 
                ? 'border-primary bg-primary/5 shadow-sm siri-glow' 
                : 'border-border hover:border-primary/30'}`}
            onClick={() => setActiveTab('voice')}
            aria-pressed={activeTab === 'voice'}
            aria-label="Voice color generator"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Mic className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold mb-2 text-lg">Voice</h3>
            <p className="text-sm text-muted-foreground">Generate palettes by voice description</p>
            
            {activeTab === 'voice' && (
              <div className="mt-3 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                Currently Active
              </div>
            )}
          </button>
          
          <button
            className={`p-5 border rounded-xl flex flex-col items-center text-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40 
              ${activeTab === 'website' 
                ? 'border-primary bg-primary/5 shadow-sm siri-glow' 
                : 'border-border hover:border-primary/30'}`}
            onClick={() => setActiveTab('website')}
            aria-pressed={activeTab === 'website'}
            aria-label="Website color extractor"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Globe className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold mb-2 text-lg">Website</h3>
            <p className="text-sm text-muted-foreground">Extract colors from any website URL</p>
            
            {activeTab === 'website' && (
              <div className="mt-3 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                Currently Active
              </div>
            )}
          </button>
          
          <button
            className={`p-5 border rounded-xl flex flex-col items-center text-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40 
              ${activeTab === 'adaptive' 
                ? 'border-primary bg-primary/5 shadow-sm siri-glow' 
                : 'border-border hover:border-primary/30'}`}
            onClick={() => setActiveTab('adaptive')}
            aria-pressed={activeTab === 'adaptive'}
            aria-label="Adaptive theme generator"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold mb-2 text-lg">Adaptive</h3>
            <p className="text-sm text-muted-foreground">Create themes for light/dark modes</p>
            
            {activeTab === 'adaptive' && (
              <div className="mt-3 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                Currently Active
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Tool Content Area */}
      <div className="bg-background border border-border/40 rounded-lg shadow-sm">
        {activeTab === 'standard' && (
          <div className="p-6 animate-fadeIn">
            <ColorPaletteGenerator />
          </div>
        )}
        
        {activeTab === 'voice' && (
          <div className="p-6 animate-fadeIn">
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
                        className="w-full ios-button ios-button-filled"
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
                    <CardTitle className="sf-pro-display">How Voice Color Works</CardTitle>
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
          </div>
        )}
        
        {activeTab === 'website' && (
          <div className="p-6 animate-fadeIn">
            <WebsiteColorExtractor />
          </div>
        )}
        
        {activeTab === 'adaptive' && (
          <div className="p-6 animate-fadeIn">
            <AdaptiveThemeGenerator />
          </div>
        )}
      </div>

      {/* Mobile Navigation Guide */}
      <div className="block md:hidden rounded-lg border border-border p-3 bg-background text-center text-sm">
        <p>Swipe left or right to navigate between tools</p>
        <div className="flex justify-center mt-2 gap-2">
          {['standard', 'voice', 'website', 'adaptive'].map((tab) => (
            <div 
              key={tab} 
              className={`w-2 h-2 rounded-full ${activeTab === tab ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-dashed border-primary/30 bg-muted/30 ios-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg sf-pro-display">
            <Info className="h-5 w-5 mr-2 text-primary" />
            Did you know?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="sf-pro-text">
            Colors evoke emotions and can significantly impact how users perceive and interact with your content.
            Our AI-powered tools help you create palettes that align with your intended emotional tone.
          </p>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground pt-0">
          <HelpCircle className="h-4 w-4 mr-1" />
          You can also use keyboard shortcuts (Arrow keys) to navigate
        </CardFooter>
      </Card>
    </div>
  );
};

export default ColorPalettesPage;