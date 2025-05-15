/**
 * Revenue Projections Interfaces - Définition des interfaces pour les projections de revenus
 * 
 * Ces interfaces définissent la structure des données pour les projections de revenus,
 * incluant les paramètres de simulation, les périodes de projection et les analyses.
 * Suivent le pattern de séparation UI/Service établi dans le projet.
 * 
 * @version 1.0
 * @standardized true
 */

import { RevenueSourceType } from '../business-model/business-model';

/**
 * Niveau de confiance dans les projections
 */
export enum ProjectionConfidenceLevel {
  VERY_LOW = 'very_low',  // Projections très spéculatives
  LOW = 'low',            // Faible niveau de confiance
  MEDIUM = 'medium',      // Niveau de confiance moyen
  HIGH = 'high',          // Niveau de confiance élevé
  VERY_HIGH = 'very_high' // Projections basées sur des données historiques solides
}

/**
 * Méthode de calcul pour les projections
 */
export enum ProjectionMethod {
  LINEAR = 'linear',         // Croissance linéaire
  COMPOUND = 'compound',     // Croissance composée
  SEASONAL = 'seasonal',     // Croissance saisonnière
  CUSTOM = 'custom',         // Modèle personnalisé
  HISTORICAL = 'historical'  // Basé sur l'historique
}

/**
 * Paramètres de simulation pour les projections de revenus côté service
 */
export interface ServiceRevenueSimulationParams {
  // Paramètres de base
  hourlyRate: number;                 // Taux horaire moyen
  hoursPerWeek: number;               // Heures de travail par semaine
  workWeeksPerYear: number;           // Semaines travaillées par an
  vacationWeeks: number;              // Semaines de congés par an
  
  // Paramètres clients
  initialClientCount: number;         // Nombre de clients au démarrage
  averageClientRetentionMonths: number; // Durée moyenne de rétention client
  newClientsPerMonth: number;         // Nouveaux clients par mois
  clientGrowthRate: number;           // Taux de croissance du nombre de clients
  
  // Paramètres services
  serviceDistribution: {              // Répartition des services
    hourly: number;                   // Pourcentage de services horaires
    package: number;                  // Pourcentage de services forfaitaires
    subscription: number;             // Pourcentage de services en abonnement
  };
  packageAverageCost: number;         // Coût moyen des forfaits
  subscriptionAverageCost: number;    // Coût moyen des abonnements
  
  // Paramètres temporels
  projectionMonths: number;           // Nombre de mois pour les projections
  startDate: string;                  // Date de début des projections
  historicalDataMonths: number;       // Mois de données historiques disponibles
  
  // Paramètres de calcul
  confidenceLevel: string;            // Niveau de confiance
  method: string;                     // Méthode de calcul
  seasonalFactors?: number[];         // Facteurs saisonniers par mois (si méthode saisonnière)
  customFactors?: Record<string, any>; // Facteurs personnalisés (si méthode personnalisée)
}

/**
 * Paramètres de simulation pour les projections de revenus côté UI
 */
export interface UIRevenueSimulationParams extends ServiceRevenueSimulationParams {
  confidenceLevel: ProjectionConfidenceLevel;
  method: ProjectionMethod;
  isEditing?: boolean;
  validationErrors?: Record<string, string>;
}

/**
 * Projection de revenus mensuels côté service
 */
export interface ServiceMonthlyRevenue {
  month: number;                  // Mois (0-11)
  year: number;                   // Année
  period: string;                 // Période formatée (ex: "2023-01")
  
  // Revenus
  hourlyRevenue: number;          // Revenus horaires
  packageRevenue: number;         // Revenus forfaitaires
  subscriptionRevenue: number;    // Revenus d'abonnements
  otherRevenue: number;           // Autres revenus
  totalRevenue: number;           // Revenu total
  
  // Capacité et utilisation
  availableHours: number;         // Heures disponibles
  billedHours: number;            // Heures facturées
  utilizationRate: number;        // Taux d'utilisation
  
  // Clients
  activeClients: number;          // Clients actifs
  newClients: number;             // Nouveaux clients
  churnedClients: number;         // Clients perdus
  
  // Croissance
  growthFromPreviousPeriod: number; // Croissance par rapport à la période précédente
  cumulativeRevenue: number;      // Revenu cumulé
}

/**
 * Projection de revenus mensuels côté UI
 */
export interface UIMonthlyRevenue extends ServiceMonthlyRevenue {
  label: string;                  // Étiquette formatée (ex: "Janvier 2023")
  formattedRevenue: string;       // Revenu formaté (ex: "1 234 €")
  formattedUtilizationRate: string; // Taux d'utilisation formaté (ex: "75%")
  color: string;                  // Couleur pour l'affichage
  isActual: boolean;              // Si les données sont réelles ou projetées
  isSelectedPeriod?: boolean;     // Si la période est sélectionnée
}

/**
 * Projection de revenus trimestriels côté service
 */
