/**
 * Interfaces standardisées pour l'analyse de marché
 * 
 * Ce fichier définit les interfaces normalisées pour la gestion des segments de clientèle,
 * des concurrents et des opportunités de marché.
 * @standardized true
 * @version 1.0
 */

import { BaseModel, ServiceModel, UIModel } from '../common/base-models';

/**
 * Niveau d'évaluation
 */
export enum EvaluationLevel {
  LOW = 'Faible',
  MEDIUM = 'Moyen',
  HIGH = 'Élevé',
  VERY_HIGH = 'Très élevé'
}

/**
 * Niveau de potentiel
 */
export enum PotentialLevel {
  LOW = 'Faible',
  MEDIUM = 'Moyen',
  HIGH = 'Élevé',
  VERY_HIGH = 'Très élevé'
}

// ==================== INTERFACES UI ====================

/**
 * Segment de clientèle (UI)
 */
export interface UICustomerSegment extends UIModel {
  /** Nom du segment */
  name: string;
  /** Description du segment */
  description: string;
  /** Besoins identifiés */
  needs: string[];
  /** Taille potentielle du marché */
  potentialSize: PotentialLevel;
  /** Niveau de rentabilité */
  profitability: PotentialLevel;
  /** Stratégies d'acquisition */
  acquisition: string;
  /** Description du client idéal (optionnel) */
  idealClient?: string;
  /** Points de douleur du segment (optionnel) */
  painPoints?: string[];
  /** Budget moyen ou plage de budget (optionnel) */
  budget?: string;
  /** Facteur principal de décision d'achat (optionnel) */
  decisionFactor?: string;
  /** Taux de croissance du segment (optionnel) */
  growthRate?: string;
  /** Observations clés (optionnel) */
  keyInsights?: string[];
}

/**
 * Concurrent (UI)
 */
export interface UICompetitor extends UIModel {
  /** Nom du concurrent */
  name: string;
  /** Site web (optionnel) */
  website?: string;
  /** Description du concurrent */
  description: string;
  /** Forces du concurrent */
  strengths: string[];
  /** Faiblesses du concurrent */
  weaknesses: string[];
  /** Marché cible */
  targetMarket: string;
  /** Stratégie de tarification (optionnel) */
  pricingStrategy?: string;
  /** Part de marché estimée (optionnel) */
  marketShare?: string;
  /** Facteurs différenciateurs (optionnel) */
  differentiators?: string[];
  /** Évaluation de la qualité des produits (1-5) (optionnel) */
  productQuality?: number;
  /** Évaluation du service client (1-5) (optionnel) */
  customerService?: number;
  /** Évaluation du prix (5 étant le plus abordable) (optionnel) */
  pricing?: number;
  /** Évaluation de l'innovation (1-5) (optionnel) */
  innovation?: number;
  /** Score de réputation (1-5) (optionnel) */
  reputationScore?: number;
  /** Niveau de menace */
  threat?: EvaluationLevel;
}

/**
 * Opportunité de marché (UI)
 */
export interface UIMarketOpportunity extends UIModel {
  /** Titre de l'opportunité */
  title: string;
  /** Description de l'opportunité */
  description: string;
  /** Potentiel de l'opportunité */
  potential: PotentialLevel;
  /** Risque associé */
  risk: EvaluationLevel;
  /** Investissement nécessaire estimé (optionnel) */
  estimatedInvestment?: string;
  /** Délai pour capitaliser sur l'opportunité (optionnel) */
  timeframe?: string;
  /** Impact attendu (optionnel) */
  expectedImpact?: string;
  /** Actions recommandées (optionnel) */
  recommendedActions?: string[];
  /** Personnes ou entités impliquées (optionnel) */
  stakeholders?: string[];
  /** Observations clés (optionnel) */
  keyInsights?: string[];
  /** Catégories associées */
  categories: string[];
}

/**
 * Tendance de marché (UI)
 */
