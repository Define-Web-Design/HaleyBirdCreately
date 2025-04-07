
import React from 'react';
import { Helmet } from 'react-helmet-async';
import OpenAIExample from '@/components/features/OpenAIExample';

export default function OpenAIExamplePage() {
  return (
    <div className="container py-8">
      <Helmet>
        <title>OpenAI Integration | Creately</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">OpenAI Integration</h1>
        <p className="text-muted-foreground">
          Explore OpenAI's capabilities with these interactive examples.
        </p>
      </div>
      
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h2 className="text-lg font-medium mb-2 text-yellow-800 dark:text-yellow-300">Important Note</h2>
        <p>
          To use these examples, you need to add your OpenAI API key to the environment variables.
          Create a <code className="px-1 py-0.5 bg-muted rounded text-sm">.env.local</code> file in the client directory and add:
          <code className="block px-3 py-2 mt-2 bg-muted rounded text-sm">VITE_OPENAI_API_KEY=your_api_key_here</code>
        </p>
      </div>
      
      <OpenAIExample />
    </div>
  );
}
import React from 'react';
import OpenAIExample from '../components/features/OpenAIExample';
import AppLayout from '../components/layout/AppLayout';

const OpenAIExamplePage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">OpenAI Integration Example</h1>
        <p className="mb-6 text-gray-600">
          This page demonstrates how to use OpenAI's API to generate text and color palettes.
          Make sure you have set the VITE_OPENAI_API_KEY environment variable in your .env file.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <OpenAIExample />
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Important Notes:</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>For security reasons, API keys should be managed server-side in production.</li>
            <li>The current implementation uses the client-side approach for demonstration purposes.</li>
            <li>OpenAI API calls count toward your API usage and may incur costs.</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default OpenAIExamplePage;
