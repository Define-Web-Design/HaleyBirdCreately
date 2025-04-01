import React from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Phone, Watch, Laptop, Settings, Wand } from 'lucide-react';

const TactileFeedbackSettings: React.FC = () => {
  const {
    isTactileFeedbackEnabled,
    toggleTactileFeedback,
    transitionSpeed,
    setTransitionSpeed,
  } = useTheme();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Watch className="h-5 w-5 text-primary" />
          <CardTitle>Tactile Feedback Settings</CardTitle>
        </div>
        <CardDescription>
          Customize how the app feels when you interact with it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="tactile-feedback" className="text-base">
                Enable Tactile Feedback
              </Label>
              <p className="text-sm text-muted-foreground">
                Enhances touch interactions with subtle physical-like responses
              </p>
            </div>
            <Switch
              id="tactile-feedback"
              checked={isTactileFeedbackEnabled}
              onCheckedChange={toggleTactileFeedback}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex flex-col space-y-1.5 mb-3">
              <Label htmlFor="transition-speed" className="text-base">
                Animation Speed
              </Label>
              <p className="text-sm text-muted-foreground">
                Adjust how quickly the app responds to your interactions
              </p>
            </div>
            <Select
              value={transitionSpeed}
              onValueChange={(value) => setTransitionSpeed(value as 'default' | 'fast' | 'luxurious')}
              disabled={!isTactileFeedbackEnabled}
            >
              <SelectTrigger id="transition-speed" className="w-full">
                <SelectValue placeholder="Select animation speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Animation Speed</SelectLabel>
                  <SelectItem value="fast" className="flex items-center">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4" />
                      <span>Fast (Performance Priority)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="default" className="flex items-center">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>Default (Balanced)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="luxurious" className="flex items-center">
                    <div className="flex items-center gap-2">
                      <Wand className="h-4 w-4" />
                      <span>Luxurious (Enhanced Experience)</span>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          {isTactileFeedbackEnabled
            ? "Tactile feedback is currently on. You'll feel subtle responses when interacting with elements."
            : "Tactile feedback is currently off. Enable it for a more immersive experience."}
        </p>
      </CardFooter>
    </Card>
  );
};

export default TactileFeedbackSettings;