export interface UIMarketTrend extends UIModel {
  /** Titre de la tendance */
  title: string;
  /** Alias de title pour compatibilité avec l'ancien code */
  name?: string;
  /** Description de la tendance */
  description: string;
  /** Impact potentiel */
  impact: EvaluationLevel;
  /** Horizon temporel */
  timeframe: string;
  /** Sources d'information */
  sources: string[];
  /** Indicateurs à surveiller (optionnel) */
  indicators?: string[];
  /** Secteurs concernés */
  sectors: string[];
  /** Opportunités associées (optionnel) */
  relatedOpportunities?: string[];
  /** Menaces associées (optionnel) */
  relatedThreats?: string[];
}

/**
 * Élément SWOT (UI)
 */
export interface UISwotItem extends UIModel {
  /** Contenu de l'élément */
  content: string;
  /** Type d'élément (force, faiblesse, opportunité, menace) */
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  /** Niveau d'importance */
  importance: 1 | 2 | 3 | 4 | 5;
  /** Catégorie associée */
  category?: string;
}

/**
 * Analyse SWOT (UI)
 */
export interface UISwotAnalysis extends UIModel {
  /** Forces */
  strengths: UISwotItem[];
  /** Faiblesses */
  weaknesses: UISwotItem[];
  /** Opportunités */
  opportunities: UISwotItem[];
  /** Menaces */
  threats: UISwotItem[];
  /** Date de dernière mise à jour */
  lastUpdated: string;
}

/**
 * Statistiques d'analyse de marché (UI)
 */
export interface UIMarketAnalysisStatistics {
  /** Nombre total de segments de clientèle */
  totalCustomerSegments: number;
  /** Nombre total de concurrents */
  totalCompetitors: number;
  /** Nombre total d'opportunités de marché */
  totalOpportunities: number;
  /** Nombre total de tendances de marché */
  totalTrends: number;
  /** Opportunités par niveau de potentiel */
  opportunitiesByPotential: Record<PotentialLevel, number>;
  /** Concurrents par niveau de menace */
  competitorsByThreat: Record<EvaluationLevel, number>;
  /** Score moyen des concurrents */
  averageCompetitorScore: number;
  /** Taille totale du marché potentiel */
  totalMarketPotential: string;
}

/**
 * Paramètres d'affichage pour l'analyse de marché (UI)
 */
export interface UIMarketAnalysisViewSettings {
  /** Vue active */
  activeView: 'segments' | 'competitors' | 'opportunities' | 'trends';
  /** Type de visualisation */
  visualizationType: 'list' | 'grid' | 'matrix' | 'chart';
  /** Filtres actifs */
  activeFilters: UIMarketAnalysisFilters;
  /** Mode de tri */
  sortBy: 'name' | 'potential' | 'risk' | 'threat' | 'created' | 'updated';
  /** Ordre de tri */
  sortOrder: 'asc' | 'desc';
}

/**
 * Filtres pour l'analyse de marché (UI)
 */
export interface UIMarketAnalysisFilters {
  /** Niveaux de potentiel à afficher */
  potentialLevels: PotentialLevel[];
  /** Niveaux de risque à afficher */
  riskLevels: EvaluationLevel[];
  /** Niveaux de menace à afficher */
  threatLevels: EvaluationLevel[];
  /** Catégories à filtrer */
  categories: string[];
  /** Secteurs à filtrer */
  sectors: string[];
  /** Terme de recherche */
  searchTerm: string;
}

/**
 * Analyse de marché complète (UI)
 */
export interface UIMarketAnalysis {
  /** Segments de clientèle */
  customerSegments: UICustomerSegment[];
  /** Alias pour customerSegments (compatibilité avec ancienne API) */
  segments?: UICustomerSegment[];
  /** Concurrents */
  competitors: UICompetitor[];
  /** Opportunités de marché */
  opportunities: UIMarketOpportunity[];
  /** Tendances de marché */
  trends: UIMarketTrend[];
  /** Analyse SWOT */
  swotAnalysis?: UISwotAnalysis;
  /** Statistiques de l'analyse de marché */
  statistics: UIMarketAnalysisStatistics;
  /** Paramètres d'affichage */
  viewSettings: UIMarketAnalysisViewSettings;
}

