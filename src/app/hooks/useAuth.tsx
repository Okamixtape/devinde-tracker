'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, UserData, UserRole } from '../services/core/authService';

// Configuration: mettre à true pour désactiver l'authentification pendant le développement
const DEV_MODE_BYPASS_AUTH = true;

// Interface définissant le contexte d'authentification
interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => Promise<boolean>;
  saveRedirectPath: (path: string) => void;
}

// Clé pour stocker le chemin de redirection
const REDIRECT_PATH_KEY = 'auth_redirect_path';

// Création du contexte avec des valeurs par défaut
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  hasRole: async () => false,
  saveRedirectPath: () => {},
});

// Fonction utilitaire pour enregistrer le chemin de redirection
const saveRedirectPath = (path: string) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(REDIRECT_PATH_KEY, path);
  }
};

/**
 * AuthProvider - Fournit le contexte d'authentification à l'application
 * REFACTORISÉ pour résoudre les problèmes de boucle de redirection
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Service d'authentification (instance singleton importée)
  
  // États pour suivre l'authentification
  const [user, setUser] = useState<UserData | null>(
    DEV_MODE_BYPASS_AUTH 
      ? { id: 'dev-user', email: 'dev@example.com', name: 'Dev User', role: UserRole.ADMIN, createdAt: new Date().toISOString() }
      : null
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(DEV_MODE_BYPASS_AUTH);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Effet pour vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      if (DEV_MODE_BYPASS_AUTH) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const isAuth = await authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          const result = await authService.getCurrentUser();
          if (result.success && result.data) {
            setUser(result.data);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'authentification:', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [authService]);
  
  // Authentifier un utilisateur
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (DEV_MODE_BYPASS_AUTH) {
      return true;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(email, password);
      
      if (result.success && result.data) {
        setUser(result.data);
        setIsAuthenticated(true);
        // Pas de redirection ici - la redirection est gérée par la page de connexion
        return true;
      } else {
        setError(result.error?.message || 'Échec de la connexion');
        return false;
      }
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
      setError('Une erreur s\'est produite lors de la connexion');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);
  
  // Enregistrer un nouvel utilisateur
  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    if (DEV_MODE_BYPASS_AUTH) {
      return true;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.register(email, password, { name });
      
      if (result.success && result.data) {
        setUser(result.data);
        setIsAuthenticated(true);
        // Pas de redirection ici - la redirection est gérée par la page d'inscription
        return true;
      } else {
        setError(result.error?.message || 'Échec de l\'inscription');
        return false;
      }
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      setError('Une erreur s\'est produite lors de l\'inscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);
  
  // Déconnecter l'utilisateur
  const logout = useCallback(async (): Promise<void> => {
    if (DEV_MODE_BYPASS_AUTH) {
      // En mode dev, simuler un délai court puis ne rien faire
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      // Redirection simple et directe - pas de logique complexe
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authService]);
  
  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = useCallback(async (role: UserRole): Promise<boolean> => {
    if (DEV_MODE_BYPASS_AUTH) {
      return true; // En mode développement, autoriser tous les rôles
    }
    
    if (!user) return false;
    return await authService.hasRole(role);
  }, [authService, user]);
  
  // Préparation du contexte
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    hasRole,
    saveRedirectPath
  };
  
  // Rendu du fournisseur de contexte avec tous les enfants
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);
