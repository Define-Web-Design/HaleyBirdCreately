import React from 'react';
import { 
  Bell,
  User, 
  Settings, 
  LogOut, 
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AccessibilityMenu } from '@/components/ui/accessibility-menu';
import { initAccessibilitySettings } from '@/lib/a11y-utils';

interface TopNavigationProps {
  toggleSidebar: () => void;
  isMobile: boolean;
}

export default function TopNavigation({ toggleSidebar, isMobile }: TopNavigationProps) {
  // Initialize accessibility settings when component mounts
  React.useEffect(() => {
    initAccessibilitySettings();
  }, []);

  return (
    <div className="flex items-center justify-between h-16 px-4 border-b bg-background">
      {/* Left side */}
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            // Set a flag to indicate this was an explicit toggle
            sessionStorage.setItem('sidebarToggled', 'true');
            toggleSidebar();
          }} 
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <h1 className="text-xl font-['SF_Pro_Display'] font-semibold ml-2">Creately</h1>
      </div>

      {/* Right side - notification and profile buttons */}
      <div className="flex items-center space-x-2">
        {/* Notifications button */}
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Accessibility menu */}
        <AccessibilityMenu />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-8 w-8 bg-primary text-primary-foreground"
              aria-label="User menu"
            >
              <User className="h-4 w-4" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}