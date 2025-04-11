import React from 'react';

function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Clean App</h1>
        <p className="text-xl text-gray-600 mb-8">
          A high-performance, optimized application built with modern web technologies.
        </p>
        <div className="flex justify-center space-x-4">
          <a href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
            Get Started
          </a>
          <a href="/login" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">
            Sign In
          </a>
        </div>
      </section>
      
      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Fast Performance</h3>
            <p className="text-gray-600">Optimized for speed with minimal dependencies.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Secure Authentication</h3>
            <p className="text-gray-600">Built with industry-standard security practices.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Modern Architecture</h3>
            <p className="text-gray-600">Built with React, TypeScript, and Express.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;