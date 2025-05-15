/**
 * MarketAnalysisAdapter - Adaptateur pour les données d'analyse de marché
 * 
 * ⚠️ CETTE VERSION EST DÉPRÉCIÉE ⚠️
 * Utiliser la version standardisée importée depuis 'src/app/adapters'
 *
 * Fichier maintenu pour compatibilité avec le code existant.
 * Toutes les méthodes sont redirigées vers l'implémentation standardisée.
 * 
 * @version 2.0
 * @deprecated Utiliser l'import depuis src/app/adapters
 */

import { BusinessPlanData } from '../services/interfaces/dataModels';
import StandardizedAdapter from './MarketAnalysisAdapter.standardized';
import {
  UIMarketAnalysis,
  UICustomerSegment,
  UICompetitor,
  UIMarketTrend,
  UIMarketOpportunity,
  UISwotAnalysis,
  UIMarketAnalysisStatistics
} from '../interfaces/market-analysis/market-analysis';

/**
 * Adaptateur pour les données d'analyse de marché
 * @deprecated Utiliser l'import depuis src/app/adapters
 */
export class MarketAnalysisAdapter {
  // Réexporte toutes les méthodes de l'adaptateur standardisé

  /**
   * Transforme les données d'analyse de marché du format service vers le format UI
   * @deprecated Utiliser l'adaptateur standardisé
   */
  static toUI(businessPlanData: BusinessPlanData): UIMarketAnalysis {
    return StandardizedAdapter.toUI(businessPlanData);
  }

  /**
   * Transforme les données du format UI vers le format service
   * @deprecated Utiliser l'adaptateur standardisé
   */
  static toService(uiData: UIMarketAnalysis): Partial<BusinessPlanData> {
    return StandardizedAdapter.toService(uiData);
  }
  
  /**
   * Met à jour partiellement les données du service avec les modifications de l'UI
   * @deprecated Utiliser l'adaptateur standardisé
   */
  static updateServiceWithUIChanges(
    businessPlanData: BusinessPlanData,
    uiChanges: Partial<UIMarketAnalysis>
  ): BusinessPlanData {
    return StandardizedAdapter.updateServiceWithUIChanges(businessPlanData, uiChanges);
  }

  /**
   * Convertit les données du business plan en segments de clientèle pour l'UI
   * @deprecated Utiliser l'adaptateur standardisé
   */
  static toCustomerSegments(businessPlanData: BusinessPlanData): UICustomerSegment[] {
    return StandardizedAdapter.toCustomerSegments(businessPlanData);
  }

  /**
   * Convertit les données du business plan en concurrents pour l'UI
   * @deprecated Utiliser l'adaptateur standardisé
   */
  static toCompetitors(businessPlanData: BusinessPlanData): UICompetitor[] {
    return StandardizedAdapter.toCompetitors(businessPlanData);
  }

  /**
   * Convertit les données du business plan en tendances de marché pour l'UI
   * @deprecated Utiliser l'adaptateur standardisé
   */
  static toMarketTrends(businessPlanData: BusinessPlanData): UIMarketTrend[] {
    return StandardizedAdapter.toMarketTrends(businessPlanData);
  }

  /**
   * Génère une analyse SWOT à partir des données du business plan
   * @deprecated Utiliser l'adaptateur standardisé
   */
  static generateSwotAnalysis(
    customerSegmentsOrBusinessPlan: UICustomerSegment[] | BusinessPlanData,
    competitors?: UICompetitor[],
    opportunities?: UIMarketOpportunity[],
    trends?: UIMarketTrend[]
  ): UISwotAnalysis {
    // Surcharge de la méthode pour gérer à la fois l'ancienne et la nouvelle signature
    if (!Array.isArray(customerSegmentsOrBusinessPlan)) {
      return StandardizedAdapter.generateSwotAnalysis(customerSegmentsOrBusinessPlan);
    }
    
    return StandardizedAdapter.generateSwotAnalysis(
      customerSegmentsOrBusinessPlan,
      competitors,
      opportunities,
      trends
    );
  }

  /**
   * Calcule les statistiques d'analyse de marché
   * @deprecated Utiliser l'adaptateur standardisé
   */
  static calculateStatistics(
    customerSegmentsOrBusinessPlan: UICustomerSegment[] | BusinessPlanData,
    competitors?: UICompetitor[],
    opportunities?: UIMarketOpportunity[],
    trends?: UIMarketTrend[]
  ): UIMarketAnalysisStatistics {
    // Surcharge de la méthode pour gérer à la fois l'ancienne et la nouvelle signature
    if (!Array.isArray(customerSegmentsOrBusinessPlan)) {
      return StandardizedAdapter.calculateStatistics(customerSegmentsOrBusinessPlan);
    }
    
    return StandardizedAdapter.calculateStatistics(
      customerSegmentsOrBusinessPlan,
      competitors,
      opportunities,
      trends
    );
  }

  /**
   * @deprecated Utiliser toUI à la place
   */
  static transformToUIFormat(businessPlanData: BusinessPlanData): UIMarketAnalysis {
    console.warn('MarketAnalysisAdapter: transformToUIFormat est déprécié, utiliser toUI à la place');
    return StandardizedAdapter.toUI(businessPlanData);
  }
}

// Export par défaut pour usage simple
export default MarketAnalysisAdapter;

/**
 * @deprecated Utiliser MarketAnalysisAdapter.toCustomerSegments à la place
 */
export function transformToCustomerSegments(businessPlanData: BusinessPlanData) {
  console.warn('transformToCustomerSegments est déprécié, utiliser MarketAnalysisAdapter.toCustomerSegments à la place');
  return MarketAnalysisAdapter.toCustomerSegments(businessPlanData);
}

/**
 * @deprecated Utiliser MarketAnalysisAdapter.toCompetitors à la place
 */
export function transformToCompetitors(businessPlanData: BusinessPlanData) {
  console.warn('transformToCompetitors est déprécié, utiliser MarketAnalysisAdapter.toCompetitors à la place');
  return MarketAnalysisAdapter.toCompetitors(businessPlanData);
}