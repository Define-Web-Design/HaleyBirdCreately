import { Helmet } from 'react-helmet-async';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../contexts/AuthContext';
import { Redirect } from 'wouter';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
      <Helmet>
        <title>Create Account | Creately</title>
        <meta name="description" content="Create a new account on Creately" />
      </Helmet>
      
      <div className="w-full max-w-md mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Join Creately</h1>
        <p className="text-center text-muted-foreground">Create your account to get started</p>
      </div>
      
      <RegisterForm />
    </div>
  );
}