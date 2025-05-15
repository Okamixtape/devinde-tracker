/**
 * useMarketAnalysis - Hook React pour la gestion de l'analyse de marché
 * 
 * Ce hook encapsule la logique pour interagir avec l'analyse de marché,
 * incluant les segments de clientèle, concurrents et opportunités.
 * 
 * @module hooks/useMarketAnalysis
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
// Import du service et des interfaces
import { BusinessPlanService, BusinessPlan } from '../services/interfaces/serviceInterfaces';
import * as ServiceFactory from '../services/serviceFactory';
import { BusinessPlanData } from '../services/interfaces/dataModels';
import { MarketAnalysisAdapter } from '../adapters/MarketAnalysisAdapter.standardized';
import { 
  UICustomerSegment as CustomerSegment, 
  UICompetitor as Competitor,
  UIMarketOpportunity as MarketOpportunity,
  UIMarketTrend as MarketTrend,
  UISwotAnalysis as SwotAnalysis,
  UIMarketAnalysisStatistics as MarketAnalysisStatistics,
  UIMarketAnalysis
} from '../interfaces/market-analysis';

/**
 * Paramètres du hook
 */
interface UseMarketAnalysisParams {
  planId?: string;
  autoLoad?: boolean;
}

/**
 * Résultat du hook
 */
interface UseMarketAnalysisResult {
  // Données
  businessPlanData: BusinessPlanData | null;
  segments: CustomerSegment[];
  competitors: Competitor[];
  opportunities: MarketOpportunity[];
  trends: MarketTrend[];
  swotAnalysis: SwotAnalysis | null;
  statistics: MarketAnalysisStatistics | null;
  
  // État
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  dirty: boolean;
  
  // Actions
  loadMarketAnalysis: (planId: string) => Promise<void>;
  saveMarketAnalysis: () => Promise<boolean>;
  
  // Opérations sur les segments
  addSegment: (segment: Omit<CustomerSegment, 'id'>) => void;
  updateSegment: (segment: CustomerSegment) => void;
  deleteSegment: (segmentId: string) => void;
  
  // Opérations sur les concurrents
  addCompetitor: (competitor: Omit<Competitor, 'id'>) => void;
  updateCompetitor: (competitor: Competitor) => void;
  deleteCompetitor: (competitorId: string) => void;
  
  // Opérations sur les opportunités
  addOpportunity: (opportunity: Omit<MarketOpportunity, 'id'>) => void;
  updateOpportunity: (opportunity: MarketOpportunity) => void;
  deleteOpportunity: (opportunityId: string) => void;
  
  // Opérations sur les tendances
  addTrend: (trend: Omit<MarketTrend, 'id'>) => void;
  updateTrend: (trend: MarketTrend) => void;
  deleteTrend: (trendId: string) => void;
  
  // Analyse SWOT
  regenerateSwotAnalysis: () => void;
}

/**
 * Hook pour la gestion de l'analyse de marché
 */
export const useMarketAnalysis = ({
  planId,
  autoLoad = true
}: UseMarketAnalysisParams = {}): UseMarketAnalysisResult => {
  // Obtenir l'instance du service via la factory pour suivre le pattern singleton
  const businessPlanService = useMemo<BusinessPlanService>(() => {
    return ServiceFactory.getBusinessPlanService();
  }, []);
  
  // État principal
  const [businessPlanData, setBusinessPlanData] = useState<BusinessPlanData | null>(null);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([]);
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [swotAnalysis, setSwotAnalysis] = useState<SwotAnalysis | null>(null);
  const [statistics, setStatistics] = useState<MarketAnalysisStatistics | null>(null);
  
  // État de l'interface utilisateur
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState<boolean>(false);
  
  /**
   * Charge les données de l'analyse de marché depuis le service
   */
  const loadMarketAnalysis = useCallback(async (id: string): Promise<void> => {
    if (!id) {
      setError('Aucun ID de plan d\'affaires fourni');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await businessPlanService.getItem(id);
      
      if (result.success && result.data) {
        // Le service retourne BusinessPlan mais nous travaillons avec BusinessPlanData
        // Conversion implicite car nous savons que la structure sous-jacente est compatible
        const businessPlanDataFromService = result.data as unknown as BusinessPlanData;
        setBusinessPlanData(businessPlanDataFromService);
        
        // Transformation des données via l'adaptateur standardisé
        const transformedData = MarketAnalysisAdapter.toUI(businessPlanDataFromService);
        
        // Mise à jour des états avec les données du service transformées
        setSegments(transformedData.segments || []);
        setCompetitors(transformedData.competitors || []);
        setOpportunities(transformedData.opportunities || []);
        setTrends(transformedData.trends || []);
        setSwotAnalysis(transformedData.swotAnalysis);
        setStatistics(transformedData.statistics);
        setDirty(false);
      } else {
        setError(result.error ? result.error.message : 'Erreur inconnue lors du chargement des données');
      }
    } catch (err) {
      setError(`Erreur de chargement: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Erreur lors du chargement de l\'analyse de marché:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanService]);
  
  /**
   * Sauvegarde l'analyse de marché via le service
   */
  const saveMarketAnalysis = useCallback(async (): Promise<boolean> => {
    if (!businessPlanData) {
      setError('Aucune donnée à sauvegarder');
      return false;
    }
    
    // Préparation des données, avec typage sécurisé
    const marketData = {
      segments,
      competitors,
      opportunities,
      trends
    };
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Utilisation de la méthode standardisée updateServiceWithUIChanges pour appliquer les changements
      // Mettre à jour les données du plan d'affaires
      const updatedBusinessPlanData = MarketAnalysisAdapter.updateServiceWithUIChanges(
        businessPlanData,
        marketData
      );
      
      // Pour la sauvegarde, nous devons convertir les données en BusinessPlan
      // Conversion implicite pour la compatibilité avec l'interface du service
      const businessPlanForService = updatedBusinessPlanData as unknown as BusinessPlan;
      
      // Nous devons nous assurer que businessPlanData.id existe et n'est pas undefined
      if (!businessPlanData.id) {
        throw new Error("L'ID du plan d'affaires est manquant");
      }
      
      // Mise à jour de l'item existant via le service
      const result = await businessPlanService.updateItem(businessPlanData.id, businessPlanForService);
      
      if (result.success) {
        setBusinessPlanData(updatedBusinessPlanData);
        setDirty(false);
        return true;
      } else {
        setError(result.error ? result.error.message : 'Erreur inconnue lors de la sauvegarde');
        return false;
      }
    } catch (err) {
      setError(`Erreur de sauvegarde: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Erreur lors de la sauvegarde de l\'analyse de marché:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService, segments, competitors, opportunities, trends]);
  
  /**
   * Régénère l'analyse SWOT et les statistiques
   */
  const recalculateAnalytics = useCallback(() => {
    if (businessPlanData) {
      // Créer une version mise à jour du businessPlanData avec les données actuelles
      const updatedBusinessPlanData = {
        ...businessPlanData,
        marketAnalysis: {
          ...businessPlanData.marketAnalysis,
          // Nous mettons à jour businessPlanData avec les données actuelles pour que
          // les adaptateurs puissent générer des analyses basées sur les données les plus récentes
          targetClients: segments.map(s => ({
            id: s.id,
            segment: s.name,
            description: s.description || '',
            needs: s.needs || []
          })),
          competitors: competitors.map(c => ({
            id: c.id,
            name: c.name,
            strengths: c.strengths || [],
            weaknesses: c.weaknesses || [],
            url: c.website
          })),
          trends: trends.map(t => t.name)
        }
      };
      
      // Utilisation des méthodes standardisées de l'adaptateur
      const newSwot = MarketAnalysisAdapter.generateSwotAnalysis(updatedBusinessPlanData);
      const newStats = MarketAnalysisAdapter.calculateStatistics(updatedBusinessPlanData);
      
      setSwotAnalysis(newSwot);
      setStatistics(newStats);
    }
  }, [businessPlanData, segments, competitors, trends]);
  
  // Opérations CRUD pour les segments de clientèle
  const addSegment = useCallback((segment: Omit<CustomerSegment, 'id'>): void => {
    const newSegment: CustomerSegment = {
      ...segment,
      id: `segment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    setSegments(prev => [...prev, newSegment]);
    setDirty(true);
    
    // Recalculer les statistiques et l'analyse SWOT
    recalculateAnalytics();
  }, [recalculateAnalytics]);
  
  const updateSegment = useCallback((segment: CustomerSegment): void => {
    setSegments(prev => prev.map(s => s.id === segment.id ? segment : s));
    setDirty(true);
    
    // Recalculer les statistiques et l'analyse SWOT
    recalculateAnalytics();
  }, [recalculateAnalytics]);
  
  const deleteSegment = useCallback((segmentId: string): void => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
    setDirty(true);
    
    // Recalculer les statistiques et l'analyse SWOT
    recalculateAnalytics();
  }, [recalculateAnalytics]);
  
  // Opérations CRUD pour les concurrents
  const addCompetitor = useCallback((competitor: Omit<Competitor, 'id'>): void => {
    const newCompetitor: Competitor = {
      ...competitor,
      id: `competitor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    setCompetitors(prev => [...prev, newCompetitor]);
    setDirty(true);
    
    // Recalculer les statistiques et l'analyse SWOT
    recalculateAnalytics();
  }, [recalculateAnalytics]);
  
  const updateCompetitor = useCallback((competitor: Competitor): void => {
    setCompetitors(prev => prev.map(c => c.id === competitor.id ? competitor : c));
    setDirty(true);
    
    // Recalculer les statistiques et l'analyse SWOT
    recalculateAnalytics();
  }, [recalculateAnalytics]);
  
  const deleteCompetitor = useCallback((competitorId: string): void => {
    setCompetitors(prev => prev.filter(c => c.id !== competitorId));
    setDirty(true);
    
    // Recalculer les statistiques et l'analyse SWOT
    recalculateAnalytics();
  }, [recalculateAnalytics]);
  
  // Opérations CRUD pour les opportunités
  const addOpportunity = useCallback((opportunity: Omit<MarketOpportunity, 'id'>): void => {
    const newOpportunity: MarketOpportunity = {
      ...opportunity,
      id: `opportunity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    setOpportunities(prev => [...prev, newOpportunity]);
    setDirty(true);
    
    // Recalculer les statistiques et l'analyse SWOT
    recalculateAnalytics();
  }, [recalculateAnalytics]);
  
  const updateOpportunity = useCallback((opportunity: MarketOpportunity): void => {
    setOpportunities(prev => prev.map(o => o.id === opportunity.id ? opportunity : o));
    setDirty(true);
    
    // Recalculer les statistiques et l'analyse SWOT
    recalculateAnalytics();
  }, [recalculateAnalytics]);
  
  const deleteOpportunity = useCallback((opportunityId: string): void => {
    setOpportunities(prev => prev.filter(o => o.id !== opportunityId));
    setDirty(true);
    
    // Recalculer les statistiques et l'analyse SWOT
    recalculateAnalytics();
  }, [recalculateAnalytics]);
  
  // Opérations CRUD pour les tendances
  const addTrend = useCallback((trend: Omit<MarketTrend, 'id'>): void => {
    const newTrend: MarketTrend = {
      ...trend,
      id: `trend-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    setTrends(prev => [...prev, newTrend]);
    setDirty(true);
    
    // Recalculer les statistiques et l'analyse SWOT
    recalculateAnalytics();
  }, [recalculateAnalytics]);
  
  const updateTrend = useCallback((trend: MarketTrend): void => {
    setTrends(prev => prev.map(t => t.id === trend.id ? trend : t));
    setDirty(true);
    
    // Recalculer les statistiques et l'analyse SWOT
    recalculateAnalytics();
  }, [recalculateAnalytics]);
  
  const deleteTrend = useCallback((trendId: string): void => {
    setTrends(prev => prev.filter(t => t.id !== trendId));
    setDirty(true);
    
    // Recalculer les statistiques et l'analyse SWOT
    recalculateAnalytics();
  }, [recalculateAnalytics]);
  
  // Régénère l'analyse SWOT
  const regenerateSwotAnalysis = useCallback(() => {
    if (businessPlanData) {
      // Utiliser la méthode standardisée de l'adaptateur
      const transformedData = MarketAnalysisAdapter.toUI(businessPlanData);
      setSwotAnalysis(transformedData.swotAnalysis);
    }
  }, [businessPlanData]);
  
  // Charger automatiquement les données si un planId est fourni
  useEffect(() => {
    if (autoLoad && planId && !businessPlanData) {
      loadMarketAnalysis(planId);
    }
  }, [autoLoad, planId, businessPlanData, loadMarketAnalysis]);
  
  return {
    // Données
    businessPlanData,
    segments,
    competitors,
    opportunities,
    trends,
    swotAnalysis,
    statistics,
    
    // État
    isLoading,
    isSaving,
    error,
    dirty,
    
    // Actions principales
    loadMarketAnalysis,
    saveMarketAnalysis,
    
    // Opérations sur les segments
    addSegment,
    updateSegment,
    deleteSegment,
    
    // Opérations sur les concurrents
    addCompetitor,
    updateCompetitor,
    deleteCompetitor,
    
    // Opérations sur les opportunités
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    
    // Opérations sur les tendances
    addTrend,
    updateTrend,
    deleteTrend,
    
    // Analyse SWOT
    regenerateSwotAnalysis
  };
};

export default useMarketAnalysis;