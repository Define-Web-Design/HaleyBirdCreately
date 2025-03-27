
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-screen bg-background flex overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
        Skip to main content
      </a>
      
      {/* Sidebar for desktop */}
      <div className="hidden md:block h-screen sticky top-0 shadow-sm z-20">
        <Sidebar 
          fontSize={fontSize}
          setFontSize={setFontSize}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
        />
      </div>
      
      {/* Mobile sidebar overlay with backdrop blur */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={toggleMobileSidebar}
        />
      )}
      
      {/* Mobile sidebar with smooth animation */}
      <div className={`fixed inset-y-0 left-0 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden transition-transform duration-300 ease-out z-50 h-full shadow-lg`}>
        <Sidebar 
          fontSize={fontSize}
          setFontSize={setFontSize}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
        />
      </div>
      
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top navigation with mobile menu button */}
        <TopNavigation toggleMobileMenu={toggleMobileSidebar} />

        <main id="main-content" className="flex-1 p-4 md:p-8 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
