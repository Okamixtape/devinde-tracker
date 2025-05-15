/**
 * BusinessModelInterfaces - Interfaces TypeScript pour le modèle économique
 * 
 * Ce fichier définit les interfaces utilisées pour le Business Model Canvas
 * et les projections financières associées au modèle économique.
 */

/**
 * Sources de revenus
 */
export enum RevenueSources {
  HOURLY = 'hourly',
  PACKAGE = 'package',
  SUBSCRIPTION = 'subscription',
  CUSTOM = 'custom'
}

/**
 * Business Model Canvas - Structure principale
 */
export interface BusinessModelCanvasData {
  partners: CanvasItem[];
  activities: CanvasItem[];
  resources: CanvasItem[];
  valueProposition: CanvasItem[];
  customerRelations: CanvasItem[];
  channels: CanvasItem[];
  segments: CanvasItem[];
  costStructure: CanvasItem[];
  revenueStreams: CanvasItem[];
}

/**
 * Élément générique pour le Canvas
 */
export interface CanvasItem {
  id: string;
  name: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  color?: string;
}

/**
 * Méthodes de tarification
 */
export interface PricingModel {
  hourlyRates: HourlyRateModel[];
  packages: PackageModel[];
  subscriptions: SubscriptionModel[];
  custom: CustomPricingModel[];
}

/**
 * Tarification horaire
 */
export interface HourlyRateModel {
  id: string;
  title: string;
  description: string;
  ratePerHour: number;
  currency: string;
  specialConditions?: string;
  minHours?: number;
  discountThresholds?: {
    hours: number;
    discountPercentage: number;
  }[];
}

/**
 * Forfaits
 */
export interface PackageModel {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  duration?: string;
  features: string[];
  popular?: boolean;
}

/**
 * Abonnements
 */
export interface SubscriptionModel {
  id: string;
  title: string;
  description: string;
  monthlyPrice: number;
  annualPrice?: number;
  currency: string;
  billingFrequency: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  features: string[];
  cancellationTerms?: string;
  popular?: boolean;
}

/**
 * Tarifications personnalisées
 */
export interface CustomPricingModel {
  id: string;
  title: string;
  description: string;
  priceRange: {
    min: number;
    max: number;
  };
  currency: string;
  factors: string[];
}

/**
 * Paramètres de simulation financière
 */
export interface BusinessModelSimulationParams {
  hoursPerWeek: number;
  newClientsPerMonth: number;
  hourlyRate: number;
  packageRate: number;
  subscriptionRate: number;
  yearsProjection: number;
  monthlyExpenses: number;
  initialInvestment?: number;
}

/**
 * Projections de revenus
 */
export interface RevenueProjections {
  monthly: MonthlyProjection[];
  quarterly: QuarterlyProjection[];
  annual: AnnualProjection;
  bySource: RevenueBySource[];
}

/**
 * Projection mensuelle
 */
export interface MonthlyProjection {
  month: number;
  year: number;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
  bySource: {
    sourceType: RevenueSources;
    amount: number;
  }[];
}

/**
 * Projection trimestrielle
 */
export interface QuarterlyProjection {
  quarter: number;
  year: number;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
  bySource: {
    sourceType: RevenueSources;
    amount: number;
  }[];
}

/**
 * Projection annuelle
 */
export interface AnnualProjection {
  firstYear: {
    revenue: number;
    expenses: number;
    profit: number;
    roi?: number;
  };
  threeYear: {
    revenue: number;
    expenses: number;
    profit: number;
    cagr?: number; // Compound Annual Growth Rate
  };
  fiveYear: {
    revenue: number;
    expenses: number;
    profit: number;
    cagr?: number;
  };
}

/**
 * Répartition des revenus par source
 */
export interface RevenueBySource {
  sourceType: RevenueSources;
  amount: number;
  percentage: number;
  color: string;
}

/**
 * Points d'équilibre
 */
export interface BreakEvenAnalysis {
  daysToBreakEven: number;
  monthsToBreakEven: number;
  breakEvenDate: Date;
  breakEvenAmount: number;
  breakEvenChart: BreakEvenChartPoint[];
}

/**
 * Point sur le graphique d'équilibre
 */
export interface BreakEvenChartPoint {
  period: string;
  revenue: number;
  expenses: number;
  cumulativeProfit: number;
}

/**
 * Hypothèses financières
 */
export interface FinancialAssumptions {
  minimalMonthlyIncome: number;
  clientRetentionRate: number;
  averageProjectDuration: number;
  clientAcquisitionCost: number;
  taxRate: number;
  inflationRate: number;
  growthRateYear1: number;
  growthRateYear2: number;
  growthRateYear3Plus: number;
}

/**
 * Métriques clés de performance
 */
export interface BusinessKPIs {
  monthlyRecurringRevenue: number;
  averageRevenuePerClient: number;
  clientLifetimeValue: number;
  acquisitionCostRatio: number;
  profitMargin: number;
  hourlyEffectiveRate: number;
  projectCompletionRate: number;
  utilisationRate: number;
}

/**
 * Structure de données des projections financières au format UI
 * Utilisée pour l'affichage et l'interaction avec l'utilisateur
 */
export interface UIBusinessModelProjections {
  revenueProjections: RevenueProjections;
  breakEvenAnalysis: BreakEvenAnalysis;
  simulationParams?: BusinessModelSimulationParams;
}

/**
 * Structure de données des projections financières au format Service
 * Utilisée pour le stockage et la manipulation des données
 */
export interface ServiceBusinessModelProjections {
  revenueProjections: RevenueProjections;
  breakEvenAnalysis: BreakEvenAnalysis;
  simulationParams: BusinessModelSimulationParams;
}
