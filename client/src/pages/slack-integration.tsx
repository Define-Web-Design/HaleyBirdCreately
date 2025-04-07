
import React from 'react';
import { Helmet } from 'react-helmet-async';
import SlackIntegrationExample from '@/components/features/SlackIntegrationExample';

export default function SlackIntegrationPage() {
  return (
    <div className="container py-8">
      <Helmet>
        <title>Slack Integration | Creately</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Slack Integration</h1>
        <p className="text-muted-foreground">
          Integrate your creative content with Slack for team collaboration.
        </p>
      </div>
      
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h2 className="text-lg font-medium mb-2 text-yellow-800 dark:text-yellow-300">Important Note</h2>
        <p>
          To use this integration, you need to add your Slack Bot Token to the environment variables.
          Create a <code className="px-1 py-0.5 bg-muted rounded text-sm">.env</code> file in the root directory and add:
          <code className="block px-3 py-2 mt-2 bg-muted rounded text-sm">SLACK_BOT_TOKEN=xoxb-your-token-here</code>
        </p>
      </div>
      
      <div className="flex justify-center">
        <SlackIntegrationExample />
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">How to Set Up Slack Integration</h2>
        <ol className="space-y-4 list-decimal pl-5">
          <li>
            <strong>Create a Slack App:</strong> Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">api.slack.com/apps</a> and create a new app.
          </li>
          <li>
            <strong>Add Bot Permissions:</strong> In your app's settings, go to "OAuth & Permissions" and add scopes like <code>chat:write</code>, <code>channels:read</code>, etc.
          </li>
          <li>
            <strong>Install the App:</strong> Install the app to your workspace to generate a Bot Token.
          </li>
          <li>
            <strong>Add the Token:</strong> Copy the Bot Token (starts with <code>xoxb-</code>) and add it to your environment variables.
          </li>
        </ol>
      </div>
    </div>
  );
}
