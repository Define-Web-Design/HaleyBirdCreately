import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './shared/schema.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Neon client
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Perform a simple query to verify connection
    const result = await sql`SELECT NOW() as time`;
    console.log('Database connection successful:', result[0].time);
    
    // Get a list of tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('\nDatabase tables:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    
    console.log('\nDatabase setup is complete and all tables are ready.');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

testConnection();