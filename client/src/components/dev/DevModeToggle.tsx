import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { performDevAutoLogin, isAlreadyAutoLoggedIn } from '@/lib/devBypass';
import { Shield, Bug, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

/**
 * Development Mode Toggle Component
 * 
 * This component provides an easy way to bypass authentication in development mode.
 * It should be REMOVED before production deployment.
 */
export const DevModeToggle = () => {
  const [, setLocation] = useLocation();
  const [isDevMode, setIsDevMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAuthBypassEnabled, setIsAuthBypassEnabled] = useState(
    import.meta.env.VITE_AUTO_LOGIN === 'true' || 
    localStorage.getItem('dev_auth_bypass') === 'true'
  );

  // Check if we're in development mode
  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                          import.meta.env.MODE === 'development';
    setIsDevMode(isDevelopment);
    
    // Check if auth bypass is already enabled
    if (isDevelopment && isAuthBypassEnabled) {
      const isAlreadyLoggedIn = isAlreadyAutoLoggedIn();
      if (!isAlreadyLoggedIn) {
        performDevAutoLogin();
        // Force page reload if not already logged in
        window.location.reload();
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
        description: 'Authentication bypass is now active. Reloading page...',
        variant: 'default',
      });
      
      // Short delay then reload to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      // Remove the tokens when disabling
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      toast({
        title: 'Dev Mode Disabled',
        description: 'Authentication bypass is now inactive. Reloading page...',
        variant: 'default',
      });
      
      // Short delay then reload to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  // Go to dashboard
  const goToDashboard = () => {
    setLocation('/dashboard');
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
            
            {isAuthBypassEnabled && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Quick Navigation</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToDashboard}
                  className="justify-start"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </AlertDialogCancel>
            {isAuthBypassEnabled && (
              <AlertDialogAction asChild>
                <Button size="sm" onClick={goToDashboard}>
                  Go to Dashboard
                </Button>
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DevModeToggle;