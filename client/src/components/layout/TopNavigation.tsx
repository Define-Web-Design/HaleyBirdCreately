import { useTheme } from '@/lib/hooks/use-theme';
import { Menu, Bell, Search } from 'lucide-react';

interface TopNavigationProps {
  toggleMobileMenu: () => void;
}

const TopNavigation = ({ toggleMobileMenu }: TopNavigationProps) => {
  const { isDark } = useTheme();

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
          <button className="relative text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
          </button>
          
          <a href="#" className="block md:hidden">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
              alt="User avatar" 
              className="h-8 w-8 rounded-full object-cover"
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
