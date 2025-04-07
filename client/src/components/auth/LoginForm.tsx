import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'wouter';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReloadIcon } from '@radix-ui/react-icons';

// Login form schema with validation
const loginSchema = z.object({
  username: z.string()
    .min(1, { message: 'Username is required' })
    .max(50, { message: 'Username is too long' }),
  password: z.string()
    .min(1, { message: 'Password is required' })
});

// Form field types
type LoginFormValues = z.infer<typeof loginSchema>;

// LoginForm props
interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo = '/' }: LoginFormProps) {
  const { login, error, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  // Form setup with validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Form submission handler
  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      const success = await login(values.username, values.password);
      if (success) {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(redirectTo);
        }
      } else {
        setFormError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      setFormError('An unexpected error occurred. Please try again.');
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your username and password to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(formError || error) && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              {formError || error}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your username" 
                      {...field} 
                      disabled={isLoading} 
                      autoComplete="username"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter your password" 
                      {...field} 
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <> 
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Don't have an account? <a href="/register" className="text-primary font-medium">Sign Up</a>
        </p>
      </CardFooter>
    </Card>
  );
}