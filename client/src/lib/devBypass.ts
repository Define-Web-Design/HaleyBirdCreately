/**
 * Authentication Test Utility
 * This file provides utilities for testing authentication in development mode.
 */

// Check if development auto-login is enabled
export const isDevelopmentAutoLogin = (): boolean => {
  // Check both environment variables and local storage for enabling dev login
  const isAutoLoginEnabled = 
    import.meta.env.VITE_AUTO_LOGIN === 'true' || 
    localStorage.getItem('dev_auth_bypass') === 'true';
  
  // Always enable in development mode if either flag is true
  return isAutoLoginEnabled;
};

// Create a mock authentication token for development
export const createMockAuthToken = (): string => {
  // Create a token that includes a timestamp to ensure uniqueness
  return `dev-mock-token-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

// Perform development auto-login by setting mock tokens in localStorage
export const performDevAutoLogin = (): void => {
  // Allow dev login for development mode
  try {
    console.log('🔑 Development auto-login: Bypassing authentication with mock tokens');
    
    // Create mock tokens
    const mockToken = createMockAuthToken();
    const mockRefreshToken = createMockAuthToken();
    
    // Store tokens in localStorage to simulate successful login
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('refresh_token', mockRefreshToken);
    
    // Also set the dev bypass flag to true to ensure consistency
    localStorage.setItem('dev_auth_bypass', 'true');
    
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