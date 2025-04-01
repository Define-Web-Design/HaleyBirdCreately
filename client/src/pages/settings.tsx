import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/lib/ThemeContext';
import TactileFeedbackSettings from '@/components/settings/TactileFeedbackSettings';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Settings, Palette, Bell, Lock, TouchpadOff, Cpu } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { theme, isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Helmet>
        <title>Settings | Creately</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your Creately experience and preferences
        </p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="mb-8 flex flex-wrap gap-2">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="interactions" className="flex items-center gap-2">
            <TouchpadOff className="h-4 w-4" />
            <span>Interactions</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>Theme Settings</CardTitle>
                </div>
                <CardDescription>
                  Customize the look and feel of your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Theme settings will go here</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interactions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TactileFeedbackSettings />
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TouchpadOff className="h-5 w-5 text-primary" />
                  <CardTitle>Gesture Controls</CardTitle>
                </div>
                <CardDescription>
                  Customize swipe and gesture behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Gesture settings will go here</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Notification settings will go here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Privacy Settings</CardTitle>
              </div>
              <CardDescription>
                Control your data and privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Privacy settings will go here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-primary" />
                <CardTitle>Performance Options</CardTitle>
              </div>
              <CardDescription>
                Optimize application performance for your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Performance settings will go here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;