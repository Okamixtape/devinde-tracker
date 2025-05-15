/**
 * Index principal des interfaces de DevIndé Tracker
 * 
 * Ce fichier exporte toutes les interfaces standardisées de l'application
 * pour faciliter leur import depuis d'autres modules.
 * 
 * @version 1.3
 * @standardized true
 */

// Export des interfaces de base et types communs
export * from './common/base-models';
export * from './common/common-types';

// Export des interfaces du modèle économique
export * from './business-model';

// Export des interfaces du plan d'action
export * from './action-plan';

// Export des interfaces d'analyse de marché
export * from './market-analysis';

// Export des interfaces pour les clients à risque
export * from './client-risk';

// Export des interfaces de facturation
export * from './invoicing';

// Export des anciennes interfaces (pour la rétrocompatibilité) 
// Ces exports seront supprimés progressivement
export * from './UIModels';
export * from './client-risk';
export * from './invoicing';