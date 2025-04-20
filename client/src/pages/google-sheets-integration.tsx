
import React from 'react';
import { Helmet } from 'react-helmet';
import GoogleSheetsExample from '../components/features/GoogleSheetsExample';

export default function GoogleSheetsIntegrationPage() {
  return (
    <div className="container py-8">
      <Helmet>
        <title>Google Sheets Integration | Creately</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Google Sheets Integration</h1>
        <p className="text-muted-foreground">
          Connect and interact with Google Sheets data from your application.
        </p>
      </div>
      
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h2 className="text-lg font-medium mb-2 text-yellow-800 dark:text-yellow-300">Setup Requirements</h2>
        <p>
          To use this integration, you need to set up Google OAuth credentials and add the necessary environment variables.
          Create a <code className="px-1 py-0.5 bg-muted rounded text-sm">.env</code> file in the root directory and add:
          <code className="block px-3 py-2 mt-2 bg-muted rounded text-sm">
            GOOGLE_CLIENT_ID=your-client-id<br/>
            GOOGLE_CLIENT_SECRET=your-client-secret
          </code>
        </p>
      </div>
      
      <div className="flex justify-center">
        <GoogleSheetsExample />
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">How to Set Up Google Sheets Integration</h2>
        <ol className="space-y-4 list-decimal pl-5">
          <li>
            <strong>Create a Google Cloud Project</strong>
            <p>Go to the Google Cloud Console and create a new project.</p>
          </li>
          <li>
            <strong>Enable the Google Sheets API</strong>
            <p>In your Google Cloud project, navigate to "APIs &amp; Services" and enable the Google Sheets API.</p>
          </li>
          <li>
            <strong>Set Up OAuth Consent Screen</strong>
            <p>Configure the OAuth consent screen with your app information.</p>
          </li>
          <li>
            <strong>Create OAuth Credentials</strong>
            <p>Create OAuth 2.0 Client IDs for your application.</p>
          </li>
          <li>
            <strong>Implement OAuth Flow</strong>
            <p>Set up the OAuth flow in your application to get access tokens.</p>
          </li>
        </ol>
      </div>
    </div>
  );
}
