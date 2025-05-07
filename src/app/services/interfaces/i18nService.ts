import { ServiceResult } from "./dataModels";

export interface I18nService {
  /**
   * Récupère une traduction par sa clé
   * @param key - La clé de traduction
   * @param params - Paramètres optionnels pour la substitution dans la traduction
   * @returns La chaîne traduite
   */
  translate(key: string, params?: Record<string, string | number>): string;

  /**
   * Change la langue active
   * @param locale - Le code de la nouvelle langue
   * @returns Un ServiceResult indiquant le succès ou l'échec
   */
  changeLocale(locale: string): Promise<ServiceResult<void>>;

  /**
   * Récupère la langue active
   * @returns Le code de la langue active
   */
  getActiveLocale(): string;

  /**
   * Récupère toutes les langues disponibles
   * @returns Un tableau des codes de langues disponibles
   */
  getAvailableLocales(): string[];

  /**
   * Vérifie si une langue est supportée
   * @param locale - Le code de la langue à vérifier
   * @returns true si la langue est supportée, false sinon
   */
  isLocaleSupported(locale: string): boolean;
}
