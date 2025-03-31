
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../components/ui/use-toast';
import AIEnhancementTools from '../components/dashboard/AIEnhancementTools';
import { Separator } from '../components/ui/separator';
import { LegalAcceptanceModal } from '../components/legal/LegalAcceptanceModal';

// Sample content items for demonstration
const SAMPLE_CONTENT = [
  { id: 1, title: 'Summer Landscape', type: 'image', thumbnail: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=300&h=200&fit=crop' },
  { id: 2, title: 'Urban Photography', type: 'image', thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&h=200&fit=crop' },
  { id: 3, title: 'Creative Portrait', type: 'image', thumbnail: 'https://images.unsplash.com/photo-1518481852452-9415f262bbe4?w=300&h=200&fit=crop' },
  { id: 4, title: 'Product Showcase', type: 'image', thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop' }
];

const AIEnhancement = () => {
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState<number | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(false);
  
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
    
    // Check if legal terms have been accepted before allowing tool use
    if (!hasAcceptedLegal) {
      setShowLegalModal(true);
      return;
    }
    
    toast({
      title: "Tool Selected",
      description: `${toolTitle} tool selected`,
    });
  };
  
  // Handle legal terms acceptance
  const handleLegalAcceptance = () => {
    setHasAcceptedLegal(true);
    setShowLegalModal(false);
    
    toast({
      title: "Terms Accepted",
      description: "You have accepted the legal terms for AI enhancement tools",
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
    
    // Check again for legal acceptance
    if (!hasAcceptedLegal) {
      setShowLegalModal(true);
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call to generate enhancement
    try {
      // In a real implementation, this would be an actual API call
      // Example: const response = await fetch('/api/ai/enhance', { method: 'POST', body: JSON.stringify({...}) })
      
      // Simulate processing delay
      setTimeout(() => {
        setIsProcessing(false);
        setShowResults(true);
        toast({
          title: "Enhancement Complete",
          description: `${selectedTool} has been applied to your content with ownership protection`,
        });
      }, 2500);
    } catch (error) {
      console.error('Enhancement generation error:', error);
      setIsProcessing(false);
      
      toast({
        title: "Enhancement Failed",
        description: "There was an error generating your enhancement. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Sample result content based on selected tool
  const generateResultContent = () => {
    if (!selectedTool || !selectedContent) return null;
    
    const content = SAMPLE_CONTENT.find(c => c.id === selectedContent);
    
    switch (selectedTool) {
      case 'Caption Generator':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Generated Caption</h3>
            <p>Experience the vibrant essence of creativity captured in this moment. #inspiration #creativity #vision</p>
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded-md">
              <span className="font-medium">© 2023 All Rights Reserved.</span> This content is protected by digital watermarking and ownership verification.
            </div>
          </div>
        );
        
      case 'Mood Board Generator':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Generated Mood Board</h3>
            <div className="grid grid-cols-2 gap-2">
              <img src="https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=150&h=150&fit=crop" alt="Mood 1" className="rounded-md" />
              <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=150&h=150&fit=crop" alt="Mood 2" className="rounded-md" />
              <img src="https://images.unsplash.com/photo-1518481852452-9415f262bbe4?w=150&h=150&fit=crop" alt="Mood 3" className="rounded-md" />
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop" alt="Mood 4" className="rounded-md" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="w-10 h-10 rounded-full bg-blue-500"></div>
              <div className="w-10 h-10 rounded-full bg-indigo-500"></div>
              <div className="w-10 h-10 rounded-full bg-purple-500"></div>
              <div className="w-10 h-10 rounded-full bg-pink-500"></div>
            </div>
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded-md">
              <span className="font-medium">© 2023 All Rights Reserved.</span> This mood board includes embedded ownership data and is protected by copyright.
            </div>
          </div>
        );
        
      case 'Cross-Platform Adapter':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Platform Adaptations</h3>
            <div className="space-y-3">
              <div className="p-2 border rounded-md">
                <h4 className="text-sm font-medium">Instagram</h4>
                <p className="text-xs">Experience the vibrant essence of creativity captured in this moment. #inspiration #creativity</p>
                <p className="text-xs text-muted-foreground">1080x1080px • Max 30 hashtags</p>
              </div>
              <div className="p-2 border rounded-md">
                <h4 className="text-sm font-medium">Twitter</h4>
                <p className="text-xs">Capturing creativity in its purest form. What inspires you today? #creativity</p>
                <p className="text-xs text-muted-foreground">1200x675px • 280 character limit</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded-md">
              <span className="font-medium">© 2023 All Rights Reserved.</span> These adaptations include digital ownership signatures.
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">AI Enhancement Complete</h3>
            <p>Your content has been enhanced with {selectedTool}.</p>
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded-md">
              <span className="font-medium">© 2023 All Rights Reserved.</span> This content is protected by intellectual property safeguards.
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Enhancement Studio</h1>
      <p className="text-muted-foreground mb-6">
        Enhance your content with AI while maintaining full ownership rights and intellectual property protection.
      </p>
      
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content Selection</TabsTrigger>
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
          <TabsTrigger value="results" disabled={!showResults}>Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Content</CardTitle>
              <CardDescription>Choose content to enhance with AI tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {SAMPLE_CONTENT.map(item => (
                  <div 
                    key={item.id}
                    className={`cursor-pointer overflow-hidden rounded-lg border transition-all ${selectedContent === item.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                    onClick={() => handleSelectContent(item.id)}
                  >
                    <img src={item.thumbnail} alt={item.title} className="w-full h-40 object-cover" />
                    <div className="p-3">
                      <h3 className="font-medium text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                    <div className="p-2 bg-muted/30 text-xs">
                      <span className="font-medium">© Protected</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Enhancement Tools</CardTitle>
              <CardDescription>
                Select a tool to enhance your content with AI-powered features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIEnhancementTools onToolSelect={handleSelectTool} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedTool(null)}>Reset</Button>
              <Button 
                disabled={!selectedContent || !selectedTool || isProcessing} 
                onClick={handleGenerateEnhancement}
              >
                {isProcessing ? 'Processing...' : 'Generate Enhancement'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enhancement Results</CardTitle>
              <CardDescription>
                Your content has been enhanced with AI while maintaining ownership protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showResults ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Original Content</h3>
                    {selectedContent && (
                      <div className="overflow-hidden rounded-lg border">
                        <img 
                          src={SAMPLE_CONTENT.find(c => c.id === selectedContent)?.thumbnail} 
                          alt="Original content" 
                          className="w-full h-40 object-cover" 
                        />
                        <div className="p-3">
                          <h3 className="font-medium text-sm">
                            {SAMPLE_CONTENT.find(c => c.id === selectedContent)?.title}
                          </h3>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Enhanced Content</h3>
                    <div className="p-4 border rounded-lg">
                      {generateResultContent()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No results available. Please select content and a tool to generate enhancements.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <Separator className="mb-4" />
                <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
                  <span className="font-medium">Legal & Security Notice:</span> All AI-enhanced content includes 
                  embedded ownership information, digital watermarks, and usage rights protection. Any unauthorized 
                  reproduction, distribution, or modification is strictly prohibited and may result in legal action.
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Legal Acceptance Modal */}
      {showLegalModal && (
        <LegalAcceptanceModal 
          isOpen={showLegalModal} 
          onClose={() => setShowLegalModal(false)}
          onAccept={handleLegalAcceptance}
          title="AI Enhancement Legal Terms"
          description="Please review and accept the terms for using AI enhancement tools"
        />
      )}
    </div>
  );
};

export default AIEnhancement;
