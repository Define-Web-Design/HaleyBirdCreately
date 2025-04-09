
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

// Define enhancement tools organized by categories
const ENHANCEMENT_TOOLS = {
  contentTransformation: [
    {
      title: 'Adaptive Recycler',
      description: 'Transform existing content for multiple platforms while preserving authenticity',
      icon: 'fas fa-recycle',
      iconGradient: 'bg-gradient-to-r from-green-500 to-teal-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 25,
      creativeGrowth: 30,
      isNew: false
    },
    {
      title: 'Format Optimizer',
      description: 'Automatically adjust content dimensions and format for target platform',
      icon: 'fas fa-crop-alt',
      iconGradient: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 15,
      creativeGrowth: 20,
      isNew: false
    },
    {
      title: 'Cross-Platform Adapter',
      description: 'Adapt content style and tone for different audience demographics',
      icon: 'fas fa-exchange-alt',
      iconGradient: 'bg-gradient-to-r from-indigo-500 to-blue-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 35,
      creativeGrowth: 30,
      isNew: false
    }
  ],
  
  creativeEnhancement: [
    {
      title: 'Mood Board Generator',
      description: 'Create visual mood boards that capture emotional resonance',
      icon: 'fas fa-palette',
      iconGradient: 'bg-gradient-to-r from-fuchsia-500 to-purple-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 15,
      creativeGrowth: 45,
      isNew: false
    },
    {
      title: 'Caption Artisan',
      description: 'Generate emotionally resonant captions that preserve your voice',
      icon: 'fas fa-comment-dots',
      iconGradient: 'bg-gradient-to-r from-purple-500 to-indigo-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 25,
      creativeGrowth: 35,
      isNew: false
    },
    {
      title: 'Style Evolution',
      description: 'Suggests style improvements while maintaining your authentic voice',
      icon: 'fas fa-magic',
      iconGradient: 'bg-gradient-to-r from-pink-500 to-rose-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 20,
      creativeGrowth: 40,
      isNew: true
    }
  ],
  
  intellectualGrowth: [
    {
      title: 'Topic Expansion',
      description: 'Discover related topics to deepen your content breadth',
      icon: 'fas fa-mind-share',
      iconGradient: 'bg-gradient-to-r from-amber-500 to-orange-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 45,
      creativeGrowth: 25,
      isNew: true
    },
    {
      title: 'Research Assistant',
      description: 'Find supporting facts and data to strengthen your arguments',
      icon: 'fas fa-search',
      iconGradient: 'bg-gradient-to-r from-cyan-500 to-blue-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 50,
      creativeGrowth: 15,
      isNew: false
    },
    {
      title: 'Perspective Analyzer',
      description: 'Evaluate content from different viewpoints to broaden perspective',
      icon: 'fas fa-binoculars',
      iconGradient: 'bg-gradient-to-r from-violet-500 to-indigo-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 45,
      creativeGrowth: 20,
      isNew: false
    }
  ],
  
  collaborationTools: [
    {
      title: 'Team Canvas',
      description: 'Real-time collaborative workspace with role-based permissions',
      icon: 'fas fa-users-class',
      iconGradient: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 30,
      creativeGrowth: 30,
      isNew: true
    },
    {
      title: 'Feedback Loop',
      description: 'Structured feedback system with AI-guided improvement suggestions',
      icon: 'fas fa-comments',
      iconGradient: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 35,
      creativeGrowth: 25,
      isNew: false
    },
    {
      title: 'Synergy Tracker',
      description: 'Monitor team collaboration effectiveness and suggest improvements',
      icon: 'fas fa-chart-network',
      iconGradient: 'bg-gradient-to-r from-rose-500 to-red-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 40,
      creativeGrowth: 20,
      isNew: true
    }
  ],
  
  practicalImpact: [
    {
      title: 'Engagement Predictor',
      description: 'Forecast potential engagement based on content attributes',
      icon: 'fas fa-chart-line',
      iconGradient: 'bg-gradient-to-r from-amber-500 to-orange-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 35,
      creativeGrowth: 15,
      isNew: false
    },
    {
      title: 'Legal Guardian',
      description: 'Verify content meets legal requirements while maintaining ownership',
      icon: 'fas fa-gavel',
      iconGradient: 'bg-gradient-to-r from-red-500 to-pink-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 40,
      creativeGrowth: 10,
      isNew: false
    },
    {
      title: 'Authentic Voice Guardian',
      description: 'Ensure content stays true to your voice even after transformation',
      icon: 'fas fa-fingerprint',
      iconGradient: 'bg-gradient-to-r from-violet-500 to-purple-600',
      animation: 'hover:scale-105 transition-transform',
      intellectualGrowth: 30,
      creativeGrowth: 30,
      isNew: true
    }
  ]
};

interface AIEnhancementToolsProps {
  onToolSelect?: (toolName: string) => void;
}

