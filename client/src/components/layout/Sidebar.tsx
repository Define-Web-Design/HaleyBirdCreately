import { Link, useLocation } from 'wouter';
import { MENU_ITEMS, SMART_TOOLS } from '@/lib/constants';
import { useTheme } from '@/lib/hooks/use-theme';
import { useState, useCallback, useEffect } from 'react';
import { Sun, Moon, ZoomIn, ZoomOut, Eye, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
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
  expanded?: boolean;
  setExpanded?: (expanded: boolean) => void;
}

// Define types for menu items with possible sub-menus
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
  expanded = true,
  setExpanded = () => {}
}: SidebarProps) => {
  const [location] = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [accessibilityExpanded, setAccessibilityExpanded] = useState(false);
  const [expandedSubMenu, setExpandedSubMenu] = useState<string | null>(null);
  
  // Only close sidebar on navigation when submenu is not open
  // and we're not using the toggle button explicitly
  useEffect(() => {
    if (expanded && expandedSubMenu === null && !sessionStorage.getItem('sidebarToggled')) {
      setExpanded(false);
    }
    // Clear the toggle flag after it's been used
    if (sessionStorage.getItem('sidebarToggled')) {
      sessionStorage.removeItem('sidebarToggled');
    }
  }, [location, expanded, expandedSubMenu, setExpanded]);

  const toggleAccessibility = () => {
    setAccessibilityExpanded(!accessibilityExpanded);
  };

  const handleMenuItemClick = useCallback((item: MenuItem) => {
    // If item has submenu, toggle it
    if (item.subMenu && item.subMenu.length > 0) {
      // This is a category with subcategories
      setExpandedSubMenu(prev => prev === item.path ? null : item.path);
      setExpanded(true); // Keep sidebar expanded when submenu is toggled
      
      // Implement your special actions for categories here
      // For example:
      if (item.onCategoryClick) {
        item.onCategoryClick(item);
      }
    } else {
      // This is a regular menu item or a subcategory
      
      // Implement your special actions for subcategories here
      // For example:
      if (item.onSubCategoryClick) {
        item.onSubCategoryClick(item);
      }
      
      // If no submenu, close sidebar after a brief delay to allow for animation
      // Only if we're on mobile - on desktop we might want to keep it open
      if (window.innerWidth < 768) {
        setTimeout(() => {
          setExpandedSubMenu(null);
          setExpanded(false);
        }, 150);
      }
    }
  }, [setExpanded]);

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm h-full">
      {/* Logo - Clickable to go back to dashboard */}
      <Link href="/" className="p-4 flex items-center cursor-pointer hover:opacity-90 transition-opacity">
        <div className="bg-gradient-to-r from-[#F2994A] to-[#FF9DAE] h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">C</div>
        <h1 className="text-xl font-['SF_Pro_Display'] font-semibold">Creately</h1>
      </Link>
      
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Workspace</h2>
            <button className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
              <i className="fas fa-ellipsis-h text-xs"></i>
            </button>
          </div>
        </div>
        
        {/* Menu Items */}
        <ul>
          {MENU_ITEMS.map((item) => {
            // For demo purposes, let's add submenu to Content Library
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
              <li key={item.path} className="px-2 mt-1 first:mt-0">
                <div>
                  {hasSubMenu ? (
                    <button 
                      onClick={() => handleMenuItemClick(itemWithSubMenu as MenuItem)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${
                        location === item.path || isSubMenuExpanded 
                        ? 'text-primary bg-orange-50 dark:bg-gray-800' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center">
                        <i className={`${item.icon} w-5 mr-3 text-lg`}></i>
                        <span>{item.name}</span>
                        {item.isNew && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs font-medium text-white bg-primary rounded-full">New</span>
                        )}
                      </div>
                      {isSubMenuExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  ) : (
                    <Link 
                      href={item.path} 
                      onClick={() => handleMenuItemClick(item as MenuItem)}
                      className={`flex items-center px-4 py-3 rounded-lg ${
                        location === item.path 
                        ? 'text-primary bg-orange-50 dark:bg-gray-800' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <i className={`${item.icon} w-5 mr-3 text-lg`}></i>
                      <span>{item.name}</span>
                      {item.isNew && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs font-medium text-white bg-primary rounded-full">New</span>
                      )}
                    </Link>
                  )}
                  
                  {/* Sub menu */}
                  {hasSubMenu && isSubMenuExpanded && (
                    <ul className="ml-7 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                      {subMenu.map((subItem) => (
                        <li key={subItem.path}>
                          <Link 
                            href={subItem.path}
                            onClick={() => {
                              setTimeout(() => {
                                setExpandedSubMenu(null);
                                setExpanded(false);
                              }, 150);
                            }}
                            className={`flex items-center px-3 py-2 text-sm rounded-md ${
                              location === subItem.path
                              ? 'text-primary bg-orange-50/70 dark:bg-gray-800/70' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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
        
        <div className="px-4 mt-8 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Smart Tools</h2>
          </div>
        </div>
        
        <ul>
          {SMART_TOOLS.map((tool) => (
            <li key={tool.path} className="px-2 mt-1 first:mt-0">
              <Link 
                href={tool.path} 
                onClick={() => handleMenuItemClick(tool as MenuItem)}
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <i className={`${tool.icon} w-5 mr-3 text-lg`}></i>
                <span>{tool.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Profile & Accessibility Tools */}
      <div className="border-t border-gray-200 dark:border-gray-800 mt-auto">
        {/* User Profile */}
        <div className="p-4">
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center w-full">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="User avatar" 
                  className="h-8 w-8 rounded-full object-cover mr-3"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-left">Sophia Chen</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Creator</p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/accessibility">Accessibility</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/integrations">Integrations</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button className="ml-auto text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
              <i className="fas fa-cog"></i>
            </button>
          </div>
        </div>
        
        {/* Accessibility Tools Section */}
        <div className="px-4 pb-4">
          <button 
            onClick={toggleAccessibility}
            className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
          >
            <span>Accessibility Tools</span>
            {accessibilityExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {accessibilityExpanded && (
            <div className="mt-2 space-y-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
              {/* Day/Night Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Sun className={`h-4 w-4 absolute transition-all duration-300 ${!isDark 
                      ? 'text-primary opacity-100 scale-100 translate-y-0' 
                      : 'text-gray-400 opacity-0 scale-95 -translate-y-1'}`} 
                    />
                    <Moon className={`h-4 w-4 transition-all duration-300 ${isDark 
                      ? 'text-primary opacity-100 scale-100 translate-y-0' 
                      : 'text-gray-400 opacity-0 scale-95 translate-y-1'}`} 
                    />
                  </div>
                  <span className="text-sm">{isDark ? 'Dark' : 'Light'} Mode</span>
                </div>
                <Switch 
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                  aria-label="Toggle theme"
                  id="theme-toggle"
                  className="data-[state=checked]:bg-primary/90 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
                />
              </div>
              
              {/* Text Size Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ZoomIn className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm">Text Size</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setFontSize(Math.max(fontSize - 2, 12))}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                    aria-label="Decrease text size"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs mx-1">{fontSize}px</span>
                  <button 
                    onClick={() => setFontSize(Math.min(fontSize + 2, 24))}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                    aria-label="Increase text size"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              
              {/* High Contrast Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm">High Contrast</span>
                </div>
                <Switch 
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                  aria-label="Toggle high contrast"
                  className="data-[state=checked]:bg-primary/90 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
