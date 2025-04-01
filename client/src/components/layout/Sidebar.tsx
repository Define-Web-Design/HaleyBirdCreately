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
      className={`flex flex-col ${expanded ? 'w-64' : 'w-0 md:w-20'} bg-background border-r border-border shadow-sm h-full transition-all duration-300 ease-in-out overflow-hidden`}
    >
      <Link href="/" className="p-4 flex items-center cursor-pointer hover:opacity-90 transition-opacity">
        <div className="bg-gradient-to-r from-[#F2994A] to-[#FF9DAE] h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3 shrink-0">C</div>
        <h1 className={`text-xl font-medium transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:opacity-0 md:w-0 md:hidden'}`}>Creately</h1>
      </Link>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className={`px-4 mb-4 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 h-0 mb-0 overflow-hidden md:opacity-100 md:h-auto md:mb-4 md:overflow-visible'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Workspace</h2>
            <button className="text-muted-foreground hover:text-primary">
              <i className="fas fa-ellipsis-h text-xs"></i>
            </button>
          </div>
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
                        <i className={`${item.icon} w-5 mr-3 text-lg shrink-0`}></i>
                        <span className={`transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:opacity-100 md:w-auto md:overflow-visible'}`}>{item.name}</span>
                        {item.isNew && expanded && (
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
                      <i className={`${item.icon} w-5 mr-3 text-lg shrink-0`}></i>
                      <span className={`transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:opacity-100 md:w-auto md:overflow-visible'}`}>{item.name}</span>
                      {item.isNew && expanded && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs font-medium text-white bg-primary rounded-full">New</span>
                      )}
                    </Link>
                  )}

                  {hasSubMenu && isSubMenuExpanded && (
                    <ul className="ml-7 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
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

        <div className={`px-4 mt-8 mb-4 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 h-0 mb-0 overflow-hidden md:opacity-100 md:h-auto md:mb-4 md:overflow-visible'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Smart Tools</h2>
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
                <i className={`${tool.icon} w-5 mr-3 text-lg shrink-0`}></i>
                <span className={`transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:opacity-100 md:w-auto md:overflow-visible'}`}>{tool.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border mt-auto">
        <div className="p-4">
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center w-full">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="User avatar" 
                  className="h-9 w-9 rounded-full object-cover mr-3 shrink-0 shadow-sm"
                />
                <div className={`flex-1 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:opacity-100 md:w-auto md:overflow-visible'}`}>
                  <p className="text-sm font-medium text-left">Sophia Chen</p>
                  <p className="text-xs text-muted-foreground">Creator</p>
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
            <button className={`ml-auto text-muted-foreground hover:text-primary transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:opacity-100 md:w-auto md:overflow-visible'}`}>
              <i className="fas fa-cog"></i>
            </button>
          </div>
        </div>

        <div className={`px-4 pb-4 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden md:opacity-100 md:h-auto md:overflow-visible'}`}>
          <button 
            onClick={toggleAccessibility}
            className="flex items-center justify-between w-full py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
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
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <EyeOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm">Color Blind Mode</span>
                </div>
                <select
                  value={colorBlindMode}
                  onChange={(e) => setColorBlindMode(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-md bg-muted border border-input shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  aria-label="Select color blind mode"
                >
                  <option value="none">None</option>
                  <option value="protanopia">Protanopia (Red-Blind)</option>
                  <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                  <option value="achromatopsia">Achromatopsia (No Color)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;