
import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Sun, Moon, ZoomIn, ZoomOut, Eye, Menu, Settings2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-70 hover:opacity-100">
                <Settings2 className="h-5 w-5" />
                <span className="sr-only">Accessibility settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFontSize(s => Math.min(s + 2, 24))}>
                <ZoomIn className="mr-2 h-4 w-4" />
                Increase Text Size
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize(s => Math.max(s - 2, 12))}>
                <ZoomOut className="mr-2 h-4 w-4" />
                Decrease Text Size
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setHighContrast(h => !h)}>
                <Eye className="mr-2 h-4 w-4" />
                Toggle High Contrast
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <main id="main-content" className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
