/**
 * Error Tracking Service - DevIndé Tracker
 * 
 * Service responsable de la capture, l'analyse, et le stockage des erreurs JavaScript
 * et des échecs d'API. S'intègre avec les services d'analytique et de performance.
 */

import { secureLocalStorage } from '../utils/security';
import { getCurrentTimestamp, generateUUID } from '../utils/helpers';
import { AppError, ErrorSeverity as AppErrorSeverity } from "@/app/services/utils/errorHandling";
import { analyticsService } from './analyticsService';

// Définir l'enum ErrorSeverity directement ici
export enum ErrorSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

// Fonction pour convertir les types de sévérité
function convertSeverity(severity: AppErrorSeverity | undefined): ErrorSeverity {
  if (!severity) return ErrorSeverity.ERROR;
  
  switch (severity) {
    case AppErrorSeverity.CRITICAL:
      return ErrorSeverity.CRITICAL;
    case AppErrorSeverity.ERROR:
      return ErrorSeverity.ERROR;
    case AppErrorSeverity.WARNING:
      return ErrorSeverity.WARNING;
    case AppErrorSeverity.INFO:
      return ErrorSeverity.INFO;
    case AppErrorSeverity.FATAL:
      return ErrorSeverity.CRITICAL;
    default:
      return ErrorSeverity.ERROR;
  }
}

// Clé de stockage pour les erreurs
export const ERROR_TRACKING_STORAGE_KEY = 'devinde-tracker-errors';

// Type d'erreur
export enum ErrorType {
  JAVASCRIPT = 'javascript',
  API = 'api',
  NETWORK = 'network',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  BUSINESS = 'business',
  USER = 'user'
}

// Statut de l'erreur
export enum ErrorStatus {
  NEW = 'new',
  RESOLVED = 'resolved',
  IGNORED = 'ignored',
  IN_PROGRESS = 'in_progress'
}

// Interface pour les données d'erreur
export interface ErrorData {
  id: string;
  timestamp: number;
  type: ErrorType;
  message: string;
  stack?: string;
  componentName?: string;
  url: string;
  path: string;
  lineNumber?: number;
  columnNumber?: number;
  severity: ErrorSeverity;
  status: ErrorStatus;
  code?: string;
  userAgent?: string;
  sessionId: string;
  breadcrumbIds?: string[];
  groupHash?: string;
  metadata?: Record<string, unknown>;
  retryCount?: number;
}

// Information sur le navigateur
export interface BrowserInfo {
  userAgent: string;
  language: string;
  platform: string;
  screenSize: string;
  viewportSize: string;
  memoryInfo?: string;
  connectionType?: string;
}

// Configuration du tracking d'erreurs
export interface ErrorTrackingConfig {
  enabled: boolean;
  captureGlobalErrors: boolean;
  capturePromiseRejections: boolean;
  captureResourceErrors: boolean;
  stackTraceLimit: number;
  sampleRate: number;
  maxErrors: number;
  scrubFields: string[];
  ignoreErrors: string[];
  breadcrumbsLimit: number;
}

// Interface pour un breadcrumb (fil d'Ariane des actions utilisateur)
export interface Breadcrumb {
  id: string;
  timestamp: number;
  type: 'navigation' | 'click' | 'input' | 'api' | 'custom';
  category: string;
  message: string;
  data?: Record<string, unknown>;
}

