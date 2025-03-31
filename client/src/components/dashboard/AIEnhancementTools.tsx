
import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

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
  onClick?: () => void;
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
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  // Handle tool selection
  const handleSelectTool = (toolName: string) => {
    setSelectedTool(toolName);
    onToolSelect?.(toolName);
  };
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">AI Enhancement Tools</h3>
      <p className="text-sm text-muted-foreground">
        Enhance your content with AI-powered tools while maintaining full ownership and copyright protection
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {ENHANCEMENT_TOOLS.map((tool) => (
          <Card 
            key={tool.title}
            className={`cursor-pointer transition-all ${selectedTool === tool.title ? 'ring-2 ring-primary' : 'hover:bg-accent/50'} ${tool.animation}`}
            onClick={() => handleSelectTool(tool.title)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${tool.iconGradient} text-white`}>
                  <i className={`${tool.icon} text-base`}></i>
                </div>
                <div>
                  <h3 className="font-medium flex items-center text-sm">
                    {tool.title}
                    {tool.isNew && (
                      <Badge className="ml-1 bg-primary text-white text-xs py-0 px-1">New</Badge>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tool.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedTool && (
        <div className="mt-4 p-3 bg-muted/50 rounded-md border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">© Legal Notice:</span> All content generated through this tool will include 
            embedded ownership information and digital watermarks. Your intellectual property rights are protected.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIEnhancementTools;
