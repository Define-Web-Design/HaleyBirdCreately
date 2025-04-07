import { AuthContextType } from '../contexts/AuthContext';
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Creates an axios instance with interceptors for handling authentication
 * @param auth The auth context instance
 * @returns An axios instance with auth interceptors
 */
export const createApiWithAuth = (auth: AuthContextType): AxiosInstance => {
  // Create axios instance
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      // If we have a token, add it to the request headers
      if (auth.token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor to handle token refresh
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      // If the error is 401 (Unauthorized) and we have a refresh token
      // and this is not a retry already and not a refresh token request itself
      if (
        error.response?.status === 401 &&
        auth.refreshToken &&
        !originalRequest._retry &&
        !(originalRequest.url === '/auth/refresh-token')
      ) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshed = await auth.refreshAccessToken();
          
          if (refreshed) {
            // If token refresh was successful, update the Authorization header
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${auth.token}`;
            
            // Retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If token refresh fails, reject with the original error
          console.error('Token refresh failed', refreshError);
        }
      }
      
      // If we couldn't refresh the token or it's not a 401, just reject the promise
      return Promise.reject(error);
    }
  );

  return api;
};

// Export a single function for simpler usage
export const createApiWithInterceptors = (auth: AuthContextType) => {
  return createApiWithAuth(auth);
};