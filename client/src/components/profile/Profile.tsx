
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
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Mobile profile summary - only visible on small screens */}
      <div className="md:hidden mb-6 p-4 bg-background rounded-lg border shadow-sm">
        <div className="flex items-center space-x-4">
          <img 
            src={userData.profileImage} 
            alt="Sophia Chen profile"
            className="h-16 w-16 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-bold">{userData.name}</h2>
            <p className="text-sm text-muted-foreground">{userData.role}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                {userData.tier}
              </Badge>
              <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                {userData.points} Points
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="mt-3 space-y-1">
          <p className="text-xs text-muted-foreground">Creative Energy</p>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary"
              style={{ width: `${(userData.creativeEnergyPoints / userData.maxCreativeEnergy) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs">
            <span>{userData.creativeEnergyPoints} points</span>
            <span>Max: {userData.maxCreativeEnergy}</span>
          </div>
        </div>
      </div>
  
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* User profile sidebar - hidden on mobile */}
        <Card className="w-full md:w-80 shrink-0 hidden md:block">
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
        <div className="flex-1 w-full">
          <Tabs defaultValue={getActiveTab()} className="w-full">
            <TabsList className="mb-4 w-full flex overflow-x-auto no-scrollbar">
              <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
              <TabsTrigger value="accessibility" className="flex-1">Accessibility</TabsTrigger>
              <TabsTrigger value="integrations" className="flex-1">Integrations</TabsTrigger>
            </TabsList>
            
            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-background border rounded-md">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                      <p className="truncate">{userData.name}</p>
                    </div>
                    <div className="p-3 bg-background border rounded-md">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                      <p className="truncate">{userData.email}</p>
                    </div>
                    <div className="p-3 bg-background border rounded-md">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Role</p>
                      <p className="truncate">{userData.role}</p>
                    </div>
                    <div className="p-3 bg-background border rounded-md">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Subscription</p>
                      <p className="truncate">Premium (Annual)</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Creative History</CardTitle>
                  <CardDescription>Your recent creative activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCreativeHistory.slice(0, 3).map((item, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="mb-2 sm:mb-0">
                          <h4 className="font-medium truncate">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="self-start sm:self-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 mt-2 sm:mt-0"
                        >
                          +{item.pointsEarned} points
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button 
                      variant="ghost" 
                      className="w-full" 
                      onClick={() => window.location.href = "/analytics"}
                    >
                      View Full History
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto"
                    >
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Content Security</CardTitle>
                  <CardDescription>Manage content ownership and protection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="font-medium">Ownership Verification</h4>
                      <p className="text-sm text-muted-foreground">Verify ownership of your creative content</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="self-start sm:self-auto"
                      onClick={() => window.location.href = "/content-vault"}
                    >
                      Manage
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="font-medium">Digital Rights</h4>
                      <p className="text-sm text-muted-foreground">Control how your content is shared</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="self-start sm:self-auto"
                    >
                      Configure
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="font-medium">Content Privacy</h4>
                      <p className="text-sm text-muted-foreground">Manage who can view and access your content</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="self-start sm:self-auto"
                    >
                      Settings
                    </Button>
                  </div>
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
                  <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 border rounded-md">
                      <div className="flex flex-row items-center justify-between mb-1">
                        <label className="font-medium">Dark Mode</label>
                        <Switch 
                          checked={isDark} 
                          onCheckedChange={toggleTheme}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex flex-row items-center justify-between mb-1">
                        <label className="font-medium">High Contrast</label>
                        <Switch 
                          checked={highContrast} 
                          onCheckedChange={setHighContrast}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">Increase contrast for better readability</p>
                    </div>
                    
                    <div className="p-4 border rounded-md space-y-2">
                      <label className="font-medium block">Text Size</label>
                      <p className="text-sm text-muted-foreground">Adjust the size of text throughout the app</p>
                      <div className="flex items-center justify-between mt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setFontSize(s => Math.max(s - 2, 12))}
                          className="flex-1"
                        >
                          A-
                        </Button>
                        <span className="px-4 text-center">{fontSize}px</span>
                        <Button 
                          variant="outline"
                          onClick={() => setFontSize(s => Math.min(s + 2, 24))}
                          className="flex-1"
                        >
                          A+
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex flex-row items-center justify-between mb-1">
                        <label className="font-medium">Reduced Motion</label>
                        <Switch className="data-[state=checked]:bg-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Minimize animations throughout the interface</p>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex flex-row items-center justify-between mb-1">
                        <label className="font-medium">Screen Reader Optimized</label>
                        <Switch className="data-[state=checked]:bg-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Enhanced support for screen readers</p>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex flex-row items-center justify-between mb-1">
                        <label className="font-medium">Color Blind Mode</label>
                        <span className="text-sm text-muted-foreground">Active</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Adjust colors to accommodate different types of color blindness</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <Button size="sm" variant="outline" className="w-full">None</Button>
                        <Button size="sm" variant="outline" className="w-full">Protanopia</Button>
                        <Button size="sm" variant="outline" className="w-full">Deuteranopia</Button>
                        <Button size="sm" variant="outline" className="w-full">Tritanopia</Button>
                        <Button size="sm" variant="outline" className="w-full">Grayscale</Button>
                      </div>
                    </div>
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
                  <div className="grid grid-cols-1 gap-4">
                    {PLATFORMS.map((platform) => (
                      <div 
                        key={platform.name} 
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md"
                      >
                        <div className="flex items-center mb-3 sm:mb-0">
                          <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${platform.color} mr-3`}>
                            <i className={`${platform.icon} text-xl`}></i>
                          </div>
                          <div>
                            <p className="font-medium">{platform.name}</p>
                            <p className="text-xs text-muted-foreground">{platform.type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                          <Button 
                            variant={connectedPlatforms.includes(platform.name) ? "outline" : "default"}
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            {connectedPlatforms.includes(platform.name) ? "Disconnect" : "Connect"}
                          </Button>
                          {connectedPlatforms.includes(platform.name) && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              Settings
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      Connect your social media accounts to share your creative work directly from Creately
                    </p>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Connect New Platform
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>API Preferences</CardTitle>
                  <CardDescription>Configure AI model preferences and API settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                      <div className="mb-2 sm:mb-0">
                        <div className="flex items-center mb-1">
                          <p className="font-medium mr-2">OpenAI Integration</p>
                          <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Connected: March 20, 2025</p>
                      </div>
                      <div className="w-full sm:w-auto">
                        <p className="text-sm text-muted-foreground hidden sm:block">API Usage: 85% of monthly limit</p>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3 sm:mb-4">
                      <div className="h-full bg-green-500 dark:bg-green-600" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 sm:hidden">API Usage: 85% of monthly limit</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">Configure</Button>
                      <Button variant="ghost" size="sm" className="w-full sm:w-auto">View Usage</Button>
                      <Button variant="ghost" size="sm" className="w-full sm:w-auto text-red-500 hover:text-red-600">Disconnect</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                      <div className="mb-2 sm:mb-0">
                        <div className="flex items-center mb-1">
                          <p className="font-medium mr-2">Midjourney</p>
                          <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                            Inactive
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Image generation API not connected</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Button size="sm" className="w-full sm:w-auto">Connect API</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                      <div className="mb-2 sm:mb-0">
                        <div className="flex items-center mb-1">
                          <p className="font-medium mr-2">Stability AI</p>
                          <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                            Inactive
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Advanced image processing and generation</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Button size="sm" className="w-full sm:w-auto">Connect API</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md border-dashed">
                    <div className="text-center py-4">
                      <p className="font-medium mb-2">Add Custom API Integration</p>
                      <p className="text-sm text-muted-foreground mb-4">Connect a custom AI service to expand capabilities</p>
                      <Button variant="outline" className="w-full sm:w-auto">
                        Add Custom API
                      </Button>
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
