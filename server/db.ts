import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@shared/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Neon client
neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Initialize database (create tables if they don't exist)
export async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create tables if they don't exist
    await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      display_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      avatar TEXT,
      role TEXT DEFAULT 'creator',
      phone VARCHAR(20),
      reset_token TEXT,
      reset_token_expiry TIMESTAMP,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS sessions (
      sid VARCHAR(255) PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMP WITH TIME ZONE NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS content (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      status TEXT NOT NULL,
      platform TEXT,
      engagement INTEGER DEFAULT 0,
      ai_sentiment INTEGER DEFAULT 0,
      ai_prediction INTEGER DEFAULT 0,
      tags TEXT[],
      created_at TIMESTAMP DEFAULT NOW(),
      scheduled_for TIMESTAMP,
      posted_at TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS mood_boards (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      images TEXT[],
      tags TEXT[],
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS analytics_data (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      period TEXT NOT NULL,
      engagement_rate INTEGER,
      growth_rate INTEGER,
      top_performing JSONB,
      predictions JSONB,
      date TIMESTAMP DEFAULT NOW()
    );
    `;
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

export default db;