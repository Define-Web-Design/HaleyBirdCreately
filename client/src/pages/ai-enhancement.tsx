import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Image, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ENHANCEMENT_TOOLS } from '@/lib/constants';

// Mock data for example content
const mockContentItems = [
  {
    id: 1,
    title: "Spring Collection Photoshoot",
    description: "Professional photos from our latest collection shoot",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    tags: ["fashion", "product", "spring"]
  },
  {
    id: 2,
    title: "Brand Colors 2025",
    description: "Official brand color palette for next year's campaigns",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    tags: ["branding", "colors", "design"]
  },
  {
    id: 3,
    title: "Customer Testimonial Clips",
    description: "Video testimonials from our top customers",
    imageUrl: "https://images.unsplash.com/photo-1496902526517-c0f2cb8fdb6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    tags: ["video", "testimonial", "customers"]
  }
];

// Example enhancement results
const mockEnhancementResults = {
  caption: "Experience our vibrant Spring Collection that combines bold colors with sustainable fabrics. Perfect for the modern professional who values both style and environmental responsibility. #SpringFashion #SustainableStyle #NewCollection",
  tags: ["spring", "sustainable", "professional", "vibrant", "modern", "collection", "fashion", "style"],
  colorPalette: ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"]
};

const AIEnhancement = () => {
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState<number | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Handle content selection
  const handleSelectContent = (id: number) => {
    setSelectedContent(id);
    setShowResults(false);
    toast({
      title: "Content Selected",
      description: `Content item #${id} selected for enhancement`,
    });
  };
  
  // Handle tool selection
  const handleSelectTool = (toolTitle: string) => {
    setSelectedTool(toolTitle);
    setShowResults(false);
    toast({
      title: "Tool Selected",
      description: `${toolTitle} tool selected`,
    });
  };
  
  // Handle enhancement generation
  const handleGenerateEnhancement = () => {
    if (!selectedContent || !selectedTool) {
      toast({
        title: "Selection Required",
        description: "Please select both content and an enhancement tool",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
      toast({
        title: "Enhancement Complete",
        description: `${selectedTool} has been applied to your content`,
      });
    }, 2500);
  };
  
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <PageHeader
        heading="AI Enhancement Tools"
        description="Enhance your content with AI-powered creative tools"
        rightSection={
          <Button 
            onClick={handleGenerateEnhancement}
            disabled={!selectedContent || !selectedTool || isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isProcessing ? "Processing..." : "Generate Enhancement"}
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Left sidebar - Content selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Select Content</h2>
          <p className="text-sm text-muted-foreground">Choose content to enhance with AI tools</p>
          
          <div className="space-y-3">
            {mockContentItems.map((item) => (
              <Card 
                key={item.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedContent === item.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectContent(item.id)}
              >
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Middle section - Tool selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Select Enhancement Tool</h2>
          <p className="text-sm text-muted-foreground">Choose an AI tool to enhance your content</p>
          
          <div className="space-y-3">
            {ENHANCEMENT_TOOLS.map((tool) => (
              <Card 
                key={tool.title}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTool === tool.title ? 'ring-2 ring-primary' : ''
                } ${tool.animation}`}
                onClick={() => handleSelectTool(tool.title)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg ${tool.iconGradient} text-white`}>
                      <i className={`${tool.icon} text-lg`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center">
                        {tool.title}
                        {tool.isNew && (
                          <Badge className="ml-2 bg-primary text-white text-xs">New</Badge>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Right section - Results */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Enhancement Results</h2>
          <p className="text-sm text-muted-foreground">Preview AI-generated enhancements</p>
          
          {!showResults ? (
            <Card className="h-[400px] flex items-center justify-center">
              <CardContent className="text-center">
                <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Results Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Select content and a tool, then generate enhancements
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Enhancement Complete
                </CardTitle>
                <CardDescription>
                  {selectedTool} results for "{mockContentItems.find(i => i.id === selectedContent)?.title}"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTool === "Caption Generator" && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Generated Caption:</h4>
                    <Textarea 
                      readOnly 
                      value={mockEnhancementResults.caption} 
                      className="h-32"
                    />
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">Suggested Hashtags:</h4>
                      <div className="flex flex-wrap gap-1">
                        {mockEnhancementResults.tags.map((tag) => (
                          <Badge key={tag} className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTool === "Color Mood Analyzer" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Detected Color Palette:</h4>
                    <div className="flex space-x-2">
                      {mockEnhancementResults.colorPalette.map((color) => (
                        <div 
                          key={color}
                          className="h-12 w-full rounded-md border"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">Mood Analysis:</h4>
                      <p className="text-sm text-muted-foreground">
                        This palette conveys a sense of patriotic professionalism with a splash of energy.
                        It balances cool, calming tones with vibrant accents.
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedTool === "Mood Board Generator" && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Generated Mood Board:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <img 
                        src="https://images.unsplash.com/photo-1549989476-69a92fa57c36?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80" 
                        alt="Mood 1"
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1550672953-32aba17236aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80" 
                        alt="Mood 2"
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1549989131-0b4ffa113cfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80" 
                        alt="Mood 3"
                        className="w-full h-24 object-cover rounded-md"
                      />
                    </div>
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-1">Theme Keywords:</h4>
                      <p className="text-sm text-muted-foreground">
                        Vibrant, Natural, Energetic, Spring, Fresh, Outdoor
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedTool === "Cross-Platform Adapter" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Platform Optimizations:</h4>
                    <div className="space-y-2">
                      <div className="p-3 border rounded-md">
                        <div className="flex items-center">
                          <i className="fab fa-instagram text-pink-600 text-xl mr-2"></i>
                          <h5 className="font-medium">Instagram</h5>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          1:1 square format, vibrant filters, 5 hashtags
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-md">
                        <div className="flex items-center">
                          <i className="fab fa-linkedin text-blue-700 text-xl mr-2"></i>
                          <h5 className="font-medium">LinkedIn</h5>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          16:9 format, professional tone, 3 industry hashtags
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-md">
                        <div className="flex items-center">
                          <i className="fab fa-facebook text-blue-600 text-xl mr-2"></i>
                          <h5 className="font-medium">Facebook</h5>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          1200x630px format, conversational tone, question prompt
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline">Refine Results</Button>
                <Button>Apply Enhancement</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIEnhancement;