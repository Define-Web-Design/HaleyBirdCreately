import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Application</h1>
        <p className="text-gray-600">A clean, fast, and optimized experience</p>
      </header>
      
      <main className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <p className="mb-4">
          This is a clean version of your app with only the essential dependencies.
          You can now build on this foundation without performance issues.
        </p>
        
        <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-2">Next Steps</h3>
          <ul className="list-disc pl-5 text-blue-700">
            <li>Add your database models and connections</li>
            <li>Create your UI components as needed</li>
            <li>Set up additional routes</li>
            <li>Connect to your APIs</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Home;