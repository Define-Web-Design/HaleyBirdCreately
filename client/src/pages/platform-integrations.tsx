
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import PlatformIntegrationManager from '@/components/platform/PlatformIntegrationManager';
import { Separator } from '@/components/ui/separator';

export default function PlatformIntegrationsPage() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json();
    },
    enabled: false, // Disabled for demo
  });
  
  // Mock user ID for now
  const userId = user?.id || 1;

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Integrations</h1>
        <p className="text-gray-500 mt-2">
          Connect your social media accounts to seamlessly distribute content
        </p>
      </div>
      
      <Separator />
      
      <PlatformIntegrationManager userId={userId} />
      
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">Why connect platforms?</h3>
        <ul className="mt-2 space-y-2 text-blue-700 dark:text-blue-400">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Share content across multiple platforms with a single click</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Access platform-specific analytics in one dashboard</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Get AI-powered recommendations optimized for each platform</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Schedule posts for the optimal time on each platform</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
