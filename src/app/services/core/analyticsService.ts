/**
 * Analytics Service - DevIndé Tracker
 * 
 * Service responsable du suivi des interactions utilisateur et de la collecte
 * de données analytiques pour améliorer l'expérience utilisateur et les fonctionnalités.
 * Utilise localStorage pour le stockage local persistant des données.
 */

import { secureLocalStorage } from "@/app/services/utils/security";
import { getCurrentTimestamp, generateUUID } from "@/app/services/utils/helpers";

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
  anonymousId: string;
  sessionId: string;
  properties?: Record<string, unknown>;
  planId?: string;
  sectionId?: string;
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
class AnalyticsService {
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

  /**
   * Obtenir l'instance singleton
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialiser le service
   */
  private initialize(): void {
    if (this.initialized) return;

    // Générer un ID anonyme si nécessaire
    if (!this.config.anonymousId) {
      this.config.anonymousId = generateUUID();
      this.saveConfig();
    }

    // Générer un ID de session si nécessaire
    if (!this.config.sessionId) {
      this.config.sessionId = generateUUID();
      this.saveConfig();
    }

    // Mettre à jour la dernière activité
    this.updateLastActive();

    // Configurer un intervalle pour sauvegarder les événements
    this.flushInterval = setInterval(() => {
      this.saveEvents();
    }, 60000); // Sauvegarder toutes les minutes

    this.initialized = true;
  }

  /**
   * Charger la configuration
   */
  private loadConfig(): AnalyticsConfig {
    try {
      const storedConfig = secureLocalStorage.getItem('analytics-config');
      if (storedConfig) {
        // Vérifier si storedConfig est déjà un objet ou une chaîne
        if (typeof storedConfig === 'string') {
          return JSON.parse(storedConfig);
        } else if (typeof storedConfig === 'object') {
          // Si c'est déjà un objet, le retourner directement
          return storedConfig as AnalyticsConfig;
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration analytics:', error);
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

  /**
   * Sauvegarder la configuration
   */
  private saveConfig(): void {
    try {
      secureLocalStorage.setItem('analytics-config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration analytics:', error);
    }
  }

  /**
   * Charger les événements
   */
  private loadEvents(): AnalyticsEvent[] {
    try {
      const storedEvents = secureLocalStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (storedEvents) {
        // Vérifier si storedEvents est déjà un objet ou une chaîne
        if (typeof storedEvents === 'string') {
          return JSON.parse(storedEvents);
        } else if (Array.isArray(storedEvents)) {
          // Si c'est déjà un tableau, le retourner directement
          return storedEvents as AnalyticsEvent[];
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements analytics:', error);
    }

    return [];
  }

  /**
   * Sauvegarder les événements
   */
  private saveEvents(): void {
    try {
      // Limiter le nombre d'événements stockés
      if (this.events.length > this.maxStoredEvents) {
        this.events = this.events.slice(-this.maxStoredEvents);
      }
      
      secureLocalStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des événements analytics:', error);
    }
  }

  /**
   * Mettre à jour le timestamp de dernière activité
   */
  private updateLastActive(): void {
    this.config.lastActive = getCurrentTimestamp();
    this.saveConfig();
  }

  /**
   * Générer un nouvel ID de session si nécessaire (inactif depuis plus de 30 minutes)
   */
  private checkAndUpdateSession(): void {
    const thirtyMinutesInMs = 30 * 60 * 1000;
    const currentTime = getCurrentTimestamp();
    
    if (currentTime - this.config.lastActive > thirtyMinutesInMs) {
      // Créer une nouvelle session après 30 minutes d'inactivité
      this.config.sessionId = generateUUID();
      this.saveConfig();
    }
    
    this.updateLastActive();
  }

  /**
   * Suivre un événement générique
   */
  public trackEvent(
    type: AnalyticsEventType,
    properties?: Record<string, unknown>,
    planId?: string,
    sectionId?: string
  ): void {
    if (!this.config.enabled || !this.config.consentGiven) {
      return;
    }

    this.checkAndUpdateSession();

    const event: AnalyticsEvent = {
      id: generateUUID(),
      type,
      timestamp: getCurrentTimestamp(),
      anonymousId: this.config.anonymousId,
      sessionId: this.config.sessionId,
      properties,
      planId,
      sectionId
    };

    this.events.push(event);
    
    // Sauvegarder immédiatement pour les événements importants
    if (
      type === AnalyticsEventType.ERROR ||
      type === AnalyticsEventType.PLAN_CREATE ||
      type === AnalyticsEventType.PLAN_DELETE
    ) {
      this.saveEvents();
    }
  }

  /**
   * Suivre un affichage de page
   */
  public trackPageView(properties?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.PAGE_VIEW, properties);
  }

  /**
   * Suivre un clic sur un bouton
   */
  public trackButtonClick(
    buttonId: string,
    buttonText?: string,
    properties?: Record<string, unknown>
  ): void {
    this.trackEvent(AnalyticsEventType.BUTTON_CLICK, {
      buttonId,
      buttonText,
      ...properties
    });
  }

  /**
   * Suivre une soumission de formulaire
   */
  public trackFormSubmit(
    formId: string,
    formData?: Record<string, unknown>,
    properties?: Record<string, unknown>
  ): void {
    this.trackEvent(AnalyticsEventType.FORM_SUBMIT, {
      formId,
      formData,
      ...properties
    });
  }

  /**
   * Suivre la création d'un plan
   */
  public trackPlanCreate(
    planId: string,
    planName?: string,
    properties?: Record<string, unknown>
  ): void {
    this.trackEvent(
      AnalyticsEventType.PLAN_CREATE,
      {
        planName,
        ...properties
      },
      planId
    );
  }

  /**
   * Suivre la mise à jour d'un plan
   */
  public trackPlanUpdate(
    planId: string,
    planName?: string,
    properties?: Record<string, unknown>
  ): void {
    this.trackEvent(
      AnalyticsEventType.PLAN_UPDATE,
      {
        planName,
        ...properties
      },
      planId
    );
  }

  /**
   * Suivre la suppression d'un plan
   */
  public trackPlanDelete(
    planId: string,
    planName?: string,
    properties?: Record<string, unknown>
  ): void {
    this.trackEvent(
      AnalyticsEventType.PLAN_DELETE,
      {
        planName,
        ...properties
      },
      planId
    );
  }

  /**
   * Suivre la complétion d'une section
   */
  public trackSectionComplete(
    planId: string,
    sectionId: string,
    sectionName?: string,
    properties?: Record<string, unknown>
  ): void {
    this.trackEvent(
      AnalyticsEventType.SECTION_COMPLETE,
      {
        sectionName,
        ...properties
      },
      planId,
      sectionId
    );
  }

  /**
   * Suivre une erreur
   */
  public trackError(
    errorMessage: string,
    errorCode?: string,
    properties?: Record<string, unknown>
  ): void {
    this.trackEvent(AnalyticsEventType.ERROR, {
      errorMessage,
      errorCode,
      ...properties
    });
  }

  /**
   * Suivre l'utilisation d'une fonctionnalité
   */
  public trackFeatureUse(
    featureName: string,
    properties?: Record<string, unknown>
  ): void {
    this.trackEvent(AnalyticsEventType.FEATURE_USE, {
      featureName,
      ...properties
    });
  }

  /**
   * Activer ou désactiver les analytiques
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
  }

  /**
   * Définir le consentement utilisateur
   */
  public setConsent(consent: boolean): void {
    this.config.consentGiven = consent;
    this.saveConfig();
  }

  /**
   * Obtenir les événements analytiques pour l'analyse
   */
  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Obtenir les événements filtrés par type
   */
  public getEventsByType(type: AnalyticsEventType): AnalyticsEvent[] {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Obtenir la configuration actuelle
   */
  public getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Supprimer toutes les données analytiques
   */
  public clearAllData(): void {
    this.events = [];
    this.saveEvents();
  }

  /**
   * Nettoyer lors de la destruction
   */
  public cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.saveEvents();
  }
}

// Exporter une instance par défaut pour faciliter l'utilisation
export const analyticsService = AnalyticsService.getInstance();
