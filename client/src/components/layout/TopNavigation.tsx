import { Menu, Bell, Search } from 'lucide-react';

interface TopNavigationProps {
  toggleMobileMenu: () => void;
}

const TopNavigation = ({ toggleMobileMenu }: TopNavigationProps) => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm mx-4 md:mx-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white focus:dark:bg-gray-700 focus:border-primary dark:focus:border-primary outline-none transition-colors" 
            placeholder="Search content..."
          />
        </div>
        
        {/* Right Navigation Items */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <button className="relative text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
          </button>
          
          <div className="flex items-center gap-2">
            {/* Notification bell with properly aligned indicator */}
            <button 
              className="relative p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900"></span>
            </button>
            
            {/* Profile dropdown button */}
            <div className="relative">
              <button 
                className="h-8 w-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-400 dark:hover:ring-blue-500 transition-all overflow-hidden focus:outline-none focus:ring-blue-500"
                aria-label="User profile menu"
                aria-haspopup="true"
                onClick={() => {
                  // Toggle profile dropdown
                  const dropdown = document.getElementById('profileDropdown');
                  if (dropdown) {
                    dropdown.classList.toggle('hidden');
                  }
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="User avatar" 
                  className="h-full w-full object-cover"
                />
              </button>
              
              {/* Profile dropdown menu */}
              <div 
                id="profileDropdown" 
                className="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
              >
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">View Profile</a>
                  <a href="#settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">Settings</a>
                  <a href="#preferences" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">Preferences</a>
                  <div className="border-t border-gray-100 dark:border-gray-700"></div>
                  <a href="#logout" className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">Log out</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
