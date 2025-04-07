
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function SlackIntegrationExample() {
  const [channel, setChannel] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessageToSlack = async () => {
    if (!channel || !message) {
      toast({
        title: "Error",
        description: "Please provide both channel and message",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/slack/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          message,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Message sent to Slack successfully",
        });
        setMessage('');
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send message to Slack",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      console.error('Error sending message to Slack:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Send Message to Slack</CardTitle>
        <CardDescription>
          Send a message to a Slack channel directly from this interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="channel" className="text-sm font-medium">Channel ID</label>
          <Input
            id="channel"
            placeholder="Enter Slack channel ID"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">Message</label>
          <Textarea
            id="message"
            placeholder="Type your message here"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={sendMessageToSlack} 
          disabled={isLoading || !channel || !message}
          className="w-full"
        >
          {isLoading ? 'Sending...' : 'Send to Slack'}
        </Button>
      </CardFooter>
    </Card>
  );
}
