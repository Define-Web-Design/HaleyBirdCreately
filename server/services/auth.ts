import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IStorage } from '../storage';
import { config } from '../config';
import { InsertUser, User, InsertRefreshToken } from '../../shared/schema';
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

interface TokenPayload {
  userId: number;
  username: string;
  role: string;
}

export class AuthService {
  private storage: IStorage;
  private readonly saltRounds = 10;
  private readonly accessTokenExpiry = '15m'; // 15 minutes
  private readonly refreshTokenExpiry = '7d'; // 7 days

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  // Register a new user
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
      const passwordHash = await bcrypt.hash(userData.password, this.saltRounds);

      // Create the user with hashed password
      const user = await this.storage.createUser({
        ...userData,
        passwordHash
      });

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Store refresh token in database
      await this.storeRefreshToken(user.id, refreshToken);

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName || undefined,
          role: user.role
        },
        token: accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  }

  // Login a user
  async login(username: string, password: string, ipAddress?: string, userAgent?: string): Promise<AuthResult> {
    try {
      // Find user by username
      const user = await this.storage.getUserByUsername(username);
      if (!user) {
        return { success: false, message: 'Invalid username or password' };
      }

      // Check if the user is active
      if (!user.isActive) {
        return { success: false, message: 'Account is disabled' };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid username or password' };
      }

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Store refresh token in database
      await this.storeRefreshToken(user.id, refreshToken, ipAddress, userAgent);

      // Update last login time
      await this.storage.updateUserLastLogin(user.id);

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName || undefined,
          role: user.role
        },
        token: accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Verify the refresh token exists and is valid
      const storedToken = await this.storage.getRefreshToken(refreshToken);
      if (!storedToken) {
        return { success: false, message: 'Invalid refresh token' };
      }

      // Check if token is expired or revoked
      if (storedToken.isRevoked || new Date() > storedToken.expiresAt) {
        return { success: false, message: 'Refresh token expired or revoked' };
      }

      // Get the user
      const user = await this.storage.getUserById(storedToken.userId);
      if (!user || !user.isActive) {
        return { success: false, message: 'User not found or inactive' };
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Revoke the old refresh token
      await this.storage.revokeRefreshToken(refreshToken);

      // Store the new refresh token
      await this.storeRefreshToken(
        user.id, 
        tokens.refreshToken, 
        storedToken.ipAddress, 
        storedToken.userAgent
      );

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName || undefined,
          role: user.role
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, message: 'An error occurred refreshing the token' };
    }
  }

  // Logout a user
  async logout(refreshToken: string): Promise<boolean> {
    try {
      if (!refreshToken) return false;
      
      // Revoke the refresh token
      await this.storage.revokeRefreshToken(refreshToken);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  // Verify an access token
  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Generate access and refresh tokens
  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    // Create token payload
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    // Generate access token
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: this.accessTokenExpiry
    });

    // Generate refresh token (cryptographically secure random string)
    const refreshToken = crypto.randomBytes(40).toString('hex');

    return { accessToken, refreshToken };
  }

  // Store refresh token in the database
  private async storeRefreshToken(
    userId: number, 
    token: string, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<void> {
    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const refreshTokenData: InsertRefreshToken = {
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent
    };

    await this.storage.createRefreshToken(refreshTokenData);
  }
}