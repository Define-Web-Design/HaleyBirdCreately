import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ColorPaletteGenerator from '@/components/color/ColorPaletteGenerator';
import MoodCapsuleGenerator from '@/components/mood/MoodCapsuleGenerator';
import { useTheme } from '@/lib/ThemeContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const CreativeTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('color-palette');
  const { isDarkMode, isColorBlindMode, toggleDarkMode, toggleColorBlindMode } = useTheme();

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Creative Tools</h1>
        <div className="flex items-center space-x-4">
          {/* Color Blind Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Switch 
              id="color-blind-mode" 
              checked={isColorBlindMode} 
              onCheckedChange={toggleColorBlindMode}
            />
            <Label htmlFor="color-blind-mode" className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Color Blind Mode</span>
            </Label>
          </div>
          
          {/* Dark Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Switch 
              id="dark-mode" 
              checked={isDarkMode} 
              onCheckedChange={toggleDarkMode}
            />
            <Label htmlFor="dark-mode" className="flex items-center">
              {isDarkMode ? 
                <Moon className="h-4 w-4 mr-1" /> : 
                <Sun className="h-4 w-4 mr-1" />
              }
              <span className="hidden sm:inline">Dark Mode</span>
            </Label>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mood-Based Creative Tools</CardTitle>
          <CardDescription>
            Enhance your creative process with emotion-driven design tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="color-palette">
                Color Palette Generator
              </TabsTrigger>
              <TabsTrigger value="mood-capsules">
                Mood Capsules
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="color-palette">
              <ColorPaletteGenerator />
            </TabsContent>
            
            <TabsContent value="mood-capsules">
              <MoodCapsuleGenerator />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          The tools can help enhance your creative workflow by adding emotional dimensions to your content and designs.
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreativeTools;