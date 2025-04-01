import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';

export default function TopNavigation({ toggleSidebar, isMobile }: { toggleSidebar: () => void, isMobile: boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasNotifications, setHasNotifications] = useState(true);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [location] = useLocation();

  // Close search when navigating
  useEffect(() => {
    setShowMobileSearch(false);
  }, [location]);

  // Only for mobile: toggle between search and regular view
  const renderMobileView = () => {
    if (showMobileSearch) {
      return (
        <header className="bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 py-2 h-14 sticky top-0 z-30">
          <div className="flex items-center w-full">
            <button 
              onClick={() => setShowMobileSearch(false)}
              className="p-2 rounded-md mr-2 hover:bg-accent"
              aria-label="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search Creately..."
                className="w-full pl-10 pr-8 py-1.5 rounded-md bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    window.history.pushState(null, '', `/search?q=${encodeURIComponent(searchTerm)}`);
                    setShowMobileSearch(false);
                  }
                }}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>
      );
    }

    return (
      <header className="bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 py-2 h-14 sticky top-0 z-30">
        {/* Left section with sidebar toggle and logo */}
        <div className="flex items-center">
          <button
            className="mr-3 p-2 rounded-md hover:bg-accent transition-colors duration-200"
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
            <span className="truncate">Creately</span>
          </Link>
        </div>

        {/* Right section with actions */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowMobileSearch(true)}
            className="p-2 rounded-md hover:bg-accent"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          
          <button 
            className="p-2 rounded-md hover:bg-accent relative"
            onClick={() => setHasNotifications(false)}
            aria-label="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            {hasNotifications && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
            )}
          </button>
          
          <Link 
            href="/content-library/create" 
            className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="Create"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </Link>

          <Link href="/profile" className="group">
            <div className="w-8 h-8 overflow-hidden rounded-full bg-muted flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </Link>
        </div>
      </header>
    );
  };

  // Desktop view with the search in the middle
  const renderDesktopView = () => (
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

      {/* Center section with search bar */}
      <div className="max-w-md w-full mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Creately..."
            className="w-full pl-10 pr-4 py-1.5 rounded-md bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Handle search action
                console.log('Searching for:', searchTerm);
                // You could navigate to search results page
                if (searchTerm.trim()) {
                  window.history.pushState(null, '', `/search?q=${encodeURIComponent(searchTerm)}`);
                }
              }
            }}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          {searchTerm && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

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

        {/* Create new content button */}
        <Link 
          href="/content-library/create" 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
          aria-label="Create new content"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Create</span>
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

  return isMobile ? renderMobileView() : renderDesktopView();
}