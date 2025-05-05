'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useI18n } from '../hooks/useI18n';

// Interface pour le contexte d'internationalisation
interface I18nContextType {
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: string;
  isLoading: boolean;
  changeLocale: (locale: string) => Promise<boolean>;
  getAvailableLocales: () => string[];
}

// Création du contexte avec une valeur par défaut
const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

/**
 * Provider pour l'internationalisation
 * Permet d'accéder aux traductions et fonctionnalités d'internationalisation dans toute l'application
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const i18nHook = useI18n();
  
  return (
    <I18nContext.Provider value={i18nHook}>
      {children}
    </I18nContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte d'internationalisation
 * @returns Fonctions et données pour l'internationalisation
 */
export const useI18nContext = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within a I18nProvider');
  }
  return context;
};

export default I18nContext;
