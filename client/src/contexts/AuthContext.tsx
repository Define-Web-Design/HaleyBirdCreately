import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { toast } from '@/hooks/use-toast';

// User type definition
export interface User {
  id: number;
  username: string;
  displayName?: string;
  email: string;
  avatar?: string;
  role: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
}

// Register form data
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

// Create the Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Initialize auth state from token in localStorage
  useEffect(() => {
    // If we have a token, try to get user data
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  // Authentication status
  const isAuthenticated = !!user;

  // Fetch the current user data
  const { isLoading, refetch: refetchUser } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: fetchCurrentUser,
    enabled: !!token, // Only run this query if we have a token
    retry: false
  });

  // Fetch current user function
  async function fetchCurrentUser() {
    try {
      // Only proceed if we have a token
      if (!token) return null;

      const response = await apiRequest('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.success && response.user) {
        setUser(response.user);
        return response.user;
      } else {
        // If the request was successful but no user data
        setUser(null);
        localStorage.removeItem('auth_token');
        setToken(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setUser(null);
      localStorage.removeItem('auth_token');
      setToken(null);
      return null;
    }
  }

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      setError(null);
      try {
        const response = await apiRequest('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        return response;
      } catch (error: any) {
        console.error('Login error:', error);
        setError(error.message || 'Login failed. Please try again.');
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.success && data.token && data.user) {
        // Save token to localStorage
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        
        // Invalidate auth queries
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        
        toast({
          title: 'Login successful',
          description: `Welcome back, ${data.user.displayName || data.user.username}!`,
          variant: 'default'
        });
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
        toast({
          title: 'Login failed',
          description: data.message || 'Please check your credentials and try again.',
          variant: 'destructive'
        });
      }
    },
    onError: (error: any) => {
      console.error('Login mutation error:', error);
      const message = error.message || 'Login failed. Please try again.';
      setError(message);
      toast({
        title: 'Login error',
        description: message,
        variant: 'destructive'
      });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      setError(null);
      try {
        const response = await apiRequest('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        return response;
      } catch (error: any) {
        console.error('Registration error:', error);
        setError(error.message || 'Registration failed. Please try again.');
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.success && data.token && data.user) {
        // Save token to localStorage
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        
        // Invalidate auth queries
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        
        toast({
          title: 'Registration successful',
          description: `Welcome, ${data.user.displayName || data.user.username}!`,
          variant: 'default'
        });
      } else {
        setError(data.message || 'Registration failed. Please try again.');
        toast({
          title: 'Registration failed',
          description: data.message || 'Please check your information and try again.',
          variant: 'destructive'
        });
      }
    },
    onError: (error: any) => {
      console.error('Registration mutation error:', error);
      const message = error.message || 'Registration failed. Please try again.';
      setError(message);
      toast({
        title: 'Registration error',
        description: message,
        variant: 'destructive'
      });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        
        return response;
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      } finally {
        // Always clear local storage and state, even if the API call fails
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    },
    onSuccess: () => {
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
        variant: 'default'
      });
    },
    onError: (error: any) => {
      console.error('Logout mutation error:', error);
      toast({
        title: 'Logout error',
        description: 'There was an error logging out, but your session has been cleared.',
        variant: 'destructive'
      });
    }
  });

  // Login function
  async function login(username: string, password: string): Promise<boolean> {
    try {
      await loginMutation.mutateAsync({ username, password });
      return !!user;
    } catch (error) {
      return false;
    }
  }

  // Register function
  async function register(userData: RegisterData): Promise<boolean> {
    try {
      await registerMutation.mutateAsync(userData);
      return !!user;
    } catch (error) {
      return false;
    }
  }

  // Logout function
  async function logout(): Promise<void> {
    await logoutMutation.mutateAsync();
  }

  // Auth context value
  const value = {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    login,
    register,
    logout,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};