
import { useState } from 'react';
import { useToast } from '../components/ui/use-toast';
import { 
  Card, CardContent, CardHeader, 
  CardTitle, CardDescription 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { CheckCircle, Image } from 'lucide-react';
import { ENHANCEMENT_TOOLS } from '../lib/constants';

// Mock content items for demonstration purposes
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
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">AI Enhancement Studio</h1>
        <p className="text-muted-foreground">
          Transform your content with AI-powered creative tools
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left section - Content selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Select Content</h2>
          <p className="text-sm text-muted-foreground">Choose content to enhance</p>
          
          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="space-y-4 pt-4">
              {mockContentItems.map((item) => (
                <Card 
                  key={item.id}
                  className={`cursor-pointer transition-all ${selectedContent === item.id ? 'ring-2 ring-primary' : 'hover:bg-accent/50'}`}
                  onClick={() => handleSelectContent(item.id)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="h-16 w-16 rounded bg-muted overflow-hidden flex-shrink-0">
                      <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="archived" className="pt-4">
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No archived content found</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Middle section - Tools */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Enhancement Tools</h2>
          <p className="text-sm text-muted-foreground">Select a tool to enhance your content</p>
          
          <div className="space-y-3">
            {ENHANCEMENT_TOOLS.map((tool) => (
              <Card 
                key={tool.title}
                className={`cursor-pointer transition-all ${selectedTool === tool.title ? 'ring-2 ring-primary' : 'hover:bg-accent/50'} ${tool.animation}`}
                onClick={() => handleSelectTool(tool.title)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
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
                
                {selectedTool === "Mood Board Generator" && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Generated Mood Board:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="aspect-square rounded-md bg-muted overflow-hidden">
                          <img 
                            src={`https://source.unsplash.com/random/300x300?mood=${num}`} 
                            alt={`Mood image ${num}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">Color Palette:</h4>
                      <div className="flex space-x-2">
                        {mockEnhancementResults.colorPalette.map((color, idx) => (
                          <div 
                            key={idx} 
                            className="h-8 w-8 rounded-full border" 
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTool === "Cross-Platform Adapter" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Instagram Version:</h4>
                      <div className="rounded-md bg-muted p-3">
                        <p className="text-sm">Caption optimized for Instagram with emojis and hashtags.</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Character count: 217/2200
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Twitter/X Version:</h4>
                      <div className="rounded-md bg-muted p-3">
                        <p className="text-sm">Our Spring Collection brings vibrant sustainable fashion for the modern professional. Check it out! #SpringFashion</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Character count: 124/280
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Button 
            className="w-full"
            disabled={!selectedContent || !selectedTool || isProcessing}
            onClick={handleGenerateEnhancement}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Processing...
              </>
            ) : (
              'Generate Enhancement'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIEnhancement;
