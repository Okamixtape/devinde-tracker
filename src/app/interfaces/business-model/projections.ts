/**
 * BusinessModel Projections - Interfaces TypeScript pour les projections financières
 * 
 * Ce fichier définit les interfaces pour les projections financières
 * et les analyses liées au modèle économique.
 * 
 * @version 1.0
 */

import { BaseModel, ServiceModel, UIModel } from '../common/base-models';
import { RevenueSourceType } from './business-model';

/**
 * Paramètres de simulation financière
 */
export interface BusinessModelSimulationParams {
  /** Heures de travail par semaine */
  hoursPerWeek: number;
  /** Nouveaux clients par mois */
  newClientsPerMonth: number;
  /** Taux horaire moyen */
  hourlyRate: number;
  /** Taux moyen des forfaits */
  packageRate: number;
  /** Taux moyen des abonnements */
  subscriptionRate: number;
  /** Nombre d'années pour les projections */
  yearsProjection: number;
  /** Dépenses mensuelles */
  monthlyExpenses: number;
  /** Investissement initial */
  initialInvestment?: number;
}

/**
 * Projections de revenus
 */
export interface RevenueProjections {
  /** Projections mensuelles */
  monthly: MonthlyProjection[];
  /** Projections trimestrielles */
  quarterly: QuarterlyProjection[];
  /** Projections annuelles */
  annual: AnnualProjection;
  /** Répartition par source de revenus */
  bySource: RevenueBySource[];
}

/**
 * Projection mensuelle
 */
export interface MonthlyProjection {
  /** Mois (0-11) */
  month: number;
  /** Année */
  year: number;
  /** Étiquette formatée (ex: "Janvier 2023") */
  label: string;
  /** Revenus projetés */
  revenue: number;
  /** Dépenses projetées */
  expenses: number;
  /** Bénéfice projeté (revenus - dépenses) */
  profit: number;
  /** Détail par source de revenus */
  bySource: {
    /** Type de source de revenus */
    sourceType: RevenueSourceType;
    /** Montant généré par cette source */
    amount: number;
  }[];
}

/**
 * Projection trimestrielle
 */
export interface QuarterlyProjection {
  /** Trimestre (1-4) */
  quarter: number;
  /** Année */
  year: number;
  /** Étiquette formatée (ex: "T1 2023") */
  label: string;
  /** Revenus projetés */
  revenue: number;
  /** Dépenses projetées */
  expenses: number;
  /** Bénéfice projeté (revenus - dépenses) */
  profit: number;
  /** Détail par source de revenus */
  bySource: {
    /** Type de source de revenus */
    sourceType: RevenueSourceType;
    /** Montant généré par cette source */
    amount: number;
  }[];
}

/**
 * Projection annuelle
 */
export interface AnnualProjection {
  /** Projection première année */
  firstYear: {
    /** Revenus projetés */
    revenue: number;
    /** Dépenses projetées */
    expenses: number;
    /** Bénéfice projeté */
    profit: number;
    /** Retour sur investissement */
    roi?: number;
  };
  /** Projection sur trois ans */
  threeYear: {
    /** Revenus projetés */
    revenue: number;
    /** Dépenses projetées */
    expenses: number;
    /** Bénéfice projeté */
    profit: number;
    /** Taux de croissance annuel composé */
    cagr?: number;
  };
  /** Projection sur cinq ans */
  fiveYear: {
    /** Revenus projetés */
    revenue: number;
    /** Dépenses projetées */
    expenses: number;
    /** Bénéfice projeté */
    profit: number;
    /** Taux de croissance annuel composé */
    cagr?: number;
  };
}

/**
 * Répartition des revenus par source
 */
export interface RevenueBySource {
  /** Type de source de revenus */
  sourceType: RevenueSourceType;
  /** Montant généré */
  amount: number;
  /** Pourcentage du revenu total */
  percentage: number;
  /** Couleur associée pour l'affichage */
  color: string;
}

/**
 * Points d'équilibre
 */
export interface BreakEvenAnalysis {
  /** Jours pour atteindre le point d'équilibre */
  daysToBreakEven: number;
  /** Mois pour atteindre le point d'équilibre */
  monthsToBreakEven: number;
  /** Date projetée du point d'équilibre */
  breakEvenDate: Date;
  /** Montant nécessaire pour atteindre le point d'équilibre */
  breakEvenAmount: number;
  /** Points du graphique de point d'équilibre */
  breakEvenChart: BreakEvenChartPoint[];
}

/**
 * Point sur le graphique d'équilibre
 */
export interface BreakEvenChartPoint {
  /** Période (étiquette) */
  period: string;
  /** Revenus cumulés */
  revenue: number;
  /** Dépenses cumulées */
  expenses: number;
  /** Bénéfice/perte cumulatif */
  cumulativeProfit: number;
}

/**
 * Hypothèses financières
 */
export interface FinancialAssumptions {
  /** Revenu mensuel minimal nécessaire */
  minimalMonthlyIncome: number;
  /** Taux de rétention des clients */
  clientRetentionRate: number;
  /** Durée moyenne des projets */
  averageProjectDuration: number;
  /** Coût d'acquisition client */
  clientAcquisitionCost: number;
  /** Taux d'imposition */
  taxRate: number;
  /** Taux d'inflation */
  inflationRate: number;
  /** Taux de croissance en année 1 */
  growthRateYear1: number;
  /** Taux de croissance en année 2 */
  growthRateYear2: number;
  /** Taux de croissance en année 3+ */
  growthRateYear3Plus: number;
}

/**
 * Métriques clés de performance
 */
export interface BusinessKPIs {
  /** Revenu mensuel récurrent */
  monthlyRecurringRevenue: number;
  /** Revenu moyen par client */
  averageRevenuePerClient: number;
  /** Valeur client à vie */
  clientLifetimeValue: number;
  /** Ratio coût d'acquisition / valeur client */
  acquisitionCostRatio: number;
  /** Marge bénéficiaire */
  profitMargin: number;
  /** Taux horaire effectif */
  hourlyEffectiveRate: number;
  /** Taux de réalisation des projets */
  projectCompletionRate: number;
  /** Taux d'utilisation (heures facturées/disponibles) */
  utilisationRate: number;
}

/**
 * Structure de données des projections financières au format UI
 */
export interface UIBusinessModelProjections {
  /** Projections de revenus */
  revenueProjections: RevenueProjections;
  /** Analyse du point d'équilibre */
  breakEvenAnalysis: BreakEvenAnalysis;
  /** Paramètres de simulation */
  simulationParams?: BusinessModelSimulationParams;
}

/**
 * Structure de données des projections financières au format Service
 */
export interface ServiceBusinessModelProjections {
  /** Projections de revenus */
  revenueProjections: RevenueProjections;
  /** Analyse du point d'équilibre */
  breakEvenAnalysis: BreakEvenAnalysis;
  /** Paramètres de simulation */
  simulationParams: BusinessModelSimulationParams;
}