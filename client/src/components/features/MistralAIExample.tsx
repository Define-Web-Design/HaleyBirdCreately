
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import mistralAI from '@/utils/mistral-ai';

// Type for structured response
interface MistralResponseData {
  analysis: {
    topic: string;
    sentiment: string;
    keywords: string[];
  };
  recommendations: string[];
}

const MistralAIExample: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [structuredResponse, setStructuredResponse] = useState<MistralResponseData | null>(null);
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
      const result = await mistralAI.generateText(prompt);
      setResponse(result);
      toast({
        title: 'Text generated',
        description: 'Mistral has generated a response',
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
        You are a content analyst. Analyze the provided text and return a JSON with:
        1. "analysis" object containing "topic", "sentiment", and "keywords" array
        2. "recommendations" array with suggestions based on the content
      `;
      
      const result = await mistralAI.generateStructuredData<MistralResponseData>(
        prompt,
        systemPrompt
      );
      
      setStructuredResponse(result);
      toast({
        title: 'Structured data generated',
        description: 'Mistral has analyzed your content',
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
      {/* Text generation card */}
      <Card>
        <CardHeader>
          <CardTitle>Mistral AI Text Generation</CardTitle>
          <CardDescription>
            Generate text responses with Mistral AI models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Your prompt</Label>
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
                <Label>Generated response</Label>
                <div className="p-4 rounded-md bg-muted whitespace-pre-wrap">
                  {response}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button 
            onClick={handleGenerateText} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Generating...' : 'Generate Text'}
          </Button>
          <Button 
            onClick={handleGenerateStructuredData} 
            disabled={isLoading}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Analyzing...' : 'Generate Structured Data'}
          </Button>
        </CardFooter>
      </Card>

      {/* Structured data card */}
      {structuredResponse && (
        <Card>
          <CardHeader>
            <CardTitle>Content Analysis</CardTitle>
            <CardDescription>
              AI-powered analysis of your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Analysis</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Topic: {structuredResponse.analysis.topic}</li>
                  <li>Sentiment: {structuredResponse.analysis.sentiment}</li>
                  <li>
                    Keywords: {structuredResponse.analysis.keywords.join(', ')}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Recommendations</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {structuredResponse.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MistralAIExample;
