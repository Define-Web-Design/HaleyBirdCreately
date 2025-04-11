import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { IStorage } from '../storage';

export class AuthService {
  private storage: IStorage;
  private saltRounds = 10;
  private jwtSecret: string;

  constructor(storage: IStorage) {
    this.storage = storage;
    this.jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret';
  }

  /**
   * Register a new user
   * @param username The username
   * @param email The email address
   * @param password The password
   * @returns The created user (without password)
   */
  async registerUser(username: string, email: string, password: string) {
    // Hash the password
    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    // Create the user
    const user = await this.storage.createUser({
      username,
      email,
      passwordHash,
      displayName: username,
      role: 'user',
      isActive: true
    });

    // Return user without sensitive data
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Login a user
   * @param email The email address
   * @param password The password
   * @returns The user and a JWT token if authentication is successful
   */
  async loginUser(email: string, password: string) {
    try {
      // Find the user by email
      const user = await this.storage.findUserByEmail(email);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // Create a JWT token
      const token = this.generateToken(user);

      // Return user without sensitive data
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify a JWT token
   * @param token The JWT token
   * @returns The decoded token payload
   */
  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Generate a JWT token for a user
   * @param user The user
   * @returns The JWT token
   */
  private generateToken(user: any) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
  }
}