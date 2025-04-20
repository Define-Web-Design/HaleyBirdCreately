
import React, { useState } from 'react';
import anthropicClient from '@/utils/anthropic-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

export default function AnthropicExample() {
  const [apiKey, setApiKey] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [colorPrompt, setColorPrompt] = useState<string>('');
  const [contentAnalysis, setContentAnalysis] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [colors, setColors] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('text');
  const { toast } = useToast();

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your Anthropic API key',
        variant: 'destructive',
      });
      return;
    }

    anthropicClient.setApiKey(apiKey);
    toast({
      title: 'API Key Saved',
      description: 'Your Anthropic API key has been saved for this session',
    });
  };

  const handleGenerateText = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a prompt to generate text',
        variant: 'destructive',
      });
      return;
    }

    if (!anthropicClient.hasApiKey()) {
      toast({
        title: 'API Key Required',
        description: 'Please set your Anthropic API key first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await anthropicClient.createChatCompletion({
        model: 'claude-3-opus-20240229',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 500
      });
      
      setResponse(result.content[0].text);
    } catch (error) {
      console.error('Error generating text:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate text',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateColors = async () => {
    if (!colorPrompt.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please enter a description for your color palette',
        variant: 'destructive',
      });
      return;
    }

    if (!anthropicClient.hasApiKey()) {
      toast({
        title: 'API Key Required',
        description: 'Please set your Anthropic API key first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const colorPalette = await anthropicClient.generateColorPalette(colorPrompt, 5);
      setColors(colorPalette);
    } catch (error) {
      console.error('Error generating colors:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate colors',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeContent = async () => {
    if (!contentAnalysis.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter content to analyze',
        variant: 'destructive',
      });
      return;
    }

    if (!anthropicClient.hasApiKey()) {
      toast({
        title: 'API Key Required',
        description: 'Please set your Anthropic API key first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const analysis = await anthropicClient.analyzeContent(contentAnalysis);
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze content',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Anthropic Claude API Key</CardTitle>
          <CardDescription>Enter your Anthropic API key to use Claude</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="password"
              placeholder="Enter your Anthropic API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveApiKey}>Save Key</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">Text Generation</TabsTrigger>
          <TabsTrigger value="colors">Color Palette</TabsTrigger>
          <TabsTrigger value="analysis">Content Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Claude Text Generation</CardTitle>
              <CardDescription>Generate text using Claude</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerateText} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Generate Text'}
              </Button>
            </CardFooter>
          </Card>

          {response && (
            <Card>
              <CardHeader>
                <CardTitle>Claude Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap p-4 bg-muted rounded-md">
                  {response}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="colors" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Claude Color Palette Generator</CardTitle>
              <CardDescription>Generate color palettes based on descriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Describe your desired color palette..."
                value={colorPrompt}
                onChange={(e) => setColorPrompt(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerateColors} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Generate Colors'}
              </Button>
            </CardFooter>
          </Card>

          {colors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Color Palette</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  {colors.map((color, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-16 h-16 rounded-md border" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs mt-1">{color}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Claude Content Analysis</CardTitle>
              <CardDescription>Analyze content sentiment and topics</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter content to analyze..."
                value={contentAnalysis}
                onChange={(e) => setContentAnalysis(e.target.value)}
                rows={4}
              />
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleAnalyzeContent} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : 'Analyze Content'}
              </Button>
            </CardFooter>
          </Card>

          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Sentiment</h3>
                    <p className="bg-muted p-2 rounded">{analysisResult.sentiment}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.topics.map((topic: string, i: number) => (
                        <span key={i} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywords.map((keyword: string, i: number) => (
                        <span key={i} className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