// ==================== INTERFACES SERVICE ====================

/**
 * Segment de clientèle (Service)
 */
export interface ServiceCustomerSegment extends ServiceModel {
  /** Nom du segment */
  name: string;
  /** Description du segment */
  description: string;
  /** Besoins identifiés */
  needs: string[];
  /** Taille potentielle du marché */
  potentialSize: string;
  /** Niveau de rentabilité */
  profitability: string;
  /** Stratégies d'acquisition */
  acquisition: string;
  /** Description du client idéal (optionnel) */
  idealClient?: string;
  /** Points de douleur du segment (optionnel) */
  painPoints?: string[];
  /** Budget moyen ou plage de budget (optionnel) */
  budget?: string;
  /** Facteur principal de décision d'achat (optionnel) */
  decisionFactor?: string;
  /** Taux de croissance du segment (optionnel) */
  growthRate?: string;
  /** Observations clés (optionnel) */
  keyInsights?: string[];
}

/**
 * Concurrent (Service)
 */
export interface ServiceCompetitor extends ServiceModel {
  /** Nom du concurrent */
  name: string;
  /** Site web (optionnel) */
  website?: string;
  /** Description du concurrent */
  description: string;
  /** Forces du concurrent */
  strengths: string[];
  /** Faiblesses du concurrent */
  weaknesses: string[];
  /** Marché cible */
  targetMarket: string;
  /** Stratégie de tarification (optionnel) */
  pricingStrategy?: string;
  /** Part de marché estimée (optionnel) */
  marketShare?: string;
  /** Facteurs différenciateurs (optionnel) */
  differentiators?: string[];
  /** Évaluation de la qualité des produits (1-5) (optionnel) */
  productQuality?: number;
  /** Évaluation du service client (1-5) (optionnel) */
  customerService?: number;
  /** Évaluation du prix (5 étant le plus abordable) (optionnel) */
  pricing?: number;
  /** Évaluation de l'innovation (1-5) (optionnel) */
  innovation?: number;
  /** Score de réputation (1-5) (optionnel) */
  reputationScore?: number;
  /** Niveau de menace */
  threat?: string;
}

/**
 * Opportunité de marché (Service)
 */
export interface ServiceMarketOpportunity extends ServiceModel {
  /** Titre de l'opportunité */
  title: string;
  /** Description de l'opportunité */
  description: string;
  /** Potentiel de l'opportunité */
  potential: string;
  /** Risque associé */
  risk: string;
  /** Investissement nécessaire estimé (optionnel) */
  estimatedInvestment?: string;
  /** Délai pour capitaliser sur l'opportunité (optionnel) */
  timeframe?: string;
  /** Impact attendu (optionnel) */
  expectedImpact?: string;
  /** Actions recommandées (optionnel) */
  recommendedActions?: string[];
  /** Personnes ou entités impliquées (optionnel) */
  stakeholders?: string[];
  /** Observations clés (optionnel) */
  keyInsights?: string[];
  /** Catégories associées */
  categories: string[];
}

/**
 * Tendance de marché (Service)
 */
export interface ServiceMarketTrend extends ServiceModel {
  /** Titre de la tendance */
  title: string;
  /** Description de la tendance */
  description: string;
  /** Impact potentiel */
  impact: string;
  /** Horizon temporel */
  timeframe: string;
  /** Sources d'information */
  sources: string[];
  /** Indicateurs à surveiller (optionnel) */
  indicators?: string[];
  /** Secteurs concernés */
  sectors: string[];
  /** Opportunités associées (optionnel) */
  relatedOpportunities?: string[];
  /** Menaces associées (optionnel) */
  relatedThreats?: string[];
}

/**
 * Structure des données d'analyse de marché (Service)
 */
export interface ServiceMarketAnalysis extends ServiceModel {
  /** Segments de clientèle */
  customerSegments: ServiceCustomerSegment[];
  /** Concurrents */
  competitors: ServiceCompetitor[];
  /** Opportunités de marché */
  opportunities: ServiceMarketOpportunity[];
  /** Tendances de marché */
  trends: ServiceMarketTrend[];
}
