import { Link, useLocation } from 'wouter';
import { MENU_ITEMS, SMART_TOOLS } from '@/lib/constants';
import { useTheme } from '@/lib/ThemeContext';
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Sun, Moon, ZoomIn, ZoomOut, Eye, EyeOff,
  ChevronUp, ChevronDown, ChevronRight,
  Settings, LogOut, User
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useGestureHelpers from '@/lib/useGestures';

interface SidebarProps {
  fontSize?: number;
  setFontSize?: (size: number) => void;
  highContrast?: boolean;
  setHighContrast?: (contrast: boolean) => void;
  colorBlindMode?: string;
  setColorBlindMode?: (mode: string) => void;
  expanded?: boolean;
  setExpanded?: (expanded: boolean) => void;
}

interface MenuItem {
  name: string;
  path: string;
  icon: string;
  isNew?: boolean;
  subMenu?: SubMenuItem[];
  onCategoryClick?: (item: MenuItem) => void;
  onSubCategoryClick?: (item: MenuItem) => void;
}

interface SubMenuItem {
  name: string;
  path: string;
}

const Sidebar = ({
  fontSize = 16,
  setFontSize = () => {},
  highContrast = false,
  setHighContrast = () => {},
  colorBlindMode = 'none',
  setColorBlindMode = () => {},
  expanded = true,
  setExpanded = () => {}
}: SidebarProps) => {
  const [location] = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [accessibilityExpanded, setAccessibilityExpanded] = useState(false);
  const [expandedSubMenu, setExpandedSubMenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Set up gesture detection for swipe to open/close the sidebar on mobile
  const { useSwipe } = useGestureHelpers;
  const { swipeHandlers } = useSwipe({
    onSwipeRight: () => {
      // Only open the sidebar if we're on mobile and it's not already expanded
      if (isMobile && !expanded) {
        setExpanded(true);
        sessionStorage.setItem('sidebarToggled', 'true');
      }
    },
    onSwipeLeft: () => {
      // Only close the sidebar if we're on mobile and it's currently expanded
      if (isMobile && expanded) {
        setExpanded(false);
        sessionStorage.setItem('sidebarToggled', 'false');
      }
    },
    threshold: 60, // Higher threshold for more intentional swipes
  });

  // Check for mobile screen size
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);

      // Auto-collapse sidebar when switching to mobile size
      if (newIsMobile && !sessionStorage.getItem('sidebarToggled')) {
        setExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setExpanded]);

  useEffect(() => {
    // Check if user has manually toggled the sidebar
    const userToggled = sessionStorage.getItem('sidebarToggled');

    // Only run this effect if we have a valid setExpanded function
    if (typeof setExpanded === 'function') {
      // If on mobile and no user toggle, ensure sidebar is collapsed
      if (window.innerWidth < 768 && !userToggled) {
        setExpanded(false);
      } else if (userToggled === 'true') {
        // If user has toggled it open, keep it open
        setExpanded(true);
      }
    }

    // Do not remove the userToggled flag here to maintain persistence
  }, [location, setExpanded]);

  const toggleAccessibility = () => {
    setAccessibilityExpanded(!accessibilityExpanded);
  };

  const [_, setLocation] = useLocation();

  const handleMenuItemClick = useCallback((item: MenuItem) => {
    // For sidebar items with submenus
    if (item.subMenu && item.subMenu.length > 0) {
      // Toggle the submenu visibility
      setExpandedSubMenu(prev => prev === item.path ? null : item.path);
      setExpanded(true);

      // Trigger any custom handler
      if (item.onCategoryClick) {
        item.onCategoryClick(item);
      }

      // Navigate to the main path if not already there
      if (location !== item.path) {
        setLocation(item.path);
      }
    }
    // For regular sidebar items without submenus
    else {
      // Navigate to the path using wouter's setLocation
      setLocation(item.path);

      // Trigger any custom handler
      if (item.onSubCategoryClick) {
        item.onSubCategoryClick(item);
      }

      // On mobile, collapse sidebar after navigating
      if (isMobile) {
        setTimeout(() => {
          setExpandedSubMenu(null);
          setExpanded(false);
        }, 150);
      }
    }
  }, [setExpanded, location, setLocation, isMobile]);

  return (
    <div
      ref={sidebarRef}
      {...swipeHandlers}
      className={`flex flex-col pt-safe ${expanded ? (isMobile ? 'w-full max-w-[250px]' : 'w-64') : (isMobile ? 'w-0' : 'w-20')} bg-background border-r border-border
      h-full transition-all duration-300 ease-in-out overflow-hidden overscroll-none shadow-sm`}
      style={{
        willChange: 'width, transform',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
      aria-expanded={expanded}
      role="navigation"
      aria-label="Main Navigation"
    >
      {/* Simple Top Section */}
      <div className="pt-4 pb-3 px-3 flex items-center justify-center md:justify-start border-b border-border/30">
        <Link
          href="/"
          className={`flex items-center cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out ${expanded ? '' : 'justify-center w-full'}`}
        >
          <div className="w-8 h-5 opacity-0">
            {/* Empty spacer for consistent layout */}
          </div>
        </Link>
      </div>

      {/* Main Navigation - Expanded to be the majority of the sidebar */}
      <nav className="flex-1 overflow-y-auto py-2 flex flex-col">
        {/* Workspace Section */}
        <div className="px-3 mb-2">
          <h2 className={`text-xs font-medium uppercase tracking-wider text-muted-foreground transition-all duration-300 ease-in-out
          ${expanded ? 'opacity-100' : 'opacity-50 text-center'}`}>
            Workspace
          </h2>
        </div>

        <ul className="mb-6 space-y-0.5">
          {MENU_ITEMS.map((item, index) => {
            const hasSubMenu = item.name === "Content Library" || item.name === "Color Palettes";
            const subMenu = hasSubMenu ? [
              { name: "All Content", path: `${item.path}/all` },
              { name: "Recent", path: `${item.path}/recent` },
              { name: "Categories", path: `${item.path}/categories` },
              { name: "Favorites", path: `${item.path}/favorites` }
            ] : [];

            const itemWithSubMenu = hasSubMenu ? { ...item, subMenu } : item;
            const isSubMenuExpanded = expandedSubMenu === item.path;
            // Staggered animation delay for menu items
            const animDelay = `${index * 0.03}s`;

            return (
              <li key={item.path} className="px-1.5" style={{ animationDelay: animDelay }}>
                <div>
                  {hasSubMenu ? (
                    <button
                      onClick={() => handleMenuItemClick(itemWithSubMenu as MenuItem)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md
                      transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] ${
                        location === item.path || isSubMenuExpanded
                          ? 'text-primary bg-primary/10 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                        }`}
                    >
                      <div className="flex items-center">
                        <i className={`${item.icon} w-4 text-base shrink-0 transition-all duration-300 ease-in-out
                        ${expanded ? 'mr-2.5' : 'mx-auto'}`}></i>
                        <span className={`transition-all duration-300 ease-in-out
                        ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 absolute left-[-9999px] overflow-hidden'}`}>
                          {item.name}
                        </span>
                        {item.isNew && expanded && (
                          <span className="ml-1.5 px-1 py-0 text-[10px] font-medium text-white bg-primary rounded-sm animate-pulse">
                            New
                          </span>
                        )}
                      </div>
                      <div className="transition-transform duration-300 ease-in-out">
                        {isSubMenuExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </button>
                  ) : (
                    <Link
                      href={item.path}
                      onClick={() => handleMenuItemClick(item as MenuItem)}
                      className={`flex items-center px-3 py-2 rounded-md
                      transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] ${
                        location === item.path
                          ? 'text-primary bg-primary/10 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                        }`}
                    >
                      <i className={`${item.icon} w-4 text-base shrink-0 transition-all duration-300 ease-in-out
                      ${expanded ? 'mr-2.5' : 'mx-auto'} ${location === item.path ? 'scale-110' : ''}`}></i>
                      <span className={`transition-all duration-300 ease-in-out
                      ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 absolute left-[-9999px] overflow-hidden'}`}>
                        {item.name}
                      </span>
                      {item.isNew && expanded && (
                        <span className="ml-1.5 px-1 py-0 text-[10px] font-medium text-white bg-primary rounded-sm animate-pulse">
                          New
                        </span>
                      )}
                    </Link>
                  )}

                  {hasSubMenu && isSubMenuExpanded && (
                    <ul className={`ml-6 mt-1 space-y-0.5 border-l border-gray-200 dark:border-gray-700 pl-2
                    animate-in slide-in-from-left-2 duration-300 ease-in-out ${isMobile ? 'max-h-[200px] overflow-y-auto' : ''}`}> {/* Added overflow-y-auto for submenus on mobile */}
                      {subMenu.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            href={subItem.path}
                            onClick={() => {
                              // Only close sidebar on mobile, keep expanded on desktop
                              if (window.innerWidth < 768) {
                                setTimeout(() => {
                                  setExpandedSubMenu(null);
                                  setExpanded(false);
                                }, 150);
                              }
                            }}
                            className={`flex items-center px-2 py-1.5 text-sm rounded-md
                            transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] ${
                              location === subItem.path
                                ? 'text-primary bg-primary/5 shadow-sm'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/30'
                              }`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Smart Tools Section */}
        <div className="px-3 mb-2">
          <h2 className={`text-xs font-medium uppercase tracking-wider text-muted-foreground transition-all duration-300 ease-in-out
          ${expanded ? 'opacity-100' : 'opacity-50 text-center'}`}>
            Smart Tools
          </h2>
        </div>

        <ul className="space-y-0.5">
          {SMART_TOOLS.map((tool, index) => {
            // Staggered animation delay for tool items
            const animDelay = `${0.2 + (index * 0.03)}s`;

            return (
              <li key={tool.path} className="px-1.5" style={{ animationDelay: animDelay }}>
                <Link
                  href={tool.path}
                  onClick={() => handleMenuItemClick(tool as MenuItem)}
                  className={`flex items-center px-3 py-2 rounded-md
                  transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] ${
                    location === tool.path
                      ? 'text-primary bg-primary/10 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                >
                  <i className={`${tool.icon} w-4 text-base shrink-0 transition-all duration-300 ease-in-out
                  ${expanded ? 'mr-2.5' : 'mx-auto'} ${location === tool.path ? 'scale-110' : ''}`}></i>
                  <span className={`transition-all duration-300 ease-in-out
                  ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 absolute left-[-9999px] overflow-hidden'}`}>
                    {tool.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Minimal Settings Section */}
      <div className="border-t border-border mt-auto">
        {/* Simple Settings Button */}
        <div className="p-2 flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger className={`flex items-center rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors duration-200 w-full
              ${expanded ? 'justify-start' : 'justify-center'}`}>
              <Settings className="h-4 w-4 text-muted-foreground" />
              {expanded && (
                <span className="ml-2 text-xs font-medium">Settings</span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile">Account</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile/accessibility">Accessibility</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-rose-500 dark:text-rose-400">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Settings Controls */}
        <div className={`px-2 pb-2 transition-all duration-300 ease-out ${!expanded ? 'hidden' : ''}`}>
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-1.5 mb-1 rounded-md bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-1.5">
              {isDarkMode
                ? <Moon className="h-3.5 w-3.5 text-indigo-400" />
                : <Sun className="h-3.5 w-3.5 text-amber-500 animate-pulse" />}
              <span className="text-xs font-medium">{isDarkMode ? 'Dark' : 'Light'}</span>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              aria-label="Toggle theme"
              className="h-3.5 w-7 data-[state=checked]:bg-primary/90"
            />
          </div>

          {/* Text Size Controls */}
          <div className="flex items-center justify-between p-1.5 rounded-md bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-1.5">
              <ZoomIn className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">Size</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setFontSize(Math.max(fontSize - 1, 12))}
                aria-label="Smaller text"
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                −
              </button>
              <span className="text-xs mx-1 w-3 text-center">{fontSize}</span>
              <button
                onClick={() => setFontSize(Math.min(fontSize + 1, 20))}
                aria-label="Larger text"
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        {/* Simple Theme Toggle Button for Collapsed Mode */}
        {!expanded && (
          <div className="px-2 pb-2">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-center p-1.5 rounded-md bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode
                ? <Moon className="h-4 w-4 text-indigo-400" />
                : <Sun className="h-4 w-4 text-amber-500 animate-pulse" />}
            </button>
          </div>
        )}
        
        {/* User Profile Section */}
        <div className={`mt-2 px-2 pb-2 border-t border-border pt-2 ${expanded ? '' : 'text-center'}`}>
          <Link 
            href="/profile" 
            className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            {expanded && (
              <div className="ml-2 flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">User Profile</p>
                <p className="text-xs text-muted-foreground truncate">View your account</p>
              </div>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;