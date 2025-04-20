
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import mistralAI from '@/utils/mistral-ai';

// Define available Mistral models
const MISTRAL_MODELS = [
  { id: 'mistral-tiny', name: 'Mistral Tiny', description: 'Fast responses, lower accuracy' },
  { id: 'mistral-small', name: 'Mistral Small', description: 'Balanced performance' }, 
  { id: 'mistral-medium', name: 'Mistral Medium', description: 'Good for complex reasoning' },
  { id: 'mistral-large-latest', name: 'Mistral Large', description: 'Most capable model' }
];

const SimpleMistralChat: React.FC = () => {
  // State variables
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('mistral-medium');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const { toast } = useToast();

  // Clear response when prompt changes
  useEffect(() => {
    if (response && prompt.trim() !== '') {
      setResponse('');
    }
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: 'Empty prompt',
        description: 'Please enter a prompt',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    setResponse('');
    
    try {
      // Update chat history with user message
      const updatedHistory = [
        ...chatHistory,
        { role: 'user', content: prompt }
      ];
      setChatHistory(updatedHistory);
      
      // Generate response
      const result = await mistralAI.generateText(prompt, {
        temperature,
        maxTokens,
        model: selectedModel
      });
      
      // Update chat history with assistant response
      setChatHistory([
        ...updatedHistory,
        { role: 'assistant', content: result }
      ]);
      
      setResponse(result);
      toast({
        title: 'Response received',
        description: `Generated with ${selectedModel}`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: `Failed to get response: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setPrompt('');
    setResponse('');
    setChatHistory([]);
    toast({
      title: 'Chat cleared',
      description: 'Chat history has been cleared',
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mistral AI Chat</CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} 
            variant="outline"
            size="sm"
          >
            {showAdvancedOptions ? 'Hide Options' : 'Show Options'}
          </Button>
          <Button 
            onClick={handleClearChat} 
            variant="outline"
            size="sm"
          >
            Clear Chat
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {showAdvancedOptions && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model-select">Model</Label>
              <Select 
                value={selectedModel} 
                onValueChange={setSelectedModel}
              >
                <SelectTrigger id="model-select">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {MISTRAL_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="temperature-slider">Temperature: {temperature.toFixed(2)}</Label>
              </div>
              <Slider 
                id="temperature-slider"
                min={0} 
                max={1} 
                step={0.01} 
                value={[temperature]} 
                onValueChange={(vals) => setTemperature(vals[0])}
              />
              <p className="text-xs text-muted-foreground">
                Lower values make output more focused and deterministic, higher values make it more creative
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="max-tokens-slider">Max Tokens: {maxTokens}</Label>
              </div>
              <Slider 
                id="max-tokens-slider"
                min={100} 
                max={4000} 
                step={100} 
                value={[maxTokens]} 
                onValueChange={(vals) => setMaxTokens(vals[0])}
              />
              <p className="text-xs text-muted-foreground">
                Maximum length of the generated response
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {chatHistory.length > 0 && (
            <div className="space-y-4 mb-6">
              {chatHistory.map((message, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-primary/10 ml-4' 
                      : 'bg-muted mr-4'
                  }`}
                >
                  <p className="text-xs font-medium mb-1">
                    {message.role === 'user' ? 'You' : 'Mistral AI'}
                  </p>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              ))}
            </div>
          )}
          
          <div>
            <Textarea
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] w-full"
            />
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2 space-y-2 sm:space-y-0">
        <div className="text-sm text-muted-foreground">
          Using {MISTRAL_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Generating...' : 'Send'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SimpleMistralChat;
