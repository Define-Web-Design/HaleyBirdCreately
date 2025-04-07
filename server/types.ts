import { Request } from 'express';
import 'express-session';

// Extend Express session types
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
    role?: string;
    token?: string;
  }
}

// Extend Express request types to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        displayName?: string;
        role: string;
      }
    }
  }
}