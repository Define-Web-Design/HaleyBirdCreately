
import React from 'react';
import { Search, Bell, User, Menu, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { motion } from 'framer-motion';

interface TopNavigationProps {
  toggleMobileMenu: () => void;
}

const TopNavigation = ({ toggleMobileMenu }: TopNavigationProps) => {
  const { isDark } = useTheme();
  const [hasNotifications, setHasNotifications] = React.useState(true);
  
  const toggleNotifications = () => {
    setHasNotifications(!hasNotifications);
  };
  
  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Mobile Menu Button */}
        <motion.button 
          className="md:hidden text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
          onClick={toggleMobileMenu}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="h-6 w-6" />
        </motion.button>
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm mx-4 md:mx-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2 rounded-lg bg-gray-100/70 dark:bg-gray-800/70 border-transparent focus:bg-white focus:dark:bg-gray-700 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 outline-none transition-all duration-300" 
            placeholder="Search content..."
          />
        </div>
        
        {/* Right Navigation Items */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell with Subtle Animation */}
          <motion.button 
            className="relative text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors duration-200"
            onClick={toggleNotifications}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="h-5 w-5" />
            {hasNotifications && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary/80 ring-2 ring-white dark:ring-gray-900"
              />
            )}
          </motion.button>
          
          {/* Settings */}
          <motion.button 
            className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="h-5 w-5" />
          </motion.button>
          
          {/* Profile Button */}
          <motion.button 
            className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:ring-2 hover:ring-primary/40 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <User className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
