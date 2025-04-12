import { QueryClient } from '@tanstack/react-query';

// Helper function for API requests
export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse the JSON response
    const data = await response.json();

    // Check if the request was successful
    if (!response.ok) {
      // Add status to the error for easier error handling
      throw {
        ...data,
        status: response.status,
        statusText: response.statusText,
      };
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});