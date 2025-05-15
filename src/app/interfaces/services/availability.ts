/**
 * Interfaces pour la gestion des disponibilités de services
 * 
 * Ce fichier définit les interfaces standardisées pour gérer les disponibilités
 * des services, incluant les plages horaires, les périodes de blocage et la
 * capacité de travail.
 * 
 * @version 1.0
 * @standardized true
 */

import { ServiceType } from './service-catalog';

/**
 * Enum pour les statuts de disponibilité
 */
export enum AvailabilityStatus {
  AVAILABLE = 'available',
  PARTIALLY_AVAILABLE = 'partially_available',
  UNAVAILABLE = 'unavailable',
  HOLIDAY = 'holiday'
}

/**
 * Enum pour les types de blocage
 */
export enum BlockingType {
  CLIENT_WORK = 'client_work',
  PERSONAL = 'personal',
  HOLIDAY = 'holiday',
  ADMINISTRATIVE = 'administrative',
  TRAINING = 'training',
  OTHER = 'other'
}

/**
 * Interface de base pour les règles de disponibilité
 */
export interface AvailabilityRule {
  id: string;
  name: string;
  priority: number; // Plus le nombre est élevé, plus la priorité est haute
  isActive: boolean;
}

/**
 * Règle de disponibilité hebdomadaire récurrente
 */
export interface WeeklyAvailabilityRule extends AvailabilityRule {
  type: 'weekly';
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Dimanche, 6 = Samedi
  startTime: string; // Format "HH:MM", ex: "09:00"
  endTime: string; // Format "HH:MM", ex: "17:00"
  serviceTypes?: ServiceType[]; // Si vide, s'applique à tous les types
}

/**
 * Règle de disponibilité pour une plage de dates spécifique
 */
export interface DateRangeAvailabilityRule extends AvailabilityRule {
  type: 'dateRange';
  startDate: string; // Format ISO, ex: "2023-01-01"
  endDate: string; // Format ISO, ex: "2023-01-07"
  startTime?: string; // Si absent, toute la journée
  endTime?: string;
  status: AvailabilityStatus;
  reason?: string;
  blockingType?: BlockingType;
  serviceTypes?: ServiceType[]; // Si vide, s'applique à tous les types
}

/**
 * Union type pour toutes les règles de disponibilité
 */
export type AvailabilityRuleType = 
  | WeeklyAvailabilityRule
  | DateRangeAvailabilityRule;

/**
 * Capacité de travail par type de service
 */
export interface ServiceCapacity {
  serviceType: ServiceType;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  maxClientsPerMonth: number;
}

/**
 * Plage horaire disponible calculée
 */
export interface AvailableTimeSlot {
  date: string; // Format ISO, ex: "2023-01-01"
  startTime: string; // Format "HH:MM", ex: "09:00"
  endTime: string; // Format "HH:MM", ex: "12:00"
  duration: number; // En minutes
  serviceTypes: ServiceType[];
}

/**
 * Période de blocage (non disponible)
 */
export interface BlockedTimeSlot {
  id: string;
  startDate: string; // Format ISO avec heure, ex: "2023-01-01T09:00:00"
  endDate: string; // Format ISO avec heure, ex: "2023-01-01T17:00:00"
  title: string;
  description?: string;
  blockingType: BlockingType;
  isRecurring?: boolean;
  recurringPattern?: string;
  serviceTypes?: ServiceType[]; // Si null, bloque tous les types
}

/**
 * Interfaces côté UI
 */

/**
 * Disponibilité d'une journée pour l'affichage dans un calendrier
 */
export interface UIDayAvailability {
  date: string; // Format ISO, ex: "2023-01-01"
  status: AvailabilityStatus;
  availableHours: number;
  availableSlots: AvailableTimeSlot[];
  blockedSlots: BlockedTimeSlot[];
}

/**
 * Disponibilité sur une plage de dates
 */
export interface UIDateRangeAvailability {
  startDate: string; // Format ISO, ex: "2023-01-01"
  endDate: string; // Format ISO, ex: "2023-01-31"
  days: UIDayAvailability[];
  summary: {
    totalAvailableHours: number;
    fullyAvailableDays: number;
    partiallyAvailableDays: number;
    unavailableDays: number;
  };
}

/**
 * Configuration de disponibilité pour l'UI
 */
export interface UIAvailabilitySettings {
  defaultWeeklyRules: WeeklyAvailabilityRule[];
  customRules: AvailabilityRuleType[];
  blockedPeriods: BlockedTimeSlot[];
  serviceCapacities: ServiceCapacity[];
}

/**
 * Interfaces côté Service
 */

/**
 * Données de disponibilité pour la couche service
 */
export interface ServiceAvailabilityData {
  availabilityRules: AvailabilityRuleType[];
  blockedPeriods: BlockedTimeSlot[];
  serviceCapacities: ServiceCapacity[];
  businessPlanId: string;
}

/**
 * Résultat du calcul de disponibilité
 */
export interface ServiceAvailabilityResult {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  availableDays: UIDayAvailability[];
  blockedPeriods: BlockedTimeSlot[];
}