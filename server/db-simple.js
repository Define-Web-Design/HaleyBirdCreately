/**
 * Simple Database Connection Module
 * 
 * This module provides a simplified interface to connect to the PostgreSQL
 * database and perform operations, especially for our code snippet feature.
 */

import pg from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Create a connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
export async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  } finally {
    if (client) client.release();
  }
}

// Initialize database tables if they don't exist
export async function initDatabase() {
  let client;
  try {
    client = await pool.connect();
    
    // Create users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        display_name TEXT,
        avatar TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create code_snippets table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS code_snippets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT,
        code TEXT NOT NULL,
        language TEXT NOT NULL,
        tags JSONB DEFAULT '[]',
        is_public BOOLEAN DEFAULT FALSE,
        view_count INTEGER DEFAULT 0,
        share_id UUID NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    return false;
  } finally {
    if (client) client.release();
  }
}

// Get all code snippets
export async function getCodeSnippets() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM code_snippets ORDER BY created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching code snippets:', error.message);
    return [];
  } finally {
    if (client) client.release();
  }
}

// Get code snippet by ID
export async function getCodeSnippetById(id) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM code_snippets WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error fetching code snippet with ID ${id}:`, error.message);
    return null;
  } finally {
    if (client) client.release();
  }
}

// Get code snippet by share ID
export async function getCodeSnippetByShareId(shareId) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM code_snippets WHERE share_id = $1
    `, [shareId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error fetching code snippet with share ID ${shareId}:`, error.message);
    return null;
  } finally {
    if (client) client.release();
  }
}

// Get all public code snippets
export async function getPublicCodeSnippets() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM code_snippets WHERE is_public = TRUE ORDER BY created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching public code snippets:', error.message);
    return [];
  } finally {
    if (client) client.release();
  }
}

// Create a new code snippet
export async function createCodeSnippet(snippet) {
  let client;
  try {
    client = await pool.connect();
    
    // Generate UUID for shareId if not provided
    const shareId = snippet.shareId || crypto.randomUUID();
    
    const result = await client.query(`
      INSERT INTO code_snippets (
        user_id, title, description, code, language, tags, 
        is_public, share_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      snippet.userId,
      snippet.title,
      snippet.description || null,
      snippet.code,
      snippet.language,
      JSON.stringify(snippet.tags || []),
      snippet.isPublic || false,
      shareId
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating code snippet:', error.message);
    throw error;
  } finally {
    if (client) client.release();
  }
}

// Update code snippet view count
export async function incrementCodeSnippetViewCount(id) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      UPDATE code_snippets SET 
        view_count = view_count + 1,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error incrementing view count for snippet ${id}:`, error.message);
    return null;
  } finally {
    if (client) client.release();
  }
}

// Function to quickly add a sample snippet for testing
export async function addSampleSnippet() {
  try {
    // First check if we have any users
    let client = await pool.connect();
    let userResult = await client.query('SELECT id FROM users LIMIT 1');
    client.release();
    
    // If no users exist, create a sample user
    let userId = 1;
    if (userResult.rows.length === 0) {
      client = await pool.connect();
      const userInsertResult = await client.query(`
        INSERT INTO users (username, email, password, role)
        VALUES ('sampleuser', 'sample@example.com', 'placeholder_password', 'user')
        RETURNING id
      `);
      userId = userInsertResult.rows[0].id;
      client.release();
      console.log('Created sample user with ID:', userId);
    } else {
      userId = userResult.rows[0].id;
    }
    
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