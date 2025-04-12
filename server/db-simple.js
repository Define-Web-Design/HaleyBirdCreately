/**
 * Simple Database Connection Module
 * 
 * This module provides a simplified interface to connect to the PostgreSQL
 * database and perform operations, especially for our code snippet feature.
 * 
 * Since we're facing issues with installing the pg package in the Replit environment,
 * this file now uses a fallback in-memory implementation without actual database connections.
 */

import crypto from 'crypto';

// In-memory database for fallback
const inMemoryDb = {
  users: [
    {
      id: 1,
      username: 'sampleuser',
      email: 'sample@example.com',
      password: 'placeholder_password',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  code_snippets: []
};

// Test connection
export async function testConnection() {
  try {
    // We're always using the in-memory database, so this always "succeeds"
    console.log('✅ Using in-memory database for code snippets');
    return true;
  } catch (error) {
    console.error('❌ Error initializing in-memory database:', error.message);
    return false;
  }
}

// Initialize database tables if they don't exist
export async function initDatabase() {
  try {
    // No need to initialize anything for in-memory
    console.log('✅ In-memory database initialized successfully');
    
    // Add a sample snippet if there are none
    if (inMemoryDb.code_snippets.length === 0) {
      await addSampleSnippet();
    }
    
    return true;
  } catch (error) {
    console.error('❌ In-memory database initialization error:', error.message);
    return false;
  }
}

// Get all code snippets
export async function getCodeSnippets() {
  try {
    // Sort by created_at in descending order
    return [...inMemoryDb.code_snippets].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error fetching code snippets:', error.message);
    return [];
  }
}

// Get code snippet by ID
export async function getCodeSnippetById(id) {
  try {
    return inMemoryDb.code_snippets.find(snippet => snippet.id === id) || null;
  } catch (error) {
    console.error(`Error fetching code snippet with ID ${id}:`, error.message);
    return null;
  }
}

// Get code snippet by share ID
export async function getCodeSnippetByShareId(shareId) {
  try {
    return inMemoryDb.code_snippets.find(snippet => snippet.share_id === shareId) || null;
  } catch (error) {
    console.error(`Error fetching code snippet with share ID ${shareId}:`, error.message);
    return null;
  }
}

// Get all public code snippets
export async function getPublicCodeSnippets() {
  try {
    // Filter by is_public = true and sort by created_at in descending order
    return inMemoryDb.code_snippets
      .filter(snippet => snippet.is_public === true)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('Error fetching public code snippets:', error.message);
    return [];
  }
}

// Create a new code snippet
export async function createCodeSnippet(snippet) {
  try {
    // Generate a new ID (max + 1)
    const newId = inMemoryDb.code_snippets.length > 0 
      ? Math.max(...inMemoryDb.code_snippets.map(s => s.id)) + 1 
      : 1;
    
    // Generate UUID for shareId if not provided
    const shareId = snippet.shareId || crypto.randomUUID();
    
    // Create the new snippet
    const now = new Date().toISOString();
    const newSnippet = {
      id: newId,
      user_id: snippet.userId,
      title: snippet.title,
      description: snippet.description || null,
      code: snippet.code,
      language: snippet.language,
      tags: Array.isArray(snippet.tags) ? snippet.tags : [],
      is_public: snippet.isPublic || false,
      view_count: 0,
      share_id: shareId,
      created_at: now,
      updated_at: now
    };
    
    // Add to the in-memory database
    inMemoryDb.code_snippets.push(newSnippet);
    
    // Return a copy to avoid accidental mutations
    return { ...newSnippet };
  } catch (error) {
    console.error('Error creating code snippet:', error.message);
    throw error;
  }
}

// Update code snippet view count
export async function incrementCodeSnippetViewCount(id) {
  try {
    const snippet = inMemoryDb.code_snippets.find(s => s.id === id);
    
    if (snippet) {
      // Increment the view count
      snippet.view_count += 1;
      snippet.updated_at = new Date().toISOString();
      
      // Return a copy to avoid accidental mutations
      return { ...snippet };
    }
    
    return null;
  } catch (error) {
    console.error(`Error incrementing view count for snippet ${id}:`, error.message);
    return null;
  }
}

// Function to quickly add a sample snippet for testing
export async function addSampleSnippet() {
  try {
    // Use the first user (we always have a sample user in our in-memory database)
    const userId = inMemoryDb.users[0].id;
    
    // Create a sample code snippet
    return await createCodeSnippet({
      userId: userId,
      title: 'Hello World in JavaScript',
      description: 'A simple Hello World example in JavaScript',
      code: 'console.log("Hello World!");',
      language: 'javascript',
      tags: ['hello-world', 'javascript', 'beginner'],
      isPublic: true
    });
  } catch (error) {
    console.error('Error adding sample snippet:', error.message);
    return null;
  }
}

export default {
  testConnection,
  initDatabase,
  getCodeSnippets,
  getCodeSnippetById,
  getCodeSnippetByShareId,
  getPublicCodeSnippets,
  createCodeSnippet,
  incrementCodeSnippetViewCount,
  addSampleSnippet
};