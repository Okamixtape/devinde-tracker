/**
 * Types communs pour DevIndé Tracker
 * 
 * Ce fichier définit les types et énumérations qui sont utilisés
 * à travers plusieurs fonctionnalités de l'application.
 * 
 * @version 1.0
 */

/**
 * Niveaux de priorité utilisés dans toute l'application
 */
export enum PriorityLevel {
  /** Priorité faible */
  LOW = 'low',
  /** Priorité moyenne */
  MEDIUM = 'medium',
  /** Priorité élevée */
  HIGH = 'high',
  /** Priorité urgente */
  URGENT = 'urgent'
}

/**
 * Types de statut pour les éléments actionnables
 */
export enum ItemStatus {
  /** Élément planifié mais pas encore commencé */
  PLANNED = 'planned',
  /** Élément en cours de réalisation */
  IN_PROGRESS = 'in-progress',
  /** Élément terminé avec succès */
  COMPLETED = 'completed',
  /** Élément annulé */
  CANCELLED = 'cancelled',
  /** Élément en retard par rapport à sa planification */
  DELAYED = 'delayed'
}

/**
 * Échelles de mesure communes
 */
export enum MeasurementScale {
  /** Niveau faible */
  LOW = 'low',
  /** Niveau moyen */
  MEDIUM = 'medium',
  /** Niveau élevé */
  HIGH = 'high',
  /** Niveau très élevé */
  VERY_HIGH = 'very-high'
}

/**
 * Périodes temporelles pour les projections et la planification
 */
export enum TimeFrame {
  /** Court terme (0-3 mois) */
  SHORT_TERM = 'short-term',
  /** Moyen terme (3-12 mois) */
  MEDIUM_TERM = 'medium-term',
  /** Long terme (1-5 ans) */
  LONG_TERM = 'long-term'
}

/**
 * Représente une période de dates
 */
export interface DateRange {
  /** Date de début (format ISO) */
  start: string;
  /** Date de fin (format ISO) */
  end: string;
}

/**
 * Types de devise
 */
export enum CurrencyType {
  EUR = '€',
  USD = '$',
  GBP = '£',
  CHF = 'CHF',
  CAD = 'CAD'
}

/**
 * Fréquences de paiement ou de facturation
 */
export enum BillingFrequency {
  /** Mensuel */
  MONTHLY = 'monthly',
  /** Trimestriel */
  QUARTERLY = 'quarterly',
  /** Semestriel */
  BIANNUAL = 'biannual',
  /** Annuel */
  ANNUAL = 'annual'
}