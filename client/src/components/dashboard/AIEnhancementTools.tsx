
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';

interface AIEnhancementToolProps {
  onSelectTool: (toolName: string) => void;
  selectedTool: string | null;
}

interface ToolCardType {
  title: string;
  description: string;
  icon: string;
  iconGradient: string;
  animation: string;
  isNew?: boolean;
  buttonText?: string;
}

// Define enhancement tools
const ENHANCEMENT_TOOLS = [
  {
    title: 'Caption Generator',
    description: 'AI-powered caption generation with ownership watermarking',
    icon: 'fas fa-comment-dots',
    iconGradient: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    animation: 'hover:scale-105 transition-transform',
    isNew: false
  },
  {
    title: 'Mood Board Generator',
    description: 'Create visual mood boards from your content with copyright protection',
    icon: 'fas fa-palette',
    iconGradient: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    animation: 'hover:scale-105 transition-transform',
    isNew: true
  },
  {
    title: 'Cross-Platform Adapter',
    description: 'Adapt content for different platforms while maintaining ownership',
    icon: 'fas fa-exchange-alt',
    iconGradient: 'bg-gradient-to-r from-green-500 to-teal-600',
    animation: 'hover:scale-105 transition-transform',
    isNew: false
  },
  {
    title: 'Sentiment Analyzer',
    description: 'Analyze emotional tone of your content',
    icon: 'fas fa-chart-line',
    iconGradient: 'bg-gradient-to-r from-amber-500 to-orange-600',
    animation: 'hover:scale-105 transition-transform',
    isNew: false
  },
  {
    title: 'Legal Compliance Check',
    description: 'Verify content meets legal requirements and ownership standards',
    icon: 'fas fa-gavel',
    iconGradient: 'bg-gradient-to-r from-red-500 to-pink-600',
    animation: 'hover:scale-105 transition-transform',
    isNew: true
  },
  {
    title: 'Branded Content Template',
    description: 'Create templates with embedded ownership information',
    icon: 'fas fa-copyright',
    iconGradient: 'bg-gradient-to-r from-violet-500 to-purple-600',
    animation: 'hover:scale-105 transition-transform',
    isNew: false
  }
];

interface AIEnhancementToolsProps {
  onToolSelect?: (toolName: string) => void;
}

const AIEnhancementTools = ({ onToolSelect }: AIEnhancementToolsProps) => {
  const { toast } = useToast();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset error when tool is changed
  useEffect(() => {
    if (error) setError(null);
  }, [selectedTool]);
  
  // Handle tool selection
  const handleSelectTool = (toolName: string) => {
    try {
      setIsLoading(true);
      
      // Simulate loading time for tool initialization
      setTimeout(() => {
        setSelectedTool(toolName);
        onToolSelect?.(toolName);
        
        toast({
          title: "Tool Selected",
          description: `${toolName} is ready to use`,
          variant: "default"
        });
        
        setIsLoading(false);
      }, 300);
    } catch (err) {
      setError("Failed to initialize tool. Please try again.");
      setIsLoading(false);
      
      toast({
        title: "Tool Error",
        description: "Could not initialize the selected tool",
        variant: "destructive"
      });
    }
  };
  
  return (
    <section className="mb-8">
      <div className="mb-3">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">AI Tools</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Enhance your content with AI while maintaining ownership
        </p>
      </div>
      
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded text-sm mb-3">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ENHANCEMENT_TOOLS.map((tool) => (
          <Card 
            key={tool.title}
            className={`cursor-pointer ${
              isLoading ? 'opacity-70 pointer-events-none' : ''
            } ${selectedTool === tool.title ? 'ring-1 ring-primary' : 'hover:bg-accent/50'}`}
            onClick={() => !isLoading && handleSelectTool(tool.title)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${tool.iconGradient} text-white flex-shrink-0`}>
                  <i className={`${tool.icon}`}></i>
                </div>
                <div>
                  <h3 className="font-medium flex items-center text-sm">
                    {tool.title}
                    {tool.isNew && (
                      <Badge className="ml-1.5 bg-primary text-white text-xs py-0 px-1">New</Badge>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{tool.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedTool && (
        <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
          <i className="fas fa-shield-alt mr-1.5 text-primary"></i>
          <span className="font-medium">Notice:</span> Content includes embedded ownership protection.
        </div>
      )}
      
      {/* Tool loading state */}
      {isLoading && (
        <div className="flex items-center justify-center p-3 mt-3 bg-background rounded">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
          <span className="text-sm">Initializing...</span>
        </div>
      )}
    </section>
  );
};

export default AIEnhancementTools;
