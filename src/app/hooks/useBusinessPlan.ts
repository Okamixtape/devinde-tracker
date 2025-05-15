/**
 * useBusinessPlan - Hook pour interagir avec le service BusinessPlan
 * 
 * Ce hook facilite l'interaction entre les composants UI modernes et le
 * service BusinessPlan existant, en fournissant des méthodes adaptées
 * pour manipuler les données du plan d'affaires.
 */

import { useState, useEffect, useCallback } from 'react';
import { BusinessPlanData } from '../services/interfaces/dataModels';
import { ServiceResult } from '../services/interfaces/serviceInterfaces';
import { BusinessPlanServiceImpl } from '../services/implementations/businessPlanServiceImpl';
import { generateKeyMetrics, generateRevenueProjections, generateSmartSuggestions } from '../adapters/UIAdapters';
import { KeyMetric, RevenueProjection, SmartSuggestion } from '../interfaces/UIModels';

interface UseBusinessPlanResult {
  // Données brutes
  businessPlanData: BusinessPlanData | null;
  
  // Données transformées pour l'UI
  keyMetrics: KeyMetric[];
  revenueProjections: RevenueProjection[];
  smartSuggestions: SmartSuggestion[];
  
  // Indicateurs d'état
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadBusinessPlan: (planId: string) => Promise<void>;
  saveBusinessPlan: () => Promise<boolean>;
  updateBusinessPlanSection: <K extends keyof BusinessPlanData>(
    sectionName: K, 
    sectionData: BusinessPlanData[K]
  ) => Promise<boolean>;
}

/**
 * Hook pour accéder et manipuler les données du plan d'affaires
 */
export const useBusinessPlan = (initialPlanId?: string): UseBusinessPlanResult => {
  // Initialiser le service
  const businessPlanService = new BusinessPlanServiceImpl();
  
  // État local
  const [businessPlanData, setBusinessPlanData] = useState<BusinessPlanData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Données dérivées pour l'UI
  const [keyMetrics, setKeyMetrics] = useState<KeyMetric[]>([]);
  const [revenueProjections, setRevenueProjections] = useState<RevenueProjection[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  
  /**
   * Charger les données du plan d'affaires
   */
  const loadBusinessPlan = useCallback(async (planId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result: ServiceResult<BusinessPlanData> = await businessPlanService.getBusinessPlan(planId);
      
      if (result.success && result.data) {
        setBusinessPlanData(result.data);
        
        // Générer les données dérivées pour l'UI
        setKeyMetrics(generateKeyMetrics(result.data));
        setRevenueProjections(generateRevenueProjections(result.data));
        setSmartSuggestions(generateSmartSuggestions(result.data));
      } else {
        setError(result.error || 'Erreur inconnue lors du chargement du plan d\'affaires');
      }
    } catch (err) {
      setError('Erreur lors du chargement du plan d\'affaires: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanService]);
  
  /**
   * Sauvegarder le plan d'affaires
   */
  const saveBusinessPlan = useCallback(async (): Promise<boolean> => {
    if (!businessPlanData) {
      setError('Aucun plan d\'affaires à sauvegarder');
      return false;
    }
    
    try {
      const result = await businessPlanService.saveBusinessPlan(businessPlanData);
      
      if (!result.success) {
        setError(result.error || 'Erreur inconnue lors de la sauvegarde');
        return false;
      }
      
      return true;
    } catch (err) {
      setError('Erreur lors de la sauvegarde: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [businessPlanData, businessPlanService]);
  
  /**
   * Mettre à jour une section spécifique du plan d'affaires
   */
  const updateBusinessPlanSection = useCallback(async <K extends keyof BusinessPlanData>(
    sectionName: K, 
    sectionData: BusinessPlanData[K]
  ): Promise<boolean> => {
    if (!businessPlanData) {
      setError('Aucun plan d\'affaires à mettre à jour');
      return false;
    }
    
    try {
      // Mettre à jour localement
      const updatedBusinessPlan = {
        ...businessPlanData,
        [sectionName]: sectionData
      };
      
      setBusinessPlanData(updatedBusinessPlan);
      
      // Régénérer les données dérivées
      setKeyMetrics(generateKeyMetrics(updatedBusinessPlan));
      setRevenueProjections(generateRevenueProjections(updatedBusinessPlan));
      setSmartSuggestions(generateSmartSuggestions(updatedBusinessPlan));
      
      // Sauvegarder dans le service
      const result = await businessPlanService.saveBusinessPlan(updatedBusinessPlan);
      
      if (!result.success) {
        setError(result.error || 'Erreur inconnue lors de la mise à jour');
        return false;
      }
      
      return true;
    } catch (err) {
      setError('Erreur lors de la mise à jour: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [businessPlanData, businessPlanService]);
  
  // Charger les données initiales si un ID est fourni
  useEffect(() => {
    if (initialPlanId) {
      loadBusinessPlan(initialPlanId);
    }
  }, [initialPlanId, loadBusinessPlan]);
  
  return {
    businessPlanData,
    isLoading,
    error,
    keyMetrics,
    revenueProjections,
    smartSuggestions,
    loadBusinessPlan,
    saveBusinessPlan,
    updateBusinessPlanSection
  };
};
