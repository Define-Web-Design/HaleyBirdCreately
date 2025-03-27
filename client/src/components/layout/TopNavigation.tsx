
import { useState } from 'react';
import { Bell, Menu, Search, Info, Inbox, Settings, User, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TopNavigationProps {
  toggleMobileMenu: () => void;
}

const TopNavigation = ({ toggleMobileMenu }: TopNavigationProps) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { toast } = useToast();

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setProfileDropdownOpen(false);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;
    
    // Placeholder for search functionality
    toast({
      title: "Search initiated",
      description: `Searching for: ${searchQuery}`,
    });
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm mx-4 md:mx-0">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                name="search"
                className="block w-full pl-10 pr-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white focus:dark:bg-gray-700 focus:border-primary dark:focus:border-primary outline-none transition-colors" 
                placeholder="Search content..."
                aria-label="Search content"
              />
            </div>
          </form>
        </div>
        
        {/* Right Navigation Items */}
        <div className="flex items-center space-x-4">
          {/* Notification bell with properly aligned indicator */}
          <div className="relative">
            <button 
              className="relative p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Notifications"
              onClick={toggleNotifications}
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900"></span>
            </button>
            
            {/* Notification dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <a href="#" className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <Info className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">New feature available</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Check out our new AI-based content organization tools</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">5 min ago</p>
                      </div>
                    </div>
                  </a>
                  <a href="#" className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                          <Inbox className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Content analysis complete</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your latest uploads have been processed</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                      </div>
                    </div>
                  </a>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <a href="/notifications" className="block text-center text-sm text-blue-600 dark:text-blue-400 font-medium py-2 hover:text-blue-500">
                    View all notifications
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {/* Profile dropdown */}
          <div className="relative">
            <button 
              className="h-8 w-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-400 dark:hover:ring-blue-500 transition-all overflow-hidden focus:outline-none focus:ring-blue-500"
              aria-label="User profile menu"
              aria-haspopup="true"
              onClick={toggleProfileDropdown}
            >
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
                alt="User avatar"
                className="h-full w-full object-cover"
              />
            </button>
            
            {/* Profile dropdown menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Your Profile
                  </div>
                </a>
                <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </div>
                </a>
                <a href="/logout" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <div className="flex items-center">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
