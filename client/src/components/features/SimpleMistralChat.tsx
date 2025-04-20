
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import mistralAI from '@/utils/mistral-ai';

const SimpleMistralChat: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    try {
      const result = await mistralAI.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 1000,
        model: 'mistral-medium'
      });
      
      setResponse(result);
      toast({
        title: 'Response received',
        description: 'Mistral AI has responded to your prompt',
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

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Mistral AI Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] w-full"
            />
          </div>
          
          {response && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Response:</h3>
              <div className="whitespace-pre-wrap">{response}</div>
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? 'Generating...' : 'Get Response'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SimpleMistralChat;
