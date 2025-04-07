import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IStorage } from '../storage';
import { config } from '../config';
import { InsertUser } from '../../shared/schema';
import crypto from 'crypto';

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
  refreshToken?: string;
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
        username: userData.username,
        email: userData.email,
        passwordHash: hashedPassword,
        displayName: userData.displayName || undefined,
        avatar: userData.avatar || undefined,
        role: userData.role
      });
      
      // Create JWT access token
      const token = this.generateAccessToken(newUser);
      
      // Create refresh token
      const refreshToken = await this.generateRefreshToken(newUser.id);
      
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
        token,
        refreshToken
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
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return { success: false, message: 'Invalid username or password' };
      }
      
      // Create JWT access token
      const token = this.generateAccessToken(user);
      
      // Create refresh token
      const refreshToken = await this.generateRefreshToken(
        user.id, 
        ipAddress || undefined, 
        userAgent || undefined
      );
      
      // Create session (still maintain sessions for backward compatibility)
      await this.storage.createSession({
        userId: user.id,
        token,
        ipAddress: ipAddress === null ? undefined : ipAddress,
        userAgent: userAgent === null ? undefined : userAgent,
        expiresAt: new Date(Date.now() + config.sessionMaxAge)
      });
      
      // Update last login time
      await this.storage.updateUserLastLogin(user.id);
      
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
        token,
        refreshToken
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }
  
  /**
   * Logout a user (invalidate token)
   * @param token JWT token to invalidate
   * @param refreshToken Refresh token to invalidate (optional)
   * @returns Boolean indicating success
   */
  async logout(token: string, refreshToken?: string): Promise<boolean> {
    try {
      // Delete session by token
      await this.storage.deleteSession(token);
      
      // If refresh token is provided, revoke it
      if (refreshToken) {
        await this.storage.revokeRefreshToken(refreshToken);
      }
      
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
      // Verify JWT token (cast secret to string to satisfy TypeScript)
      const decoded = jwt.verify(token, String(config.jwtSecret)) as any;
      
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
   * @param sessionToken Session token
   * @returns Boolean indicating if session is valid
   */
  async isSessionValid(sessionToken: string): Promise<boolean> {
    try {
      // Get session by token
      const session = await this.storage.getSessionByToken(sessionToken);
      
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
   * Generate a refresh token
   * @param userId User ID to generate refresh token for
   * @param ipAddress IP address (optional)
   * @param userAgent User agent (optional)
   */
  async generateRefreshToken(userId: number, ipAddress?: string, userAgent?: string): Promise<string> {
    // Generate a random token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Calculate expiration date
    const expiresAt = new Date();
    // Parse the expiration time: "7d" -> 7 days, "1h" -> 1 hour
    const expiresInMatch = config.refreshTokenExpiresIn.match(/^(\d+)([hdm])$/);
    if (expiresInMatch) {
      const value = parseInt(expiresInMatch[1]);
      const unit = expiresInMatch[2];
      
      if (unit === 'd') {
        expiresAt.setDate(expiresAt.getDate() + value);
      } else if (unit === 'h') {
        expiresAt.setHours(expiresAt.getHours() + value);
      } else if (unit === 'm') {
        expiresAt.setMinutes(expiresAt.getMinutes() + value);
      }
    } else {
      // Default to 7 days if format is incorrect
      expiresAt.setDate(expiresAt.getDate() + 7);
    }
    
    // Store the refresh token
    await this.storage.createRefreshToken({
      userId,
      token: refreshToken,
      expiresAt,
      ipAddress,
      userAgent
    });
    
    return refreshToken;
  }
  
  /**
   * Refresh an access token using a refresh token
   * @param refreshToken Refresh token
   * @returns New auth result with a fresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Get the refresh token from storage
      const storedToken = await this.storage.getRefreshTokenByToken(refreshToken);
      
      // Check if token exists and is valid
      if (!storedToken) {
        return { success: false, message: 'Invalid refresh token' };
      }
      
      // Check if token is expired
      const now = new Date();
      if (storedToken.expiresAt < now) {
        await this.storage.deleteRefreshToken(refreshToken);
        return { success: false, message: 'Refresh token expired' };
      }
      
      // Check if token is revoked
      if (storedToken.isRevoked) {
        // If a token is revoked, we should delete all tokens for this user as a security measure
        await this.storage.deleteRefreshTokensByUserId(storedToken.userId);
        return { success: false, message: 'Refresh token revoked' };
      }
      
      // Get the user
      const user = await this.storage.getUserById(storedToken.userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      // Generate a new access token
      const token = this.generateAccessToken(user);
      
      // Return the auth result
      return {
        success: true,
        message: 'Token refreshed successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName || undefined,
          role: user.role || 'user'
        },
        token,
        refreshToken // Return the same refresh token
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return { success: false, message: 'Failed to refresh token' };
    }
  }

  /**
   * Generate an access token for a user
   * @param user User to generate token for
   * @returns JWT token
   */
  private generateAccessToken(user: any): string {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role || 'user'
    };
    
    // Cast the secret to string to satisfy TypeScript
    const secret = String(config.jwtSecret);
    
    // Cast the options to any to work around typing issues
    const options: any = { expiresIn: config.jwtExpiresIn };
    
    return jwt.sign(payload, secret, options);
  }
}