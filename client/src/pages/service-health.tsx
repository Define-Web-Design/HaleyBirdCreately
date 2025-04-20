
import React from 'react';
import { Helmet } from 'react-helmet';
import ServiceHealthDashboard from '@/components/features/ServiceHealthDashboard';

export default function ServiceHealthPage() {
  return (
    <div className="container py-8">
      <Helmet>
        <title>Service Health | Creately</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Service Health Status</h1>
        <p className="text-muted-foreground">
          Check the status and availability of all integrated external services.
        </p>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-medium mb-2 text-blue-800 dark:text-blue-300">Integration Setup Guide</h2>
        <p className="text-blue-700 dark:text-blue-400">
          For unavailable services, you need to add the appropriate API keys to your environment variables.
          Create a <code className="px-1 py-0.5 bg-muted rounded text-sm">.env</code> file in the root directory 
          and add the necessary API keys.
        </p>
      </div>
      
      <ServiceHealthDashboard />
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Configure External Services</h2>
        <div className="space-y-4 mt-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium">OpenAI Integration</h3>
            <p className="mt-1 text-muted-foreground">
              Add this to your .env file:
            </p>
            <pre className="bg-muted p-2 rounded mt-2">OPENAI_API_KEY=your_openai_api_key</pre>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Mistral AI Integration</h3>
            <p className="mt-1 text-muted-foreground">
              Add this to your .env file:
            </p>
            <pre className="bg-muted p-2 rounded mt-2">MISTRAL_API_KEY=your_mistral_api_key</pre>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Slack Integration</h3>
            <p className="mt-1 text-muted-foreground">
              Add this to your .env file:
            </p>
            <pre className="bg-muted p-2 rounded mt-2">SLACK_BOT_TOKEN=xoxb-your-slack-bot-token</pre>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium">HubSpot Integration</h3>
            <p className="mt-1 text-muted-foreground">
              Add this to your .env file:
            </p>
            <pre className="bg-muted p-2 rounded mt-2">HUBSPOT_API_KEY=your_hubspot_api_key</pre>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Google OAuth Integration</h3>
            <p className="mt-1 text-muted-foreground">
              Follow the Google OAuth setup guide to create credentials and add this to your .env file:
            </p>
            <pre className="bg-muted p-2 rounded mt-2">GOOGLE_OAUTH_SECRETS={"web":{"client_id":"...","project_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_secret":"..."}}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
