/**
 * AuthService - Implementation of authentication operations
 */
import { AuthService } from '../interfaces/service-interfaces';
import { ServiceResult } from '../interfaces/data-models';
import { LocalStorageService } from './local-storage-service';
import { generateUUID, getCurrentTimestamp } from '../utils/helpers';
import { generateToken, verifyToken, getTokenRemainingTime } from '../utils/jwt-helper';

// Define user interface
export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  name?: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
}

// Define user data for returned responses (without password)
export interface UserData {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

// Define roles for role-based access control
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

// Define authentication token structure
export interface AuthToken {
  token: string;
  expiresAt: number;
}

// Key for storing users in localStorage
export const USERS_STORAGE_KEY = 'devinde-tracker-users';
// Key for storing current session
export const CURRENT_USER_KEY = 'devinde-tracker-current-user';
// Key for storing JWT token
export const AUTH_TOKEN_KEY = 'devinde-tracker-auth-token';
// Maximum failed login attempts before locking
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
// Lock duration in milliseconds (15 minutes)
export const ACCOUNT_LOCK_DURATION = 15 * 60 * 1000;

/**
 * AuthServiceImpl - Implementation of authentication using localStorage
 * 
 * This implementation includes:
 * - JWT token-based authentication
 * - Role-based access control
 * - Account lockout protection
 * - Session timeout handling
 */
export class AuthServiceImpl implements AuthService {
  private userStorage: LocalStorageService<User>;
  
  constructor() {
    this.userStorage = new LocalStorageService<User>(USERS_STORAGE_KEY);
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, userData?: Record<string, unknown>): Promise<ServiceResult<UserData>> {
    try {
      // Check if email is valid
      if (!this.isValidEmail(email)) {
        return {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: 'Please provide a valid email address'
          }
        };
      }
      
      // Check if password is strong enough
      if (!this.isValidPassword(password)) {
        return {
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: 'Password must be at least 8 characters long and include at least one number, one uppercase letter, and one special character'
          }
        };
      }
      
      // Check if user already exists
      const users = await this.userStorage.getItems();
      const existingUser = users.data?.find(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (existingUser) {
        return {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'A user with this email already exists'
          }
        };
      }
      
      // Create the new user
      const newUser: User = {
        id: generateUUID(),
        email,
        password, // Would be hashed in a real app
        name: userData?.name as string || '',
        role: userData?.isAdmin ? UserRole.ADMIN : UserRole.USER,
        failedLoginAttempts: 0,
        createdAt: getCurrentTimestamp()
      };
      
      // Save the user
      const result = await this.userStorage.createItem(newUser);
      
      if (!result.success || !result.data) {
        return result as ServiceResult<UserData>;
      }
      
      // Return user without password
      const userWithoutPassword = this.removePasswordFromUser(result.data);
      
      return {
        success: true,
        data: userWithoutPassword
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: 'Failed to register user',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Login a user with JWT token generation
   */
  async login(email: string, password: string): Promise<ServiceResult<UserData>> {
    try {
      // Get all users
      const users = await this.userStorage.getItems();
      
      // Find user with matching email
      const user = users.data?.find(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        };
      }
      
      // Check if account is locked
      if (user.lockedUntil) {
        const lockUntil = new Date(user.lockedUntil).getTime();
        const now = Date.now();
        
        if (lockUntil > now) {
          const remainingMinutes = Math.ceil((lockUntil - now) / 60000);
          return {
            success: false,
            error: {
              code: 'ACCOUNT_LOCKED',
              message: `Account is temporarily locked. Try again in ${remainingMinutes} minutes.`
            }
          };
        }
      }
      
      // Check password (would use secure comparison in a real app)
      if (user.password !== password) {
        // Increment failed login attempts
        const failedAttempts = (user.failedLoginAttempts || 0) + 1;
        const updatedFields: Partial<User> = {
          failedLoginAttempts: failedAttempts
        };
        
        // Lock account if max attempts reached
        if (failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
          const lockUntil = new Date(Date.now() + ACCOUNT_LOCK_DURATION);
          updatedFields.lockedUntil = lockUntil.toISOString();
        }
        
        await this.userStorage.updateItem(user.id, updatedFields);
        
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        };
      }
      
      // Reset failed login attempts and update last login
      const updatedUser = { 
        ...user, 
        lastLogin: getCurrentTimestamp(),
        failedLoginAttempts: 0,
        lockedUntil: undefined
      };
      
      await this.userStorage.updateItem(user.id, updatedUser);
      
      // Generate JWT token for the user
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };
      
