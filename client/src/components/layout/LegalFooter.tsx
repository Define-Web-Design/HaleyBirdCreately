
import React from 'react';
import Link from 'next/link';

const LegalFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto py-4 border-t border-gray-200 dark:border-gray-800">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {currentYear} All rights reserved. This platform and all content within it are protected by intellectual property law.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Unauthorized reproduction, distribution, or use of any materials is strictly prohibited.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <Link 
              href="/legal/terms" 
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Terms of Service
            </Link>
            <Link 
              href="/legal/privacy" 
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Privacy Notice
            </Link>
            <Link 
              href="/legal/contact" 
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Legal Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LegalFooter;
