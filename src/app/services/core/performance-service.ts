/**
 * Performance Monitoring Service - DevIndé Tracker
 * 
 * Service responsable du suivi et de l'analyse des performances côté client.
 * Utilise l'API Web Performance et stocke les données dans localStorage.
 */

import { secureLocalStorage } from '../utils/security';
import { getCurrentTimestamp, generateUUID } from '../utils/helpers';
import { analyticsService, AnalyticsEventType } from './analytics-service';

// Clé de stockage pour les données de performance
export const PERFORMANCE_STORAGE_KEY = 'devinde-tracker-performance';

// Types de métriques de performance
export enum PerformanceMetricType {
  PAGE_LOAD = 'page_load',
  RESOURCE_LOAD = 'resource_load',
  PAINT = 'paint',
  INTERACTION = 'interaction',
  NAVIGATION = 'navigation',
  MEMORY = 'memory',
  API_CALL = 'api_call',
  CUSTOM = 'custom'
}

// Types d'entrées de performance
export interface PerformanceEntry {
  id: string;
  type: PerformanceMetricType;
  name: string;
  timestamp: number;
  duration: number;
  session: string;
  page: string;
  details?: Record<string, unknown>;
}

// Interface pour la configuration du monitoring
export interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number; // Pourcentage d'échantillonnage (0-100)
  collectResourceTiming: boolean;
  collectPaintTiming: boolean;
  collectNavigation: boolean;
  collectMemory: boolean;
  maxEntries: number;
}

// Métriques Web Vitals (Core Web Vitals)
export interface WebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint
}

// Service de monitoring de performance
export class PerformanceService {
  private static instance: PerformanceService;
  private entries: PerformanceEntry[] = [];
  private config: PerformanceConfig;
  private observer?: PerformanceObserver;
  private apiTimers: Map<string, number> = new Map();
  private customTimers: Map<string, number> = new Map();
  private initialized: boolean = false;
  private webVitals: WebVitals = {};
  private sessionId: string;

  private constructor() {
    this.config = this.loadConfig();
    this.entries = this.loadEntries();
    this.sessionId = generateUUID();
    this.initialize();
  }

  // Obtenir l'instance singleton
  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  // Initialiser le service de monitoring
  private initialize(): void {
    // Vérifier si on est côté client
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
      return;
    }

    if (this.initialized || !this.config.enabled) {
      return;
    }

    // Définir l'échantillonnage - ne pas collecter les données pour tous les utilisateurs
    if (Math.random() * 100 > this.config.sampleRate) {
      console.info('Performance monitoring: User not sampled based on sample rate');
      return;
    }