export interface ServiceQuarterlyRevenue {
  quarter: number;                // Trimestre (1-4)
  year: number;                   // Année
  period: string;                 // Période formatée (ex: "2023-Q1")
  
  // Revenus
  hourlyRevenue: number;          // Revenus horaires
  packageRevenue: number;         // Revenus forfaitaires
  subscriptionRevenue: number;    // Revenus d'abonnements
  otherRevenue: number;           // Autres revenus
  totalRevenue: number;           // Revenu total
  
  // Capacité et utilisation
  availableHours: number;         // Heures disponibles
  billedHours: number;            // Heures facturées
  utilizationRate: number;        // Taux d'utilisation
  
  // Clients
  averageActiveClients: number;   // Clients actifs moyens
  newClientsTotal: number;        // Total des nouveaux clients
  churnRate: number;              // Taux d'attrition
  
  // Croissance
  growthFromPreviousPeriod: number; // Croissance par rapport à la période précédente
  cumulativeRevenue: number;      // Revenu cumulé
}

/**
 * Projection de revenus trimestriels côté UI
 */
export interface UIQuarterlyRevenue extends ServiceQuarterlyRevenue {
  label: string;                  // Étiquette formatée (ex: "T1 2023")
  formattedRevenue: string;       // Revenu formaté
  formattedUtilizationRate: string; // Taux d'utilisation formaté
  color: string;                  // Couleur pour l'affichage
  isActual: boolean;              // Si les données sont réelles ou projetées
  isSelectedPeriod?: boolean;     // Si la période est sélectionnée
}

/**
 * Projection de revenus annuels côté service
 */
export interface ServiceAnnualRevenue {
  year: number;                   // Année
  period: string;                 // Période formatée (ex: "2023")
  
  // Revenus
  hourlyRevenue: number;          // Revenus horaires
  packageRevenue: number;         // Revenus forfaitaires
  subscriptionRevenue: number;    // Revenus d'abonnements
  otherRevenue: number;           // Autres revenus
  totalRevenue: number;           // Revenu total
  
  // Capacité et utilisation
  availableHours: number;         // Heures disponibles
  billedHours: number;            // Heures facturées
  utilizationRate: number;        // Taux d'utilisation
  
  // Clients
  averageActiveClients: number;   // Clients actifs moyens
  newClientsTotal: number;        // Total des nouveaux clients
  churnedClientsTotal: number;    // Total des clients perdus
  netClientGrowth: number;        // Croissance nette des clients
  
  // Croissance
  growthFromPreviousYear: number; // Croissance par rapport à l'année précédente
  cumulativeRevenue: number;      // Revenu cumulé depuis le début
  cagr?: number;                  // Taux de croissance annuel composé
}

/**
 * Projection de revenus annuels côté UI
 */
export interface UIAnnualRevenue extends ServiceAnnualRevenue {
  label: string;                  // Étiquette formatée (ex: "2023")
  formattedRevenue: string;       // Revenu formaté
  formattedUtilizationRate: string; // Taux d'utilisation formaté
  formattedGrowth: string;        // Croissance formatée
  color: string;                  // Couleur pour l'affichage
  isActual: boolean;              // Si les données sont réelles ou projetées
  isSelectedPeriod?: boolean;     // Si la période est sélectionnée
}

/**
 * Répartition des revenus par source côté service
 */
export interface ServiceRevenueBySource {
  sourceType: string;             // Type de source de revenus
  amount: number;                 // Montant
  percentage: number;             // Pourcentage du total
}

/**
 * Répartition des revenus par source côté UI
 */
export interface UIRevenueBySource {
  sourceType: RevenueSourceType;  // Type de source de revenus
  amount: number;                 // Montant
  percentage: number;             // Pourcentage du total
  formattedAmount: string;        // Montant formaté
  formattedPercentage: string;    // Pourcentage formaté
  color: string;                  // Couleur pour l'affichage
  isHighlighted?: boolean;        // Si la source est mise en évidence
}

/**
 * Analyse de point d'équilibre côté service
 */
export interface ServiceBreakEvenAnalysis {
  initialInvestment: number;      // Investissement initial
  fixedCosts: number;             // Coûts fixes mensuels
  variableCosts: number;          // Coûts variables (pourcentage du revenu)
  revenueNeeded: number;          // Revenu nécessaire pour atteindre l'équilibre
  monthsToBreakEven: number;      // Mois pour atteindre l'équilibre
  breakEvenDate: string;          // Date d'équilibre estimée
  breakEvenPoints: {              // Points du graphique
    period: string;               // Période
    revenue: number;              // Revenu cumulé
    costs: number;                // Coûts cumulés
    profit: number;               // Profit/Perte cumulés
  }[];
}

/**
 * Analyse de point d'équilibre côté UI
 */
