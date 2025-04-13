/**
 * Simple in-memory database for code snippets
 * This is used as a fallback when PostgreSQL is unavailable
 */

import crypto from 'crypto';

// In-memory storage for code snippets
const snippets = [];
let nextId = 1;

/**
 * Generate a random ID for sharing
 * @param {number} length - The length of the ID
 * @returns {string} The generated ID
 */
function generateId(length = 6) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const index = bytes[i] % characters.length;
    result += characters[index];
  }
  
  return result;
}

/**
 * Test connection to database
 * @returns {Promise<boolean>} True if connection is successful
 */
export async function testConnection() {
  return true; // In-memory DB is always available
}

/**
 * Initialize the database
 * @returns {Promise<void>}
 */
export async function initDatabase() {
  console.log('Initializing in-memory database for code snippets');
  
  // Add a sample snippet if none exist
  if (snippets.length === 0) {
    await addSampleSnippet();
  }
  
  return true;
}

/**
 * Get all code snippets
 * @returns {Promise<Array>} Array of code snippets
 */
export async function getCodeSnippets() {
  return snippets.filter(snippet => snippet.isPublic);
}

/**
 * Get a code snippet by ID
 * @param {number} id - The snippet ID
 * @returns {Promise<Object|null>} The snippet or null if not found
 */
export async function getCodeSnippetById(id) {
  const snippet = snippets.find(s => s.id === id);
  return snippet || null;
}

/**
 * Get a code snippet by shareId
 * @param {string} shareId - The snippet share ID
 * @returns {Promise<Object|null>} The snippet or null if not found
 */
export async function getCodeSnippetByShareId(shareId) {
  const snippet = snippets.find(s => s.shareId === shareId);
  
  if (snippet) {
    // Increment view count
    snippet.viewCount += 1;
  }
  
  return snippet || null;
}

/**
 * Get all public code snippets
 * @returns {Promise<Array>} Array of public code snippets
 */
export async function getPublicCodeSnippets() {
  return snippets.filter(snippet => snippet.isPublic)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Create a new code snippet
 * @param {Object} snippet - The snippet to create
 * @returns {Promise<Object>} The created snippet
 */
export async function createCodeSnippet(snippet) {
  const id = nextId++;
  const shareId = generateId(8);
  const createdAt = new Date().toISOString();
  
  const newSnippet = {
    id,
    shareId,
    createdAt,
    viewCount: 0,
    ...snippet
  };
  
  snippets.push(newSnippet);
  return newSnippet;
}

/**
 * Increment the view count for a snippet
 * @param {number} id - The snippet ID
 * @returns {Promise<Object|null>} The updated snippet or null if not found
 */
export async function incrementCodeSnippetViewCount(id) {
  const snippet = await getCodeSnippetById(id);
  
  if (snippet) {
    snippet.viewCount += 1;
  }
  
  return snippet;
}

/**
 * Add a sample snippet to the database
 * @returns {Promise<Object>} The created snippet
 */
export async function addSampleSnippet() {
  return createCodeSnippet({
    title: 'Welcome to Creately Code Snippets',
    language: 'javascript',
    code: `/**
 * Welcome to Creately Code Snippets
 * 
 * This is a sample code snippet to demonstrate the functionality.
 * You can create your own snippets and share them with others.
 */
function greeting(name) {
  return \`Hello, \${name}! Welcome to Creately Code Snippets.\`;
}

// Example usage
const message = greeting('User');
console.log(message);

// Features:
// - Syntax highlighting
// - Line numbers
// - Copy to clipboard
// - Public/private snippets
// - Share via URL
`,
    description: 'A sample code snippet to demonstrate the functionality of Creately Code Snippets.',
    author: 'Creately Team',
    isPublic: true
  });
}