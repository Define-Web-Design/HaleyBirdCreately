
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import openai from '@/utils/openai-client';

interface OpenAIResponse {
  title: string;
  description: string;
  keywords: string[];
}

const OpenAIExample: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [structuredResponse, setStructuredResponse] = useState<OpenAIResponse | null>(null);
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
      const result = await openai.generateText(prompt);
      setResponse(result);
      toast({
        title: 'Text generated',
        description: 'OpenAI has generated a response',
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
      const systemPrompt = `
        You are a content metadata generator. 
        Create a JSON object with the following structure:
        {
          "title": "A catchy title for the content",
          "description": "A brief description",
          "keywords": ["array", "of", "relevant", "keywords"]
        }
      `;
      
      const result = await openai.generateStructuredData<OpenAIResponse>(prompt, systemPrompt);
      setStructuredResponse(result);
      toast({
        title: 'Data generated',
        description: 'OpenAI has generated structured data',
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
        title: 'Missing image URL',
        description: 'Please enter an image URL to analyze',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await openai.analyzeImage(
        imageUrl,
        'Analyze this image and describe what you see in detail.'
      );
      setImageAnalysis(result);
      toast({
        title: 'Image analyzed',
        description: 'OpenAI has analyzed the image',
      });
    } catch (error) {
      toast({
        title: 'Analysis failed',
        description: `Error: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Text Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Text Generation</CardTitle>
          <CardDescription>
            Generate text using OpenAI GPT models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
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
                <Label>Response</Label>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                  {response}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateText} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Text'}
          </Button>
        </CardFooter>
      </Card>

      {/* Structured Data Section */}
      <Card>
        <CardHeader>
          <CardTitle>Structured Data Generation</CardTitle>
          <CardDescription>
            Generate JSON data using OpenAI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="structuredPrompt">Prompt</Label>
              <Textarea
                id="structuredPrompt"
                placeholder="Describe the content to generate metadata for..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            {structuredResponse && (
              <div className="space-y-2">
                <Label>Generated Data</Label>
                <div className="p-4 bg-muted rounded-md">
                  <p><strong>Title:</strong> {structuredResponse.title}</p>
                  <p><strong>Description:</strong> {structuredResponse.description}</p>
                  <p><strong>Keywords:</strong> {structuredResponse.keywords.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateStructuredData} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Structured Data'}
          </Button>
        </CardFooter>
      </Card>

      {/* Image Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle>Image Analysis</CardTitle>
          <CardDescription>
            Analyze images using OpenAI Vision
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="Enter image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            {imageUrl && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="overflow-hidden rounded-md border border-input">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="max-h-[300px] w-full object-contain"
                    onError={() => {
                      toast({
                        title: 'Image load error',
                        description: 'Could not load image from URL',
                        variant: 'destructive',
                      });
                    }} 
                  />
                </div>
              </div>
            )}
            {imageAnalysis && (
              <div className="space-y-2">
                <Label>Analysis</Label>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                  {imageAnalysis}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyzeImage} disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze Image'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OpenAIExample;
import React, { useState } from 'react';
import { generateText, generateColorPalette } from '../../utils/openai-client';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { toast } from '../ui/toaster';

const OpenAIExample = () => {
  const [prompt, setPrompt] = useState('');
  const [paletteDescription, setPaletteDescription] = useState('');
  const [result, setResult] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaletteLoading, setIsPaletteLoading] = useState(false);

  const handleGenerateText = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const generatedText = await generateText(prompt);
      setResult(generatedText);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate text",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePalette = async () => {
    if (!paletteDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for your color palette",
        variant: "destructive"
      });
      return;
    }

    setIsPaletteLoading(true);
    try {
      const palette = await generateColorPalette(paletteDescription);
      setColors(palette);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate color palette",
        variant: "destructive"
      });
    } finally {
      setIsPaletteLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">OpenAI Text Generation</h2>
        <Textarea
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px]"
        />
        <Button 
          onClick={handleGenerateText} 
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Text'}
        </Button>
        
        {result && (
          <Card className="p-4 mt-4">
            <h3 className="font-semibold mb-2">Generated Result:</h3>
            <div className="whitespace-pre-wrap">{result}</div>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">OpenAI Color Palette Generator</h2>
        <Input
          placeholder="Describe your color palette (e.g., 'sunset on the beach')"
          value={paletteDescription}
          onChange={(e) => setPaletteDescription(e.target.value)}
        />
        <Button 
          onClick={handleGeneratePalette} 
          disabled={isPaletteLoading}
        >
          {isPaletteLoading ? 'Generating...' : 'Generate Palette'}
        </Button>
        
        {colors.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Generated Palette:</h3>
            <div className="flex space-x-2">
              {colors.map((color, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-16 h-16 rounded-md border border-gray-200" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm mt-1">{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenAIExample;
