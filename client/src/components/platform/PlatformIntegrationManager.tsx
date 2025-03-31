
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PLATFORM_SETTINGS } from 'server/services/platforms';
import { PlatformIntegration } from 'shared/schema';

interface Props {
  userId: number;
  onUpdate?: () => void;
}

export default function PlatformIntegrationManager({ userId, onUpdate }: Props) {
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegrations();
  }, [userId]);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/integrations');
      if (!response.ok) throw new Error('Failed to fetch integrations');
      const data = await response.json();
      setIntegrations(data);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      toast({
        title: "Error",
        description: "Failed to load platform integrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platform: string) => {
    // Get the auth URL from platform settings
    const platformInfo = Object.values(PLATFORM_SETTINGS).find(
      p => p.name.toUpperCase() === platform.toUpperCase()
    );
    
    if (platformInfo && platformInfo.authUrl) {
      // In a real implementation, this would redirect to the OAuth flow
      window.location.href = platformInfo.authUrl;
    }
  };

  const handleDisconnect = async (integrationId: number) => {
    try {
      const response = await fetch(`/api/user/integrations/${integrationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to disconnect platform');
      
      toast({
        title: "Success",
        description: "Platform disconnected successfully",
      });
      
      // Refresh integrations
      fetchIntegrations();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error disconnecting platform:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect platform",
        variant: "destructive"
      });
    }
  };

  // Get all platforms
  const allPlatforms = Object.values(PLATFORM_SETTINGS);
  
  // Filter out platforms that are already integrated
  const availablePlatforms = allPlatforms.filter(platform => 
    !integrations.some(int => int.platform.toUpperCase() === platform.name.toUpperCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
          <CardDescription>
            Manage your social media platform connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4 text-center text-gray-500">Loading integrations...</div>
          ) : integrations.length === 0 ? (
            <div className="py-4 text-center text-gray-500">No platforms connected yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map(integration => {
                const platformInfo = Object.values(PLATFORM_SETTINGS).find(
                  p => p.name.toUpperCase() === integration.platform.toUpperCase()
                );
                
                return (
                  <div 
                    key={integration.id}
                    className="p-4 border rounded-md flex items-center justify-between"
                    style={{ borderColor: platformInfo?.color || '#e2e8f0' }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                        style={{ backgroundColor: platformInfo?.color || '#e2e8f0' }}
                      >
                        <i className={`${platformInfo?.icon || 'fas fa-globe'} text-white`}></i>
                      </div>
                      <div>
                        <div className="font-medium">{platformInfo?.name || integration.platform}</div>
                        <div className="text-sm text-gray-500">Connected</div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {availablePlatforms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connect More Platforms</CardTitle>
            <CardDescription>
              Expand your reach by connecting additional social media accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePlatforms.map(platform => (
                <div 
                  key={platform.name}
                  className="p-4 border rounded-md flex items-center justify-between"
                  style={{ borderColor: platform.color || '#e2e8f0' }}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: platform.color || '#e2e8f0' }}
                    >
                      <i className={`${platform.icon || 'fas fa-globe'} text-white`}></i>
                    </div>
                    <div>
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm text-gray-500">Not connected</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleConnect(platform.name)}
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
