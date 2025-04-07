// Configuration options for the server
export const config = {
  // Authentication and security settings
  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-do-not-use-in-production',
    accessExpiryMinutes: Number(process.env.JWT_ACCESS_EXPIRY_MINUTES) || 15,
    refreshExpiryDays: Number(process.env.JWT_REFRESH_EXPIRY_DAYS) || 7
  },
  
  // Session settings
  session: {
    secret: process.env.SESSION_SECRET || 'default-session-secret-do-not-use-in-production',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production'
    }
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Password security
  password: {
    saltRounds: 10,
    minLength: 8
  },
  
  // Database configuration
  database: {
    useInMemory: process.env.USE_IN_MEMORY_DB === 'true'
  },
  
  // Server configuration
  server: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0'
  }
};