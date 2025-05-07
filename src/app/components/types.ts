/**
 * Types pour l'application DevIndé Tracker
 * Ce fichier contient toutes les définitions de types utilisées dans l'application
 */

// Types pour la section Pitch
export interface PitchSection {
  // Champs originaux
  title: string;
  summary: string;
  vision: string;
  values: string[];
  
  // Champs additionnels de la vue détaillée
  problem?: string;
  solution?: string;
  uniqueValueProposition?: string;
  targetAudience?: string;
  competitiveAdvantage?: string;
}

// Types pour la section Services
export interface ServicesSection {
  offerings: string[];
  technologies: string[];
  process: string[];
}

// Types pour la section Modèle économique
export interface BusinessModelSection {
  hourlyRates: string[];
  packages: string[];
  subscriptions: string[];
}

// Types pour la section Analyse de marché
export interface MarketAnalysisSection {
  competitors: string[];
  targetClients: string[];
  trends: string[];
}

// Types pour la section Finances
export interface FinancialsSection {
  initialInvestment: number;
  quarterlyGoals: number[];
  expenses: string[];
}

// Types pour la section Plan d'action
export interface ActionPlanSection {
  milestones: string[];
}

/**
 * Structure complète des données du business plan
 */
export interface BusinessPlanData {
  pitch: PitchSection;
  services: ServicesSection;
  businessModel: BusinessModelSection;
  marketAnalysis: MarketAnalysisSection;
  financials: FinancialsSection;
  actionPlan: ActionPlanSection;
}

// Types utilitaires
export type SectionKey = keyof BusinessPlanData;

/**
 * Type générique pour obtenir les clés d'une section spécifique
 * Permet d'obtenir les types corrects dans les callbacks et les props des composants
 */
export type FieldKey<S extends SectionKey> = keyof BusinessPlanData[S];

/**
 * Type générique pour obtenir le type de valeur d'un champ spécifique
 * Utile pour le typage précis des fonctions de mise à jour
 */
export type FieldValue<S extends SectionKey, F extends FieldKey<S>> = BusinessPlanData[S][F];

/**
 * Type pour les fonctions de mise à jour des données
 */
export type UpdateDataFunction = <S extends SectionKey>(
  section: S, 
  field: FieldKey<S>, 
  value: FieldValue<S, FieldKey<S>>
) => void;

/**
 * Type pour les fonctions d'ajout d'éléments à une liste
 */
export type AddListItemFunction = (
  section: SectionKey,
  field: string
) => void;

/**
 * Type pour les fonctions de suppression d'éléments d'une liste
 */
export type RemoveListItemFunction = (
  section: SectionKey,
  field: string,
  index: number
) => void;