const AIEnhancementTools = ({ onToolSelect }: AIEnhancementToolsProps) => {
  const { toast } = useToast();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('contentTransformation');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset error when tool is changed
  useEffect(() => {
    if (error) setError(null);
  }, [selectedTool]);
  
  // Handle tool selection
  const handleSelectTool = (toolName: string, intellectualGrowth: number, creativeGrowth: number) => {
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
  
  // Map category to readable title
  const getCategoryTitle = (category: string): string => {
    switch(category) {
      case 'contentTransformation': return 'Content Transformation';
      case 'creativeEnhancement': return 'Creative Enhancement';
      case 'intellectualGrowth': return 'Intellectual Growth';
      case 'collaborationTools': return 'Collaboration Tools';
      case 'practicalImpact': return 'Practical Impact';
      default: return category;
    }
  };
  
  // Map category to description
  const getCategoryDescription = (category: string): string => {
    switch(category) {
      case 'contentTransformation': 
        return 'Transform and adapt your content across platforms while preserving your authentic voice';
      case 'creativeEnhancement': 
        return 'Enhance your creative expression with AI-powered tools that respect your unique style';
      case 'intellectualGrowth': 
        return 'Expand your knowledge and thinking with tools designed to deepen understanding';
      case 'collaborationTools': 
        return 'Work together more effectively with real-time collaboration and feedback systems';
      case 'practicalImpact': 
        return 'Maximize the real-world impact of your content with analytics and compliance tools';
      default: 
        return 'Advanced AI tools to enhance your creative process';
    }
  };
  
  // Map category to icon
  const getCategoryIcon = (category: string): JSX.Element => {
    switch(category) {
      case 'contentTransformation': 
        return <i className="fas fa-recycle text-teal-500"></i>;
      case 'creativeEnhancement': 
        return <i className="fas fa-palette text-purple-500"></i>;
      case 'intellectualGrowth': 
        return <i className="fas fa-brain text-indigo-500"></i>;
      case 'collaborationTools': 
        return <i className="fas fa-users text-blue-500"></i>;
      case 'practicalImpact': 
        return <i className="fas fa-chart-line text-amber-500"></i>;
      default: 
        return <i className="fas fa-robot text-primary"></i>;
    }
  };
  
  // Get all categories as array
  const categories = Object.keys(ENHANCEMENT_TOOLS);
  
  return (
    <section className="mb-8 space-y-4">
      <div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">AI Growth Ecosystem</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Tools designed to nurture your creative, intellectual, and collaborative growth
        </p>
      </div>
      
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        </div>
      )}
      
      {/* Category Selection */}
      <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors
              ${selectedCategory === category 
                ? 'bg-primary/10 text-primary border border-primary/30' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-transparent'}`}
          >
            {getCategoryIcon(category)}
            {getCategoryTitle(category)}
          </button>
        ))}
      </div>
      
      {/* Category Description */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
        {getCategoryDescription(selectedCategory)}
      </div>
      
      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ENHANCEMENT_TOOLS[selectedCategory as keyof typeof ENHANCEMENT_TOOLS].map((tool) => (
          <Card 
            key={tool.title}
            className={`cursor-pointer ${
              isLoading ? 'opacity-70 pointer-events-none' : ''
            } ${selectedTool === tool.title ? 'ring-1 ring-primary' : 'hover:bg-accent/50'} overflow-hidden`}
            onClick={() => !isLoading && handleSelectTool(tool.title, tool.intellectualGrowth, tool.creativeGrowth)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${tool.iconGradient} text-white flex-shrink-0`}>
                  <i className={`${tool.icon}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium flex items-center text-sm">
                    {tool.title}
                    {tool.isNew && (
                      <Badge className="ml-1.5 bg-primary text-white text-xs py-0 px-1">New</Badge>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tool.description}</p>
                </div>
              </div>
              
              {/* Growth Contribution */}
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center">
                    <i className="fas fa-brain mr-1 text-indigo-400"></i> Intellectual
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full" 
                      style={{ width: `${tool.intellectualGrowth}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center">
                    <i className="fas fa-sparkles mr-1 text-fuchsia-400"></i> Creative
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-fuchsia-500 rounded-full" 
                      style={{ width: `${tool.creativeGrowth}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedTool && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
          <div className="flex gap-2 items-start">
            <div className="rounded-full p-1.5 bg-primary/10 text-primary mt-0.5">
              <i className="fas fa-lightbulb"></i>
            </div>
            <div>
              <h4 className="font-medium text-primary">{selectedTool}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                This tool preserves your authentic voice while enhancing your content. All transformations include embedded ownership protection.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Tool loading state */}
      {isLoading && (
        <div className="flex items-center justify-center p-3 bg-background rounded-lg border border-gray-100 dark:border-gray-800">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
          <span className="text-sm">Initializing growth-aware AI systems...</span>
        </div>
      )}
    </section>
  );
};

export default AIEnhancementTools;
