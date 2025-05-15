/**
 * Hooks d'application - Exportation centralisée
 * 
 * Ce fichier exporte tous les hooks React personnalisés de l'application,
 * facilitant leur import depuis les composants.
 * 
 * @version 2.2
 * @standardized true
 */

// Hooks standardisés 
export { default as useBusinessModel } from './useBusinessModel';
export { default as useMarketAnalysis } from './useMarketAnalysis';
export { default as useActionPlan } from './useActionPlan.standardized';
export { default as useFinancialProjects } from './useFinancialProjects';
export { default as useRiskClient } from './useRiskClient';
export { default as useInvoicing } from './useInvoicing';

// Export d'anciens hooks pour rétrocompatibilité
// Ces hooks seront progressivement supprimés au profit des versions standardisées
export { useActionPlan as useActionPlanLegacy } from './useActionPlan';

// Types standardisés pour le modèle d'affaires
export type {
  UIBusinessModelCanvas,
  UICanvasItem,
  UIRevenueStream,
  UICostStructure,
  ServiceBusinessModelCanvas
} from '../interfaces/business-model/business-model';

export type {
  UIRevenueProjections,
  UIBreakEvenAnalysis,
  UIFinancialIndicator
} from '../interfaces/business-model/projections';

// Types standardisés pour le plan d'action
export type {
  UIMilestone,
  UITask,
  UISubTask,
  UIActionPlan,
  ItemStatus,
  PriorityLevel,
  MilestoneCategory
} from '../interfaces/action-plan/action-plan';

// Types standardisés pour l'analyse de marché
export type {
  UICustomerSegment,
  UICompetitor, 
  UIMarketOpportunity,
  UIMarketAnalysis,
  MarketTrend,
  CompetitionLevel
} from '../interfaces/market-analysis/market-analysis';

// Types standardisés pour les clients à risque
export type {
  UIRiskClient,
  UIClientIncident,
  UIRiskStats,
  UIRiskClientFilters,
  RiskLevel,
  IncidentType
} from '../interfaces/client-risk/client-risk';

// Types standardisés pour la facturation
export type {
  UIDocument,
  UIInvoiceItem,
  UIPayment,
  UIDocumentFilters,
  UIInvoicingStats,
  UIClientInfo,
  UICompanyInfo,
  DocumentType,
  DocumentStatus,
  PaymentMethod
} from '../interfaces/invoicing/invoicing';
