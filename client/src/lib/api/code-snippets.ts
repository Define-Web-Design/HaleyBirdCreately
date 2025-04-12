
/**
 * API client for code snippets functionality
 */
import { queryClient } from '../queryClient';

const API_BASE = '/api';

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

/**
 * Fetch all snippets for the current user
 */
export const fetchSnippets = async (): Promise<CodeSnippet[]> => {
  try {
    const response = await fetch(`${API_BASE}/snippets`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // This is expected if no snippets exist yet
        return [];
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching snippets:', error);
    // Return empty array instead of throwing to prevent UI crash
    return [];
  }
};

/**
 * Fetch a single snippet by ID
 */
export const fetchSnippetById = async (id: string): Promise<CodeSnippet> => {
  const response = await fetch(`${API_BASE}/snippets/${id}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Create a new snippet
 */
export const createSnippet = async (snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<CodeSnippet> => {
  const response = await fetch(`${API_BASE}/snippets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(snippet),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  const newSnippet = await response.json();
  
  // Invalidate the snippets cache to refresh lists
  queryClient.invalidateQueries(['snippets']);
  
  return newSnippet;
};

/**
 * Update an existing snippet
 */
export const updateSnippet = async (id: string, updates: Partial<CodeSnippet>): Promise<CodeSnippet> => {
  const response = await fetch(`${API_BASE}/snippets/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  const updatedSnippet = await response.json();
  
  // Invalidate specific queries to refresh relevant data
  queryClient.invalidateQueries(['snippets']);
  queryClient.invalidateQueries(['snippet', id]);
  
  return updatedSnippet;
};

/**
 * Delete a snippet
 */
export const deleteSnippet = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/snippets/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  // Invalidate the snippets cache to refresh lists
  queryClient.invalidateQueries(['snippets']);
};
