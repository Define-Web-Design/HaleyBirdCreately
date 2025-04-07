import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IStorage } from '../storage';
import { config } from '../config';
import { InsertUser } from '../../shared/schema';

// Define types for the service
interface AuthResult {
  success: boolean;
  message?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    displayName?: string;
    role: string;
  };
  token?: string;
}

// Auth service class
export class AuthService {
  private storage: IStorage;
  
  constructor(storage: IStorage) {
    this.storage = storage;
  }
  
  /**
   * Register a new user
   * @param userData User data to register
   * @returns Result of registration
   */
  async register(userData: InsertUser): Promise<AuthResult> {
    try {
      // Check if username already exists
      const existingUser = await this.storage.getUserByUsername(userData.username);
      if (existingUser) {
        return { success: false, message: 'Username already exists' };
      }
      
      // Check if email already exists
      const existingEmail = await this.storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return { success: false, message: 'Email already exists' };
      }
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user with hashed password
      const newUser = await this.storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Create JWT token
      const token = this.generateToken(newUser);
      
      // Create session
      await this.storage.createSession({
        userId: newUser.id,
        token,
        expiresAt: new Date(Date.now() + config.sessionMaxAge)
      });
      
      return { 
        success: true, 
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          displayName: newUser.displayName || undefined,
          role: newUser.role || 'user'
        },
        token
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  }
  
  /**
   * Login a user
   * @param username Username
   * @param password Password
   * @param ipAddress IP address (optional)
   * @param userAgent User agent (optional)
   * @returns Result of login
   */
  async login(
    username: string, 
    password: string, 
    ipAddress?: string | null,
    userAgent?: string | null
  ): Promise<AuthResult> {
    try {
      // Get user by username
      const user = await this.storage.getUserByUsername(username);
      if (!user) {
        return { success: false, message: 'Invalid username or password' };
      }
      
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { success: false, message: 'Invalid username or password' };
      }
      
      // Create JWT token
      const token = this.generateToken(user);
      
      // Create session
      await this.storage.createSession({
        userId: user.id,
        token,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        expiresAt: new Date(Date.now() + config.sessionMaxAge)
      });
      
      return { 
        success: true, 
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName || undefined,
          role: user.role || 'user'
        },
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }
  
  /**
   * Logout a user (invalidate token)
   * @param token JWT token to invalidate
   * @returns Boolean indicating success
   */
  async logout(token: string): Promise<boolean> {
    try {
      // Delete session by token
      await this.storage.deleteSessionByToken(token);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }
  
  /**
   * Verify a token
   * @param token JWT token to verify
   * @returns User data if token is valid, null otherwise
   */
  async verifyToken(token: string): Promise<any> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      
      // Check if token is in valid sessions
      const session = await this.storage.getSessionByToken(token);
      if (!session) {
        return null;
      }
      
      // Get user from decoded token
      const user = await this.storage.getUserById(decoded.id);
      if (!user) {
        return null;
      }
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role || 'user'
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }
  
  /**
   * Check if a session is valid
   * @param sessionId Session ID
   * @returns Boolean indicating if session is valid
   */
  async isSessionValid(sessionId: string): Promise<boolean> {
    try {
      // Get session by ID
      const session = await this.storage.getSessionById(sessionId);
      
      // Check if session exists and is not expired
      if (!session) {
        return false;
      }
      
      // Check if session is expired
      const now = new Date();
      if (session.expiresAt < now) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }
  
  /**
   * Generate a JWT token for a user
   * @param user User to generate token for
   * @returns JWT token
   */
  private generateToken(user: any): string {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role || 'user'
    };
    
    return jwt.sign(
      payload, 
      config.jwtSecret, 
      { expiresIn: config.jwtExpiresIn }
    );
  }
}