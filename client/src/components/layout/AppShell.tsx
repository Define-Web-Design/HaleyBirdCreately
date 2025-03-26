import { ReactNode, createContext, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import useTheme from '@/lib/hooks/use-theme';
import { ThemeContextType } from '@/lib/types';

// Create theme context
export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - hidden on mobile unless toggled */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:flex fixed md:relative z-20 md:z-auto w-64 h-full`}>
          <Sidebar />
        </div>
        
        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavigation toggleMobileMenu={toggleMobileMenu} />
          
          {/* Content Scroll Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-6">
            {children}
          </main>
          
          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6 z-10">
            <button className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl focus:outline-none flex items-center justify-center transition-all">
              <i className="fas fa-plus text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default AppShell;
