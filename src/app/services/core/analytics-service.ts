/**
 * Analytics Service - DevIndé Tracker
 * 
 * Service responsable du suivi des interactions utilisateur et de la collecte
 * de données analytiques pour améliorer l'expérience utilisateur et les fonctionnalités.
 * Utilise localStorage pour le stockage local persistant des données.
 */

import { secureLocalStorage } from '../utils/security';
import { getCurrentTimestamp, generateUUID } from '../utils/helpers';

// Clé de stockage pour les données d'analytique
export const ANALYTICS_STORAGE_KEY = 'devinde-tracker-analytics';

// Types d'événements que nous suivons
export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  BUTTON_CLICK = 'button_click',
  FORM_SUBMIT = 'form_submit',
  PLAN_CREATE = 'plan_create',
  PLAN_UPDATE = 'plan_update',
  PLAN_DELETE = 'plan_delete',
  SECTION_COMPLETE = 'section_complete',
  ERROR = 'error',
  FEATURE_USE = 'feature_use'
}

// Interface pour un événement analytique
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: number;
  userId?: string;
  planId?: string;
  sectionId?: string;
  properties?: Record<string, unknown>;
  path?: string;
}

// Interface pour la configuration des analytiques
export interface AnalyticsConfig {
  enabled: boolean;
  anonymousId: string;
  sessionId: string;
  consentGiven: boolean;
  lastActive: number;
}

// Service d'analytiques
export class AnalyticsService {
  private static instance: AnalyticsService;
  private config: AnalyticsConfig;
  private events: AnalyticsEvent[] = [];
  private maxStoredEvents: number = 1000;
  private initialized: boolean = false;
  private flushInterval?: NodeJS.Timeout;

  private constructor() {
    this.config = this.loadConfig();
    this.events = this.loadEvents();
    this.initialize();
  }

  // Obtenir l'instance singleton
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Initialiser le service
  private initialize(): void {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') {
      return;
    }

    if (!this.initialized) {
      // Configurer l'intervalle pour sauvegarder régulièrement les événements (toutes les 5 minutes)
      this.flushInterval = setInterval(() => this.saveEvents(), 5 * 60 * 1000);

      // Écouter les changements de page
      if (typeof window !== 'undefined') {
        this.trackPageView();
        window.addEventListener('popstate', () => this.trackPageView());
      }

      this.initialized = true;
    }

