import React, { useState, useEffect } from 'react';
import { Link, useLocation, useRoute } from 'wouter';

export default function TopNavigation({ toggleSidebar, isMobile }: { toggleSidebar: () => void, isMobile: boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasNotifications, setHasNotifications] = useState(true);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [location, setLocation] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isOnDashboard] = useRoute('/');

  // Close search when navigating
  useEffect(() => {
    setShowMobileSearch(false);
    setNotificationsOpen(false);
  }, [location]);

  // Handle search submission
  const handleSearch = () => {
    if (searchTerm.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowMobileSearch(false);
    }
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setHasNotifications(false); // Mark as read when opening
  };

  // Only for mobile: toggle between search and regular view
  const renderMobileView = () => {
    if (showMobileSearch) {
      return (
        <header className="bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-5 py-2.5 h-16 sticky top-0 z-50 transition-all duration-300 ease-in-out">
          <div className="flex items-center w-full">
            <button 
              onClick={() => setShowMobileSearch(false)}
              className="p-2.5 rounded-md mr-2.5 hover:bg-accent/80 focus:ring-2 focus:ring-primary focus:outline-none"
              aria-label="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search Creately..."
                className="w-full pl-10 pr-8 py-2 rounded-md bg-muted/80 hover:bg-muted focus:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
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
      <header className="bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-5 py-2.5 h-16 sticky top-0 z-50 transition-all duration-300 ease-in-out">
        {/* Left section with sidebar toggle and logo */}
        <div className="flex items-center gap-2">
          <button
            className="mr-2 p-2.5 rounded-md hover:bg-accent/80 transition-colors duration-200 focus:ring-2 focus:ring-primary focus:outline-none"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <Link href="/" className="font-semibold text-lg tracking-tight flex items-center focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-1 py-0.5">
            <div className="bg-gradient-to-r from-[#F2994A] to-[#FF9DAE] h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-2.5 shadow-sm">C</div>
            <span className="font-medium">Creately</span>
          </Link>
        </div>

        {/* Right section with actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMobileSearch(true)}
            className="p-2.5 rounded-md hover:bg-accent/80 transition-colors duration-200 focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          
          <button 
            className="p-2.5 rounded-md hover:bg-accent/80 relative group transition-colors duration-200 focus:ring-2 focus:ring-primary focus:outline-none"
            onClick={toggleNotifications}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            aria-haspopup="true"
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
            className="p-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none shadow-sm"
            aria-label="Create content"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </Link>

          <Link href="/profile" className="group focus:outline-none">
            <div className="w-9 h-9 overflow-hidden rounded-full bg-muted flex items-center justify-center hover:ring-2 hover:ring-primary/50 focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </Link>
        </div>
        
        {/* Notifications dropdown */}
        {notificationsOpen && (
          <div className="absolute right-4 top-16 w-80 max-w-[calc(100vw-2rem)] bg-background border rounded-lg shadow-lg z-50 py-2 mt-1 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h3 className="font-medium">Notifications</h3>
              <button 
                onClick={() => setNotificationsOpen(false)}
                className="p-1.5 rounded-md hover:bg-accent/80 text-muted-foreground hover:text-foreground"
                aria-label="Close notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-md border hover:border-border/80 transition-colors cursor-pointer">
                  <div className="flex items-start">
                    <div className="bg-primary/10 text-primary rounded-full p-2 mr-3 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l6.29-6.29c.94-.94.94-2.48 0-3.42L11.71 2.71c-.94-.94-2.48-.94-3.42 0L5 6"></path>
                        <path d="M7 9h0"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">New Color Palette Trends</h4>
                      <p className="text-xs text-muted-foreground mt-1">Check out the latest trending palettes for Spring 2025</p>
                      <p className="text-xs text-muted-foreground mt-2">Just now</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-md border hover:border-border/80 transition-colors cursor-pointer">
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full p-2 mr-3 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">You've Reached Advanced Tier!</h4>
                      <p className="text-xs text-muted-foreground mt-1">Your creative energy level has increased to 150 points</p>
                      <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 text-center text-sm text-primary hover:underline">
                View all notifications
              </button>
            </div>
          </div>
        )}
      </header>
    );
  };

  // Desktop view with the search in the middle
  const renderDesktopView = () => (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-5 py-2.5 h-16 sticky top-0 z-50 transition-all duration-300 ease-in-out">
      {/* Left section with sidebar toggle and logo */}
      <div className="flex items-center gap-2">
        <button
          className="mr-2 p-2.5 rounded-md hover:bg-accent/80 transition-colors duration-200 focus:ring-2 focus:ring-primary focus:outline-none"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <Link href="/" className="font-semibold text-lg tracking-tight flex items-center focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-1 py-0.5">
          <div className="bg-gradient-to-r from-[#F2994A] to-[#FF9DAE] h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-2.5 shadow-sm">C</div>
          <span className="font-medium">Creately</span>
        </Link>
      </div>

      {/* Center section with search bar */}
      <div className="max-w-xl w-full mx-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Creately..."
            className="w-full pl-10 pr-4 py-2 rounded-md bg-muted/80 hover:bg-muted focus:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
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
      <div className="flex items-center gap-3.5">
        {/* Notification bell */}
        <button 
          className="p-2.5 rounded-md hover:bg-accent/80 relative group transition-colors duration-200 focus:ring-2 focus:ring-primary focus:outline-none"
          onClick={toggleNotifications}
          aria-label="Notifications"
          aria-expanded={notificationsOpen}
          aria-haspopup="true"
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
          className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none shadow-sm"
          aria-label="Create new content"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Create</span>
        </Link>

        {/* User avatar */}
        <Link href="/profile" className="group focus:outline-none">
          <div className="w-9 h-9 overflow-hidden rounded-full bg-muted flex items-center justify-center hover:ring-2 hover:ring-primary/50 focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </Link>
      </div>
      
      {/* Notifications dropdown */}
      {notificationsOpen && (
        <div className="absolute right-4 top-16 w-80 max-w-[calc(100vw-2rem)] bg-background border rounded-lg shadow-lg z-50 py-2 mt-1 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h3 className="font-medium">Notifications</h3>
            <button 
              onClick={() => setNotificationsOpen(false)}
              className="p-1.5 rounded-md hover:bg-accent/80 text-muted-foreground hover:text-foreground"
              aria-label="Close notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-md border hover:border-border/80 transition-colors cursor-pointer">
                <div className="flex items-start">
                  <div className="bg-primary/10 text-primary rounded-full p-2 mr-3 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l6.29-6.29c.94-.94.94-2.48 0-3.42L11.71 2.71c-.94-.94-2.48-.94-3.42 0L5 6"></path>
                      <path d="M7 9h0"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">New Color Palette Trends</h4>
                    <p className="text-xs text-muted-foreground mt-1">Check out the latest trending palettes for Spring 2025</p>
                    <p className="text-xs text-muted-foreground mt-2">Just now</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-md border hover:border-border/80 transition-colors cursor-pointer">
                <div className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full p-2 mr-3 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">You've Reached Advanced Tier!</h4>
                    <p className="text-xs text-muted-foreground mt-1">Your creative energy level has increased to 150 points</p>
                    <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 text-center text-sm text-primary hover:underline">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </header>
  );

  return isMobile ? renderMobileView() : renderDesktopView();
}