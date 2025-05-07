/**
 * Performance Monitoring Service - DevIndé Tracker
 * 
 * Service responsable du suivi et de l'analyse des performances côté client.
 * Utilise l'API Web Performance et stocke les données dans localStorage.
 */

import { secureLocalStorage } from "@/app/services/utils/security";
import { getCurrentTimestamp, generateUUID } from "@/app/services/utils/helpers";
import { analyticsService, AnalyticsEventType } from './analyticsService';

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
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  FCP?: number; // First Contentful Paint
  TTI?: number; // Time to Interactive
}

// Service de monitoring de performance
class PerformanceService {
  private static instance: PerformanceService;
  private entries: PerformanceEntry[] = [];
  private config: PerformanceConfig;
  private observer?: PerformanceObserver;
  private apiTimers: Map<string, number> = new Map();
  private customTimers: Map<string, number> = new Map();
  private initialized: boolean = false;
  private webVitals: WebVitals = {};
  private sessionId: string;
  private metaData: Map<string, unknown> = new Map();

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
    if (this.initialized || typeof window === 'undefined' || typeof performance === 'undefined') {
      return;
    }

    // Configuration des observers de performance
    if (this.config.enabled) {
      this.setupPerformanceObservers();
      this.capturePageLoad();
      this.setupInteractionTracking();
    }

    this.initialized = true;

