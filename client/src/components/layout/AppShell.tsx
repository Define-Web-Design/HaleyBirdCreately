
import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Sun, Moon, ZoomIn, ZoomOut, Eye, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isDark, toggleTheme } = useTheme();
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [fontSize, highContrast]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>
      
      {/* Sidebar for desktop */}
      <div className="hidden md:block h-screen sticky top-0">
        <Sidebar />
      </div>
      
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}
      
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden transition-transform duration-300 ease-in-out z-50 h-full`}>
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Top navigation with mobile menu button */}
        <TopNavigation toggleMobileMenu={toggleMobileSidebar} />
        
        {/* Accessibility controls */}
        <div className="fixed top-4 right-4 flex gap-2 z-20">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFontSize(s => Math.min(s + 2, 24))}
            aria-label="Increase font size"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFontSize(s => Math.max(s - 2, 12))}
            aria-label="Decrease font size"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setHighContrast(h => !h)}
            aria-label="Toggle high contrast"
          >
            <Eye className="h-5 w-5" />
          </Button>
        </div>

        <main id="main-content" className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
