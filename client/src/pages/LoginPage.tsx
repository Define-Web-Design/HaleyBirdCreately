import { Helmet } from 'react-helmet-async';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../contexts/AuthContext';
import { Redirect } from 'wouter';

export function LoginPage() {
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
      <Helmet>
        <title>Sign In | Creately</title>
        <meta name="description" content="Sign in to your Creately account" />
      </Helmet>
      
      <div className="w-full max-w-md mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-center text-muted-foreground">Sign in to continue to Creately</p>
      </div>
      
      <LoginForm />
    </div>
  );
}