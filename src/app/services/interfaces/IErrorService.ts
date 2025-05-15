import { AppError, ErrorCategory, ErrorCodes, ErrorResponse } from "../utils/errorHandling";
import { ServiceResult } from "./dataModels";

/**
 * Type pour les gestionnaires d'erreurs personnalisés
 */
export type ErrorHandler = (error: unknown, context?: Record<string, unknown>) => void;

/**
 * Configuration du service d'erreur
 */
export interface ErrorServiceConfig {
  /** Inclure les informations de debug dans les réponses d'erreur */
  includeDebugInfo?: boolean;
  /** Journaliser les erreurs dans la console */
  logErrorsToConsole?: boolean;
  /** Envoyer les erreurs au serveur pour journalisation */
  logErrorsToServer?: boolean;
  /** Gestionnaires d'erreurs personnalisés */
  errorHandlers?: ErrorHandler[];
  /** Message d'erreur par défaut */
  defaultErrorMessage?: string;
  /** Taille maximale de l'historique des erreurs */
  maxErrorHistorySize?: number;
}

/**
 * Options pour la gestion d'une erreur spécifique
 */
export interface ErrorHandlingOptions {
  /** Contexte supplémentaire pour l'erreur */
  context?: Record<string, unknown>;
  /** Inclure les informations de debug */
  includeDebugInfo?: boolean;
  /** Journaliser l'erreur */
  logError?: boolean;
  /** Notifier les gestionnaires d'erreur enregistrés */
  notifyHandlers?: boolean;
}

/**
 * Options pour la méthode tryOperation
 */
export interface TryOperationOptions {
  /** Message d'erreur personnalisé */
  errorMessage?: string;
  /** Contexte supplémentaire pour l'erreur */
  context?: Record<string, unknown>;
}

/**
 * Enregistrement d'une erreur pour l'historique
 */
export interface ErrorRecord {
  /** ID unique de l'erreur */
  id: string;
  /** Horodatage de l'erreur */
  timestamp: string;
  /** Erreur capturée */
  error: ErrorResponse;
  /** Contexte de l'erreur */
  context?: Record<string, unknown>;
}

/**
 * Niveaux de journalisation pour le service d'erreur
 */
export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARNING = 2,
  INFO = 3,
  DEBUG = 4
}

/**
 * Interface standardisée pour le service de gestion d'erreurs
 * Fournit des méthodes pour gérer, transformer et journaliser les erreurs de manière cohérente
 */
export interface IErrorService {
  /**
   * Configure le service d'erreur
   * @param config Configuration partielle à appliquer
   */
  configure(config: Partial<ErrorServiceConfig>): void;

  /**
   * Ajoute un gestionnaire d'erreur
   * @param handler Fonction de gestion d'erreur à ajouter
   */
  addErrorHandler(handler: ErrorHandler): void;

  /**
   * Supprime un gestionnaire d'erreur
   * @param handler Fonction de gestion d'erreur à supprimer
   */
  removeErrorHandler(handler: ErrorHandler): void;

  /**
   * Gère une erreur selon la configuration du service
   * @param error Erreur à gérer
   * @param options Options de gestion
   * @returns Réponse d'erreur standardisée
   */
  handleError(error: unknown, options?: ErrorHandlingOptions): ErrorResponse;

  /**
   * Crée un ServiceResult d'erreur
   * @param error Erreur à transformer
   * @param options Options de gestion
   * @returns ServiceResult contenant l'erreur
   */
  createErrorResult<T>(error: unknown, options?: ErrorHandlingOptions): ServiceResult<T>;

  /**
   * Crée un ServiceResult de succès
   * @param data Données de résultat
   * @returns ServiceResult contenant les données
   */
  createSuccessResult<T>(data: T): ServiceResult<T>;

  /**
   * Vérifie si une erreur appartient à une catégorie spécifique
   * @param error Erreur à vérifier
   * @param category Catégorie d'erreur
   * @returns Vrai si l'erreur appartient à la catégorie
   */
  isErrorOfCategory(error: unknown, category: ErrorCategory): boolean;

  /**
   * Vérifie si une erreur a un code spécifique
   * @param error Erreur à vérifier
   * @param code Code d'erreur
   * @returns Vrai si l'erreur a le code spécifié
   */
  isErrorOfCode(error: unknown, code: number | keyof typeof ErrorCodes): boolean;

  /**
   * Crée une erreur de validation
   * @param message Message d'erreur
   * @param details Détails supplémentaires
   * @returns Erreur de validation
   */
  createValidationError(message: string, details?: unknown): AppError;

  /**
   * Crée une erreur d'authentification
   * @param codeRef Code d'erreur d'authentification
   * @param message Message personnalisé
   * @param details Détails supplémentaires
   * @returns Erreur d'authentification
   */
  createAuthError(
    codeRef: 'AUTH_REQUIRED' | 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED' | 'ACCOUNT_LOCKED',
    message?: string,
    details?: unknown
  ): AppError;

  /**
   * Crée une erreur "non trouvé"
   * @param resourceType Type de ressource
   * @param resourceId Identifiant de la ressource
   * @returns Erreur "non trouvé"
   */
  createNotFoundError(resourceType: string, resourceId?: string): AppError;

  /**
   * Exécute une opération avec gestion d'erreurs intégrée
   * @param operation Fonction à exécuter
   * @param options Options de gestion d'erreurs
   * @returns ServiceResult contenant le résultat ou l'erreur
   */
  tryOperation<T>(
    operation: () => Promise<T>,
    options?: TryOperationOptions
  ): Promise<ServiceResult<T>>;

  /**
   * Obtient l'historique des erreurs récentes
   * @param limit Nombre maximal d'erreurs à retourner
   * @returns Liste des erreurs récentes
   */
  getRecentErrors(limit?: number): ErrorRecord[];

  /**
   * Définit le niveau de verbosité de la journalisation
   * @param level Niveau de verbosité
   */
  setLogLevel(level: LogLevel): void;
}

/**
 * Interface pour le service de gestion d'erreurs
 * Fournit des méthodes pour gérer, transformer et journaliser les erreurs de manière cohérente
 */
export type { IErrorService };