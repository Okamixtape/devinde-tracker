'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import frTranslations from '../i18n/locales/fr.json';
import enTranslations from '../i18n/locales/en.json';

// Constantes pour l'internationalisation
export const DEFAULT_LOCALE = 'fr';
export const SUPPORTED_LOCALES = ['fr', 'en'];
export const LOCALE_STORAGE_KEY = 'devinde_locale';

// Préchargement des traductions
const translations = {
  fr: frTranslations,
  en: enTranslations
};

// Types pour l'internationalisation
interface TranslationNestedValue {
  [key: string]: string | TranslationNestedValue;
}

interface TranslationObject {
  [key: string]: string | TranslationNestedValue;
}

interface I18nContextType {
  locale: string;
  translations: Record<string, TranslationObject>;
  t: (key: string, params?: Record<string, string | number>) => string;
  changeLocale: (newLocale: string) => Promise<boolean>;
  getAvailableLocales: () => string[];
  isLoading: boolean;
}

// Création du contexte d'internationalisation
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Props pour le provider
interface I18nProviderProps {
  children: ReactNode;
}

/**
 * Provider pour le contexte d'internationalisation
 * Gère l'état de la langue et les fonctions de traduction
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<string>(DEFAULT_LOCALE);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialisation : charger la langue active depuis localStorage
  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
        setLocale(savedLocale);
      }
    } catch (error) {
      console.error('Error loading locale from localStorage:', error);
    }
  }, []);

  /**
   * Récupère une valeur imbriquée à partir d'un objet en utilisant une notation à points
   */
  const getNestedValue = (obj: TranslationObject, path: string): string | undefined => {
    const value = path.split('.').reduce((prev: TranslationObject | TranslationNestedValue | undefined, curr: string) => {
      return prev && typeof prev === 'object' ? prev[curr] as TranslationObject | TranslationNestedValue | undefined : undefined;
    }, obj);
    
    return typeof value === 'string' ? value : undefined;
  };

  /**
   * Remplace les placeholders par leurs valeurs
   */
  const substituteParams = (text: string, params?: Record<string, string | number>): string => {
    if (!params) return text;
    
    return Object.entries(params).reduce((result, [key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      return result.replace(regex, String(value));
    }, text);
  };

  /**
   * Traduire une clé en utilisant la langue active
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translationsForLocale = translations[locale as keyof typeof translations];
    
    if (!translationsForLocale) {
      return key; // Retourne la clé si les traductions ne sont pas chargées
    }
    
    const translation = getNestedValue(translationsForLocale, key);
    
    if (translation === undefined) {
      // Si la traduction n'est pas trouvée, essayer avec la langue par défaut
      if (locale !== DEFAULT_LOCALE) {
        const defaultTranslation = getNestedValue(translations[DEFAULT_LOCALE], key);
        if (defaultTranslation !== undefined) {
          return substituteParams(defaultTranslation, params);
        }
      }
      
      return key; // Retourne la clé si aucune traduction n'est trouvée
    }
    
    return substituteParams(translation, params);
  };

  /**
   * Changer la langue active
   */
  const changeLocale = async (newLocale: string): Promise<boolean> => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) {
      return false;
    }
    
    setIsLoading(true);
    try {
      // Mettre à jour la langue active
      setLocale(newLocale);
      
      // Sauvegarder la préférence dans localStorage
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      
      return true;
    } catch (error) {
      console.error('Error changing locale:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Récupérer les langues disponibles
   */
  const getAvailableLocales = (): string[] => {
    return SUPPORTED_LOCALES;
  };

  // Valeur du contexte
  const contextValue: I18nContextType = {
    locale,
    translations,
    t,
    changeLocale,
    getAvailableLocales,
    isLoading
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

/**
 * Hook personnalisé pour utiliser le contexte d'internationalisation
 */
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
