/**
 * MarketAnalysisInterfaces - Interfaces TypeScript pour l'analyse de marché
 * 
 * Ce fichier définit les interfaces utilisées pour la gestion des segments de clientèle,
 * des concurrents et des opportunités de marché.
 */

import { MarketAnalysisData } from '../services/interfaces/dataModels';

/**
 * Segment de clientèle
 */
export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  needs: string[];
  potentialSize: 'Faible' | 'Moyen' | 'Élevé' | 'Très élevé';
  profitability: 'Faible' | 'Moyenne' | 'Élevée' | 'Très élevée';
  acquisition: string; // Stratégies d'acquisition
  idealClient?: string; // Description du client idéal
  painPoints?: string[]; // Points de douleur du segment
  budget?: string; // Budget moyen ou plage de budget
  decisionFactor?: string; // Facteur principal de décision d'achat
  growthRate?: string; // Taux de croissance du segment
  keyInsights?: string[]; // Observations clés
}

/**
 * Concurrent
 */
export interface Competitor {
  id: string;
  name: string;
  website?: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  targetMarket: string;
  pricingStrategy?: string;
  marketShare?: string; // Part de marché estimée
  differentiators?: string[]; // Facteurs différenciateurs
  productQuality?: number; // Évaluation de 1 à 5
  customerService?: number; // Évaluation de 1 à 5
  pricing?: number; // Évaluation de 1 à 5 (5 étant le plus abordable)
  innovation?: number; // Évaluation de 1 à 5
  reputationScore?: number; // Évaluation de 1 à 5
  threat?: 'Faible' | 'Moyen' | 'Élevé'; // Niveau de menace
}

/**
 * Opportunité de marché
 */
export interface MarketOpportunity {
  id: string;
  title: string;
  description: string;
  relatedSegments: string[]; // IDs des segments concernés
  potentialRevenue: string; // Estimation de revenus potentiels
  feasibility: 'Faible' | 'Moyenne' | 'Élevée'; // Facilité de mise en œuvre
  timeframe: 'Court terme' | 'Moyen terme' | 'Long terme';
  priority: 'Faible' | 'Moyenne' | 'Élevée';
  requiredResources?: string[]; // Ressources nécessaires
  potentialPartners?: string[]; // Partenaires potentiels
  riskLevel?: 'Faible' | 'Moyen' | 'Élevé'; // Niveau de risque
  nextSteps?: string[]; // Prochaines étapes
  marketTrends?: string[]; // Tendances de marché associées
  status?: 'Identifiée' | 'En évaluation' | 'Poursuivie' | 'Abandonnée';
}

/**
 * Tendance de marché
 */
export interface MarketTrend {
  id: string;
  name: string;
  description: string;
  impact: 'Faible' | 'Modéré' | 'Significatif' | 'Majeur';
  timeframe: 'Actuel' | 'Court terme' | 'Moyen terme' | 'Long terme';
  relevance: number; // Pertinence pour l'activité (1-10)
  sourceLinks?: string[]; // Liens vers les sources d'information
  relatedOpportunities?: string[]; // IDs des opportunités liées
  status: 'Émergente' | 'En croissance' | 'Mature' | 'En déclin';
}

/**
 * Propriété intellectuelle
 */
export interface IntellectualProperty {
  id: string;
  name: string;
  type: 'Brevet' | 'Marque déposée' | 'Droit d\'auteur' | 'Secret commercial' | 'Autre';
  description: string;
  status: 'En préparation' | 'Déposé' | 'Accordé' | 'Refusé' | 'Expiré';
  filingDate?: string;
  grantDate?: string;
  expirationDate?: string;
  coverageArea?: string[]; // Pays ou régions couverts
  owners?: string[]; // Propriétaires
  value?: string; // Estimation de la valeur
}

/**
 * Analyse SWOT
 */
export interface SwotAnalysis {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

/**
 * Élément de l'analyse SWOT
 */
export interface SwotItem {
  id: string;
  description: string;
  impact: 'Faible' | 'Moyen' | 'Élevé';
  actionable: boolean;
  actions?: string[]; // Actions possibles
}

/**
 * Positionnement de marché
 */
export interface MarketPositioning {
  uniqueSellingProposition: string;
  targetCustomerProfile: string;
  brandPersonality: string[];
  competitiveAdvantages: string[];
  valueProposition: string;
  pricingPosition: 'Premium' | 'Milieu de gamme' | 'Économique' | 'Freemium' | 'Personnalisé';
  qualityPosition: 'Haut de gamme' | 'Standard' | 'Économique';
  differentiationStrategy: string;
}

/**
 * Statistiques pour l'analyse comparative
 */
export interface MarketAnalysisStatistics {
  totalSegments: number;
  segmentsWithHighPotential: number;
  totalCompetitors: number;
  majorCompetitors: number;
  totalOpportunities: number;
  highPriorityOpportunities: number;
  marketShareEstimate?: string;
  addressableMarketSize?: string;
  serviceableFastSize?: string;
}

/**
 * Tableau de données pour la présentation visuelle
 */
export interface MarketDataTable {
  columns: {
    id: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'enum';
    options?: string[]; // Pour les types enum
  }[];
  rows: {
    id: string;
    cells: {
      columnId: string;
      value: string | number | boolean | Date;
    }[];
  }[];
}

/**
 * Adaptateurs pour transformer les données du modèle en données UI
 */
export interface MarketAnalysisAdapters {
  transformSegments: (data: MarketAnalysisData) => CustomerSegment[];
  transformCompetitors: (data: MarketAnalysisData) => Competitor[];
  transformOpportunities: (data: MarketAnalysisData) => MarketOpportunity[];
  transformTrends: (data: MarketAnalysisData) => MarketTrend[];
  generateSwotAnalysis: (data: MarketAnalysisData) => SwotAnalysis;
  calculateStatistics: (data: MarketAnalysisData) => MarketAnalysisStatistics;
}

/**
 * Configuration de l'affichage de l'analyse de marché
 */
export interface MarketAnalysisViewSettings {
  segmentView: 'cards' | 'table' | 'grid';
  competitorView: 'cards' | 'table' | 'matrix';
  opportunityView: 'cards' | 'list' | 'kanban';
  sortSegmentsBy: 'name' | 'potentialSize' | 'profitability';
  sortCompetitorsBy: 'name' | 'threat' | 'marketShare';
  sortOpportunitiesBy: 'priority' | 'potentialRevenue' | 'timeframe';
  sortDirection: 'asc' | 'desc';
  showDetailedSegmentInfo: boolean;
  enableMarketComparison: boolean;
}