    // Analytique pour l'initialisation du service
    analyticsService.trackEvent(AnalyticsEventType.FEATURE_USE, {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent
    });
  }

  // Configuration des observateurs de performance
  private setupPerformanceObservers(): void {
    if (typeof PerformanceObserver === 'undefined') {
      return;
    }

    try {
      // Observer pour les perf entries de type 'paint' (FP, FCP)
      if (this.config.collectPaintTiming) {
        const paintObserver = new PerformanceObserver((entries) => {
          entries.getEntries().forEach((entry) => {
            // Filter uniquement les entrées FP et FCP
            if (entry.name === 'first-paint' || entry.name === 'first-contentful-paint') {
              this.logPerformanceEntry({
                type: PerformanceMetricType.PAINT,
                name: entry.name,
                duration: entry.startTime,
                details: {
                  entryType: entry.entryType,
                  startTime: entry.startTime
                }
              });

              // Mettre à jour les Web Vitals
              if (entry.name === 'first-contentful-paint') {
                this.webVitals.FCP = entry.startTime;
              }
            }
          });
        });
        paintObserver.observe({ type: 'paint', buffered: true });
      }

      // Observer pour les perf entries de type 'navigation'
      if (this.config.collectNavigation) {
        const navigationObserver = new PerformanceObserver((entries) => {
          entries.getEntries().forEach((entry) => {
            const navEntry = entry as PerformanceNavigationTiming;
            
            this.logPerformanceEntry({
              type: PerformanceMetricType.NAVIGATION,
              name: 'navigation',
              duration: navEntry.loadEventEnd - navEntry.startTime,
              details: {
                domComplete: navEntry.domComplete,
                domContentLoadedEventEnd: navEntry.domContentLoadedEventEnd,
                domContentLoadedEventStart: navEntry.domContentLoadedEventStart,
                domInteractive: navEntry.domInteractive,
                loadEventEnd: navEntry.loadEventEnd,
                loadEventStart: navEntry.loadEventStart,
                redirectCount: navEntry.redirectCount,
                type: navEntry.type,
                unloadEventEnd: navEntry.unloadEventEnd,
                unloadEventStart: navEntry.unloadEventStart,
                nextHopProtocol: navEntry.nextHopProtocol,
                redirectTime: navEntry.redirectEnd - navEntry.redirectStart,
                dnsTime: navEntry.domainLookupEnd - navEntry.domainLookupStart,
                connectTime: navEntry.connectEnd - navEntry.connectStart,
                requestTime: navEntry.responseStart - navEntry.requestStart,
                responseTime: navEntry.responseEnd - navEntry.responseStart,
                domProcessingTime: navEntry.domComplete - navEntry.responseEnd,
                ttfb: navEntry.responseStart - navEntry.requestStart
              }
            });

            // Mettre à jour TTFB dans les Web Vitals
            this.webVitals.TTFB = navEntry.responseStart - navEntry.requestStart;
          });
        });
        navigationObserver.observe({ type: 'navigation', buffered: true });
      }

      // Observer pour les perf entries de type 'resource'
      if (this.config.collectResourceTiming) {
        const resourceObserver = new PerformanceObserver((entries) => {
          entries.getEntries().forEach((entry) => {
            // Cast to PerformanceResourceTiming to access initiatorType
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Si l'entrée ne contient pas initiatorType, ne pas la traiter
            if (!resourceEntry.initiatorType) return;
            
            // Ne pas traiter les ressources si elles ne sont pas pertinentes
            const initiatorType = resourceEntry.initiatorType;
            if (initiatorType === 'beacon' || initiatorType === 'fetch' || initiatorType === 'xmlhttprequest') {
              return; // Les appels API sont déjà capturés par une autre méthode
            }

            // Note: Entry was already cast to PerformanceResourceTiming above
            
            this.logPerformanceEntry({
              type: PerformanceMetricType.RESOURCE_LOAD,
              name: entry.name,
              duration: entry.duration,
              details: {
                entryType: entry.entryType,
                initiatorType,
                startTime: entry.startTime,
                responseEnd: resourceEntry.responseEnd
              }
            });
          });
        });
        resourceObserver.observe({ type: 'resource', buffered: true });
      }

      // Observer pour Largest Contentful Paint (LCP) - Core Web Vital
      const lcpObserver = new PerformanceObserver((entries) => {
        const lastEntry = entries.getEntries().pop();
        if (lastEntry) {
          this.webVitals.LCP = lastEntry.startTime;
          
          this.logPerformanceEntry({
            type: PerformanceMetricType.PAINT,
            name: 'largest-contentful-paint',
            duration: lastEntry.startTime,
            details: {
              element: 'element' in lastEntry && lastEntry.element ? (lastEntry.element as { tagName: string }).tagName : null,
              size: 'size' in lastEntry ? (lastEntry.size as number) : 0
            }
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // Observer pour Cumulative Layout Shift (CLS) - Core Web Vital
      const clsObserver = new PerformanceObserver((entries) => {
        let cumulativeLayoutShift = 0;
        
        entries.getEntries().forEach((entry) => {
          // Cast to LayoutShift which is part of the Web API
          interface LayoutShift extends PerformanceEntry {
            hadRecentInput: boolean;
            value: number;
          }
          
          // First cast to unknown, then to LayoutShift to avoid direct conversion errors
          const layoutShift = entry as unknown as LayoutShift;
          if (!layoutShift.hadRecentInput) {
            cumulativeLayoutShift += layoutShift.value || 0;
          }
        });
        
        this.webVitals.CLS = cumulativeLayoutShift;
        
        this.logPerformanceEntry({
          type: PerformanceMetricType.PAINT,
          name: 'cumulative-layout-shift',
          duration: 0, // CLS n'a pas de durée à proprement parler
          details: {
            value: cumulativeLayoutShift
          }
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Recueillir des données de mémoire à intervalles réguliers
      // Chrome-specific memory API
      interface PerformanceMemory {
        jsHeapSizeLimit: number;
        totalJSHeapSize: number;
        usedJSHeapSize: number;
      }
      
      interface PerformanceWithMemory extends Performance {
        memory?: PerformanceMemory;
      }
      
      if (this.config.collectMemory && (performance as PerformanceWithMemory).memory) {
        setInterval(() => {
          const memory = (performance as PerformanceWithMemory).memory!;
          
          this.logPerformanceEntry({
            type: PerformanceMetricType.MEMORY,
            name: 'memory-usage',
            duration: 0, // La mémoire n'a pas de durée
            details: {
              jsHeapSizeLimit: memory.jsHeapSizeLimit,
              totalJSHeapSize: memory.totalJSHeapSize,
              usedJSHeapSize: memory.usedJSHeapSize,
              usageRatio: memory.usedJSHeapSize / memory.jsHeapSizeLimit
            }
          });
        }, 30000); // Toutes les 30 secondes
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des observateurs de performance:', error);
    }
  }

  // Capture des performances de chargement de page
  private capturePageLoad(): void {
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return;
    }

    // Utiliser requestAnimationFrame pour s'assurer que la page est rendue
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigationTiming) {
          const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.startTime;
          
          this.logPerformanceEntry({
            type: PerformanceMetricType.PAGE_LOAD,
            name: window.location.pathname,
            duration: pageLoadTime,
            details: {
              url: window.location.href,
              referrer: document.referrer,
              navigationTiming: {
                dns: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
                tcp: navigationTiming.connectEnd - navigationTiming.connectStart,
                ttfb: navigationTiming.responseStart - navigationTiming.requestStart,
                download: navigationTiming.responseEnd - navigationTiming.responseStart,
                domProcessing: navigationTiming.domComplete - navigationTiming.responseEnd
              }
            }
          });
          
          // Analytique pour le chargement de page
          analyticsService.trackEvent(AnalyticsEventType.FEATURE_USE, {
            pageLoadTime,
            url: window.location.href
          });
        }
      });
    });
  }

  // Configuration du suivi des interactions
  private setupInteractionTracking(): void {
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return;
    }

    // Observer pour First Input Delay (FID) - Core Web Vital
    try {
      const fidObserver = new PerformanceObserver((entries) => {
        const firstInput = entries.getEntries()[0];
        if (firstInput) {
          // Cast to PerformanceEventTiming to access processingStart
          const firstInputTiming = firstInput as PerformanceEventTiming;
          const delay = firstInputTiming.processingStart! - firstInput.startTime;
          
          this.webVitals.FID = delay;
          
          this.logPerformanceEntry({
            type: PerformanceMetricType.INTERACTION,
            name: 'first-input-delay',
            duration: delay,
            details: {
              inputType: 'name' in firstInput ? (firstInput as { name: string }).name : 'unknown',
              startTime: firstInput.startTime,
              target: 'target' in firstInput && (firstInput as { target?: { tagName: string } }).target ? 
                (firstInput as { target: { tagName: string } }).target.tagName : null
            }
          });
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      console.error('Erreur lors du suivi des interactions:', error);
    }
  }

  // Enregistrer une entrée de performance
  public logPerformanceEntry(entry: Omit<PerformanceEntry, 'id' | 'timestamp' | 'session' | 'page'>): void {
    if (!this.config.enabled) {
      return;
    }

    // Appliquer l'échantillonnage si configuré
    if (Math.random() * 100 > this.config.sampleRate) {
      return;
    }

    // Nettoyer les anciennes entrées si nécessaire
    this.cleanOldEntries();

    const fullEntry: PerformanceEntry = {
      id: generateUUID(),
      timestamp: getCurrentTimestamp(),
      session: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      ...entry
    };

    this.entries.push(fullEntry);

    // Sauvegarder les entrées
    this.saveEntries();
  }

  // Commencer à mesurer une API call
  public startApiCall(endpoint: string): string {
    const callId = generateUUID();
    this.apiTimers.set(callId, performance.now());
    // Enregistrer l'endpoint pour des analyses futures
    this.recordApiEndpoint(callId, endpoint);
    return callId;
  }
  
  // Enregistrer l'endpoint pour des analyses futures (structure préparée pour des améliorations)
  private recordApiEndpoint(callId: string, endpoint: string): void {
    // Simplement stocker pour l'instant, cela permettra d'analyser les performances par endpoint plus tard
    if (!this.metaData.has('apiEndpoints')) {
      this.metaData.set('apiEndpoints', new Map<string, string>());
    }
    const endpointMap = this.metaData.get('apiEndpoints') as Map<string, string>;
    endpointMap.set(callId, endpoint);
  }

  // Terminer la mesure d'une API call
  public endApiCall(callId: string, endpoint: string, status: number, success: boolean): void {
    if (!this.apiTimers.has(callId)) {
      return;
    }

    const startTime = this.apiTimers.get(callId)!;
    const duration = performance.now() - startTime;
    
    this.apiTimers.delete(callId);
    
    this.logPerformanceEntry({
      type: PerformanceMetricType.API_CALL,
      name: endpoint,
      duration,
      details: {
        status,
        success,
        url: endpoint
      }
    });
  }

  // Commencer à mesurer un timer personnalisé
  public startCustomTimer(name: string): void {
    this.customTimers.set(name, performance.now());
  }

  // Terminer un timer personnalisé
  public endCustomTimer(name: string, details?: Record<string, unknown>): void {
    if (!this.customTimers.has(name)) {
      return;
    }

    const startTime = this.customTimers.get(name)!;
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
  public async measureAsyncExecution<T>(
    name: string,
    func: () => Promise<T>,
    details?: Record<string, unknown>
  ): Promise<T> {
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
    if (this.entries.length > this.config.maxEntries) {
      // Trier par timestamp croissant (plus ancien en premier)
      this.entries.sort((a, b) => a.timestamp - b.timestamp);
      
      // Garder seulement les plus récentes
      this.entries = this.entries.slice(this.entries.length - this.config.maxEntries);
    }
  }

  // Charger la configuration
  private loadConfig(): PerformanceConfig {
    try {
      const storedConfig = secureLocalStorage.getItem('devinde-tracker-performance-config');
      
      if (storedConfig) {
        // Check if storedConfig is already an object or a string that needs to be parsed
        return typeof storedConfig === 'string' ? JSON.parse(storedConfig) as PerformanceConfig : storedConfig as PerformanceConfig;
      }
    } catch (e) {
      console.warn('Failed to load performance config:', e);
    }
    
    return {
      enabled: true,
      sampleRate: 100, // 100% par défaut
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
      secureLocalStorage.setItem('devinde-tracker-performance-config', JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to save performance config:', e);
    }
  }

  // Charger les entrées de performance
  private loadEntries(): PerformanceEntry[] {
    try {
      const storedEntries = secureLocalStorage.getItem(PERFORMANCE_STORAGE_KEY);
      
      if (storedEntries) {
        // Check if storedEntries is already an object or a string that needs to be parsed
        return typeof storedEntries === 'string' ? JSON.parse(storedEntries) as PerformanceEntry[] : storedEntries as PerformanceEntry[];
      }
    } catch (e) {
      console.warn('Failed to load stored performance entries:', e);
    }
    
    return [];
  }

  // Sauvegarder les entrées de performance
  private saveEntries(): void {
    try {
      secureLocalStorage.setItem(PERFORMANCE_STORAGE_KEY, JSON.stringify(this.entries));
    } catch (e) {
      console.warn('Failed to save performance entries:', e);
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
    
    // Si on active et que le service n'est pas encore initialisé, l'initialiser
    if (enabled && !this.initialized) {
      this.initialize();
    }
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

export default performanceService;