// Service de tracking d'erreurs
class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private errors: ErrorData[] = [];
  private breadcrumbs: Breadcrumb[] = [];
  private config: ErrorTrackingConfig;
  private initialized: boolean = false;
  private sessionId: string;
  private originalOnError?: OnErrorEventHandler;
  private originalOnUnhandledRejection?: ((event: PromiseRejectionEvent) => void);

  private constructor() {
    this.config = this.loadConfig();
    this.errors = this.loadErrors();
    this.sessionId = generateUUID();
    this.initialize();
  }

  // Obtenir l'instance singleton
  public static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  // Initialiser le service de tracking d'erreurs
  private initialize(): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    // Configuration des listeners globaux pour les erreurs
    if (this.config.enabled) {
      if (this.config.captureGlobalErrors) {
        this.setupGlobalErrorHandlers();
      }
      
      this.setupBreadcrumbListeners();
    }

    this.initialized = true;

    // Analytique pour l'initialisation du service
    analyticsService.trackEvent('error_tracking_initialized', {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent
    });
  }

  // Configuration des gestionnaires d'erreurs globaux
  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Intercepter les erreurs JavaScript globales
      this.originalOnError = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        this.onerror(message, source, lineno, colno, error);
        return this.originalOnError ? this.originalOnError(message, source, lineno, colno, error) : false;
      };

      // Intercepter les rejets de promesses non gérés
      if (this.config.capturePromiseRejections) {
        this.originalOnUnhandledRejection = (event: PromiseRejectionEvent) => {
          event.preventDefault();
          const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
          this.captureException(error, ErrorType.JAVASCRIPT, { unhandledRejection: true });
        };
        window.addEventListener('unhandledrejection', this.originalOnUnhandledRejection);
      }

      // Intercepter les erreurs de ressources
      if (this.config.captureResourceErrors) {
        window.addEventListener('error', (event) => {
          if (event.target && (event.target as HTMLElement).tagName) {
            const target = event.target as HTMLElement;
            this.captureError({
              type: ErrorType.NETWORK,
              message: `Failed to load resource: ${target.tagName} ${target.getAttribute('src') || target.getAttribute('href')}`,
              url: window.location.href,
              path: window.location.pathname,
              severity: ErrorSeverity.WARNING,
              status: ErrorStatus.NEW,
              metadata: {
                resourceType: target.tagName,
                resourceUrl: target.getAttribute('src') || target.getAttribute('href')
              }
            });
          }
        }, true);
      }
    }
  }

  // Configurer le nouveau gestionnaire d'erreurs
  private onerror(message: any, source?: string, lineno?: number, colno?: number, error?: Error): boolean {
    if (this.config.enabled && !this.shouldIgnoreError(message?.toString())) {
      const errorData: Partial<ErrorData> = {
        type: ErrorType.JAVASCRIPT,
        message: message?.toString() || 'Unknown error',
        url: window.location.href,
        path: window.location.pathname,
        lineNumber: lineno,
        columnNumber: colno,
        stack: error?.stack,
        severity: ErrorSeverity.ERROR,
        status: ErrorStatus.NEW
      };

      this.captureError(errorData);
    }
    return false;
  }

  // Configuration des écouteurs pour les breadcrumbs
  private setupBreadcrumbListeners(): void {
    if (typeof window !== 'undefined') {
      // Breadcrumbs de navigation
      window.addEventListener('popstate', () => {
        this.addBreadcrumb({
          type: 'navigation',
          category: 'navigation',
          message: `Navigation to ${window.location.href}`
        });
      });

      // Breadcrumbs de clics
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        
        if (target) {
          let selector = '';
          
          if (target.id) {
            selector = `#${target.id}`;
          } else if (target.className && typeof target.className === 'string') {
            selector = `.${target.className.split(' ').join('.')}`;
          } else {
            selector = target.tagName.toLowerCase();
          }
          
          this.addBreadcrumb({
            type: 'click',
            category: 'ui.click',
            message: `Click on ${selector}`,
            data: {
              selector,
              innerText: target.innerText?.substring(0, 100),
              clientX: event.clientX,
              clientY: event.clientY
            }
          });
        }
      });
    }
  }

  // Ajouter un breadcrumb
  public addBreadcrumb(data: Omit<Breadcrumb, 'id' | 'timestamp'>): void {
    if (!this.config.enabled) return;
    
    const breadcrumb: Breadcrumb = {
      id: generateUUID(),
      timestamp: getCurrentTimestamp(),
      ...data
    };
    
    // Limiter le nombre de breadcrumbs
    this.breadcrumbs.push(breadcrumb);
    if (this.breadcrumbs.length > this.config.breadcrumbsLimit) {
      this.breadcrumbs.shift(); // Enlever le plus ancien
    }
  }

  // Capturer une exception
  public captureException(
    error: Error | AppError,
    type: ErrorType = ErrorType.JAVASCRIPT,
    additionalData: Record<string, unknown> = {}
  ): string {
    if (!this.config.enabled) return '';
    
    // Vérifier si l'erreur doit être ignorée
    if (this.shouldIgnoreError(error.message)) {
      return '';
    }
    
    // Si c'est une AppError, on peut extraire directement plus d'informations
    let code: string | undefined;
    let severity: ErrorSeverity;
    
    if (error instanceof AppError) {
      code = error.code;
      severity = convertSeverity(error.severity);
      additionalData = { ...additionalData, ...error.metadata };
    } else {
      severity = ErrorSeverity.ERROR;
    }
    
    // Scrubber les données pour supprimer les informations sensibles
    const safeAdditionalData = this.scrubData(additionalData);
    
    // Créer l'objet d'erreur
    const errorData: Partial<ErrorData> = {
      type,
      message: error.message,
      stack: this.processStack(error.stack),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      code,
      severity,
      status: ErrorStatus.NEW,
      metadata: safeAdditionalData
    };
    
    // Ajouter un breadcrumb pour cette exception
    this.addBreadcrumb({
      type: 'custom',
      category: 'error',
      message: `Exception: ${error.message}`,
      data: {
        errorType: type,
        errorId: errorData.id
      }
    });
    
    // Enregistrer l'analytique de cette erreur
    analyticsService.trackEvent('error_occurred', {
      errorType: type,
      errorMessage: error.message,
      errorCode: code,
      severity
    });
    
    // Capturer et retourner l'ID
    return this.captureError(errorData);
  }

  // Capturer une erreur générique
  public captureError(errorData: Partial<ErrorData>): string {
    if (!this.config.enabled) return '';
    
    // Appliquer l'échantillonnage si configuré
    if (Math.random() > this.config.sampleRate) {
      return '';
    }
    
    // Nettoyer les anciennes erreurs si nécessaire
    this.cleanOldErrors();
    
    const now = getCurrentTimestamp();
    const browserInfo = this.getBrowserInfo();
    
    // Générer un hash de groupe pour regrouper les erreurs similaires
    const groupHash = this.calculateGroupHash(errorData);
    
    // Breadcrumbs associés à cette erreur
    const breadcrumbIds = this.breadcrumbs.map(b => b.id);
    
    // Compléter l'objet d'erreur
    const fullErrorData: ErrorData = {
      id: generateUUID(),
      timestamp: now,
      type: errorData.type || ErrorType.JAVASCRIPT,
      message: errorData.message || 'Unknown error',
      stack: errorData.stack,
      componentName: errorData.componentName,
      url: errorData.url || (typeof window !== 'undefined' ? window.location.href : 'unknown'),
      path: errorData.path || (typeof window !== 'undefined' ? window.location.pathname : 'unknown'),
      lineNumber: errorData.lineNumber,
      columnNumber: errorData.columnNumber,
      severity: errorData.severity || ErrorSeverity.ERROR,
      status: errorData.status || ErrorStatus.NEW,
      code: errorData.code,
      userAgent: browserInfo.userAgent,
      sessionId: this.sessionId,
      breadcrumbIds,
      groupHash,
      metadata: errorData.metadata || {},
      retryCount: 0
    };
    
    // Ajouter l'erreur à la liste
    this.errors.push(fullErrorData);
    
    // Sauvegarder les erreurs
    this.saveErrors();
    
    return fullErrorData.id;
  }

  // Vérifier si une erreur doit être ignorée
  private shouldIgnoreError(message?: string): boolean {
    if (!message) return false;
    
    return this.config.ignoreErrors.some(pattern => {
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        try {
          const regex = new RegExp(pattern.slice(1, -1));
          return regex.test(message);
        } catch (e) {
          return false;
        }
      }
      return message.includes(pattern);
    });
  }

  // Scrubber les données pour supprimer les informations sensibles
  private scrubData(data: Record<string, unknown>): Record<string, unknown> {
    return this.scrub(JSON.parse(JSON.stringify(data)));
  }

  // Parcourir récursivement l'objet et remplacer les champs sensibles
  private scrub(obj: Record<string, unknown>, path = ''): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return obj;
    
    const result: Record<string, unknown> = {};
    
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Vérifier si ce champ doit être scrubbed
      const shouldScrub = this.config.scrubFields.some(field => 
        field.toLowerCase() === key.toLowerCase() || 
        currentPath.toLowerCase().includes(field.toLowerCase())
      );
      
      if (shouldScrub) {
        result[key] = '[FILTERED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = this.scrub(obj[key] as Record<string, unknown>, currentPath);
      } else {
        result[key] = obj[key];
      }
    }
    
    return result;
  }

  // Calculer un hash de groupe pour regrouper les erreurs similaires
  private calculateGroupHash(errorData: Partial<ErrorData>): string {
    let hashSource = `${errorData.type || 'unknown'}:${errorData.message || 'unknown'}`;
    
    if (errorData.stack) {
      // Utiliser seulement la première ligne de la stack trace pour le hash
      const firstFrame = errorData.stack.split('\n')[0];
      hashSource += `:${firstFrame}`;
    }
    
    // Méthode simple de hashing - dans un environnement de production, on utiliserait
    // une fonction de hashing plus robuste
    let hash = 0;
    for (let i = 0; i < hashSource.length; i++) {
      const char = hashSource.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en entier 32 bits
    }
    
    return hash.toString(16);
  }

  // Traiter et limiter la stack trace
  private processStack(stack?: string): string | undefined {
    if (!stack) return undefined;
    
    const lines = stack.split('\n');
    const limitedLines = lines.slice(0, this.config.stackTraceLimit);
    return limitedLines.join('\n');
  }

  // Recueillir les informations sur le navigateur
  private getBrowserInfo(): BrowserInfo {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        userAgent: 'Node.js',
        language: 'unknown',
        platform: 'unknown',
        screenSize: 'unknown',
        viewportSize: 'unknown'
      };
    }
    
    const { userAgent, language, platform } = navigator;
    const { width: screenWidth, height: screenHeight } = window.screen;
    const { innerWidth, innerHeight } = window;
    
    // Essayer d'obtenir des informations de connexion et de mémoire si disponibles
    let connectionType = 'unknown';
    let memoryInfo = 'unknown';
    
    try {
      if ('connection' in navigator && (navigator as any).connection) {
        const connection = (navigator as any).connection;
        connectionType = connection.effectiveType || connection.type || 'unknown';
      }
    } catch (e) {
      // Ignorer les erreurs, certains navigateurs ne supportent pas cette API
    }
    
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        memoryInfo = `${Math.round(memory.usedJSHeapSize / 1048576)}MB / ${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`;
      }
    } catch (e) {
      // Ignorer les erreurs, certains navigateurs ne supportent pas cette API
    }
    
    return {
      userAgent,
      language,
      platform,
      screenSize: `${screenWidth}x${screenHeight}`,
      viewportSize: `${innerWidth}x${innerHeight}`,
      connectionType,
      memoryInfo
    };
  }

  // Nettoyer les anciennes erreurs
  private cleanOldErrors(): void {
    if (this.errors.length > this.config.maxErrors) {
      // Trier par timestamp croissant (plus ancien en premier)
      this.errors.sort((a, b) => a.timestamp - b.timestamp);
      
      // Garder seulement les plus récentes
      this.errors = this.errors.slice(this.errors.length - this.config.maxErrors);
      
      // Sauvegarder les erreurs
      this.saveErrors();
    }
  }

  // Capturer une erreur API
  public captureApiError(
    endpoint: string,
    statusCode: number,
    responseBody: unknown,
    requestData?: unknown
  ): string {
    const severity = statusCode >= 500 ? ErrorSeverity.ERROR : ErrorSeverity.WARNING;
    
    let message = `API Error: ${statusCode} on ${endpoint}`;
    const errorData: any = {};
    
    if (responseBody) {
      try {
        // Si le corps de la réponse est un objet, extraire des informations utiles
        if (typeof responseBody === 'object' && responseBody !== null) {
          const body = responseBody as any;
          
          if (body.message) {
            message = `API Error: ${body.message}`;
          }
          
          if (body.error || body.code) {
            errorData.errorCode = body.error || body.code;
          }
        }
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }
    
    return this.captureError({
      type: ErrorType.API,
      message,
      severity,
      status: ErrorStatus.NEW,
      code: `API_${statusCode}`,
      metadata: {
        endpoint,
        statusCode,
        responseBody: this.scrubData(responseBody as Record<string, unknown>),
        requestData: requestData ? this.scrubData(requestData as Record<string, unknown>) : undefined
      }
    });
  }

  // Charger la configuration
  private loadConfig(): ErrorTrackingConfig {
    try {
      const storedConfig = secureLocalStorage.getItem('devinde-tracker-error-config');
      
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        return {
          ...this.getDefaultConfig(),
          ...parsedConfig
        };
      }
    } catch (e) {
      console.warn('Failed to load error tracking config:', e);
    }
    
    return this.getDefaultConfig();
  }

  // Configuration par défaut
  private getDefaultConfig(): ErrorTrackingConfig {
    return {
      enabled: true,
      captureGlobalErrors: true,
      capturePromiseRejections: true,
      captureResourceErrors: true,
      stackTraceLimit: 10,
      sampleRate: 1.0, // 100% des erreurs sont capturées
      maxErrors: 100, // Nombre maximum d'erreurs conservées
      scrubFields: [
        'password', 'passwd', 'secret', 'token', 'auth', 
        'api_key', 'apikey', 'access_token', 'refreshtoken',
        'credit_card', 'cardnumber', 'cvv', 'ssn'
      ],
      ignoreErrors: [
        // Erreurs de ressources courantes
        'ResizeObserver loop limit exceeded',
        'Script error',
        'ChunkLoadError',
        // Erreurs CORS
        'Access is denied',
        'Permission denied',
        // Erreurs de connectivité
        'Network Error',
        'Failed to fetch',
        'NetworkError',
        'The Internet connection appears to be offline'
      ],
      breadcrumbsLimit: 20
    };
  }

  // Sauvegarder la configuration
  private saveConfig(): void {
    try {
      secureLocalStorage.setItem('devinde-tracker-error-config', JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to save error tracking config:', e);
    }
  }

  // Charger les erreurs
  private loadErrors(): ErrorData[] {
    try {
      const storedErrors = secureLocalStorage.getItem(ERROR_TRACKING_STORAGE_KEY);
      
      if (storedErrors) {
        return JSON.parse(storedErrors);
      }
    } catch (e) {
      console.warn('Failed to load stored errors:', e);
    }
    
    return [];
  }

  // Sauvegarder les erreurs
  private saveErrors(): void {
    try {
      secureLocalStorage.setItem(ERROR_TRACKING_STORAGE_KEY, JSON.stringify(this.errors));
    } catch (e) {
      console.warn('Failed to save errors:', e);
    }
  }

  // Obtenir toutes les erreurs
  public getErrors(): ErrorData[] {
    return [...this.errors];
  }

  // Obtenir une erreur par ID
  public getErrorById(id: string): ErrorData | undefined {
    return this.errors.find(error => error.id === id);
  }

  // Obtenir les erreurs filtrées par type
  public getErrorsByType(type: ErrorType): ErrorData[] {
    return this.errors.filter(error => error.type === type);
  }

  // Obtenir les erreurs filtrées par sévérité
  public getErrorsBySeverity(severity: ErrorSeverity): ErrorData[] {
    return this.errors.filter(error => error.severity === severity);
  }

  // Obtenir les erreurs filtrées par statut
  public getErrorsByStatus(status: ErrorStatus): ErrorData[] {
    return this.errors.filter(error => error.status === status);
  }

  // Mettre à jour le statut d'une erreur
  public updateErrorStatus(id: string, status: ErrorStatus): boolean {
    const errorIndex = this.errors.findIndex(error => error.id === id);
    
    if (errorIndex !== -1) {
      this.errors[errorIndex].status = status;
      this.saveErrors();
      return true;
    }
    
    return false;
  }

  // Activer ou désactiver le tracking d'erreurs
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
    
    // Si on active et que le service n'est pas encore initialisé, l'initialiser
    if (enabled && !this.initialized) {
      this.initialize();
    }
  }

  // Obtenir la configuration actuelle
  public getConfig(): ErrorTrackingConfig {
    return { ...this.config };
  }

  // Mettre à jour la configuration
  public updateConfig(newConfig: Partial<ErrorTrackingConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
    
    this.saveConfig();
  }

  // Vider les erreurs
  public clearErrors(): void {
    this.errors = [];
    this.saveErrors();
  }

  // Obtenir les breadcrumbs
  public getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  // Vider les breadcrumbs
  public clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  // Nettoyage et arrêt du tracking
  public cleanup(): void {
    if (typeof window !== 'undefined') {
      // Restaurer les gestionnaires d'erreurs originaux
      if (this.originalOnError) {
        window.onerror = this.originalOnError;
      }
      
      if (this.originalOnUnhandledRejection) {
        window.removeEventListener('unhandledrejection', this.originalOnUnhandledRejection);
      }
    }
    
    this.initialized = false;
  }

  // Méthode utilitaire pour traquer des erreurs simples
  public trackError(error: Error, type: ErrorType = ErrorType.JAVASCRIPT, additionalData: Record<string, unknown> = {}): string {
    return this.captureException(error, type, additionalData);
  }
}

// Exporter une instance par défaut pour faciliter l'utilisation
export const errorTrackingService = ErrorTrackingService.getInstance();
