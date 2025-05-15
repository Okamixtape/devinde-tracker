/**
 * BusinessModelProjectionsAdapter - Adaptateur pour les projections financières du modèle économique
 * 
 * Transforme les données entre le format service (dataModels) et le format UI (BusinessModelInterfaces).
 * Implémente les conventions définies dans /docs/CONVENTIONS.md
 *
 * @version 2.0
 * @standardized true
 */

import { BusinessPlanData } from '../services/interfaces/dataModels';
import StandardizedAdapter from './BusinessModelProjectionsAdapter.standardized';
import { 
  BusinessModelSimulationParams,
  RevenueProjections,
  BreakEvenAnalysis,
  UIBusinessModelProjections,
  ServiceBusinessModelProjections
} from '../interfaces/BusinessModelInterfaces';
import {
  BusinessModelProjections,
  SimulationParameters
} from '../interfaces/BusinessModelInterfaces';

/**
 * Énumération des types de sources de revenus
 */
export enum RevenueSources {
  HOURLY = 'hourly',
  PACKAGE = 'package',
  SUBSCRIPTION = 'subscription',
  SERVICES = 'services',
  PRODUCTS = 'products'
}

/**
 * Adaptateur pour les projections financières du modèle économique
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * et le format UI, ainsi que des calculs financiers associés.
 */
export class BusinessModelProjectionsAdapter {
  /**
   * Transforme les données du format service vers le format UI
   * Cette méthode est le point d'entrée principal pour obtenir des données formatées pour l'UI
   * 
   * @param businessPlanData Données provenant du service
   * @returns Données formatées pour l'UI avec valeurs par défaut pour les champs manquants
   */
  static toUI(businessPlanData: BusinessPlanData | null | undefined): BusinessModelProjections {
    return StandardizedAdapter.toUI(businessPlanData);
  }
  
  /**
   * Transforme les données du format UI vers le format service
   * Utilisé lors de la création ou la sauvegarde complète de données
   * 
   * @param uiData Données provenant de l'UI
   * @returns Données formatées pour le service
   */
  static toService(uiData: BusinessModelProjections | null | undefined): ServiceBusinessModelProjections {
    return StandardizedAdapter.toService(uiData);
  }
  
  /**
   * Met à jour partiellement les données du service avec les modifications de l'UI
   * Méthode clé pour les mises à jour partielles qui préserve les données non modifiées
   * 
   * @param businessPlanData Données complètes du service
   * @param uiChanges Modifications partielles de l'UI
   * @returns Données service mises à jour avec fusion intelligente
   */
  static updateServiceWithUIChanges(
    businessPlanData: BusinessPlanData | null | undefined,
    uiChanges: Partial<BusinessModelProjections> | null | undefined
  ): BusinessPlanData {
    return StandardizedAdapter.updateServiceWithUIChanges(businessPlanData, uiChanges);
  }
  
  /**
   * Génère les projections de revenus basées sur les paramètres de simulation
   * 
   * @param businessPlanData Données du plan d'affaires (optionnel)
   * @param params Paramètres de simulation
   * @returns Projections de revenus calculées
   */
  static generateRevenueProjections(
    businessPlanData: BusinessPlanData | null | undefined,
    params: BusinessModelSimulationParams | null | undefined
  ): RevenueProjections {
    return StandardizedAdapter.generateRevenueProjections(businessPlanData, params);
  }
  
  /**
   * Génère l'analyse du point d'équilibre basée sur les paramètres et projections
   * 
   * @param params Paramètres de simulation
   * @param projections Projections de revenus
   * @returns Analyse du point d'équilibre
   */
  static generateBreakEvenAnalysis(
    params: BusinessModelSimulationParams | null | undefined,
    projections: RevenueProjections | null | undefined
  ): BreakEvenAnalysis {
    return StandardizedAdapter.generateBreakEvenAnalysis(params, projections);
  }
}

/**
 * @deprecated Utilisez BusinessModelProjectionsAdapter.generateRevenueProjections à la place
 * Calcule les projections de revenus basées sur les paramètres de simulation
 */
export function calculateRevenueProjections(
  businessPlanData: BusinessPlanData,
  params: BusinessModelSimulationParams
): RevenueProjections {
  console.warn('DEPRECATED: Utilisez BusinessModelProjectionsAdapter.generateRevenueProjections à la place');
  return BusinessModelProjectionsAdapter.generateRevenueProjections(businessPlanData, params);
}

/**
 * @deprecated Utilisez BusinessModelProjectionsAdapter.generateBreakEvenAnalysis à la place
 * Calcule l'analyse du point d'équilibre
 */
export function calculateBreakEven(
  params: BusinessModelSimulationParams,
  projections: RevenueProjections
): BreakEvenAnalysis {
  console.warn('DEPRECATED: Utilisez BusinessModelProjectionsAdapter.generateBreakEvenAnalysis à la place');
  return BusinessModelProjectionsAdapter.generateBreakEvenAnalysis(params, projections);
}

export default BusinessModelProjectionsAdapter;