export interface UIBreakEvenAnalysis extends ServiceBreakEvenAnalysis {
  formattedInvestment: string;    // Investissement formaté
  formattedFixedCosts: string;    // Coûts fixes formatés
  formattedRevenueNeeded: string; // Revenu nécessaire formaté
  formattedBreakEvenDate: string; // Date d'équilibre formatée
  breakEvenPoints: {              // Points du graphique avec formatage
    period: string;               // Période
    revenue: number;              // Revenu cumulé
    costs: number;                // Coûts cumulés
    profit: number;               // Profit/Perte cumulés
    formattedRevenue: string;     // Revenu formaté
    formattedCosts: string;       // Coûts formatés
    formattedProfit: string;      // Profit/Perte formatés
    isBreakEvenPoint: boolean;    // Si c'est le point d'équilibre
  }[];
}

/**
 * Scénario de revenus côté service
 */
export interface ServiceRevenueScenario {
  id: string;                     // Identifiant unique
  name: string;                   // Nom du scénario
  description?: string;           // Description
  params: ServiceRevenueSimulationParams; // Paramètres de simulation
  isDefault: boolean;             // Si c'est le scénario par défaut
  
  // Résultats calculés
  monthlyRevenue: ServiceMonthlyRevenue[];      // Revenus mensuels
  quarterlyRevenue: ServiceQuarterlyRevenue[];  // Revenus trimestriels
  annualRevenue: ServiceAnnualRevenue[];        // Revenus annuels
  revenueBySource: ServiceRevenueBySource[];    // Répartition par source
  breakEvenAnalysis?: ServiceBreakEvenAnalysis; // Analyse du point d'équilibre
  
  createdAt: string;              // Date de création
  updatedAt: string;              // Date de mise à jour
  businessPlanId: string;         // ID du plan d'affaires
}

/**
 * Scénario de revenus côté UI
 */
export interface UIRevenueScenario {
  id: string;                     // Identifiant unique
  name: string;                   // Nom du scénario
  description?: string;           // Description
  params: UIRevenueSimulationParams; // Paramètres de simulation
  isDefault: boolean;             // Si c'est le scénario par défaut
  
  // Résultats calculés
  monthlyRevenue: UIMonthlyRevenue[];      // Revenus mensuels
  quarterlyRevenue: UIQuarterlyRevenue[];  // Revenus trimestriels
  annualRevenue: UIAnnualRevenue[];        // Revenus annuels
  revenueBySource: UIRevenueBySource[];    // Répartition par source
  breakEvenAnalysis?: UIBreakEvenAnalysis; // Analyse du point d'équilibre
  
  // Méta-informations
  createdAt: string;              // Date de création
  updatedAt: string;              // Date de mise à jour
  businessPlanId: string;         // ID du plan d'affaires
  
  // États UI
  isEditing?: boolean;            // Si en cours d'édition
  isExpanded?: boolean;           // Si le scénario est développé
  isSelected?: boolean;           // Si le scénario est sélectionné
  isDuplicated?: boolean;         // Si le scénario est une copie
  validationErrors?: Record<string, string>; // Erreurs de validation
}

/**
 * Comparaison de scénarios côté service
 */
export interface ServiceScenarioComparison {
  scenarioIds: string[];          // IDs des scénarios comparés
  comparisonPoints: {             // Points de comparaison
    period: string;               // Période (année)
    scenarioValues: {             // Valeurs par scénario
      scenarioId: string;         // ID du scénario
      revenue: number;            // Revenu
      utilizationRate: number;    // Taux d'utilisation
    }[];
  }[];
  differenceToBaseline: {         // Différences par rapport au scénario de base
    scenarioId: string;           // ID du scénario
    revenuePercentDiff: number;   // Différence de revenu en pourcentage
    absoluteDiff: number;         // Différence absolue
  }[];
}

/**
 * Comparaison de scénarios côté UI
 */
export interface UIScenarioComparison extends ServiceScenarioComparison {
  scenarioNames: string[];        // Noms des scénarios comparés
  comparisonPoints: {             // Points de comparaison avec formatage
    period: string;               // Période (année)
    label: string;                // Étiquette formatée
    scenarioValues: {             // Valeurs par scénario
      scenarioId: string;         // ID du scénario
      scenarioName: string;       // Nom du scénario
      revenue: number;            // Revenu
      formattedRevenue: string;   // Revenu formaté
      utilizationRate: number;    // Taux d'utilisation
      formattedUtilizationRate: string; // Taux d'utilisation formaté
      color: string;              // Couleur pour l'affichage
    }[];
  }[];
  differenceToBaseline: {         // Différences par rapport au scénario de base
    scenarioId: string;           // ID du scénario
    scenarioName: string;         // Nom du scénario
    revenuePercentDiff: number;   // Différence de revenu en pourcentage
    absoluteDiff: number;         // Différence absolue
    formattedPercentDiff: string; // Différence en pourcentage formatée
    formattedAbsoluteDiff: string; // Différence absolue formatée
    isPositive: boolean;          // Si la différence est positive
  }[];
}