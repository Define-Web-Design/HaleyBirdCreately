import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, BookmarkIcon, ThumbsUp, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types for creative prompts
interface CreativePrompt {
  id: number;
  title: string;
  category: string;
  prompt: string;
  exampleOutput: string;
  isFavorite: boolean;
  usageCount: number;
}

// Mock categories
const PROMPT_CATEGORIES = [
  "Visual Design",
  "Content Writing",
  "Social Media",
  "Product Photography",
  "Brand Storytelling",
  "Color Theory",
  "Website Copywriting",
  "Email Marketing"
];

// Mock prompts for example content
const mockPrompts: CreativePrompt[] = [
  {
    id: 1,
    title: "Emotional Brand Story",
    category: "Brand Storytelling",
    prompt: "Create a compelling brand origin story that focuses on the founder's personal journey and the key emotional moment that inspired the creation of [your brand]. Highlight the core values that emerged from this experience and how they continue to guide the brand today.",
    exampleOutput: "In the quiet corners of her studio apartment, Sophia's hands trembled with both exhaustion and determination. After years of battling fast fashion's environmental impact from inside the industry, she had finally reached her breaking point. The image of textile waste piled high in landfills wouldn't leave her mind. That sleepless night in 2020 became the catalyst for EcoThreads, born from the belief that sustainable fashion shouldn't require compromise. Today, each garment we create carries that same promise – blending ethical production with timeless design, turning our founder's moment of crisis into a movement for change.",
    isFavorite: true,
    usageCount: 12
  },
  {
    id: 2,
    title: "Color Palette Storytelling",
    category: "Color Theory",
    prompt: "Develop a narrative around your chosen color palette by explaining how each color represents a different aspect of your brand's personality or values. For each color, provide a short sentence about what emotion or quality it embodies and how that translates to your customer experience.",
    exampleOutput: "Our palette tells the story of who we are: Deep navy represents the reliability that grounds every customer interaction. Vibrant coral embodies the passion that drives our innovation. Soft sage reflects our commitment to sustainable practices. Warm amber highlights the optimism we bring to solving industry challenges. Together, these colors weave the narrative of a brand that stands for trust, enthusiasm, responsibility, and positive transformation.",
    isFavorite: false,
    usageCount: 8
  },
  {
    id: 3,
    title: "Visual Contrast Product Photography",
    category: "Product Photography",
    prompt: "Create a product photography concept that uses strong visual contrast to highlight your product's key features. Describe a setup that includes contrasting elements (light/shadow, smooth/textured, geometric/organic) to create visual tension that draws attention to what makes your product unique.",
    exampleOutput: "Place the minimalist white ceramic vase against a backdrop of rough, dark volcanic rock. Position the light source from the upper right to cast dramatic shadows that emphasize the vase's smooth curves. Arrange wildflowers with varied textures and heights inside, allowing their organic forms to spill slightly over the geometric rim. This composition creates multiple layers of contrast—smooth against rough, light against dark, contained against wild—symbolizing how the product brings structure to natural beauty while honoring its unpredictability.",
    isFavorite: true,
    usageCount: 15
  },
  {
    id: 4,
    title: "Engaging Social Media Carousel",
    category: "Social Media",
    prompt: "Design a 5-slide social media carousel that educates your audience on a complex topic related to your industry. For each slide, write a headline under 10 words and supporting copy under 50 words. Begin with a provocative question, present 3 key insights in the middle slides, and end with an actionable conclusion.",
    exampleOutput: "Slide 1: \"Is your skincare routine actually aging you?\" Many popular techniques can damage your skin barrier without you realizing it. Let's separate skincare facts from fiction.\n\nSlide 2: \"Myth: More exfoliation equals better skin\" Over-exfoliation destroys your protective barrier, causing inflammation that accelerates aging. Limit chemical exfoliants to 1-2 times weekly, regardless of what influencers suggest.\n\nSlide 3: \"Myth: Natural ingredients are always gentler\" Some natural extracts cause more irritation than synthetic alternatives. Lavender and citrus oils can trigger photosensitivity and dermatitis in sensitive skin.\n\nSlide 4: \"Myth: You need a 10-step routine\" Skin minimalism often delivers better results. Using fewer, highly-targeted products reduces potential irritation and ingredient conflicts while improving compliance.\n\nSlide 5: \"Your action plan: Reassess, reduce, results\" Evaluate your current routine for irritants, streamline to essentials (cleanser, moisturizer, SPF, 1-2 actives), and give your skin 4 weeks to reveal the benefits of doing less.",
    isFavorite: false,
    usageCount: 20
  },
];

