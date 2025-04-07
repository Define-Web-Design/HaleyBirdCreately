
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import geminiAI from '@/utils/gemini-ai';

interface GeminiResponseData {
  ideas: string[];
  themes: string[];
  colors: string[];
}

const GeminiAIExample: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [structuredResponse, setStructuredResponse] = useState<GeminiResponseData | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAnalysis, setImageAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Handle text generation
  const handleGenerateText = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Empty prompt',
        description: 'Please enter a prompt to generate text',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await geminiAI.generateText(prompt);
      setResponse(result);
      toast({
        title: 'Text generated',
        description: 'Gemini has generated a response',
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: `Error: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle structured data generation
  const handleGenerateStructuredData = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Empty prompt',
        description: 'Please enter a prompt to generate data',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const systemPrompt = 'You are a creative ideas generator. Generate ideas based on the user prompt.';
      const result = await geminiAI.generateStructuredData<GeminiResponseData>(
        prompt,
        systemPrompt
      );
      
      setStructuredResponse(result);
      toast({
        title: 'Data generated',
        description: 'Gemini has generated structured data',
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: `Error: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image analysis
  const handleAnalyzeImage = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: 'No image URL',
        description: 'Please enter an image URL to analyze',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Fetch the image and convert to base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          // Extract the base64 data (remove the data URL prefix)
          const base64Image = reader.result.split(',')[1];
          
          // Use Gemini to analyze the image
          const result = await geminiAI.analyzeImage(
            base64Image,
            'Describe this image in detail. What's happening in it? What colors are prominent?'
          );
          
          setImageAnalysis(result);
          toast({
            title: 'Image analyzed',
            description: 'Gemini has analyzed the image',
          });
        }
        setIsLoading(false);
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: 'Analysis failed',
        description: `Error: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Gemini AI Text Generation</CardTitle>
          <CardDescription>Enter a prompt and generate text with Google's Gemini AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Your Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            {response && (
              <div className="space-y-2">
                <Label>Generated Response</Label>
                <div className="rounded-md bg-muted p-4 overflow-auto max-h-[300px] whitespace-pre-wrap">
                  {response}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setResponse('')}>Clear</Button>
          <Button onClick={handleGenerateText} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Text'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Structured Data Generation</CardTitle>
          <CardDescription>Generate structured data from your prompt</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="structured-prompt">Your Prompt</Label>
              <Textarea
                id="structured-prompt"
                placeholder="E.g., Generate 5 creative ideas for a summer campaign..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            {structuredResponse && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Generated Ideas</Label>
                  <ul className="list-disc list-inside space-y-1 rounded-md bg-muted p-4">
                    {structuredResponse.ideas?.map((idea, index) => (
                      <li key={index}>{idea}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <Label>Themes</Label>
                  <div className="flex flex-wrap gap-2">
                    {structuredResponse.themes?.map((theme, index) => (
                      <span key={index} className="px-2 py-1 bg-primary/10 rounded-full text-sm">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Suggested Colors</Label>
                  <div className="flex flex-wrap gap-2">
                    {structuredResponse.colors?.map((color, index) => (
                      <div 
                        key={index} 
                        className="w-8 h-8 rounded-full border" 
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setStructuredResponse(null)}>Clear</Button>
          <Button onClick={handleGenerateStructuredData} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Structured Data'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image Analysis with Gemini Vision</CardTitle>
          <CardDescription>Analyze images using Gemini's vision capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="Enter image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            {imageUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="rounded-md overflow-hidden border">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="max-h-[200px] object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      toast({
                        title: 'Image error',
                        description: 'Could not load the image. Check the URL.',
                        variant: 'destructive',
                      });
                    }}
                  />
                </div>
              </div>
            )}
            {imageAnalysis && (
              <div className="space-y-2">
                <Label>Image Analysis</Label>
                <div className="rounded-md bg-muted p-4 overflow-auto max-h-[300px] whitespace-pre-wrap">
                  {imageAnalysis}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => {
            setImageAnalysis('');
          }}>
            Clear Analysis
          </Button>
          <Button onClick={handleAnalyzeImage} disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze Image'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GeminiAIExample;
