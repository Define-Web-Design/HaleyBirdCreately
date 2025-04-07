import React, { useState } from 'react';
import openAIClient from '@/utils/openai-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

export default function OpenAIExample() {
  const [apiKey, setApiKey] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [colorPrompt, setColorPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [colors, setColors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('text');
  const { toast } = useToast();

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your OpenAI API key',
        variant: 'destructive',
      });
      return;
    }

    openAIClient.setApiKey(apiKey);
    toast({
      title: 'API Key Saved',
      description: 'Your OpenAI API key has been saved for this session',
    });
  };

  const handleGenerateText = async () => {
    if (!openAIClient.hasApiKey()) {
      toast({
        title: 'API Key Required',
        description: 'Please set your OpenAI API key first',
        variant: 'destructive',
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a prompt for text generation',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await openAIClient.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      setResponse(result.choices[0]?.message?.content || 'No response generated');
    } catch (error) {
      console.error('Text generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate text',
        variant: 'destructive',
      });
      setResponse('Error generating response. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateColors = async () => {
    if (!openAIClient.hasApiKey()) {
      toast({
        title: 'API Key Required',
        description: 'Please set your OpenAI API key first',
        variant: 'destructive',
      });
      return;
    }

    if (!colorPrompt.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please enter a description for the color palette',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const colorPalette = await openAIClient.generateColorPalette(colorPrompt, 5);
      setColors(colorPalette);
    } catch (error) {
      console.error('Color generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate colors',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>OpenAI Integration Demo</CardTitle>
          <CardDescription>
            Test OpenAI's capabilities with text generation and color palette creation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium mb-1">
                OpenAI API Key
              </label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your OpenAI API key"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                />
                <Button onClick={handleSaveApiKey}>Save Key</Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your API key is stored only in this browser session and is not saved to the server.
              </p>
            </div>

            {!openAIClient.hasApiKey() && (
              <Alert variant="warning" className="mt-4">
                <AlertTitle>API Key Required</AlertTitle>
                <AlertDescription>
                  Please set your OpenAI API key to use this feature. You can get an API key from the OpenAI dashboard.
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text Generation</TabsTrigger>
                <TabsTrigger value="colors">Color Palette</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-4">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium mb-1">
                    Prompt
                  </label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleGenerateText}
                  disabled={isLoading || !openAIClient.hasApiKey()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Text'
                  )}
                </Button>

                {response && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Response</label>
                    <div className="border rounded-md p-4 bg-muted/30 whitespace-pre-wrap">
                      {response}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="colors" className="space-y-4 mt-4">
                <div>
                  <label htmlFor="color-prompt" className="block text-sm font-medium mb-1">
                    Color Palette Description
                  </label>
                  <Input
                    id="color-prompt"
                    placeholder="e.g., Sunset over the ocean"
                    value={colorPrompt}
                    onChange={e => setColorPrompt(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleGenerateColors}
                  disabled={isLoading || !openAIClient.hasApiKey()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Color Palette'
                  )}
                </Button>

                {colors.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Generated Palette</label>
                    <div className="flex flex-wrap gap-2">
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
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Powered by OpenAI API
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}