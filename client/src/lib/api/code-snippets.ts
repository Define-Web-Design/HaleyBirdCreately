import { apiRequest } from '../queryClient';

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

const API_BASE = '/api/snippets';

export async function fetchSnippets(): Promise<CodeSnippet[]> {
  try {
    return await apiRequest(API_BASE);
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return [];
  }
}

export async function fetchSnippetById(id: string): Promise<CodeSnippet | null> {
  try {
    return await apiRequest(`${API_BASE}/${id}`);
  } catch (error) {
    console.error(`Error fetching snippet ${id}:`, error);
    return null;
  }
}

export async function createSnippet(snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<CodeSnippet | null> {
  try {
    return await apiRequest(API_BASE, {
      method: 'POST',
      body: JSON.stringify(snippet)
    });
  } catch (error) {
    console.error("Error creating snippet:", error);
    return null;
  }
}

export async function updateSnippet(id: string, updates: Partial<CodeSnippet>): Promise<CodeSnippet | null> {
  try {
    return await apiRequest(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  } catch (error) {
    console.error(`Error updating snippet ${id}:`, error);
    return null;
  }
}

export async function deleteSnippet(id: string): Promise<boolean> {
  try {
    await apiRequest(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error(`Error deleting snippet ${id}:`, error);
    return false;
  }
}