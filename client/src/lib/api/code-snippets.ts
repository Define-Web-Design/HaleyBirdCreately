import { ProgrammingLanguage } from '../../../shared/schema';
import { apiRequest } from '../queryClient';

export interface CodeSnippet {
  id: string | number;
  userId: string | number;
  title: string;
  description?: string;
  code: string;
  language: ProgrammingLanguage;
  tags?: string[];
  isPublic: boolean;
  viewCount: number;
  shareId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCodeSnippetData {
  title: string;
  description?: string;
  code: string;
  language: ProgrammingLanguage;
  tags?: string[];
  isPublic: boolean;
}

export interface UpdateCodeSnippetData {
  title?: string;
  description?: string;
  code?: string;
  language?: ProgrammingLanguage;
  tags?: string[];
  isPublic?: boolean;
}

/**
 * Create a new code snippet
 * @param data The snippet data
 * @returns The created snippet
 */
export const createCodeSnippet = async (data: CreateCodeSnippetData): Promise<CodeSnippet> => {
  const response = await apiRequest('/api/snippets', {
    method: 'POST',
    data,
  });
  return response.snippet;
};

/**
 * Get a code snippet by ID
 * @param id The snippet ID
 * @returns The snippet or null if not found
 */
export const getCodeSnippetById = async (id: string | number): Promise<CodeSnippet | null> => {
  try {
    const response = await apiRequest(`/api/snippets/${id}`, {
      method: 'GET',
    });
    return response.snippet;
  } catch (error) {
    if ((error as any)?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Get a code snippet by share ID
 * @param shareId The snippet share ID
 * @returns The snippet or null if not found
 */
export const getCodeSnippetByShareId = async (shareId: string): Promise<CodeSnippet | null> => {
  try {
    const response = await apiRequest(`/api/snippets/share/${shareId}`, {
      method: 'GET',
    });
    return response.snippet;
  } catch (error) {
    if ((error as any)?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Get all code snippets for the authenticated user
 * @returns Array of snippets
 */
export const getUserCodeSnippets = async (): Promise<CodeSnippet[]> => {
  const response = await apiRequest('/api/snippets', {
    method: 'GET',
  });
  return response.snippets || [];
};

/**
 * Get all public code snippets
 * @returns Array of public snippets
 */
export const getPublicCodeSnippets = async (): Promise<CodeSnippet[]> => {
  const response = await apiRequest('/api/snippets/public/all', {
    method: 'GET',
  });
  return response.snippets || [];
};

/**
 * Update a code snippet
 * @param id The snippet ID
 * @param data The updated data
 * @returns The updated snippet
 */
export const updateCodeSnippet = async (id: string | number, data: UpdateCodeSnippetData): Promise<CodeSnippet> => {
  const response = await apiRequest(`/api/snippets/${id}`, {
    method: 'PATCH',
    data,
  });
  return response.snippet;
};

/**
 * Delete a code snippet
 * @param id The snippet ID
 * @returns Success status
 */
export const deleteCodeSnippet = async (id: string | number): Promise<boolean> => {
  const response = await apiRequest(`/api/snippets/${id}`, {
    method: 'DELETE',
  });
  return response.success || false;
};

// Fetching code snippet content
export const fetchSnippets = async () => {
  try {
    const response = await fetch('/api/snippets');
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return { snippets: [] };
  }
};