import React, { useState } from 'react';
import { Link } from 'wouter';

export default function TopNavigation({ toggleSidebar, isMobile }: { toggleSidebar: () => void, isMobile: boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasNotifications, setHasNotifications] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 py-2 h-14 sticky top-0 z-30">
      {/* Left section with sidebar toggle and logo */}
      <div className="flex items-center">
        <button
          className="mr-4 p-2 rounded-md hover:bg-accent transition-colors duration-200"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <Link href="/" className="font-semibold text-lg tracking-tight flex items-center">
          <div className="bg-gradient-to-r from-[#F2994A] to-[#FF9DAE] h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-2">C</div>
          Creately
        </Link>
      </div>

      {/* Center section with search bar - hide on mobile */}
      {!isMobile && (
        <div className="max-w-md w-full mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-1.5 rounded-md bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Right section with actions */}
      <div className="flex items-center space-x-3">
        {/* Notification bell */}
        <button 
          className="p-2 rounded-md hover:bg-accent relative group transition-colors duration-200"
          onClick={() => setHasNotifications(false)}
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          {hasNotifications && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-background group-hover:animate-pulse"></span>
          )}
        </button>

        {/* Create new content button - hide label on mobile */}
        <Link 
          href="/content-library/create" 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
          aria-label="Create new content"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {!isMobile && <span>Create</span>}
        </Link>

        {/* User avatar */}
        <Link href="/profile" className="group">
          <div className="w-8 h-8 overflow-hidden rounded-full bg-muted flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </Link>
      </div>
    </header>
  );
}