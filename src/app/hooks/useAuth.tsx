'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { 
  AuthServiceImpl, 
  UserData, 
  UserRole 
} from '../services/core/auth-service';

// Define the shape of our Authentication Context
interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
}

// Create Authentication Context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  hasRole: () => false
});

// Props for our Authentication Provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Authentication Provider Component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create a single instance of the auth service
  const authService = useMemo(() => new AuthServiceImpl(), []);
  
  // Check if the user is already logged in when the component mounts
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const result = await authService.getCurrentUser();
        if (result.success && result.data) {
          setUser(result.data);
        }
      } catch (err) {
        console.error('Failed to check auth status:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
    
    // Set up interval to refresh tokens if needed
    const tokenRefreshInterval = setInterval(async () => {
      if (await authService.isAuthenticated()) {
        await authService.refreshTokenIfNeeded();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => {
      clearInterval(tokenRefreshInterval);
    };
  }, [authService]);
  
  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(email, password);
      
      if (result.success && result.data) {
        setUser(result.data);
        return true;
      } else {
        setError(result.error?.message || 'Failed to login');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Login error: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = name ? { name } : undefined;
      const result = await authService.register(email, password, userData);
      
      if (result.success && result.data) {
        // Auto login after successful registration
        return login(email, password);
      } else {
        setError(result.error?.message || 'Failed to register');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Registration error: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Logout error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if user has specific role
  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    
    // Admin has access to everything
    if (user.role === UserRole.ADMIN) return true;
    
    // Otherwise, check if user has the specific role
    return user.role === role;
  };
  
  // Context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    hasRole
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Re-export UserRole from auth service for convenience
export { UserRole } from '../services/core/auth-service';
