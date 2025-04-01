import { Link, useLocation } from 'wouter';
import { MENU_ITEMS, SMART_TOOLS } from '@/lib/constants';
import { useTheme } from '@/lib/hooks/use-theme';
import { useState, useCallback, useEffect } from 'react';
import { Sun, Moon, ZoomIn, ZoomOut, Eye, EyeOff, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { isDark, toggleTheme } = useTheme();
  const [accessibilityExpanded, setAccessibilityExpanded] = useState(false);
  const [expandedSubMenu, setExpandedSubMenu] = useState<string | null>(null);

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
      if (window.innerWidth < 768) {
        setTimeout(() => {
          setExpandedSubMenu(null);
          setExpanded(false);
        }, 150);
      }
    }
  }, [setExpanded, location, setLocation]);

  return (
    <div 
      className={`flex flex-col ${expanded ? 'w-64' : 'w-0 md:w-20'} bg-background border-r border-border 
      h-full transition-all duration-300 ease-in-out overflow-hidden overscroll-none`}
      style={{ 
        willChange: 'width',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <Link href="/" className="p-4 flex items-center cursor-pointer hover:opacity-90 transition-opacity">
        <div className="bg-gradient-to-r from-[#F2994A] to-[#FF9DAE] h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3 shrink-0">C</div>
        <h1 className={`text-xl font-medium transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:opacity-0 md:w-0 md:hidden'}`}>Creately</h1>
      </Link>

      <nav className="flex-1 overflow-y-auto py-2">
        <div className={`px-3 mb-2 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 h-0 mb-0 overflow-hidden md:opacity-100 md:h-auto md:mb-2 md:overflow-visible'}`}>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Workspace</h2>
        </div>

        <ul>
          {MENU_ITEMS.map((item) => {
            const hasSubMenu = item.name === "Content Library" || item.name === "Color Palettes";
            const subMenu = hasSubMenu ? [
              { name: "All Content", path: `${item.path}/all` },
              { name: "Recent", path: `${item.path}/recent` },
              { name: "Categories", path: `${item.path}/categories` },
              { name: "Favorites", path: `${item.path}/favorites` }
            ] : [];

            const itemWithSubMenu = hasSubMenu ? { ...item, subMenu } : item;
            const isSubMenuExpanded = expandedSubMenu === item.path;

            return (
              <li key={item.path} className="px-1.5">
                <div>
                  {hasSubMenu ? (
                    <button 
                      onClick={() => handleMenuItemClick(itemWithSubMenu as MenuItem)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded ${
                        location === item.path || isSubMenuExpanded 
                        ? 'text-primary bg-primary/10' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <i className={`${item.icon} w-4 mr-2.5 text-base shrink-0`}></i>
                        <span className={`transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:opacity-100 md:w-auto md:overflow-visible'}`}>{item.name}</span>
                        {item.isNew && expanded && (
                          <span className="ml-1.5 px-1 py-0 text-[10px] font-medium text-white bg-primary rounded-sm">New</span>
                        )}
                      </div>
                      {isSubMenuExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                  ) : (
                    <Link 
                      href={item.path} 
                      onClick={() => handleMenuItemClick(item as MenuItem)}
                      className={`flex items-center px-3 py-2 rounded ${
                        location === item.path 
                        ? 'text-primary bg-primary/10' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <i className={`${item.icon} w-4 mr-2.5 text-base shrink-0`}></i>
                      <span className={`transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:opacity-100 md:w-auto md:overflow-visible'}`}>{item.name}</span>
                      {item.isNew && expanded && (
                        <span className="ml-1.5 px-1 py-0 text-[10px] font-medium text-white bg-primary rounded-sm">New</span>
                      )}
                    </Link>
                  )}

                  {hasSubMenu && isSubMenuExpanded && (
                    <ul className="ml-6 mt-0.5 space-y-0.5 border-l border-gray-200 dark:border-gray-700 pl-1.5">
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
                            className={`flex items-center px-2 py-1.5 text-sm rounded ${
                              location === subItem.path
                              ? 'text-primary bg-primary/5' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
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

        <div className={`px-3 mt-4 mb-2 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 h-0 mb-0 overflow-hidden md:opacity-100 md:h-auto md:mb-2 md:overflow-visible'}`}>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Smart Tools</h2>
        </div>

        <ul>
          {SMART_TOOLS.map((tool) => (
            <li key={tool.path} className="px-1.5">
              <Link 
                href={tool.path} 
                onClick={() => handleMenuItemClick(tool as MenuItem)}
                className={`flex items-center px-3 py-2 rounded ${
                  location === tool.path 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <i className={`${tool.icon} w-4 mr-2.5 text-base shrink-0`}></i>
                <span className={`transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:opacity-100 md:w-auto md:overflow-visible'}`}>{tool.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border mt-auto">
        <div className="p-3">
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center w-full">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="User avatar" 
                  className="h-8 w-8 rounded-full object-cover mr-2 shrink-0"
                />
                <div className={`flex-1 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:opacity-100 md:w-auto md:overflow-visible'}`}>
                  <p className="text-sm font-medium text-left">Sophia</p>
                  <p className="text-xs text-muted-foreground">Creator</p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/accessibility">Accessibility</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className={`px-3 pb-3 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden md:opacity-100 md:h-auto md:overflow-visible'}`}>
          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-1.5">
              {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              <span className="text-xs">{isDark ? 'Dark' : 'Light'}</span>
            </div>
            <Switch 
              checked={isDark}
              onCheckedChange={toggleTheme}
              aria-label="Toggle theme"
              className="h-3.5 w-7 data-[state=checked]:bg-primary/90"
            />
          </div>

          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-1.5">
              <ZoomIn className="h-3.5 w-3.5" />
              <span className="text-xs">Text Size</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setFontSize(Math.max(fontSize - 1, 12))} aria-label="Smaller text">−</button>
              <span className="text-xs mx-1">{fontSize}</span>
              <button onClick={() => setFontSize(Math.min(fontSize + 1, 20))} aria-label="Larger text">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;