    // Mettre à jour le timestamp de dernière activité
    this.updateLastActive();
  }

  // Charger la configuration
  private loadConfig(): AnalyticsConfig {
    try {
      const storedConfig = secureLocalStorage.getItem<AnalyticsConfig>('devinde-tracker-analytics-config');
      
      if (storedConfig) {
        return storedConfig;
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration analytique:', error);
    }

    // Configuration par défaut
    return {
      enabled: true,
      anonymousId: generateUUID(),
      sessionId: generateUUID(),
      consentGiven: false,
      lastActive: getCurrentTimestamp()
    };
  }

  // Sauvegarder la configuration
  private saveConfig(): void {
    try {
      secureLocalStorage.setItem('devinde-tracker-analytics-config', this.config);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration analytique:', error);
    }
  }

  // Charger les événements
  private loadEvents(): AnalyticsEvent[] {
    try {
      const storedEvents = secureLocalStorage.getItem<AnalyticsEvent[]>(ANALYTICS_STORAGE_KEY);
      return storedEvents || [];
    } catch (error) {
      console.error('Erreur lors du chargement des événements analytiques:', error);
      return [];
    }
  }

  // Sauvegarder les événements
  private saveEvents(): void {
    try {
      // Limiter le nombre d'événements stockés pour éviter de saturer le localStorage
      if (this.events.length > this.maxStoredEvents) {
        this.events = this.events.slice(-this.maxStoredEvents);
      }
      
      secureLocalStorage.setItem(ANALYTICS_STORAGE_KEY, this.events);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des événements analytiques:', error);
    }
  }

  // Mettre à jour le timestamp de dernière activité
  private updateLastActive(): void {
    this.config.lastActive = getCurrentTimestamp();
    this.saveConfig();
  }

  // Générer un nouvel ID de session si nécessaire (inactif depuis plus de 30 minutes)
  private checkAndUpdateSession(): void {
    const now = getCurrentTimestamp();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    
    if (now - this.config.lastActive > thirtyMinutesInMs) {
      this.config.sessionId = generateUUID();
      this.saveConfig();
    }
    
    this.updateLastActive();
  }

  // Suivre un événement générique
  public trackEvent(type: AnalyticsEventType, properties?: Record<string, unknown>, planId?: string, sectionId?: string): void {
    if (!this.config.enabled || !this.config.consentGiven) {
      return;
    }

    this.checkAndUpdateSession();

    const event: AnalyticsEvent = {
      id: generateUUID(),
      type,
      timestamp: getCurrentTimestamp(),
      userId: this.config.anonymousId,
      planId,
      sectionId,
      properties,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined
    };

    this.events.push(event);
    
    // Sauvegarder les événements si nous avons plus de 10 nouveaux événements
    if (this.events.length % 10 === 0) {
      this.saveEvents();
    }
  }

  // Suivre un affichage de page
  public trackPageView(properties?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.PAGE_VIEW, {
      ...properties,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      title: typeof document !== 'undefined' ? document.title : undefined
    });
  }

  // Suivre un clic sur un bouton
  public trackButtonClick(buttonId: string, buttonText?: string, properties?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.BUTTON_CLICK, {
      ...properties,
      buttonId,
      buttonText
    });
  }

  // Suivre une soumission de formulaire
  public trackFormSubmit(formId: string, formData?: Record<string, unknown>, properties?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.FORM_SUBMIT, {
      ...properties,
      formId,
      formData
    });
  }

  // Suivre la création d'un plan
  public trackPlanCreate(planId: string, planName?: string, properties?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.PLAN_CREATE, {
      ...properties,
      planName
    }, planId);
  }

  // Suivre la mise à jour d'un plan
  public trackPlanUpdate(planId: string, planName?: string, properties?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.PLAN_UPDATE, {
      ...properties,
      planName
    }, planId);
  }

  // Suivre la suppression d'un plan
  public trackPlanDelete(planId: string, planName?: string, properties?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.PLAN_DELETE, {
      ...properties,
      planName
    }, planId);
  }

  // Suivre la complétion d'une section
  public trackSectionComplete(planId: string, sectionId: string, sectionName?: string, properties?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.SECTION_COMPLETE, {
      ...properties,
      sectionName
    }, planId, sectionId);
  }

  // Suivre une erreur
  public trackError(errorMessage: string, errorCode?: string, properties?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.ERROR, {
      ...properties,
      errorMessage,
      errorCode
    });
  }

  // Suivre l'utilisation d'une fonctionnalité
  public trackFeatureUse(featureName: string, properties?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.FEATURE_USE, {
      ...properties,
      featureName
    });
  }

  // Activer ou désactiver les analytiques
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
  }

  // Définir le consentement utilisateur
  public setConsent(consent: boolean): void {
    this.config.consentGiven = consent;
    this.saveConfig();
    
    if (!consent) {
      // Si le consentement est retiré, supprimer toutes les données
      this.clearAllData();
    }
  }

  // Obtenir les événements analytiques pour l'analyse
  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  // Obtenir les événements filtrés par type
  public getEventsByType(type: AnalyticsEventType): AnalyticsEvent[] {
    return this.events.filter(event => event.type === type);
  }

  // Obtenir la configuration actuelle
  public getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  // Supprimer toutes les données analytiques
  public clearAllData(): void {
    this.events = [];
    this.saveEvents();
    
    // Régénérer un nouvel ID anonyme pour respecter la vie privée
    this.config.anonymousId = generateUUID();
    this.config.sessionId = generateUUID();
    this.saveConfig();
  }

  // Nettoyer lors de la destruction
  public cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Sauvegarder les événements avant de nettoyer
    this.saveEvents();
  }
}

// Exporter une instance par défaut pour faciliter l'utilisation
export const analyticsService = AnalyticsService.getInstance();
