
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { hapticFeedback, setHapticFeedbackEnabled, getHapticFeedbackEnabled } from '../../lib/hapticFeedback';

export function TactileFeedbackSettings() {
  const [feedbackEnabled, setFeedbackEnabled] = useState<boolean>(true);
  
  useEffect(() => {
    // Load saved preference
    setFeedbackEnabled(getHapticFeedbackEnabled());
  }, []);
  
  const handleToggle = (checked: boolean) => {
    setFeedbackEnabled(checked);
    setHapticFeedbackEnabled(checked);
    
    // Provide feedback if being enabled
    if (checked) {
      hapticFeedback('light');
    }
  };
  
  const testFeedback = (intensity: 'light' | 'medium' | 'strong' | 'success' | 'error' | 'warning') => {
    hapticFeedback(intensity);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tactile Feedback</CardTitle>
        <CardDescription>
          Configure tactile feedback for touch interactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="tactile-feedback" className="flex-1">
            Enable tactile feedback
            <span className="block text-sm text-muted-foreground mt-1">
              Provides subtle vibration feedback when interacting with elements
            </span>
          </Label>
          <Switch 
            id="tactile-feedback" 
            checked={feedbackEnabled}
            onCheckedChange={handleToggle}
          />
        </div>
        
        {feedbackEnabled && (
          <div className="space-y-4">
            <div className="text-sm font-medium">Test feedback intensities</div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => testFeedback('light')}
              >
                Light
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => testFeedback('medium')}
              >
                Medium
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => testFeedback('strong')}
              >
                Strong
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => testFeedback('success')}
                className="text-green-600"
              >
                Success
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => testFeedback('error')}
                className="text-red-600"
              >
                Error
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => testFeedback('warning')}
                className="text-yellow-600"
              >
                Warning
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Tactile feedback requires a device that supports vibration.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TactileFeedbackSettings;