    try {
      // Observer les entrées de performance pour page navigation
      this.setupPerformanceObservers();

      // Écouter les événements de chargement de page
      window.addEventListener('load', () => this.capturePageLoad());

      // Mesurer les interactions utilisateur
      this.setupInteractionTracking();

      // Nettoyer les anciens enregistrements
      this.cleanOldEntries();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  // Configuration des observateurs de performance
  private setupPerformanceObservers(): void {
    // Observer les métriques de paint
    if (this.config.collectPaintTiming) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.webVitals.fcp = entry.startTime;
              this.logPerformanceEntry({
                type: PerformanceMetricType.PAINT,
                name: entry.name,
                duration: 0,
                details: { entryType: entry.entryType }
              });
            }
          }
        });
        paintObserver.observe({ type: 'paint', buffered: true });
      } catch (e) {
        console.warn('Paint timing not supported', e);
      }
    }

    // Observer les métriques de navigation
    if (this.config.collectNavigation) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const navEntry = list.getEntries()[0] as PerformanceNavigationTiming;
          if (navEntry) {
            this.webVitals.ttfb = navEntry.responseStart;
            
            this.logPerformanceEntry({
              type: PerformanceMetricType.NAVIGATION,
              name: 'navigation',
              duration: navEntry.duration,
              details: {
                domComplete: navEntry.domComplete,
                domContentLoaded: navEntry.domContentLoadedEventEnd,
                domInteractive: navEntry.domInteractive,
                loadEvent: navEntry.loadEventEnd,
                ttfb: navEntry.responseStart,
                type: navEntry.type
              }
            });
          }
        });
        navigationObserver.observe({ type: 'navigation', buffered: true });
      } catch (e) {
        console.warn('Navigation timing not supported', e);
      }
    }

    // Observer les métriques de ressources
    if (this.config.collectResourceTiming) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Limiter aux ressources importantes (JS, CSS, fonts, images, fetch/XHR)
            if (['script', 'link', 'img', 'css', 'fetch', 'xmlhttprequest'].includes(entry.initiatorType)) {
              this.logPerformanceEntry({
                type: PerformanceMetricType.RESOURCE_LOAD,
                name: entry.name.split('/').pop() || entry.name,
                duration: entry.duration,
                details: {
                  url: entry.name,
                  initiatorType: entry.initiatorType,
                  size: (entry as PerformanceResourceTiming).transferSize || 0,
                  protocol: (entry as PerformanceResourceTiming).nextHopProtocol
                }
              });
            }
          }
        });
        resourceObserver.observe({ type: 'resource', buffered: true });
      } catch (e) {
        console.warn('Resource timing not supported', e);
      }
    }

    // Observer les métriques de layout shift
    try {
      let cumulativeLayoutShift = 0;
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Ne pas inclure les layouts shifts causés par des interactions utilisateur
          if (!(entry as any).hadRecentInput) {
            const impact = (entry as any).value;
            cumulativeLayoutShift += impact;
            this.webVitals.cls = cumulativeLayoutShift;
          }
        }
      });
      layoutShiftObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('Layout Shift measurement not supported', e);
    }

    // Observer Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.webVitals.lcp = lastEntry.startTime;
        
        this.logPerformanceEntry({
          type: PerformanceMetricType.PAINT,
          name: 'largest-contentful-paint',
          duration: 0,
          details: { 
            size: (lastEntry as any).size,
            element: (lastEntry as any).element ? (lastEntry as any).element.tagName : null 
          }
        });
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('Largest Contentful Paint measurement not supported', e);
    }
  }

  // Capture des performances de chargement de page
  private capturePageLoad(): void {
    // Si window.performance n'est pas disponible, ne rien faire
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    // Collecte des métriques mémoire si disponibles et configurées
    if (this.config.collectMemory && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.logPerformanceEntry({
        type: PerformanceMetricType.MEMORY,
        name: 'memory',
        duration: 0,
        details: {
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          totalJSHeapSize: memory.totalJSHeapSize,
          usedJSHeapSize: memory.usedJSHeapSize
        }
      });
    }

    // Collecter les métriques de timing qui ne sont pas déjà capturées par les observateurs
    const pageLoadTiming = performance.timing || {} as any;
    
    // Calculer les métriques de page load si disponibles
    if (pageLoadTiming.navigationStart) {
      this.logPerformanceEntry({
        type: PerformanceMetricType.PAGE_LOAD,
        name: 'page-load',
        duration: pageLoadTiming.loadEventEnd - pageLoadTiming.navigationStart,
        details: {
          url: window.location.href,
          referrer: document.referrer,
          connectTime: pageLoadTiming.connectEnd - pageLoadTiming.connectStart,
          requestTime: pageLoadTiming.responseEnd - pageLoadTiming.requestStart,
          renderTime: pageLoadTiming.domComplete - pageLoadTiming.domLoading,
          domContentLoaded: pageLoadTiming.domContentLoadedEventEnd - pageLoadTiming.navigationStart
        }
      });
    }
  }

  // Configuration du suivi des interactions
  private setupInteractionTracking(): void {
    try {
      // Mesurer First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Seulement prendre en compte la première interaction
          if (!this.webVitals.fid) {
            this.webVitals.fid = (entry as any).processingStart - entry.startTime;

            this.logPerformanceEntry({
              type: PerformanceMetricType.INTERACTION,
              name: 'first-input-delay',
              duration: this.webVitals.fid,
              details: { 
                inputType: (entry as any).name,
                processingTime: (entry as any).processingTime,
                startTime: entry.startTime
              }
            });
          }
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.warn('First Input Delay measurement not supported', e);
    }
  }

  // Enregistrer une entrée de performance
  private logPerformanceEntry(entry: Omit<PerformanceEntry, 'id' | 'timestamp' | 'session' | 'page'>): void {
    if (!this.config.enabled) {
      return;
    }

    const performanceEntry: PerformanceEntry = {
      id: generateUUID(),
      timestamp: getCurrentTimestamp(),
      session: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      ...entry
    };

    this.entries.push(performanceEntry);

    // Enregistrer dans le service d'analytique également
    analyticsService.trackEvent(AnalyticsEventType.FEATURE_USE, {
      feature: 'performance_monitoring',
      metric: entry.type,
      name: entry.name,
      duration: entry.duration
    });

    // Sauvegarder périodiquement
    if (this.entries.length % 5 === 0) {
      this.saveEntries();
    }
  }

  // Commencer à mesurer une API call
  public startApiCall(endpoint: string): string {
    const callId = generateUUID();
    this.apiTimers.set(callId, performance.now());
    return callId;
  }

  // Terminer la mesure d'une API call
  public endApiCall(callId: string, endpoint: string, status: number, success: boolean): void {
    const startTime = this.apiTimers.get(callId);
    if (!startTime) {
      return;
    }

    const duration = performance.now() - startTime;
    this.apiTimers.delete(callId);

    this.logPerformanceEntry({
      type: PerformanceMetricType.API_CALL,
      name: endpoint,
      duration,
      details: {
        status,
        success,
        endpoint
      }
    });
  }

  // Commencer à mesurer un timer personnalisé
  public startCustomTimer(name: string): void {
    this.customTimers.set(name, performance.now());
  }

  // Terminer un timer personnalisé
  public endCustomTimer(name: string, details?: Record<string, unknown>): void {
    const startTime = this.customTimers.get(name);
    if (!startTime) {
      return;
    }

    const duration = performance.now() - startTime;
    this.customTimers.delete(name);

    this.logPerformanceEntry({
      type: PerformanceMetricType.CUSTOM,
      name,
      duration,
      details
    });
  }

  // Mesurer un bloque de code avec une fonction wrapper
  public measureExecution<T>(name: string, func: () => T, details?: Record<string, unknown>): T {
    this.startCustomTimer(name);
    try {
      return func();
    } finally {
      this.endCustomTimer(name, details);
    }
  }

  // Mesurer un bloque de code asynchrone avec une fonction wrapper
  public async measureAsyncExecution<T>(name: string, func: () => Promise<T>, details?: Record<string, unknown>): Promise<T> {
    this.startCustomTimer(name);
    try {
      return await func();
    } finally {
      this.endCustomTimer(name, details);
    }
  }

  // Enregistrer une métrique personnalisée
  public logCustomMetric(name: string, duration: number, details?: Record<string, unknown>): void {
    this.logPerformanceEntry({
      type: PerformanceMetricType.CUSTOM,
      name,
      duration,
      details
    });
  }

  // Nettoyer les anciennes entrées
  private cleanOldEntries(): void {
    // Garder seulement le nombre d'entrées configuré
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }
    
    this.saveEntries();
  }

  // Charger la configuration
  private loadConfig(): PerformanceConfig {
    try {
      const storedConfig = secureLocalStorage.getItem<PerformanceConfig>('devinde-tracker-performance-config');
      
      if (storedConfig) {
        return storedConfig;
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration de performance:', error);
    }

    // Configuration par défaut
    return {
      enabled: true,
      sampleRate: 100, // Collecter pour 100% des utilisateurs par défaut
      collectResourceTiming: true,
      collectPaintTiming: true,
      collectNavigation: true,
      collectMemory: true,
      maxEntries: 1000
    };
  }

  // Sauvegarder la configuration
  private saveConfig(): void {
    try {
      secureLocalStorage.setItem('devinde-tracker-performance-config', this.config);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration de performance:', error);
    }
  }

  // Charger les entrées de performance
  private loadEntries(): PerformanceEntry[] {
    try {
      const storedEntries = secureLocalStorage.getItem<PerformanceEntry[]>(PERFORMANCE_STORAGE_KEY);
      return storedEntries || [];
    } catch (error) {
      console.error('Erreur lors du chargement des entrées de performance:', error);
      return [];
    }
  }

  // Sauvegarder les entrées de performance
  private saveEntries(): void {
    try {
      // Limiter le nombre d'entrées stockées
      if (this.entries.length > this.config.maxEntries) {
        this.entries = this.entries.slice(-this.config.maxEntries);
      }

      secureLocalStorage.setItem(PERFORMANCE_STORAGE_KEY, this.entries);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des entrées de performance:', error);
    }
  }

  // Obtenir les mesures Web Vitals actuelles
  public getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  // Obtenir toutes les entrées de performance
  public getEntries(): PerformanceEntry[] {
    return [...this.entries];
  }

  // Obtenir les entrées de performance filtrées par type
  public getEntriesByType(type: PerformanceMetricType): PerformanceEntry[] {
    return this.entries.filter(entry => entry.type === type);
  }

  // Obtenir les entrées de performance filtrées par nom
  public getEntriesByName(name: string): PerformanceEntry[] {
    return this.entries.filter(entry => entry.name === name);
  }

  // Activer ou désactiver le monitoring
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
  }

  // Obtenir la configuration actuelle
  public getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  // Mettre à jour la configuration
  public updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
    this.saveConfig();
  }

  // Vider les entrées de performance
  public clearEntries(): void {
    this.entries = [];
    this.saveEntries();
  }
}

// Exporter une instance par défaut pour faciliter l'utilisation
export const performanceService = PerformanceService.getInstance();
