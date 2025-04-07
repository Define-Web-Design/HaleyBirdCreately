
import React from 'react';
import { Helmet } from 'react-helmet-async';
import HubSpotIntegration from '@/components/features/HubSpotIntegration';

export default function HubSpotIntegrationPage() {
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <Helmet>
        <title>HubSpot Integration | Creately</title>
      </Helmet>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">HubSpot CRM Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your application with HubSpot CRM to manage contacts and deals
        </p>
      </header>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <HubSpotIntegration />
        </div>
        
        <div className="p-6 border rounded-lg bg-muted/50">
          <h2 className="text-2xl font-semibold mb-4">HubSpot Integration Guide</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Getting Started</h3>
              <p className="text-sm text-muted-foreground">
                To use the HubSpot integration, you'll need to:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                <li>Create a HubSpot account</li>
                <li>Generate an API key in your HubSpot developer settings</li>
                <li>Add the API key to your environment variables</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Available Features</h3>
              <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                <li>Create and update contacts</li>
                <li>Search for contacts by email</li>
                <li>Create deals and associate them with contacts</li>
                <li>Track customer interactions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Security Considerations</h3>
              <p className="text-sm text-muted-foreground">
                Always store your HubSpot API key securely in environment variables.
                Never expose your API key in client-side code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
