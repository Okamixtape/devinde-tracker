'use client';

import { useState, useEffect, useCallback } from 'react';
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

// Création d'un événement personnalisé pour la synchronisation entre les composants
const LOCALE_CHANGE_EVENT = 'localeChange';

// Types pour l'internationalisation
interface TranslationNestedValue {
  [key: string]: string | TranslationNestedValue;
}

type TranslationObject = {
  [key: string]: string | TranslationNestedValue;
};

/**
 * Hook personnalisé pour utiliser l'internationalisation dans les composants
 * Version améliorée qui propage le changement de langue instantanément
 */
export const useI18n = () => {
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

    // Écouter les changements de langue provenant d'autres instances du hook
    const handleLocaleChange = (e: CustomEvent) => {
      if (e.detail && e.detail.locale && e.detail.locale !== locale) {
        setLocale(e.detail.locale);
      }
    };

    // Ajouter l'écouteur d'événements
    window.addEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange as EventListener);

    // Nettoyer l'écouteur d'événements lors du démontage
    return () => {
      window.removeEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange as EventListener);
    };
  }, [locale]);

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
   * @param key - La clé de traduction
   * @param params - Paramètres optionnels pour la substitution
   * @returns La chaîne traduite
   */
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
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
    },
    [locale]
  );

  /**
   * Changer la langue active
   * @param newLocale - Le code de la nouvelle langue
   * @returns true si le changement a réussi, false sinon
   */
  const changeLocale = useCallback(
    async (newLocale: string): Promise<boolean> => {
      if (!SUPPORTED_LOCALES.includes(newLocale)) {
        return false;
      }
      
      setIsLoading(true);
      try {
        // Mettre à jour la langue active
        setLocale(newLocale);
        
        // Sauvegarder la préférence dans localStorage
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
        
        // Émettre un événement pour synchroniser tous les composants
        window.dispatchEvent(
          new CustomEvent(LOCALE_CHANGE_EVENT, {
            detail: { locale: newLocale }
          })
        );
        
        return true;
      } catch (error) {
        console.error('Error changing locale:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Récupérer les langues disponibles
   * @returns Un tableau des codes de langues disponibles
   */
  const getAvailableLocales = useCallback((): string[] => {
    return SUPPORTED_LOCALES;
  }, []);

  return {
    t,
    locale,
    changeLocale,
    getAvailableLocales,
    isLoading
  };
};

export default useI18n;
