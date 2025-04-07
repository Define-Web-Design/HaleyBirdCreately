/**
 * Authentication Test Utility
 * This file provides utilities for testing authentication.
 * NOTE: Auto-login is now disabled by default and requires explicit opt-in via environment variable.
 */

// Check if development auto-login is enabled
export const isDevelopmentAutoLogin = (): boolean => {
  // Auto-login is now only enabled if explicitly set to true
  const isAutoLoginEnabled = import.meta.env.VITE_AUTO_LOGIN === 'true';
  
  // No longer auto-enables in development mode by default
  return isAutoLoginEnabled;
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