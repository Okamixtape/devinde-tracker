/**
 * Interfaces pour le catalogue de services
 * 
 * Ce fichier définit les interfaces standardisées pour gérer le catalogue
 * de services, incluant les types de services, les catégories, et les tarifs.
 * Il suit le pattern de séparation UI/Service établi dans le projet.
 * 
 * @version 1.0
 * @standardized true
 */

/**
 * Enum pour les types de services
 */
export enum ServiceType {
  DEVELOPMENT = 'development',
  DESIGN = 'design',
  CONSULTING = 'consulting',
  TRAINING = 'training',
  MAINTENANCE = 'maintenance',
  SUPPORT = 'support',
  OTHER = 'other'
}

/**
 * Enum pour les types de tarification
 */
export enum PricingType {
  HOURLY = 'hourly',
  FIXED = 'fixed',
  RECURRING = 'recurring',
  CUSTOM = 'custom'
}

/**
 * Interface de base pour un service
 */
interface BaseService {
  id: string;
  name: string;
  description: string;
  type: ServiceType;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service avec tarification horaire
 */
export interface HourlyPricedService extends BaseService {
  pricingType: PricingType.HOURLY;
  hourlyRate: number;
  minimumHours?: number;
  discountThresholds?: {
    hours: number;
    discountPercentage: number;
  }[];
}

/**
 * Service avec prix fixe
 */
export interface FixedPricedService extends BaseService {
  pricingType: PricingType.FIXED;
  price: number;
  estimatedHours?: number;
  deliverables: string[];
  estimatedTimeframe?: string;
}

/**
 * Service avec paiement récurrent
 */
export interface RecurringPricedService extends BaseService {
  pricingType: PricingType.RECURRING;
  price: number;
  billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  minimumCommitment?: number; // En cycles
  includedItems: string[];
}

/**
 * Service avec tarification personnalisée
 */
export interface CustomPricedService extends BaseService {
  pricingType: PricingType.CUSTOM;
  priceRange?: {
    min: number;
    max: number;
  };
  pricingFactors: string[];
  requiresConsultation: boolean;
}

/**
 * Type union pour tous les types de services
 */
export type Service = 
  | HourlyPricedService
  | FixedPricedService
  | RecurringPricedService
  | CustomPricedService;

/**
 * Interface pour la catégorie de service
 */
export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  order: number;
}

/**
 * Interfaces côté UI
 */

/**
 * Forme simplifiée d'un service pour l'affichage en liste
 */
export interface UIServiceListItem {
  id: string;
  name: string;
  type: ServiceType;
  category: string;
  pricingType: PricingType;
  price: string; // Formaté pour affichage, ex: "50€/h" ou "1000-2000€"
  isActive: boolean;
}

/**
 * Forme complète d'un service pour l'édition
 */
export interface UIService extends Omit<Service, 'createdAt' | 'updatedAt'> {
  pricing: {
    type: PricingType;
    hourlyRate?: number;
    fixedPrice?: number;
    recurringPrice?: number;
    priceRange?: {
      min: number;
      max: number;
    };
  };
}

/**
 * Catalogue complet des services pour l'UI
 */
export interface UIServiceCatalog {
  services: UIServiceListItem[];
  categories: ServiceCategory[];
  stats: {
    activeServicesCount: number;
    categoriesCount: number;
    averageHourlyRate?: number;
  };
}

/**
 * Interfaces côté Service
 */

/**
 * Données de service pour la couche service
 */
export interface ServiceServiceData {
  services: Service[];
  categories: ServiceCategory[];
}

/**
 * Interface pour le service de catalogue
 */
export interface ServiceCatalogServiceData {
  services: Service[];
  categories: ServiceCategory[];
  businessPlanId: string;
}