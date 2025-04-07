import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { StorageInterface, User } from '../storage';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  success: boolean;
  message: string;
  user?: Omit<User, 'password'>;
  tokens?: AuthTokens;
}

export interface RegisterResult {
  success: boolean;
  message: string;
  userId?: string;
  tokens?: AuthTokens;
}

export class AuthService {
  private storage: StorageInterface;

  constructor(storage: StorageInterface) {
    this.storage = storage;
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string): Promise<RegisterResult> {
    try {
      // Validate inputs
      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      if (password.length < config.password.minLength) {
        return { 
          success: false, 
          message: `Password must be at least ${config.password.minLength} characters long` 
        };
      }

      // Check if user already exists
      const existingUser = await this.storage.getUserByEmail(email);
      if (existingUser) {
        return { success: false, message: 'User already exists with this email' };
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, config.password.saltRounds);
      const userId = await this.storage.createUser({
        email,
        password: hashedPassword,
        name: name || '',
        role: 'user'
      });

      // Generate tokens
      const tokens = this.generateTokens(userId, email);

      // Store refresh token
      await this.storage.storeRefreshToken(userId, tokens.refreshToken);

      return {
        success: true,
        message: 'User registered successfully',
        userId,
        tokens
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed due to an internal error' };
    }
  }

  /**
   * Login a user
   */
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      // Validate inputs
      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      // Get user by email
      const user = await this.storage.getUserByEmail(email);
      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Generate tokens
      const tokens = this.generateTokens(user.id, user.email, user.role);

      // Store refresh token
      await this.storage.storeRefreshToken(user.id, tokens.refreshToken);

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Login successful',
        user: userWithoutPassword,
        tokens
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed due to an internal error' };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ success: boolean; accessToken?: string; message: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as { id: string; email: string };

      // Check if refresh token exists in the database
      const storedToken = await this.storage.getRefreshToken(decoded.id, refreshToken);
      if (!storedToken) {
        return { success: false, message: 'Invalid refresh token' };
      }

      // Get user data
      const user = await this.storage.getUserById(decoded.id);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: `${config.jwt.accessExpiryMinutes}m` }
      );

      return {
        success: true,
        accessToken,
        message: 'Token refreshed successfully'
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, message: 'Invalid or expired refresh token' };
    }
  }

  /**
   * Logout user by invalidating refresh token
   */
  async logout(userId: string, refreshToken: string): Promise<boolean> {
    try {
      return await this.storage.removeRefreshToken(userId, refreshToken);
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  /**
   * Generate JWT tokens (access and refresh)
   */
  private generateTokens(userId: string, email: string, role?: string): AuthTokens {
    const accessToken = jwt.sign(
      { id: userId, email, role },
      config.jwt.secret,
      { expiresIn: `${config.jwt.accessExpiryMinutes}m` }
    );

    const refreshToken = jwt.sign(
      { id: userId, email },
      config.jwt.secret,
      { expiresIn: `${config.jwt.refreshExpiryDays}d` }
    );

    return {
      accessToken,
      refreshToken
    };
  }

  /**
   * Verify if a token is valid
   */
  verifyToken(token: string): { valid: boolean; payload?: any } {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return { valid: true, payload: decoded };
    } catch (error) {
      return { valid: false };
    }
  }
}