const CreativePrompts = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState<CreativePrompt | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filter prompts based on category and search
  const filteredPrompts = mockPrompts.filter(prompt => {
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesSearch = 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Handle selecting a prompt
  const handleSelectPrompt = (prompt: CreativePrompt) => {
    setCurrentPrompt(prompt);
    setGeneratedOutput(''); // Clear any previous output
    setPromptInput(prompt.prompt); // Pre-fill the prompt input
    toast({
      title: "Prompt Selected",
      description: `"${prompt.title}" prompt is ready to use`,
    });
  };
  
  // Handle generating output
  const handleGenerateOutput = () => {
    if (!currentPrompt) return;
    
    setIsGenerating(true);
    // Simulate API call delay
    setTimeout(() => {
      setGeneratedOutput(currentPrompt.exampleOutput);
      setIsGenerating(false);
      toast({
        title: "Output Generated",
        description: "Your creative content has been generated",
      });
    }, 2000);
  };
  
  // Handle copying to clipboard
  const handleCopyOutput = () => {
    navigator.clipboard.writeText(generatedOutput);
    toast({
      title: "Copied to Clipboard",
      description: "Output has been copied to your clipboard",
    });
  };
  
  // Handle favoriting a prompt
  const handleToggleFavorite = (promptId: number) => {
    // In a real app, you'd update this in the database
    toast({
      title: "Favorite Updated",
      description: "Prompt has been added to your favorites",
    });
  };
  
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <PageHeader
        heading="Creative Prompts"
        description="AI-powered prompts to inspire your creative process"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Left sidebar - Prompt selection */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Search prompts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PROMPT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredPrompts.map((prompt) => (
              <Card 
                key={prompt.id}
                className={`cursor-pointer hover:shadow-md transition-all ${
                  currentPrompt?.id === prompt.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectPrompt(prompt)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{prompt.title}</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(prompt.id);
                      }}
                    >
                      <BookmarkIcon 
                        className={`h-4 w-4 ${prompt.isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                      />
                    </Button>
                  </div>
                  <Badge className="mb-2">{prompt.category}</Badge>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{prompt.prompt}</p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    <span>Used {prompt.usageCount} times</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Right section - Prompt workspace */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{currentPrompt?.title || "Select a Prompt"}</CardTitle>
              <CardDescription>
                {currentPrompt 
                  ? `${currentPrompt.category} prompt to enhance your creative work` 
                  : "Choose a prompt from the library to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Prompt Template</h4>
                  <Textarea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Select a prompt or create your own..."
                    className="h-32"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setPromptInput('')}
                    disabled={!promptInput}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleGenerateOutput}
                    disabled={!promptInput || isGenerating}
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {isGenerating ? "Generating..." : "Generate Content"}
                  </Button>
                </div>
                
                {generatedOutput && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Generated Output</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8" 
                        onClick={handleCopyOutput}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md whitespace-pre-wrap text-sm">
                      {generatedOutput}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tips for Effective Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Be specific about the tone, style, and format you want in the output</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Include your target audience to get more relevant results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Use placeholders like [brand name] that you can easily replace</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Specify word counts or character limits if you have constraints</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Include examples of what you like to guide the AI's output style</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreativePrompts;