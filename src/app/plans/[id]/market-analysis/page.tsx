'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TargetAudienceAnalyzer } from '../../../components/market-analysis/TargetAudienceAnalyzer';
import { 
  getBusinessPlanService, 
  getSectionService 
} from '../../../services/service-factory';
import { BusinessPlanData, MarketAnalysisData } from '../../../services/interfaces/data-models';

/**
 * Market Analysis Page
 * 
 * Displays the target audience analyzer for a specific business plan.
 * Follows the established service architecture pattern.
 */
export default function MarketAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [businessPlan, setBusinessPlan] = useState<BusinessPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize services
  const businessPlanService = getBusinessPlanService();
  const sectionService = getSectionService();
  
  // Load business plan data
  useEffect(() => {
    const loadBusinessPlan = async () => {
      setLoading(true);
      try {
        const result = await businessPlanService.getItem(id);
        if (result.success && result.data) {
          setBusinessPlan(result.data);
        } else {
          setError(result.error?.message || 'Impossible de charger le plan d\'affaires');
          router.push('/plans');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Une erreur s\'est produite');
        router.push('/plans');
      } finally {
        setLoading(false);
      }
    };
    
    loadBusinessPlan();
  }, [id, router]);
  
  // Handle saving market analysis data
  const handleSaveMarketAnalysis = async (marketData: MarketAnalysisData) => {
    if (!businessPlan) return;
    
    try {
      // Update the business plan with new market analysis data
      const updatedPlan = {
        ...businessPlan,
        marketAnalysis: marketData
      };
      
      const result = await businessPlanService.updateItem(id, updatedPlan);
      
      if (result.success) {
        setBusinessPlan(result.data);
        
        // Update section completion if there's a market analysis section
        const marketSection = businessPlan.sections?.find(section => section.key === 'market-analysis');
        if (marketSection) {
          // Calculate completion based on filled data
          const hasTargetClients = marketData.targetClients.length > 0;
          const hasCompetitors = marketData.competitors.length > 0;
          const hasTrends = marketData.trends.length > 0;
          
          // Simple completion calculation
          const completionPercentage = [
            hasTargetClients ? 40 : 0,
            hasCompetitors ? 40 : 0,
            hasTrends ? 20 : 0
          ].reduce((a, b) => a + b, 0);
          
          await sectionService.updateSectionCompletion(marketSection.id, completionPercentage);
        }
      } else {
        setError(result.error?.message || 'Échec de l\'enregistrement de l\'analyse de marché');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur s\'est produite');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Analyse de Marché</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (!businessPlan) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Analyse de Marché</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error || 'Plan d\'affaires non trouvé'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Analyse de Marché: {businessPlan.name}</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <TargetAudienceAnalyzer
        marketData={businessPlan.marketAnalysis}
        onSave={handleSaveMarketAnalysis}
      />
    </div>
  );
}
