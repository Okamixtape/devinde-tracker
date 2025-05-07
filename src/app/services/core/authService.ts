/**
 * AuthService - Implementation of authentication operations
 */
import { AuthService } from '../interfaces/serviceInterfaces';
import { ServiceResult } from '../interfaces/dataModels';
import { generateUUID, getCurrentTimestamp } from '../utils/helpers';
import { generateToken, verifyToken } from "../utils/jwtHelper";
import { LocalStorageService } from './localStorageService';

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

// Define user preferences
export interface UserPreferences {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  language?: string;
  dashboardLayout?: string;
  [key: string]: string | boolean | undefined; // Type plus spécifique
}

// Key for storing users in localStorage
export const USERS_STORAGE_KEY = 'devinde-tracker-users';
// Key for storing current session
export const CURRENT_USER_KEY = 'devinde-tracker-current-user';
// Token expiration time (10 hours)
export const TOKEN_EXPIRATION_TIME = 10 * 60 * 60 * 1000;
// Refresh token threshold (1 hour before expiration)
export const TOKEN_REFRESH_THRESHOLD = 1 * 60 * 60 * 1000;
// Account lockout threshold
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
// Account lockout duration (15 minutes)
export const ACCOUNT_LOCKOUT_DURATION = 15 * 60 * 1000;

/**
 * AuthServiceImpl - Implementation of authentication using localStorage
 *
 * This implementation includes:
 * - JWT token-based authentication
 * - Role-based access control
 * - Account lockout protection
 * - Session timeout handling
 */
class AuthServiceImpl implements AuthService {
  private userStorage: LocalStorageService<User>;

  constructor() {
    this.userStorage = new LocalStorageService<User>(USERS_STORAGE_KEY);
  }

  /**
   * Register a new user
   * @param email User email
   * @param password User password
   * @param userData Additional user data
   * @returns ServiceResult with user data
   */
  async register(
    email: string,
    password: string,
    userData?: Record<string, unknown>
  ): Promise<ServiceResult<UserData>> {
    try {
      // Validate email and password
      if (!this.isValidEmail(email)) {
        return {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: 'L\'adresse email n\'est pas valide'
          }
        };
      }

      if (!this.isValidPassword(password)) {
        return {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Le mot de passe ne respecte pas les critères de sécurité'
          }
        };
      }

      // Check if user already exists
      const existingUsers = await this.userStorage.getItems();
      if (existingUsers.success && existingUsers.data) {
        const userExists = existingUsers.data.some(user => user.email.toLowerCase() === email.toLowerCase());
        if (userExists) {
          return {
            success: false,
            error: {
              code: 'USER_EXISTS',
              message: 'Cet utilisateur existe déjà'
            }
          };
        }
      }

      // Create new user
      const newUser: User = {
        id: generateUUID(),
        email,
        password, // In a real app, this would be hashed
        role: UserRole.USER, // Default role
        createdAt: new Date().toISOString(),
        ...userData && { name: userData.name as string }
      };

      // Save user
      const saveResult = await this.userStorage.createItem(newUser);
      
      if (saveResult.success) {
        // Return user data without password
        return {
          success: true,
          data: this.removePasswordFromUser(newUser)
        };
      } else {
        return {
          success: false,
          error: {
            code: 'REGISTRATION_FAILED',
            message: 'L\'enregistrement a échoué'
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Une erreur est survenue lors de l\'enregistrement',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Login a user with JWT token generation
   * @param email User email
   * @param password User password
   * @returns ServiceResult with user data
   */
  async login(email: string, password: string): Promise<ServiceResult<UserData>> {
    try {
      // Get all users
      const usersResult = await this.userStorage.getItems();
      
      if (!usersResult.success || !usersResult.data) {
        return {
          success: false,
          error: {
            code: 'FETCH_ERROR',
            message: 'Impossible de récupérer les données utilisateur'
          }
        };
      }

      // Find user by email
      const user = usersResult.data.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Utilisateur non trouvé'
          }
        };
      }

      // Check if account is locked
      if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
        const remainingTime = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
        return {
          success: false,
          error: {
            code: 'ACCOUNT_LOCKED',
            message: `Compte verrouillé. Réessayez dans ${remainingTime} minutes`
          }
        };
      }

      // Check password
      if (user.password !== password) { // In a real app, use proper password comparison
        // Increment failed login attempts
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

        // Lock account if max attempts reached
        if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
          user.lockedUntil = new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION).toISOString();
        }

