/**
 * Development Bypass Utility
 * This file provides utilities for bypassing authentication during development.
 */

// Check if development auto-login is enabled
export const isDevelopmentAutoLogin = (): boolean => {
  // Check if running in development mode
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       import.meta.env.MODE === 'development';
  
  // Check if auto-login is explicitly enabled via environment variable
  const isAutoLoginEnabled = import.meta.env.VITE_AUTO_LOGIN === 'true';
  
  // Enable auto-login in development by default unless explicitly disabled
  const isAutoLoginDisabled = import.meta.env.VITE_AUTO_LOGIN === 'false';
  
  // Development auto-login is enabled if in development mode AND not explicitly disabled,
  // OR if explicitly enabled via environment variable
  return (isDevelopment && !isAutoLoginDisabled) || isAutoLoginEnabled;
};

// Create a mock authentication token for development
export const createMockAuthToken = (): string => {
  // Create a token that includes a timestamp to ensure uniqueness
  return `dev-mock-token-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

// Perform development auto-login by setting mock tokens in localStorage
export const performDevAutoLogin = (): void => {
  if (!isDevelopmentAutoLogin()) {
    console.warn('Attempt to perform dev auto-login when not in development mode or auto-login is disabled');
    return;
  }
  
  try {
    console.log('🔑 Development auto-login: Bypassing authentication with mock tokens');
    
    // Create mock tokens
    const mockToken = createMockAuthToken();
    const mockRefreshToken = createMockAuthToken();
    
    // Store tokens in localStorage to simulate successful login
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('refresh_token', mockRefreshToken);
    
    console.log('✅ Development auto-login: Mock tokens set successfully');
  } catch (error) {
    console.error('❌ Development auto-login failed:', error);
  }
};

// Check if user is already auto-logged in
export const isAlreadyAutoLoggedIn = (): boolean => {
  const authToken = localStorage.getItem('auth_token');
  return !!authToken && authToken.startsWith('dev-mock-token-');
};