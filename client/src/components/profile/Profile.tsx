
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/lib/hooks/use-theme';
import { useLocation } from 'wouter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PLATFORMS } from '@/lib/constants';

// Example data for Sophia
const mockCreativeHistory = [
  { title: "Created Winter Mood Board", date: "March 25, 2025", pointsEarned: 25 },
  { title: "Shared Color Palette on Twitter", date: "March 24, 2025", pointsEarned: 15 },
  { title: "Generated 3 AI Color Schemes", date: "March 23, 2025", pointsEarned: 30 },
  { title: "Created Happy Mood Capsule", date: "March 22, 2025", pointsEarned: 40 },
  { title: "Uploaded 12 Photos to Content Library", date: "March 20, 2025", pointsEarned: 20 },
];

// Mock user data
const userData = {
  name: "Sophia Chen",
  role: "Creative Director",
  email: "sophia@example.com",
  tier: "Advanced",
  points: 620,
  creativeEnergyPoints: 145,
  maxCreativeEnergy: 150,
  joinDate: "January 15, 2025",
  profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80"
};

// Mock connected platforms
const connectedPlatforms = ["Instagram", "LinkedIn"];

export default function Profile() {
  const { isDark, toggleTheme } = useTheme();
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [location] = useLocation();
  
  // Determine which tab to show based on the URL
  const getActiveTab = () => {
    if (location.includes('/accessibility')) return 'accessibility';
    if (location.includes('/integrations')) return 'integrations';
    return 'general';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start gap-6">
        {/* User profile sidebar */}
        <Card className="w-80 shrink-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <img 
                src={userData.profileImage} 
                alt="Sophia Chen profile"
                className="h-24 w-24 rounded-full object-cover mb-4"
              />
              <h2 className="text-xl font-bold">{userData.name}</h2>
              <p className="text-sm text-muted-foreground">{userData.role}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-100">
                  {userData.tier} Tier
                </Badge>
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-100">
                  {userData.points} Points
                </Badge>
              </div>
              
              <div className="w-full mt-4 space-y-1">
                <p className="text-sm text-center">Creative Energy</p>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${(userData.creativeEnergyPoints / userData.maxCreativeEnergy) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {userData.creativeEnergyPoints}/{userData.maxCreativeEnergy} points
                </p>
              </div>
              
              <div className="w-full border-t mt-4 pt-4">
                <p className="text-sm">
                  <span className="text-muted-foreground">Member since:</span> {userData.joinDate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main content */}
        <div className="flex-1">
          <Tabs defaultValue={getActiveTab()} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>
            
            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p>{userData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p>{userData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p>{userData.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subscription</p>
                      <p>Premium (Annual)</p>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-2">Edit Profile</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Creative History</CardTitle>
                  <CardDescription>Your recent creative activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCreativeHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          +{item.pointsEarned} points
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4">View Full History</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Settings</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Dark Mode</label>
                      <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                    </div>
                    <Switch 
                      checked={isDark} 
                      onCheckedChange={toggleTheme}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">High Contrast</label>
                      <p className="text-sm text-muted-foreground">Increase contrast for better readability</p>
                    </div>
                    <Switch 
                      checked={highContrast} 
                      onCheckedChange={setHighContrast}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-medium">Text Size</label>
                    <p className="text-sm text-muted-foreground">Adjust the size of text throughout the app</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setFontSize(s => Math.max(s - 2, 12))}
                      >
                        A-
                      </Button>
                      <span className="min-w-[60px] text-center">{fontSize}px</span>
                      <Button 
                        variant="outline"
                        onClick={() => setFontSize(s => Math.min(s + 2, 24))}
                      >
                        A+
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Reduced Motion</label>
                      <p className="text-sm text-muted-foreground">Minimize animations throughout the interface</p>
                    </div>
                    <Switch className="data-[state=checked]:bg-primary" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Screen Reader Optimized</label>
                      <p className="text-sm text-muted-foreground">Enhanced support for screen readers</p>
                    </div>
                    <Switch className="data-[state=checked]:bg-primary" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connected Platforms</CardTitle>
                  <CardDescription>Manage your connected social media accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {PLATFORMS.map((platform) => (
                      <div key={platform.name} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center">
                          <i className={`${platform.icon} text-xl ${platform.color} mr-3`}></i>
                          <div>
                            <p className="font-medium">{platform.name}</p>
                            <p className="text-xs text-muted-foreground">{platform.type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <Button 
                          variant={connectedPlatforms.includes(platform.name) ? "outline" : "default"}
                          size="sm"
                        >
                          {connectedPlatforms.includes(platform.name) ? "Disconnect" : "Connect"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>API Preferences</CardTitle>
                  <CardDescription>Configure AI model preferences and API settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">OpenAI Integration</p>
                        <p className="text-sm text-muted-foreground">Connected: March 20, 2025</p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        Active
                      </Badge>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm">Configure</Button>
                      <Button variant="ghost" size="sm">Disconnect</Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Midjourney</p>
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      </div>
                      <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                        Inactive
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <Button size="sm">Connect API</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
