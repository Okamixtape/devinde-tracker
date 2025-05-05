import { I18nService } from '../interfaces/i18n-service';
import { ServiceResult } from '../interfaces/data-models';
import { StorageService } from '../interfaces/service-interfaces';
// Import des fichiers de traduction directement
import frTranslations from '../../i18n/locales/fr.json';
import enTranslations from '../../i18n/locales/en.json';

// Constants pour l'internationalisation
export const DEFAULT_LOCALE = 'fr';
export const SUPPORTED_LOCALES = ['fr', 'en'];
export const LOCALE_STORAGE_KEY = 'devinde_locale';

// Préchargement des traductions
const translations = {
  fr: frTranslations,
  en: enTranslations
};

// Type pour les traductions
type TranslationObject = Record<string, unknown>;

/**
 * Interface pour les objets de stockage de chaînes de caractères
 */
interface StringStorageItem {
  id: string;
  value: string;
}

/**
 * Implémentation du service d'internationalisation basée sur next-intl
 */
export class I18nServiceImpl implements I18nService {
  private locale: string;
  private translations: Record<string, TranslationObject> = translations;
  private storageService: StorageService<string>;

  constructor(storageService: StorageService<string>) {
    this.storageService = storageService;
    // Récupère la langue depuis le stockage local ou utilise la langue par défaut
    const savedLocale = DEFAULT_LOCALE;
    
    // Tentative de récupération de la langue sauvegardée
    this.storageService.getItem(LOCALE_STORAGE_KEY)
      .then(result => {
        if (result.success && result.data) {
          const locale = result.data;
          if (this.isLocaleSupported(locale)) {
            this.locale = locale;
          }
        }
      })
      .catch(err => console.error("Failed to get saved locale", err));
    
    this.locale = savedLocale;
  }

  /**
   * Charge les traductions pour une langue donnée
   * @param locale - Code de la langue
   */
  async loadTranslationsForLocale(locale: string): Promise<void> {
    // Les traductions sont désormais préchargées dans le constructeur
    // Cette méthode est conservée pour la compatibilité avec l'interface
    if (!this.translations[locale] && locale !== DEFAULT_LOCALE && this.translations[DEFAULT_LOCALE]) {
      // Fallback aux traductions par défaut si la langue demandée n'existe pas
      this.translations[locale] = this.translations[DEFAULT_LOCALE];
    }
  }

  /**
   * Récupère une valeur imbriquée à partir d'un objet en utilisant une notation à points
   * @param obj - L'objet contenant les données
   * @param path - Le chemin en notation à points (e.g., 'common.buttons.save')
   * @returns La valeur récupérée ou undefined si non trouvée
   */
  private getNestedValue(obj: TranslationObject, path: string): string | undefined {
    const value = path.split('.').reduce((prev: TranslationObject | undefined, curr: string) => {
      return prev && typeof prev === 'object' ? prev[curr] as TranslationObject | undefined : undefined;
    }, obj);
    
    return typeof value === 'string' ? value : undefined;
  }

  /**
   * Substitue les paramètres dans une chaîne de texte
   * @param text - La chaîne contenant les placeholders
   * @param params - Les paramètres à substituer
   * @returns La chaîne avec les paramètres substitués
   */
  private substituteParams(text: string, params?: Record<string, string | number>): string {
    if (!params) return text;
    
    return Object.entries(params).reduce((result, [key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      return result.replace(regex, String(value));
    }, text);
  }

  /**
   * Traduit une clé en utilisant la langue active
   * @param key - La clé de traduction (peut être imbriquée avec la notation à points)
   * @param params - Paramètres optionnels pour la substitution
   * @returns La chaîne traduite
   */
  translate(key: string, params?: Record<string, string | number>): string {
    if (!this.translations[this.locale]) {
      console.warn(`No translations available for ${this.locale} or default locale`);
      return key;
    }
    
    const translation = this.getNestedValue(this.translations[this.locale], key);
    
    if (translation === undefined) {
      // Si la traduction n'est pas trouvée, essayer avec la langue par défaut
      if (this.locale !== DEFAULT_LOCALE && this.translations[DEFAULT_LOCALE]) {
        const defaultTranslation = this.getNestedValue(this.translations[DEFAULT_LOCALE], key);
        if (defaultTranslation !== undefined) {
          return this.substituteParams(defaultTranslation, params);
        }
      }
      
      return key; // Retourne la clé si aucune traduction n'est trouvée
    }
    
    return this.substituteParams(translation, params);
  }

  /**
   * Change la langue active
   * @param locale - Code de la nouvelle langue
   * @returns Un ServiceResult indiquant le succès ou l'échec
   */
  async changeLocale(locale: string): Promise<ServiceResult<void>> {
    if (!this.isLocaleSupported(locale)) {
      return {
        success: false,
        error: {
          code: 'UNSUPPORTED_LOCALE',
          message: `Locale ${locale} is not supported`
        }
      };
    }
    
    try {
      // Charger les traductions pour la nouvelle langue si nécessaire
      await this.loadTranslationsForLocale(locale);
      
      // Mettre à jour la langue active
      this.locale = locale;
      
      // Sauvegarder la préférence dans le stockage local
      try {
        const existingResult = await this.storageService.getItem(LOCALE_STORAGE_KEY);
        if (existingResult.success && existingResult.data) {
          await this.storageService.updateItem(LOCALE_STORAGE_KEY, locale);
        } else {
          // Créer l'item avec un objet conforme à l'interface attendue
          await this.storageService.createItem({ id: LOCALE_STORAGE_KEY, value: locale } as StringStorageItem);
        }
      } catch (storageError) {
        console.error("Failed to save locale preference", storageError);
        // On ne fait pas échouer l'opération si seulement la sauvegarde échoue
      }
      
      return { success: true };
    } catch (_error) {
      // On capture l'erreur mais on ne l'utilise pas directement dans la réponse
      return {
        success: false,
        error: {
          code: 'CHANGE_LOCALE_FAILED',
          message: `Failed to change locale to ${locale}`
        }
      };
    }
  }

  /**
   * Récupère la langue active
   * @returns Le code de la langue active
   */
  getActiveLocale(): string {
    return this.locale;
  }

  /**
   * Récupère toutes les langues disponibles
   * @returns Un tableau des codes de langues disponibles
   */
  getAvailableLocales(): string[] {
    return SUPPORTED_LOCALES;
  }

  /**
   * Vérifie si une langue est supportée
   * @param locale - Le code de la langue à vérifier
   * @returns true si la langue est supportée, false sinon
   */
  isLocaleSupported(locale: string): boolean {
    return SUPPORTED_LOCALES.includes(locale);
  }
}
