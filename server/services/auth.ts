import bcrypt from 'bcrypt';
import { User, InsertUser } from '@shared/schema';
import jwt from 'jsonwebtoken';
import { IStorage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export class AuthService {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  async login(username: string, password: string): Promise<{ user: User; token: string } | null> {
    const user = await this.storage.getUserByUsername(username);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    // Update last login
    // In a real implementation, you'd update the user record in database
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { 
      user: {
        ...user,
        // Exclude password from the returned user object
        password: undefined as any 
      }, 
      token 
    };
  }

  async register(userData: InsertUser): Promise<{ user: User; token: string } | null> {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      
      // Create the user with hashed password
      const newUser = await this.storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: newUser.id, username: newUser.username, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return { 
        user: {
          ...newUser,
          // Exclude password from the returned user object
          password: undefined as any 
        }, 
        token 
      };
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  }

  async verifyToken(token: string): Promise<{ id: number; username: string; role: string } | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

export default AuthService;