import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

export function UnauthorizedPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
      <Helmet>
        <title>Unauthorized | Creately</title>
        <meta name="description" content="Unauthorized access" />
      </Helmet>
      
      <div className="w-full max-w-md text-center space-y-6">
        <div className="bg-red-100 dark:bg-red-900/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-red-600 dark:text-red-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold">Access Denied</h1>
        
        <p className="text-muted-foreground">
          You don't have permission to access this page. This area requires additional privileges.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
          
          {isAuthenticated ? (
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}