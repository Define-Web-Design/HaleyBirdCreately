import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/lib/hooks/use-theme';
import { Link, useLocation } from 'wouter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PLATFORMS } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

// Color blindness simulation modes
const colorBlindnessTypes = [
  { id: 'none', name: 'None' },
  { id: 'protanopia', name: 'Protanopia (Red-Blind)' },
  { id: 'deuteranopia', name: 'Deuteranopia (Green-Blind)' },
  { id: 'tritanopia', name: 'Tritanopia (Blue-Blind)' },
  { id: 'achromatopsia', name: 'Achromatopsia (Monochrome)' }
];

export default function Profile() {
  const { isDark, toggleTheme } = useTheme();
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReaderOptimized, setScreenReaderOptimized] = useState(false);
  const [colorBlindnessMode, setColorBlindnessMode] = useState('none');
  const [hapticsEnabled, setHapticsEnabled] = useState(false);
  const [location, setLocation] = useLocation();
  
  // Apply font size to document root
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    
    // Cleanup on unmount
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontSize]);
  
  // Apply color blindness filter to the entire app
  useEffect(() => {
    document.body.dataset.colorBlindness = colorBlindnessMode;
    
    // Add CSS filter based on color blindness mode
    const html = document.documentElement;
    
    switch(colorBlindnessMode) {
      case 'protanopia':
        html.style.filter = 'url(#protanopia-filter)';
        break;
      case 'deuteranopia':
        html.style.filter = 'url(#deuteranopia-filter)';
        break;  
      case 'tritanopia':
        html.style.filter = 'url(#tritanopia-filter)';
        break;
      case 'achromatopsia':
        html.style.filter = 'grayscale(100%)';
        break;
      default:
        html.style.filter = '';
    }
    
    // Cleanup on unmount
    return () => {
      html.style.filter = '';
      delete document.body.dataset.colorBlindness;
    };
  }, [colorBlindnessMode]);
  
  // Apply reduced motion setting
  useEffect(() => {
    if (reducedMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
    
    return () => {
      document.body.classList.remove('reduce-motion');
    };
  }, [reducedMotion]);
  
  // Apply high contrast
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    return () => {
      document.body.classList.remove('high-contrast');
    };
  }, [highContrast]);
  
  // Determine which tab to show based on the URL
  const getActiveTab = () => {
    if (location.includes('/accessibility')) return 'accessibility';
    if (location.includes('/integrations')) return 'integrations';
    return 'general';
  };
  
  // Change tabs through URL
  const handleTabChange = (value: string) => {
    if (value === 'accessibility') {
      setLocation('/profile/accessibility');
    } else if (value === 'integrations') {
      setLocation('/profile/integrations');
    } else {
      setLocation('/profile');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* SVG Filters for Color Blindness Simulation - hidden from view */}
      <svg aria-hidden="true" className="absolute w-0 h-0 overflow-hidden">
        <defs>
          {/* Protanopia (red-blind) */}
          <filter id="protanopia-filter">
            <feColorMatrix 
              type="matrix"
              values="0.567, 0.433, 0, 0, 0
                      0.558, 0.442, 0, 0, 0
                      0, 0.242, 0.758, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
          
          {/* Deuteranopia (green-blind) */}
          <filter id="deuteranopia-filter">
            <feColorMatrix 
              type="matrix"
              values="0.625, 0.375, 0, 0, 0
                      0.7, 0.3, 0, 0, 0
                      0, 0.3, 0.7, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
          
          {/* Tritanopia (blue-blind) */}
          <filter id="tritanopia-filter">
            <feColorMatrix 
              type="matrix"
              values="0.95, 0.05, 0, 0, 0
                      0, 0.433, 0.567, 0, 0
                      0, 0.475, 0.525, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
        </defs>
      </svg>
    
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
          <Tabs defaultValue={getActiveTab()} className="w-full" onValueChange={handleTabChange}>
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
                    <Link href="/analytics">
                      <Button 
                        variant="ghost" 
                        className="w-full"
                      >
                        View Full History
                      </Button>
                    </Link>
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
                    <Link href="/content-vault">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="self-start sm:self-auto"
                      >
                        Manage
                      </Button>
                    </Link>
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
                  <CardDescription>Customize your experience for better accessibility</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Display Settings */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Display</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>
                    </div>
                    
                    {/* Color Blindness Options */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Color Blindness Support</h3>
                      <div className="p-4 border rounded-md">
                        <label className="font-medium block mb-2">Color Blindness Mode</label>
                        <p className="text-sm text-muted-foreground mb-3">Adjust colors to accommodate different types of color vision deficiency</p>
                        
                        <Select 
                          value={colorBlindnessMode} 
                          onValueChange={setColorBlindnessMode}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a color blindness mode" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorBlindnessTypes.map(type => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="mt-4 flex flex-wrap gap-3">
                          <div className="w-12 h-12 rounded-md bg-red-500 border" aria-label="Red color sample"></div>
                          <div className="w-12 h-12 rounded-md bg-green-500 border" aria-label="Green color sample"></div>
                          <div className="w-12 h-12 rounded-md bg-blue-500 border" aria-label="Blue color sample"></div>
                          <div className="w-12 h-12 rounded-md bg-yellow-500 border" aria-label="Yellow color sample"></div>
                          <div className="w-12 h-12 rounded-md bg-purple-500 border" aria-label="Purple color sample"></div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2">Color samples help you verify the current filter effect</p>
                      </div>
                    </div>
                    
                    {/* Text Size */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Text</h3>
                      <div className="p-4 border rounded-md space-y-2">
                        <label className="font-medium block">Text Size</label>
                        <p className="text-sm text-muted-foreground">Adjust the size of text throughout the app</p>
                        <div className="flex items-center justify-between mt-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setFontSize(s => Math.max(s - 1, 12))}
                            aria-label="Decrease text size"
                            className="flex-1"
                          >
                            A-
                          </Button>
                          <span className="px-4 text-center">{fontSize}px</span>
                          <Button 
                            variant="outline"
                            onClick={() => setFontSize(s => Math.min(s + 1, 24))}
                            aria-label="Increase text size"
                            className="flex-1"
                          >
                            A+
                          </Button>
                        </div>
                        <div className="mt-3 text-base">
                          <p>Example text at current size</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Motion & Interaction */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Motion & Interaction</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-md">
                          <div className="flex flex-row items-center justify-between mb-1">
                            <label className="font-medium">Reduced Motion</label>
                            <Switch 
                              checked={reducedMotion}
                              onCheckedChange={setReducedMotion}
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">Minimize animations throughout the interface</p>
                        </div>
                        
                        <div className="p-4 border rounded-md">
                          <div className="flex flex-row items-center justify-between mb-1">
                            <label className="font-medium">Haptic Feedback</label>
                            <Switch 
                              checked={hapticsEnabled}
                              onCheckedChange={setHapticsEnabled}
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">Enable vibration feedback on mobile devices</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Assistive Technology */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Assistive Technology</h3>
                      <div className="p-4 border rounded-md">
                        <div className="flex flex-row items-center justify-between mb-1">
                          <label className="font-medium">Screen Reader Optimized</label>
                          <Switch 
                            checked={screenReaderOptimized}
                            onCheckedChange={setScreenReaderOptimized}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">Enhance interface elements and descriptions for screen readers</p>
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
                  <CardDescription>Manage your platform connections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PLATFORMS.map((platform) => (
                    <div 
                      key={platform.name}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${platform.color}`}>
                          <i className={platform.icon}></i>
                        </div>
                        <div className="ml-3">
                          <h4 className="font-medium">{platform.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {connectedPlatforms.includes(platform.name) 
                              ? "Connected" 
                              : "Not connected"}
                          </p>
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
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sharing Settings</CardTitle>
                  <CardDescription>Configure how content is shared to platforms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex flex-row items-center justify-between mb-1">
                      <label className="font-medium">Automatic Sharing</label>
                      <Switch className="data-[state=checked]:bg-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Automatically share new palettes and mood capsules</p>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <div className="flex flex-row items-center justify-between mb-1">
                      <label className="font-medium">Share Analytics</label>
                      <Switch className="data-[state=checked]:bg-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Allow analytics data to be shared with integrations</p>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <div className="flex flex-row items-center justify-between mb-1">
                      <label className="font-medium">Import Content</label>
                      <Button variant="outline" size="sm">Import Now</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Import content from connected platforms</p>
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