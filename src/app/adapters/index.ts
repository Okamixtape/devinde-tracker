/**
 * Adaptateurs pour DevIndé Tracker - Exportation centralisée
 * 
 * Ce fichier exporte tous les adaptateurs standardisés de l'application,
 * facilitant leur import depuis les composants.
 * 
 * @version 1.2
 * @standardized true
 */

// Adaptateurs standardisés
export { default as BusinessModelAdapter } from './BusinessModelAdapter.standardized';
export { default as BusinessModelProjectionsAdapter } from './BusinessModelProjectionsAdapter';
export { default as ActionPlanAdapter } from './ActionPlanAdapter.standardized';
export { default as MarketAnalysisAdapter } from './MarketAnalysisAdapter.standardized';
export { default as RiskClientAdapter } from './RiskClientAdapter.standardized';
export { default as InvoicingAdapter } from './InvoicingAdapter.standardized';

// Adaptateurs non standardisés (pour rétrocompatibilité temporaire)
// À terme, ces exports seront supprimés au profit des versions standardisées
export { default as BusinessModelAdapterLegacy } from './BusinessModelAdapter';
export { default as ActionPlanAdapterLegacy } from './ActionPlanAdapter';
export { default as MarketAnalysisAdapterLegacy } from './MarketAnalysisAdapter';