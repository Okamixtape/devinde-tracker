"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Types pour le thème
type Theme = 'light' | 'dark';

// Interface du contexte
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Constantes pour le stockage et les requêtes media
const STORAGE_KEY = 'devinde-theme';
const DARK_CLASS = 'dark';
const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

// Création du contexte avec une valeur par défaut
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

/**
 * Hook personnalisé pour utiliser le contexte de thème
 * @returns {ThemeContextType} Le contexte de thème
 */
export const useTheme = () => useContext(ThemeContext);

/**
 * Récupère le thème initial en fonction des préférences utilisateur
 * et des préférences système
 */
const getInitialTheme = (): Theme => {
  // Vérifie si le code s'exécute côté client
  if (typeof window === 'undefined') return 'light';
  
  // Vérifier si un thème est stocké dans localStorage
  const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
  
  if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
    return savedTheme;
  }
  
  // Utiliser les préférences système si aucun thème n'est stocké
  return window.matchMedia(PREFERS_DARK_QUERY).matches ? 'dark' : 'light';
};

/**
 * Applique le thème au document HTML
 */
const applyThemeToDocument = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle(DARK_CLASS, theme === 'dark');
};

/**
 * Composant provider qui va envelopper l'application
 * Gère l'état du thème et fournit des méthodes pour le modifier
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // État local pour le thème
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Fonction pour définir le thème
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyThemeToDocument(newTheme);
  }, []);

  // Fonction pour basculer entre les thèmes
  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, newTheme);
      applyThemeToDocument(newTheme);
      return newTheme;
    });
  }, []);

  // Effet pour initialiser le thème et écouter les changements de préférences système
  useEffect(() => {
    // Appliquer le thème initial au document
    applyThemeToDocument(theme);
    
    // Écouter les changements de préférences système
    const mediaQuery = window.matchMedia(PREFERS_DARK_QUERY);
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Seulement mettre à jour si l'utilisateur n'a pas défini de préférence explicite
      if (!localStorage.getItem(STORAGE_KEY)) {
        setThemeState(e.matches ? 'dark' : 'light');
        applyThemeToDocument(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
