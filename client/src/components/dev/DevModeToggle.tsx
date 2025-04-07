import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { performDevAutoLogin, isAlreadyAutoLoggedIn } from '@/lib/devBypass';
import { 
  Shield, Bug, X, LayoutDashboard, Home, Palette, 
  Settings, BookOpen, Bell, Users, BarChart 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

/**
 * Development Mode Toggle Component
 * 
 * This component provides an easy way to bypass authentication in development mode.
 * It should be REMOVED before production deployment.
 */
export const DevModeToggle = () => {
  const [, setLocation] = useLocation();
  const [isDevMode, setIsDevMode] = useState(true); // Always show in development
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAuthBypassEnabled, setIsAuthBypassEnabled] = useState(
    import.meta.env.VITE_AUTO_LOGIN === 'true' || 
    localStorage.getItem('dev_auth_bypass') === 'true'
  );

  // Check if we're in development mode and apply auth bypass
  useEffect(() => {
    // Always enable dev mode for development
    setIsDevMode(true);
    
    // Check if auth bypass is already enabled
    if (isAuthBypassEnabled) {
      const isAlreadyLoggedIn = isAlreadyAutoLoggedIn();
      if (!isAlreadyLoggedIn) {
        performDevAutoLogin();
      }
    }
  }, [isAuthBypassEnabled]);

  // Toggle auth bypass
  const handleToggleAuthBypass = (checked: boolean) => {
    setIsAuthBypassEnabled(checked);
    localStorage.setItem('dev_auth_bypass', checked ? 'true' : 'false');
    
    if (checked) {
      performDevAutoLogin();
      toast({
        title: 'Dev Mode Enabled',
        description: 'Authentication bypass is now active',
        variant: 'default',
      });
    } else {
      // Remove the tokens when disabling
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      toast({
        title: 'Dev Mode Disabled',
        description: 'Authentication bypass is now inactive',
        variant: 'default',
      });
    }
  };

  // Navigation functions without page reloads
  const navigateTo = (path: string) => {
    setLocation(path);
    // Keep dialog open to allow multiple navigation without reopening
  };

  // Close dialog only when explicitly requested
  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  // If not in development mode, don't render anything
  if (!isDevMode) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsDialogOpen(true)}
          className="bg-background/80 backdrop-blur-sm border border-border shadow-lg flex items-center gap-2"
        >
          <Bug className="h-4 w-4" />
          <span className="text-xs">Dev Mode</span>
        </Button>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-500" />
              Development Mode Controls
            </AlertDialogTitle>
            <AlertDialogDescription>
              These controls are only for development purposes and should be removed before production deployment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auth-bypass">Authentication Bypass</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable authentication bypass for development
                </p>
              </div>
              <Switch 
                id="auth-bypass" 
                checked={isAuthBypassEnabled}
                onCheckedChange={handleToggleAuthBypass}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Quick Navigation</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateTo('/')}
                  className="justify-start"
                >
                  <Home className="h-4 w-4 mr-2" /> Home
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateTo('/dashboard')}
                  className="justify-start"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateTo('/palettes')}
                  className="justify-start"
                >
                  <Palette className="h-4 w-4 mr-2" /> Palettes
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateTo('/settings')}
                  className="justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateTo('/tutorials')}
                  className="justify-start"
                >
                  <BookOpen className="h-4 w-4 mr-2" /> Tutorials
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateTo('/notifications')}
                  className="justify-start"
                >
                  <Bell className="h-4 w-4 mr-2" /> Notifications
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateTo('/community')}
                  className="justify-start"
                >
                  <Users className="h-4 w-4 mr-2" /> Community
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateTo('/analytics')}
                  className="justify-start"
                >
                  <BarChart className="h-4 w-4 mr-2" /> Analytics
                </Button>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={closeDialog}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button 
              size="sm" 
              onClick={() => {
                navigateTo('/dashboard');
                closeDialog();
              }}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DevModeToggle;