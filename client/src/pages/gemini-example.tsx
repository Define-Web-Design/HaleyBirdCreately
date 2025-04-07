
import React from 'react';
import { Helmet } from 'react-helmet-async';
import GeminiAIExample from '@/components/features/GeminiAIExample';

export default function GeminiExamplePage() {
  return (
    <div className="container py-8">
      <Helmet>
        <title>Google Gemini AI Example | Creately</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Google Gemini AI Integration</h1>
        <p className="text-muted-foreground">
          Explore the capabilities of Google's Gemini AI with these interactive examples.
        </p>
      </div>
      
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h2 className="text-lg font-medium mb-2 text-yellow-800 dark:text-yellow-300">Important Note</h2>
        <p>
          To use these examples, you need to add your Gemini API key to the environment variables.
          Create a <code className="px-1 py-0.5 bg-muted rounded text-sm">.env.local</code> file in the client directory and add:
          <code className="block px-3 py-2 mt-2 bg-muted rounded text-sm">VITE_GEMINI_API_KEY=your_api_key_here</code>
        </p>
      </div>
      
      <GeminiAIExample />
    </div>
  );
}
