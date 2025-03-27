
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/lib/hooks/use-theme';

export default function Profile() {
  const { isDark, toggleTheme } = useTheme();
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <label>Dark Mode</label>
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
          </div>
          
          <div className="flex items-center justify-between">
            <label>High Contrast</label>
            <Switch checked={highContrast} onCheckedChange={setHighContrast} />
          </div>
          
          <div className="space-y-2">
            <label>Font Size</label>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setFontSize(s => Math.max(s - 2, 12))}
              >
                A-
              </Button>
              <span>{fontSize}px</span>
              <Button 
                variant="outline"
                onClick={() => setFontSize(s => Math.min(s + 2, 24))}
              >
                A+
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Integration settings will go here */}
        </CardContent>
      </Card>
    </div>
  );
}
