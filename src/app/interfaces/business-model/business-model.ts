/**
 * BusinessModel Interfaces - Interfaces TypeScript pour le modèle économique
 * 
 * Ce fichier définit les interfaces pour le Business Model Canvas
 * et les modèles de données associés.
 * 
 * @version 1.0
 */

import { BaseModel, ServiceModel, UIModel } from '../common/base-models';
import { PriorityLevel, CurrencyType } from '../common/common-types';

/**
 * Types de sources de revenus
 */
export enum RevenueSourceType {
  /** Tarification horaire */
  HOURLY = 'hourly',
  /** Forfaits et packages */
  PACKAGE = 'package',
  /** Abonnements récurrents */
  SUBSCRIPTION = 'subscription',
  /** Tarification personnalisée */
  CUSTOM = 'custom'
}

/**
 * Élément générique du Business Model Canvas (UI)
 */
export interface UICanvasItem extends UIModel {
  /** Nom de l'élément */
  name: string;
  /** Description détaillée */
  description: string;
  /** Niveau de priorité */
  priority: PriorityLevel;
  /** Couleur associée pour l'affichage */
  color?: string;
}

/**
 * Élément générique du Business Model Canvas (Service)
 */
export interface ServiceCanvasItem extends ServiceModel {
  /** Nom de l'élément */
  name: string;
  /** Description détaillée */
  description?: string;
  /** Niveau de priorité (stocké comme chaîne de caractères) */
  priority?: string;
}

/**
 * Structure complète du Business Model Canvas (UI)
 */
export interface UIBusinessModelCanvas {
  /** Partenaires clés */
  partners: UICanvasItem[];
  /** Activités clés */
  activities: UICanvasItem[];
  /** Ressources clés */
  resources: UICanvasItem[];
  /** Propositions de valeur */
  valueProposition: UICanvasItem[];
  /** Relations clients */
  customerRelations: UICanvasItem[];
  /** Canaux de distribution */
  channels: UICanvasItem[];
  /** Segments de clientèle */
  segments: UICanvasItem[];
  /** Structure de coûts */
  costStructure: UICanvasItem[];
  /** Sources de revenus */
  revenueStreams: UICanvasItem[];
}

/**
 * Structure complète du Business Model Canvas (Service)
 * Cette interface étend le modèle de données service existant
 */
export interface ServiceBusinessModelCanvas {
  /** Partenaires clés */
  partners?: ServiceCanvasItem[];
  /** Activités clés */
  activities?: ServiceCanvasItem[];
  /** Ressources clés */
  resources?: ServiceCanvasItem[];
  /** Propositions de valeur */
  valuePropositions?: ServiceCanvasItem[];
  /** Relations clients */
  customerRelations?: ServiceCanvasItem[];
  /** Canaux de distribution */
  channels?: ServiceCanvasItem[];
  /** Segments de clientèle */
  segments?: ServiceCanvasItem[];
  /** Structure de coûts */
  costStructure?: ServiceCanvasItem[];
  /** Sources de revenus */
  revenueStreams?: ServiceCanvasItem[];
}

/**
 * Structure complète du modèle économique (UI)
 */
export interface UIBusinessModel {
  /** Business Model Canvas */
  canvas: UIBusinessModelCanvas;
  /** Modèle de tarification */
  pricing: UIPricingModel;
}

/**
 * Modèle de tarification complet (UI)
 */
export interface UIPricingModel {
  /** Tarifs horaires */
  hourlyRates: UIHourlyRateModel[];
  /** Forfaits */
  packages: UIPackageModel[];
  /** Abonnements */
  subscriptions: UISubscriptionModel[];
  /** Tarifications personnalisées */
  custom: UICustomPricingModel[];
}

/**
 * Tarification horaire (UI)
 */
