
import React from 'react';
import { Helmet } from 'react-helmet-async';
import GoogleDocsExample from '@/components/features/GoogleDocsExample';

export default function GoogleDocsIntegrationPage() {
  return (
    <div className="container py-8">
      <Helmet>
        <title>Google Docs Integration | Creately</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Google Docs Integration</h1>
        <p className="text-muted-foreground">
          Connect your application with Google Docs to create and manage documents programmatically.
        </p>
      </div>
      
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h2 className="text-lg font-medium mb-2 text-yellow-800 dark:text-yellow-300">Important Note</h2>
        <p>
          To use this integration, you need to:
          <ul className="list-disc list-inside mt-2">
            <li>Set up Google OAuth 2.0 credentials in Google Cloud Console</li>
            <li>Enable Google Docs API in your Google Cloud project</li>
            <li>Add your OAuth client ID and client secret to your environment variables</li>
          </ul>
        </p>
      </div>
      
      <GoogleDocsExample />
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">How to Set Up Google Docs Integration</h2>
        <ol className="space-y-4 list-decimal pl-5">
          <li>
            <strong>Create a project in Google Cloud Console</strong>
            <p className="text-sm text-muted-foreground mt-1">
              Go to the Google Cloud Console and create a new project or select an existing one.
            </p>
          </li>
          <li>
            <strong>Enable the Google Docs API</strong>
            <p className="text-sm text-muted-foreground mt-1">
              In the API Library, search for "Google Docs API" and enable it.
            </p>
          </li>
          <li>
            <strong>Set up OAuth consent screen</strong>
            <p className="text-sm text-muted-foreground mt-1">
              Configure the OAuth consent screen with your app information.
            </p>
          </li>
          <li>
            <strong>Create OAuth 2.0 credentials</strong>
            <p className="text-sm text-muted-foreground mt-1">
              Create OAuth client ID credentials for a web application.
            </p>
          </li>
          <li>
            <strong>Add authorized JavaScript origins and redirect URIs</strong>
            <p className="text-sm text-muted-foreground mt-1">
              Add your application's domain to the authorized origins and redirect URIs.
            </p>
          </li>
          <li>
            <strong>Add credentials to your environment</strong>
            <p className="text-sm text-muted-foreground mt-1">
              Add your client ID and client secret to your application's environment variables.
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
}
