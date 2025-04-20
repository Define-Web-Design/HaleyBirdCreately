
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ServiceStatus {
  status: 'active' | 'inactive' | 'error' | 'available' | 'unavailable' | string;
  message?: string;
  lastChecked?: string;
}

interface ServiceHealthResponse {
  status: string;
  timestamp: string;
  services: {
    core: any[];
    ai: {
      openai: ServiceStatus;
      mistral: ServiceStatus;
    };
    integrations: {
      slack: ServiceStatus;
      hubspot: ServiceStatus;
      google: ServiceStatus;
    };
  };
}

export default function ServiceHealthDashboard() {
  const [healthData, setHealthData] = useState<ServiceHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchHealthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/service-health');
      
      if (!response.ok) throw new Error('Failed to fetch service health status');
      
      const data = await response.json();
      setHealthData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching service health:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: "Error",
        description: "Failed to fetch service health status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'active' || status === 'available') {
      return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>;
    } else if (status === 'inactive' || status === 'unavailable') {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Unavailable</Badge>;
    } else {
      return <Badge className="bg-red-500 hover:bg-red-600">Error</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>External Services Health Status</CardTitle>
        <CardDescription>
          Check the status of all integrated external services
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : healthData ? (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-lg mb-2">AI Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>OpenAI</span>
                    {getStatusBadge(healthData.services.ai.openai.status)}
                  </div>
                  {healthData.services.ai.openai.message && (
                    <p className="text-sm text-muted-foreground mt-1">{healthData.services.ai.openai.message}</p>
                  )}
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Mistral AI</span>
                    {getStatusBadge(healthData.services.ai.mistral.status)}
                  </div>
                  {healthData.services.ai.mistral.message && (
                    <p className="text-sm text-muted-foreground mt-1">{healthData.services.ai.mistral.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium text-lg mb-2">Third-Party Integrations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Slack</span>
                    {getStatusBadge(healthData.services.integrations.slack.status)}
                  </div>
                  {healthData.services.integrations.slack.message && (
                    <p className="text-sm text-muted-foreground mt-1">{healthData.services.integrations.slack.message}</p>
                  )}
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>HubSpot</span>
                    {getStatusBadge(healthData.services.integrations.hubspot.status)}
                  </div>
                  {healthData.services.integrations.hubspot.message && (
                    <p className="text-sm text-muted-foreground mt-1">{healthData.services.integrations.hubspot.message}</p>
                  )}
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Google</span>
                    {getStatusBadge(healthData.services.integrations.google.status)}
                  </div>
                  {healthData.services.integrations.google.message && (
                    <p className="text-sm text-muted-foreground mt-1">{healthData.services.integrations.google.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(healthData.timestamp).toLocaleString()}
              </p>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button onClick={fetchHealthStatus} disabled={loading}>
                Refresh Status
              </Button>
            </div>
          </div>
        ) : (
          <div>No health data available</div>
        )}
      </CardContent>
    </Card>
  );
}
