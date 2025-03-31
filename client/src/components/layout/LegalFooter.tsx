
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Info } from 'lucide-react';

export const LegalFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-6 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <Shield className="h-5 w-5 text-primary mr-2" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">Protected Platform</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              All content, functionality, and assets are protected by intellectual property law.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-4">
            <Link 
              to="/legal/terms" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
            >
              <FileText className="h-4 w-4 mr-1" />
              Terms of Service
            </Link>
            
            <Link 
              to="/legal/privacy" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
            >
              <Info className="h-4 w-4 mr-1" />
              Privacy Notice
            </Link>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 text-center text-xs text-gray-500 dark:text-gray-500">
          <p>© {currentYear} All Rights Reserved. Unauthorized reproduction strictly prohibited.</p>
          <p className="mt-1">Protected by technical measures and intellectual property law.</p>
        </div>
      </div>
    </footer>
  );
};

export default LegalFooter;
