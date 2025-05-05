/**
 * Error Tracking Service - DevIndé Tracker
 * 
 * Service responsable de la capture, l'analyse, et le stockage des erreurs JavaScript
 * et des échecs d'API. S'intègre avec les services d'analytique et de performance.
 */

import { secureLocalStorage } from '../utils/security';
import { getCurrentTimestamp, generateUUID } from '../utils/helpers';
import { analyticsService } from './analytics-service';
import { AppError, ErrorSeverity as AppErrorSeverity } from '../utils/error-handling';

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
  RESOURCE = 'resource',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  PROMISE = 'promise',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  CUSTOM = 'custom'
}

// Statut de l'erreur
export enum ErrorStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  OPEN = 'open',
  IGNORED = 'ignored',
  RETRYING = 'retrying'
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
export class ErrorTrackingService {
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
    if (typeof window === 'undefined' || this.initialized) {
      return;
    }

    this.initialized = true;

    if (this.config.enabled) {
      if (this.config.captureGlobalErrors) {
        this.setupGlobalErrorHandlers();
      }
      this.setupBreadcrumbListeners();
      this.cleanOldErrors();
    }
  }

  // Configuration des gestionnaires d'erreurs globaux
  private setupGlobalErrorHandlers(): void {
    // Sauvegarder le gestionnaire d'erreurs original
    this.originalOnError = window.onerror;

    // Configurer le nouveau gestionnaire d'erreurs
    window.onerror = (message, source, lineno, colno, error) => {
      if (this.originalOnError) {
        this.originalOnError(message, source, lineno, colno, error);
      }

      if (typeof message === 'string' && this.shouldIgnoreError(message)) {
        return true;
      }

      const errorData: Partial<ErrorData> = {
        type: ErrorType.JAVASCRIPT,
        message: typeof message === 'string' ? message : String(message),
        url: source || window.location.href,
        path: window.location.pathname,
        lineNumber: lineno,
        columnNumber: colno,
        severity: ErrorSeverity.ERROR,
        stack: error?.stack,
        sessionId: this.sessionId,
        timestamp: getCurrentTimestamp()
      };

      this.captureError(errorData);
      return false;
    };

    // Sauvegarder le gestionnaire de rejets de promesses original
    if (this.config.capturePromiseRejections && window.addEventListener) {
      this.originalOnUnhandledRejection = (event: PromiseRejectionEvent) => {
        event.preventDefault();
      };

      window.addEventListener('unhandledrejection', (event) => {
        if (this.originalOnUnhandledRejection) {
          this.originalOnUnhandledRejection(event);
        }

        const reason = event.reason;
        const message = reason instanceof Error ? reason.message : String(reason);

        if (this.shouldIgnoreError(message)) {
          return;
        }

        const errorData: Partial<ErrorData> = {
          type: ErrorType.PROMISE,
          message: message,
          stack: reason instanceof Error ? reason.stack : undefined,
          url: window.location.href,
          path: window.location.pathname,
          severity: ErrorSeverity.WARNING,
          sessionId: this.sessionId,
          timestamp: getCurrentTimestamp()
        };

        this.captureError(errorData);
      });
    }

    // Écouter les erreurs de chargement de ressources
    if (this.config.captureResourceErrors && window.addEventListener) {
      window.addEventListener('error', (event) => {
        // Ignorer les erreurs JavaScript (déjà capturées par onerror)
        if (event.error) return;

        // Vérifier si l'événement concerne une ressource
        const target = event.target as HTMLElement;
        if (!target || !('tagName' in target)) return;

        const tagName = target.tagName.toLowerCase();
        if (['img', 'script', 'link', 'audio', 'video'].indexOf(tagName) === -1) return;

        // Traiter différents types d'éléments pour obtenir l'URL
        let url: string | null = null;
        if (tagName === 'img' || tagName === 'script') {
          url = (target as HTMLImageElement | HTMLScriptElement).src;
        } else if (tagName === 'link') {
          url = (target as HTMLLinkElement).href;
        } else if (tagName === 'audio' || tagName === 'video') {
          url = (target as HTMLMediaElement).src;
        }
        
        if (!url) return;

        const errorData: Partial<ErrorData> = {
          type: ErrorType.RESOURCE,
          message: `Failed to load ${tagName}: ${url}`,
          url: window.location.href,
          path: window.location.pathname,
          severity: ErrorSeverity.MEDIUM,
          sessionId: this.sessionId,
          timestamp: getCurrentTimestamp(),
          metadata: {
            resourceType: tagName,
            resourceUrl: url
          }
        };

        this.captureError(errorData);
      }, true);
    }
  }

  // Configuration des écouteurs pour les breadcrumbs
  private setupBreadcrumbListeners(): void {
    if (typeof window === 'undefined' || !window.addEventListener) {
      return;
    }

    // Navigation
    window.addEventListener('popstate', () => {
      this.addBreadcrumb({
        type: 'navigation',
        category: 'navigation',
        message: `Navigated to ${window.location.pathname}`
      });
    });

    // Clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target) return;
      
      // Ignorer les clicks sur le corps du document
      if (target === document.body) return;

      const tagName = target.tagName.toLowerCase();
      const id = target.id || '';
      const classList = Array.from(target.classList).join('.');
      const selector = id ? `#${id}` : (classList ? `.${classList}` : tagName);

      this.addBreadcrumb({
        type: 'click',
        category: 'ui.click',
        message: `Click on ${selector}`,
        data: {
          selector,
          tagName,
          id: id || undefined,
          classList: classList || undefined,
          text: target.textContent?.substring(0, 50) || undefined
        }
      });
    });
  }

  // Ajouter un breadcrumb
  public addBreadcrumb(data: Omit<Breadcrumb, 'id' | 'timestamp'>): void {
    if (!this.config.enabled) return;
    
    const breadcrumb: Breadcrumb = {
      id: generateUUID(),
      timestamp: getCurrentTimestamp(),
      ...data
    };

    this.breadcrumbs.unshift(breadcrumb);
    
    // Limiter le nombre de breadcrumbs
    if (this.breadcrumbs.length > this.config.breadcrumbsLimit) {
      this.breadcrumbs = this.breadcrumbs.slice(0, this.config.breadcrumbsLimit);
    }
  }

  // Capturer une exception
  public captureException(
    error: Error | AppError,
    type: ErrorType = ErrorType.JAVASCRIPT,
    additionalData: Record<string, unknown> = {}
  ): string {
    if (!this.config.enabled) return '';

    // Vérifier si c'est une AppError avec des propriétés spécifiques
    const isAppError = error && typeof error === 'object' && error instanceof AppError;
    
    const errorData: Partial<ErrorData> = {
      type,
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      severity: isAppError ? convertSeverity((error as AppError).severity) : ErrorSeverity.ERROR,
      code: isAppError && (error as AppError).code ? String((error as AppError).code) : undefined,
      sessionId: this.sessionId,
      timestamp: getCurrentTimestamp(),
      metadata: additionalData
    };

    // Analytique pour les erreurs
    if (typeof window !== 'undefined') {
      analyticsService.trackError(error.message, isAppError && (error as AppError).code ? String((error as AppError).code) : undefined);
    }

    return this.captureError(errorData);
  }

  // Capturer une erreur générique
  public captureError(errorData: Partial<ErrorData>): string {
    if (!this.config.enabled) return '';
    
    // Appliquer un échantillonnage aléatoire si configuré
    if (this.config.sampleRate < 1 && Math.random() > this.config.sampleRate) {
      return '';
    }
    
    const now = getCurrentTimestamp();
    
    // Vérifier si nous avons déjà atteint la limite d'erreurs
    if (this.errors.length >= this.config.maxErrors) {
      this.cleanOldErrors();
      
      // Si nous sommes toujours à la limite, ne pas enregistrer cette erreur
      if (this.errors.length >= this.config.maxErrors) {
        console.warn('Error tracking: maximum number of errors reached');
        return '';
      }
    }
    
    // Enrichir les données d'erreur
    const fullErrorData: ErrorData = {
      id: generateUUID(),
      timestamp: now,
      type: errorData.type || ErrorType.JAVASCRIPT,
      message: errorData.message || 'Unknown error',
      url: errorData.url || (typeof window !== 'undefined' ? window.location.href : ''),
      path: errorData.path || (typeof window !== 'undefined' ? window.location.pathname : ''),
      stack: this.processStack(errorData.stack),
      severity: errorData.severity || ErrorSeverity.ERROR,
      status: ErrorStatus.NEW,
      sessionId: errorData.sessionId || this.sessionId,
      breadcrumbIds: this.breadcrumbs.slice(0, 10).map(b => b.id),
      metadata: this.scrubData(errorData.metadata || {}),
      componentName: errorData.componentName,
      lineNumber: errorData.lineNumber,
      columnNumber: errorData.columnNumber,
      code: errorData.code,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      groupHash: '',
      retryCount: 0
    };
    
    // Ajouter des informations sur le navigateur si disponible
    if (typeof window !== 'undefined') {
      fullErrorData.userAgent = navigator.userAgent;
    }
    
    // Calculer un hash pour regrouper les erreurs similaires
    fullErrorData.groupHash = this.calculateGroupHash(fullErrorData);
    
    // Ajouter l'erreur à la liste
    this.errors.push(fullErrorData);
    
    // Sauvegarder les erreurs
    this.saveErrors();
    
    return fullErrorData.id;
  }

  // Vérifier si une erreur doit être ignorée
  private shouldIgnoreError(message?: string): boolean {
    if (!message) return false;
    
    // Vérifier si le message correspond à un pattern à ignorer
    return this.config.ignoreErrors.some(pattern => {
      // Traiter les chaînes comme des sous-chaînes
      if (typeof pattern === 'string') {
        return message.includes(pattern);
      }
      return false;
    });
  }

  // Scrubber les données pour supprimer les informations sensibles
  private scrubData(data: Record<string, unknown>): Record<string, unknown> {
    if (!data || typeof data !== 'object') return {};
    
    // Clone profond pour éviter de modifier l'original
    const clonedData = JSON.parse(JSON.stringify(data));
    
    // Scrub récursif des données
    return this.scrub(clonedData);
  }

  // Parcourir récursivement l'objet et remplacer les champs sensibles
  private scrub(obj: Record<string, unknown>, path = ''): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Pour chaque propriété de l'objet
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newPath = path ? `${path}.${key}` : key;
        
        // Vérifier si ce champ doit être nettoyé
        const shouldScrub = this.config.scrubFields.some(field => {
          // Match exact du chemin
          if (field === newPath) return true;
          
          // Match par substring
          return typeof field === 'string' && key.toLowerCase().includes(field.toLowerCase());
        });
        
        if (shouldScrub) {
          // Remplacer la valeur par [FILTERED]
          obj[key] = '[FILTERED]';
        } else if (obj[key] && typeof obj[key] === 'object') {
          // Scrub récursif pour les objets et tableaux
          obj[key] = this.scrub(obj[key] as Record<string, unknown>, newPath);
        }
      }
    }
    
    return obj;
  }

  // Calculer un hash de groupe pour regrouper les erreurs similaires
  private calculateGroupHash(errorData: Partial<ErrorData>): string {
    // Stratégie simple : utiliser type + message + stackFirstLine
    const type = errorData.type || '';
    const message = errorData.message || '';
    const stackFirstLine = errorData.stack?.split('\n')[1] || '';
    
    // Hash extrêmement basique, peut être amélioré
    return `${type}:${message}:${stackFirstLine}`.replace(/[0-9]/g, 'X');
  }

  // Traiter et limiter la stack trace
  private processStack(stack?: string): string | undefined {
    if (!stack) return undefined;
    
    // Limiter la taille de la stack trace
    const lines = stack.split('\n');
    if (lines.length > this.config.stackTraceLimit) {
      return lines.slice(0, this.config.stackTraceLimit).join('\n');
    }
    
    return stack;
  }

  // Recueillir les informations sur le navigateur
  private getBrowserInfo(): BrowserInfo {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        userAgent: 'Unknown',
        language: 'Unknown',
        platform: 'Unknown',
        screenSize: 'Unknown',
        viewportSize: 'Unknown'
      };
    }
    
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const info: BrowserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenSize: `${screenWidth}x${screenHeight}`,
      viewportSize: `${viewportWidth}x${viewportHeight}`
    };
    
    // Ajouter des informations sur la mémoire si disponibles
    if ('performance' in window && 'memory' in (performance as any)) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        info.memoryInfo = `${Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024))}MB / ${Math.round(memoryInfo.jsHeapSizeLimit / (1024 * 1024))}MB`;
      }
    }
    
    // Ajouter des informations sur la connexion si disponibles
    if (navigator && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        info.connectionType = connection.effectiveType || connection.type;
      }
    }
    
    return info;
  }

  // Nettoyer les anciennes erreurs
  private cleanOldErrors(): void {
    // Trier les erreurs par date, plus récentes en premier
    this.errors.sort((a, b) => b.timestamp - a.timestamp);
    
    // Ne garder que les maxErrors erreurs les plus récentes
    if (this.errors.length > this.config.maxErrors) {
      this.errors = this.errors.slice(0, this.config.maxErrors);
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
    if (!this.config.enabled) return '';
    
    const message = `API Error: ${statusCode} on ${endpoint}`;
    
    // Déterminer la sévérité en fonction du code de statut
    let severity = ErrorSeverity.MEDIUM;
    if (statusCode >= 500) {
      severity = ErrorSeverity.ERROR;
    } else if (statusCode >= 400) {
      severity = ErrorSeverity.WARNING;
    }
    
    const errorData: Partial<ErrorData> = {
      type: ErrorType.API,
      message,
      url: typeof window !== 'undefined' ? window.location.href : '',
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      severity,
      sessionId: this.sessionId,
      timestamp: getCurrentTimestamp(),
      metadata: {
        endpoint,
        statusCode,
        responseBody: this.scrubData(responseBody as Record<string, unknown>),
        requestData: requestData ? this.scrubData(requestData as Record<string, unknown>) : undefined
      }
    };
    
    const trackingMessage = message;
    const trackingData = {
      statusCode,
      endpoint
    };
    
    // Analytique pour les erreurs API
    analyticsService.trackError(trackingMessage, undefined, trackingData);
    
    return this.captureError(errorData);
  }

  // Charger la configuration
  private loadConfig(): ErrorTrackingConfig {
    if (typeof window === 'undefined') {
      return this.getDefaultConfig();
    }
    
    try {
      const savedConfig = secureLocalStorage.getItem('devinde-tracker-error-config');
      if (savedConfig) {
        return JSON.parse(savedConfig as string) as ErrorTrackingConfig;
      }
    } catch (err) {
      console.error('Failed to load error tracking config:', err);
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
      sampleRate: 1, // Capturer 100% des erreurs
      maxErrors: 100, // Limiter à 100 erreurs
      scrubFields: ['password', 'secret', 'token', 'auth', 'key', 'apiKey', 'credit_card'],
      ignoreErrors: [
        // Erreurs de Chrome extensions
        'chrome-extension://',
        // Erreurs de plugins React DevTools
        'React DevTools',
        // Erreurs de network offline
        'Network request failed',
        // Erreurs de sécurité CORS
        'blocked by CORS policy'
      ],
      breadcrumbsLimit: 20
    };
  }

  // Sauvegarder la configuration
  private saveConfig(): void {
    if (typeof window === 'undefined') return;
    
    try {
      secureLocalStorage.setItem('devinde-tracker-error-config', JSON.stringify(this.config));
    } catch (err) {
      console.error('Failed to save error tracking config:', err);
    }
  }

  // Charger les erreurs
  private loadErrors(): ErrorData[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const savedErrors = secureLocalStorage.getItem(ERROR_TRACKING_STORAGE_KEY);
      if (savedErrors && typeof savedErrors === 'string' && savedErrors.trim() !== '') {
        try {
          return JSON.parse(savedErrors) as ErrorData[];
        } catch (parseError) {
          console.error('Error parsing errors JSON:', parseError);
          // En cas d'erreur de parsing, réinitialiser le stockage
          secureLocalStorage.removeItem(ERROR_TRACKING_STORAGE_KEY);
          return [];
        }
      }
    } catch (err) {
      console.error('Failed to load errors:', err);
    }
    
    return [];
  }

  // Sauvegarder les erreurs
  private saveErrors(): void {
    if (typeof window === 'undefined') return;
    
    try {
      secureLocalStorage.setItem(ERROR_TRACKING_STORAGE_KEY, JSON.stringify(this.errors));
    } catch (err) {
      console.error('Failed to save errors:', err);
    }
  }

  // Obtenir toutes les erreurs
  public getErrors(): ErrorData[] {
    return [...this.errors];
  }

  // Obtenir une erreur par ID
  public getErrorById(id: string): ErrorData | undefined {
    return this.errors.find(err => err.id === id);
  }

  // Obtenir les erreurs filtrées par type
  public getErrorsByType(type: ErrorType): ErrorData[] {
    return this.errors.filter(err => err.type === type);
  }

  // Obtenir les erreurs filtrées par sévérité
  public getErrorsBySeverity(severity: ErrorSeverity): ErrorData[] {
    return this.errors.filter(err => err.severity === severity);
  }

  // Obtenir les erreurs filtrées par statut
  public getErrorsByStatus(status: ErrorStatus): ErrorData[] {
    return this.errors.filter(err => err.status === status);
  }

  // Mettre à jour le statut d'une erreur
  public updateErrorStatus(id: string, status: ErrorStatus): boolean {
    const errorIndex = this.errors.findIndex(err => err.id === id);
    if (errorIndex === -1) return false;
    
    this.errors[errorIndex].status = status;
    this.saveErrors();
    
    return true;
  }

  // Activer ou désactiver le tracking d'erreurs
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
    
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
    this.config = { ...this.config, ...newConfig };
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
      if (this.originalOnError) {
        window.onerror = this.originalOnError;
      }
      
      if (this.originalOnUnhandledRejection && window.removeEventListener) {
        window.removeEventListener('unhandledrejection', this.originalOnUnhandledRejection);
      }
    }
    
    this.initialized = false;
  }
}

// Exporter une instance par défaut pour faciliter l'utilisation
export const errorTrackingService = ErrorTrackingService.getInstance();
