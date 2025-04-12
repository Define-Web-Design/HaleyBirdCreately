import { QueryClient } from '@tanstack/react-query';

// Default fetch configuration for API requests
const defaultFetchOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json'
  }
};

// API request helper function that handles auth token
export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  // Get auth token from localStorage
  const token = localStorage.getItem('token');
  
  // Merge default options with provided options
  const fetchOptions = {
    ...defaultFetchOptions,
    ...options,
    headers: {
      ...defaultFetchOptions.headers,
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };
  
  // Make the request
  const response = await fetch(url, fetchOptions);
  
  // Handle non-2xx responses
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }
  
  // For 204 No Content responses, return null
  if (response.status === 204) {
    return null;
  }
  
  // Parse and return the JSON response
  return await response.json();
}

// Create the query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use our custom fetcher function
      queryFn: async ({ queryKey }) => {
        // Convert query key to URL
        const url = Array.isArray(queryKey) 
          ? queryKey.join('/') 
          : queryKey.toString();
          
        return apiRequest(url);
      },
      // Default caching and error handling settings
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

export default queryClient;