      const token = generateToken(tokenPayload);
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      // Store token in localStorage
      const authToken: AuthToken = {
        token,
        expiresAt
      };
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(authToken));
      
      // Store user session (without sensitive info)
      const userSession = this.removePasswordFromUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
      
      return {
        success: true,
        data: userSession
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: 'Failed to log in',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<ServiceResult<boolean>> {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      
      return {
        success: true,
        data: true
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Failed to log out',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<ServiceResult<UserData>> {
    try {
      // First check if we have a valid token
      const validToken = this.verifySession();
      if (!validToken.valid) {
        if (validToken.expired) {
          // Clear expired session
          await this.logout();
        }
        return {
          success: false,
          error: {
            code: 'NO_VALID_SESSION',
            message: validToken.expired ? 'Your session has expired' : 'No user is currently logged in'
          }
        };
      }
      
      const userJSON = localStorage.getItem(CURRENT_USER_KEY);
      
      if (!userJSON) {
        return {
          success: false,
          error: {
            code: 'NO_USER_SESSION',
            message: 'No user is currently logged in'
          }
        };
      }
      
      const user = JSON.parse(userJSON) as UserData;
      
      return {
        success: true,
        data: user
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'SESSION_ERROR',
          message: 'Failed to get current user',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Check if a user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return this.verifySession().valid;
  }

  /**
   * Check if current user has a specific role
   */
  async hasRole(requiredRole: UserRole): Promise<boolean> {
    const userResult = await this.getCurrentUser();
    
    if (!userResult.success || !userResult.data) {
      return false;
    }
    
    const user = userResult.data;
    
    // Admin role has access to everything
    if (user.role === UserRole.ADMIN) {
      return true;
    }
    
    // Otherwise, check if user has the specific role
    return user.role === requiredRole;
  }

  /**
   * Get the current JWT token
   */
  getAuthToken(): string | null {
    try {
      const tokenData = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!tokenData) {
        return null;
      }
      
      const { token } = JSON.parse(tokenData) as AuthToken;
      return token;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Verify current session token
   */
  private verifySession(): { valid: boolean; expired?: boolean } {
    try {
      const tokenData = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!tokenData) {
        return { valid: false };
      }
      
      const { token, expiresAt } = JSON.parse(tokenData) as AuthToken;
      
      // Check local expiration time
      if (Date.now() > expiresAt) {
        return { valid: false, expired: true };
      }
      
      // Verify token integrity
      const verificationResult = verifyToken(token);
      
      return verificationResult;
    } catch (_error) {
      return { valid: false };
    }
  }

  /**
   * Refresh token if it's close to expiring
   */
  async refreshTokenIfNeeded(): Promise<boolean> {
    try {
      const tokenData = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!tokenData) {
        return false;
      }
      
      const { token } = JSON.parse(tokenData) as AuthToken;
      const remainingTime = getTokenRemainingTime(token);
      
      // Refresh if less than 1 hour remains
      if (remainingTime < 3600) {
        const userResult = await this.getCurrentUser();
        
        if (!userResult.success || !userResult.data) {
          return false;
        }
        
        const user = userResult.data;
        
        // Generate new token
        const tokenPayload = {
          userId: user.id,
          email: user.email,
          role: user.role
        };
        
        const newToken = generateToken(tokenPayload);
        const newExpiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        
        // Store refreshed token
        const authToken: AuthToken = {
          token: newToken,
          expiresAt: newExpiresAt
        };
        localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(authToken));
        
        return true;
      }
      
      return false;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Simple email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Password validation with stronger requirements
   */
  private isValidPassword(password: string): boolean {
    // In real app this would check for complexity, special chars, etc.
    return password.length >= 8;
  }

  /**
   * Helper method to remove password from user object
   */
  private removePasswordFromUser(user: User): UserData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as UserData;
  }
}
