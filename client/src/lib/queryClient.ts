import { QueryClient } from '@tanstack/react-query';

// Create a client with default configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 10 * 1000, // 10 seconds
    },
  },
});

// Custom fetch wrapper for API requests
export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    // If this is a GET request and there's no explicit Authorization header set
    // but we have an auth token in localStorage, add it to the request
    if (
      (!options.method || options.method === 'GET') &&
      !options.headers?.hasOwnProperty('Authorization')
    ) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    // Set default headers
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Make the fetch request
    const response = await fetch(url, options);

    // Parse the JSON response
    const data = await response.json();

    // If the response is not ok, throw an error with the response data
    if (!response.ok) {
      throw {
        message: data.message || 'An error occurred',
        status: response.status,
        data,
      };
    }

    // Return the parsed data
    return data;
  } catch (error: any) {
    // If error is already formatted by us, just rethrow it
    if (error.status) {
      throw error;
    }

    // Otherwise format and throw a new error
    console.error('API request failed:', error);
    throw {
      message: error.message || 'Network error',
      status: 500,
      data: null,
    };
  }
}

// Function to handle API mutations (POST, PUT, DELETE, etc.)
export function apiMutation<TData = any, TError = Error, TVariables = any, TContext = unknown>(
  url: string,
  method: string = 'POST',
  options: RequestInit = {}
) {
  return async (variables: TVariables): Promise<TData> => {
    return apiRequest(url, {
      method,
      body: JSON.stringify(variables),
      ...options,
    });
  };
}

// Default query function for the QueryClient
export const defaultQueryFn = async ({ queryKey }: { queryKey: string[] }): Promise<any> => {
  // Use the first element of the query key as the endpoint URL
  const [url, ...params] = queryKey;
  
  // If there are additional params, append them as query params
  const queryParams = params.length
    ? `?${new URLSearchParams(Object.fromEntries(
        params.map((param, i) => [
          typeof param === 'object' ? `param${i}` : param,
          typeof param === 'object' ? JSON.stringify(param) : String(param)
        ])
      ))}`
    : '';
  
  return apiRequest(`${url}${queryParams}`);
};

// Set the default query function for the query client
queryClient.setDefaultOptions({
  queries: {
    queryFn: defaultQueryFn,
  },
});