        // Update user record
        await this.userStorage.updateItem(user.id, user);

        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Identifiants invalides'
          }
        };
      }

      // Reset failed login attempts
      user.failedLoginAttempts = 0;
      user.lockedUntil = undefined;
      user.lastLogin = new Date().toISOString();

      // Update user record
      await this.userStorage.updateItem(user.id, user);

      // Generate JWT token
      const now = getCurrentTimestamp();
      const expiresAt = now + TOKEN_EXPIRATION_TIME;
      const token = generateToken({ 
        sub: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(expiresAt / 1000) // JWT uses seconds, not milliseconds
      });

      // Store auth token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
          token,
          expiresAt
        }));
      }

      // Return user data without password
      return {
        success: true,
        data: this.removePasswordFromUser(user)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: 'Une erreur est survenue lors de la connexion',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Logout the current user
   * @returns ServiceResult indicating success
   */
  async logout(): Promise<ServiceResult<boolean>> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Une erreur est survenue lors de la déconnexion',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Get the current authenticated user
   * @returns ServiceResult with user data
   */
  async getCurrentUser(): Promise<ServiceResult<UserData>> {
    try {
      // Verify current session
      const session = this.verifySession();
      
      if (!session.valid) {
        if (session.expired) {
          // Clear expired session
          await this.logout();
        }
        
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: session.expired ? 'Session expirée' : 'Non authentifié'
          }
        };
      }

      // Get token from localStorage
      const authToken = this.getAuthToken();
      
      if (!authToken) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Aucun token d\'authentification'
          }
        };
      }

      // Decode token to get user ID
      const decodedToken = verifyToken(authToken);
      
      if (!decodedToken || typeof decodedToken === 'string') {
        return {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token invalide'
          }
        };
      }

      // Get user from storage
      const userResult = await this.userStorage.getItem(decodedToken.sub);
      
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Utilisateur non trouvé'
          }
        };
      }

      // Return user data without password
      return {
        success: true,
        data: this.removePasswordFromUser(userResult.data)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_USER_ERROR',
          message: 'Une erreur est survenue lors de la récupération de l\'utilisateur',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Check if a user is authenticated
   * @returns Boolean indicating if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = this.verifySession();
      
      // If session is valid, check token and user existence
      if (session.valid) {
        const userResult = await this.getCurrentUser();
        return userResult.success && !!userResult.data;
      }
      
      if (session.expired) {
        // Clear expired session
        await this.logout();
      }
      
      return false;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }

  /**
   * Check if current user has a specific role
   * @param requiredRole Role to check for
   * @returns Boolean indicating if user has the required role
   */
  async hasRole(requiredRole: UserRole): Promise<boolean> {
    try {
      // First check if user is authenticated
      const isAuth = await this.isAuthenticated();
      
      if (!isAuth) {
        return false;
      }

      // Get current user
      const userResult = await this.getCurrentUser();
      
      if (!userResult.success || !userResult.data) {
        return false;
      }

      return userResult.data.role === requiredRole;
    } catch (error) {
      console.error('Role check error:', error);
      return false;
    }
  }

  /**
   * Get the current JWT token
   * @returns Token string or null if not found
   */
  getAuthToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const authData = localStorage.getItem(CURRENT_USER_KEY);
    
    if (!authData) {
      return null;
    }

    try {
      const parsedAuthData = JSON.parse(authData) as AuthToken;
      return parsedAuthData.token;
    } catch (error) {
      console.error('Error parsing auth token:', error);
      return null;
    }
  }

  /**
   * Verify current session token
   * @returns Object indicating validity and expiration status
   */
  verifySession(): { valid: boolean; expired?: boolean } {
    try {
      if (typeof window === 'undefined') {
        return { valid: false };
      }

      const authData = localStorage.getItem(CURRENT_USER_KEY);
      
      if (!authData) {
        return { valid: false };
      }

      // Parse token data
      const parsedAuthData = JSON.parse(authData) as AuthToken;
      
      if (!parsedAuthData || !parsedAuthData.token) {
        return { valid: false };
      }

      // Check token expiration
      if (parsedAuthData.expiresAt < getCurrentTimestamp()) {
        return { valid: false, expired: true };
      }

      // Verify token signature and content
      const decodedToken = verifyToken(parsedAuthData.token);
      
      if (!decodedToken || typeof decodedToken === 'string') {
        return { valid: false };
      }

      return { valid: true };
    } catch (error) {
      console.error('Session verification error:', error);
      return { valid: false };
    }
  }

  /**
   * Refresh token if it's close to expiring
   * @returns Boolean indicating if token was refreshed
   */
  async refreshTokenIfNeeded(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      const authData = localStorage.getItem(CURRENT_USER_KEY);
      
      if (!authData) {
        return false;
      }

      // Parse token data
      const parsedAuthData = JSON.parse(authData) as AuthToken;
      
      if (!parsedAuthData.token) {
        return false;
      }

      // Check if token needs refreshing (if it expires within the threshold)
      const remainingTime = parsedAuthData.expiresAt - getCurrentTimestamp();
      
      if (remainingTime > TOKEN_REFRESH_THRESHOLD) {
        return false; // No refresh needed
      }

      // Verify token is still valid
      const decodedToken = verifyToken(parsedAuthData.token);
      
      if (!decodedToken || typeof decodedToken === 'string') {
        return false;
      }

      // Get user from storage to ensure they still exist
      const userResult = await this.userStorage.getItem(decodedToken.sub);
      
      if (!userResult.success || !userResult.data) {
        return false;
      }

      // Generate new token
      const now = getCurrentTimestamp();
      const expiresAt = now + TOKEN_EXPIRATION_TIME;
      const newToken = generateToken({
        sub: decodedToken.sub,
        email: decodedToken.email,
        role: decodedToken.role,
        exp: Math.floor(expiresAt / 1000) // JWT uses seconds, not milliseconds
      });

      // Store new token
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        token: newToken,
        expiresAt
      }));

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Simple email validation
   * @param email Email to validate
   * @returns Boolean indicating if email is valid
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Password validation with stronger requirements
   * @param password Password to validate
   * @returns Boolean indicating if password is valid
   */
  isValidPassword(password: string): boolean {
    // Require at least 8 characters, one letter, one number
    return password.length >= 8 && 
           /[A-Za-z]/.test(password) && 
           /[0-9]/.test(password);
  }

  /**
   * Helper method to remove password from user object
   * @param user User with password
   * @returns User data without password
   */
  removePasswordFromUser(user: User): UserData {
    const { password, failedLoginAttempts, lockedUntil, ...userData } = user;
    return userData;
  }

  /**
   * Update user profile information
   * @param userData Partial user data to update
   * @returns ServiceResult with updated user data
   */
  async updateUserProfile(userData: Partial<UserData>): Promise<ServiceResult<UserData>> {
    try {
      // Check if user is authenticated
      const authResult = await this.getCurrentUser();
      
      if (!authResult.success || !authResult.data) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Vous devez être connecté pour effectuer cette action'
          }
        };
      }

      const currentUser = authResult.data;

      // Get user from storage to update
      const userResult = await this.userStorage.getItem(currentUser.id);
      
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Utilisateur non trouvé'
          }
        };
      }

      const fullUser = userResult.data;

      // Update allowed fields
      const updatedUser: User = {
        ...fullUser,
        name: userData.name !== undefined ? userData.name : fullUser.name
      };

      // Save updated user
      const updateResult = await this.userStorage.updateItem(fullUser.id, updatedUser);
      
      if (!updateResult.success) {
        return {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'La mise à jour a échoué'
          }
        };
      }

      // Return updated user data
      return {
        success: true,
        data: this.removePasswordFromUser(updatedUser)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Une erreur est survenue lors de la mise à jour du profil',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Change user password
   * @param currentPassword Current password for verification
   * @param newPassword New password to set
   * @returns ServiceResult indicating success
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ServiceResult<boolean>> {
    try {
      // Check if user is authenticated
      const authResult = await this.getCurrentUser();
      
      if (!authResult.success || !authResult.data) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Vous devez être connecté pour effectuer cette action'
          }
        };
      }

      const currentUser = authResult.data;

      // Get user from storage with password
      const userResult = await this.userStorage.getItem(currentUser.id);
      
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Utilisateur non trouvé'
          }
        };
      }

      const fullUser = userResult.data;

      // Verify current password
      if (fullUser.password !== currentPassword) {
        return {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Mot de passe actuel incorrect'
          }
        };
      }

      // Validate new password
      if (!this.isValidPassword(newPassword)) {
        return {
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: 'Le nouveau mot de passe ne respecte pas les critères de sécurité'
          }
        };
      }

      // Update password
      fullUser.password = newPassword;

      // Save updated user
      const updateResult = await this.userStorage.updateItem(fullUser.id, fullUser);
      
      if (!updateResult.success) {
        return {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'La mise à jour du mot de passe a échoué'
          }
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PASSWORD_CHANGE_ERROR',
          message: 'Une erreur est survenue lors du changement de mot de passe',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Update user preferences
   * @param preferences User preferences to update
   * @returns ServiceResult with updated preferences
   */
  async updateUserPreferences(preferences: UserPreferences): Promise<ServiceResult<UserPreferences>> {
    try {
      // Check if user is authenticated
      const authResult = await this.getCurrentUser();
      
      if (!authResult.success || !authResult.data) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Vous devez être connecté pour effectuer cette action'
          }
        };
      }

      const currentUser = authResult.data;

      // Store preferences in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`devinde-tracker-preferences-${currentUser.id}`, JSON.stringify(preferences));
      }

      return {
        success: true,
        data: preferences
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PREFERENCES_ERROR',
          message: 'Une erreur est survenue lors de la mise à jour des préférences',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Get user preferences
   * @returns ServiceResult with user preferences
   */
  async getUserPreferences(): Promise<ServiceResult<UserPreferences>> {
    try {
      // Check if user is authenticated
      const authResult = await this.getCurrentUser();
      
      if (!authResult.success || !authResult.data) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Vous devez être connecté pour effectuer cette action'
          }
        };
      }

      const currentUser = authResult.data;

      // Get preferences from localStorage
      if (typeof window !== 'undefined') {
        const preferencesData = localStorage.getItem(`devinde-tracker-preferences-${currentUser.id}`);
        
        if (preferencesData) {
          return {
            success: true,
            data: JSON.parse(preferencesData) as UserPreferences
          };
        }
      }

      // Return default preferences if none found
      return {
        success: true,
        data: {
          theme: 'light',
          notifications: true,
          language: 'fr'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PREFERENCES_ERROR',
          message: 'Une erreur est survenue lors de la récupération des préférences',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Get token
   * @returns JWT token string or null
   */
  async getToken(): Promise<string | null> {
    return this.getAuthToken();
  }
}

// Export singleton instance
export const authService = new AuthServiceImpl();

export default authService;