export interface UIHourlyRateModel extends UIModel {
  /** Intitulé du service */
  title: string;
  /** Description du service */
  description: string;
  /** Taux horaire */
  ratePerHour: number;
  /** Devise */
  currency: string;
  /** Conditions spéciales */
  specialConditions?: string;
  /** Nombre minimum d'heures */
  minHours?: number;
  /** Seuils de remise */
  discountThresholds?: {
    hours: number;
    discountPercentage: number;
  }[];
}

/**
 * Forfait (UI)
 */
export interface UIPackageModel extends UIModel {
  /** Intitulé du forfait */
  title: string;
  /** Description du forfait */
  description: string;
  /** Prix du forfait */
  price: number;
  /** Devise */
  currency: string;
  /** Durée du forfait */
  duration?: string;
  /** Fonctionnalités incluses */
  features: string[];
  /** Indique si c'est un forfait populaire/mis en avant */
  popular?: boolean;
}

/**
 * Abonnement (UI)
 */
export interface UISubscriptionModel extends UIModel {
  /** Intitulé de l'abonnement */
  title: string;
  /** Description de l'abonnement */
  description: string;
  /** Prix mensuel */
  monthlyPrice: number;
  /** Prix annuel */
  annualPrice?: number;
  /** Devise */
  currency: string;
  /** Fréquence de facturation */
  billingFrequency: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  /** Fonctionnalités incluses */
  features: string[];
  /** Conditions d'annulation */
  cancellationTerms?: string;
  /** Indique si c'est un abonnement populaire/mis en avant */
  popular?: boolean;
}

/**
 * Tarification personnalisée (UI)
 */
export interface UICustomPricingModel extends UIModel {
  /** Intitulé de la tarification */
  title: string;
  /** Description de la tarification */
  description: string;
  /** Fourchette de prix */
  priceRange: {
    min: number;
    max: number;
  };
  /** Devise */
  currency: string;
  /** Facteurs influençant le prix */
  factors: string[];
}

/**
 * Tarification horaire (Service)
 */
export interface ServiceHourlyRateModel extends ServiceModel {
  /** Type de service */
  serviceType: string;
  /** Taux horaire */
  rate: number;
  /** Devise */
  currency: string;
  /** Nombre minimum d'heures */
  minimumHours?: number;
  /** Conditions spéciales */
  conditions?: string;
  /** Nom du service */
  name: string;
  /** Description du service */
  description?: string;
  /** Montant (synonyme de rate, pour compatibilité) */
  amount?: number;
}

/**
 * Forfait (Service)
 */
export interface ServicePackageModel extends ServiceModel {
  /** Nom du forfait */
  name: string;
  /** Description du forfait */
  description: string;
  /** Prix du forfait */
  price: number;
  /** Devise */
  currency: string;
  /** Services inclus */
  services: string[];
  /** Durée du forfait */
  duration?: string;
  /** Indication si forfait populaire */
  isPopular?: boolean;
  /** Fonctionnalités incluses (synonyme de services, pour compatibilité) */
  features?: string[];
}

/**
 * Abonnement (Service)
 */
export interface ServiceSubscriptionModel extends ServiceModel {
  /** Nom de l'abonnement */
  name: string;
  /** Description de l'abonnement */
  description: string;
  /** Prix mensuel */
  monthlyPrice: number;
  /** Prix annuel */
  annualPrice?: number;
  /** Devise */
  currency: string;
  /** Fonctionnalités incluses */
  features: string[];
  /** Cycle de facturation */
  billingCycle?: string;
  /** Conditions d'annulation */
  cancellationTerms?: string;
  /** Indication si abonnement populaire */
  isPopular?: boolean;
}

/**
 * Tarification personnalisée (Service)
 */
export interface ServiceCustomPricingModel extends ServiceModel {
  /** Nom de la tarification */
  name: string;
  /** Description de la tarification */
  description: string;
  /** Prix minimum */
  minPrice?: number;
  /** Prix maximum */
  maxPrice?: number;
  /** Devise */
  currency: string;
  /** Facteurs influençant le prix */
  pricingFactors?: string[];
}