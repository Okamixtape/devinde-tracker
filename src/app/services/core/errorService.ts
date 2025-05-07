import { 
  AppError, 
  ErrorCategory, 
  ErrorSeverity, 
  ErrorResponse, 
  handleError as utilsHandleError,
  ErrorCodes
} from "../utils/errorHandling";
import { ServiceResult } from "../interfaces/dataModels";

// Interface pour le gestionnaire d'erreurs
export interface ErrorHandler {
  (error: unknown, context?: Record<string, unknown>): void;
}

// Configuration globale pour le service d'erreur
export interface ErrorServiceConfig {
  includeDebugInfo?: boolean;
  logErrorsToConsole?: boolean;
  logErrorsToServer?: boolean;
  errorHandlers?: ErrorHandler[];
  defaultErrorMessage?: string;
}

/**
 * Service centralisé pour la gestion des erreurs dans l'application
 */
class ErrorService {
  private static instance: ErrorService;
  private readonly config: ErrorServiceConfig;
  private errorHandlers: ErrorHandler[] = [];

  private constructor(config: ErrorServiceConfig = {}) {
    this.config = {
      includeDebugInfo: process.env.NODE_ENV === 'development',
      logErrorsToConsole: true,
      logErrorsToServer: process.env.NODE_ENV === 'production',
      defaultErrorMessage: "Une erreur est survenue",
      ...config
    };

    if (this.config.errorHandlers && this.config.errorHandlers.length) {
      this.errorHandlers = [...this.config.errorHandlers];
    }
  }

  /**
   * Obtenir l'instance unique du service d'erreur (Singleton)
   */
  public static getInstance(config?: ErrorServiceConfig): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService(config);
    }
    return ErrorService.instance;
  }

  /**
   * Configurer le service d'erreur
   */
  public configure(config: Partial<ErrorServiceConfig>): void {
    Object.assign(this.config, config);
    
    if (config.errorHandlers) {
      this.errorHandlers = [...config.errorHandlers];
    }
  }

  /**
   * Ajouter un gestionnaire d'erreur
   */
  public addErrorHandler(handler: ErrorHandler): void {
    if (!this.errorHandlers.includes(handler)) {
      this.errorHandlers.push(handler);
    }
  }

  /**
   * Supprimer un gestionnaire d'erreur
   */
  public removeErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
  }

  /**
   * Gérer une erreur
   */
  public handleError(
    error: unknown, 
    options: {
      context?: Record<string, unknown>;
      includeDebugInfo?: boolean;
      logError?: boolean;
      notifyHandlers?: boolean;
    } = {}
  ): ErrorResponse {
    const {
      context = {},
      includeDebugInfo = this.config.includeDebugInfo,
      logError = this.config.logErrorsToConsole,
      notifyHandlers = true
    } = options;

    // Convertir en format standard
    const errorResponse = utilsHandleError(error, {
      includeDebugInfo,
      logError
    });

    // Notifier les gestionnaires d'erreur enregistrés
    if (notifyHandlers && this.errorHandlers.length > 0) {
      for (const handler of this.errorHandlers) {
        try {
          handler(error, context);
        } catch (handlerError) {
          console.error('Error in error handler:', handlerError);
        }
      }
    }

    // Envoyer au serveur si configuré
    if (this.config.logErrorsToServer) {
      this.logErrorToServer(errorResponse, context);
    }

    return errorResponse;
  }

  /**
   * Envoyer l'erreur au serveur (pour journalisation)
   * Cette fonction serait connectée à un service de monitoring externe ou un backend
   */
  private logErrorToServer(error: ErrorResponse, context: Record<string, unknown> = {}): void {
    // Implémentation à connecter à un service de monitoring
    // Pour l'instant, simple log dans la console
    console.info('Erreur qui aurait été envoyée au serveur:', { error, context });
    
    // Dans un environnement réel, cette fonction pourrait envoyer des données à 
    // Sentry, LogRocket, New Relic, etc.
  }

  /**
   * Créer un ServiceResult d'erreur
   */
  public createErrorResult<T>(
    error: unknown, 
    options?: {
      context?: Record<string, unknown>;
      includeDebugInfo?: boolean;
    }
  ): ServiceResult<T> {
    const errorResponse = this.handleError(error, options);
    return {
      success: false,
      error: {
        code: String(errorResponse.error.code),
        message: errorResponse.error.message,
        details: errorResponse.error.details
      }
    };
  }

  /**
   * Créer un ServiceResult de succès
   */
  public createSuccessResult<T>(data: T): ServiceResult<T> {
    return {
      success: true,
      data
    };
  }

  /**
   * Vérifier si une erreur est d'une catégorie spécifique
   */
  public isErrorOfCategory(error: unknown, category: ErrorCategory): boolean {
    return error instanceof AppError && error.category === category;
  }

  /**
   * Vérifier si une erreur a un code spécifique
   */
  public isErrorOfCode(error: unknown, code: number | keyof typeof ErrorCodes): boolean {
    if (!(error instanceof AppError)) return false;
    
    const errorCode = typeof code === 'number' 
      ? code 
      : ErrorCodes[code]?.code;
      
    return error.code === errorCode;
  }

  /**
   * Créer une erreur de validation
   */
  public createValidationError(message: string, details?: unknown): AppError {
    return new AppError('INVALID_INPUT', {
      message,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.WARNING,
      details
    });
  }

  /**
   * Créer une erreur d'authentification
   */
  public createAuthError(
    codeRef: 'AUTH_REQUIRED' | 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED' | 'ACCOUNT_LOCKED',
    message?: string,
    details?: unknown
  ): AppError {
    return new AppError(codeRef, {
      message,
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.ERROR,
      details
    });
  }

  /**
   * Créer une erreur "non trouvé"
   */
  public createNotFoundError(resourceType: string, resourceId?: string): AppError {
    const message = resourceId
      ? `${resourceType} avec ID ${resourceId} non trouvé`
      : `${resourceType} non trouvé`;
      
    return new AppError('NOT_FOUND', {
      message,
      category: ErrorCategory.DATA,
      severity: ErrorSeverity.WARNING
    });
  }

  /**
   * Traiter un bloc try/catch en retournant un ServiceResult
   */
  public async tryOperation<T>(
    operation: () => Promise<T>,
    options: {
      errorMessage?: string;
      context?: Record<string, unknown>;
    } = {}
  ): Promise<ServiceResult<T>> {
    try {
      const result = await operation();
      return this.createSuccessResult(result);
    } catch (error) {
      const { errorMessage, context } = options;
      
      // Si un message d'erreur personnalisé est fourni, utiliser ce message
      if (errorMessage) {
        const appError = error instanceof AppError ? error : new AppError('UNKNOWN_ERROR', { message: String(error), category: ErrorCategory.SYSTEM, severity: ErrorSeverity.ERROR });
        appError.userMessage = errorMessage;
        return this.createErrorResult<T>(appError, { context });
      }
      
      return this.createErrorResult<T>(error, { context });
    }
  }
}

// Export de l'instance par défaut
export default ErrorService.getInstance();

// Export de la classe pour tests ou cas spéciaux
export { ErrorService };
