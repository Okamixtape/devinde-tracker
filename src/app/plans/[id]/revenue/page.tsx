'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BusinessPlanData } from "../services/interfaces/dataModels";
import { RevenueProjector } from '@/app/components/revenue/RevenueProjector';
import { 
  getBusinessPlanService, 
  getSectionService 
} from '@/app/services/serviceFactory';

/**
 * Revenue Projector Page
 * 
 * Displays the revenue projector for a specific business plan.
 * Follows the established service architecture pattern.
 */
export default function RevenuePage() {
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
  
  // Handle saving projection data
  const handleSaveProjections = async (projectionData: any) => {
    if (!businessPlan) return;
    
    try {
      // Update the business plan with new projection data
      const updatedPlan = {
        ...businessPlan,
        revenueProjections: projectionData
      };
      
      const result = await businessPlanService.updateItem(id, updatedPlan);
      
      if (result.success) {
        setBusinessPlan(result.data);
        
        // Update section completion if there's a revenue section
        const revenueSection = businessPlan.sections?.find(section => section.key === 'revenue');
        if (revenueSection) {
          // Simply having done projections counts as 100% completion for this section
          await sectionService.updateSectionCompletion(revenueSection.id, 100);
        }
      } else {
        setError(result.error?.message || 'Échec de l\'enregistrement des projections');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur s\'est produite');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Projections de Revenus</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (!businessPlan) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Projections de Revenus</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error || 'Plan d\'affaires non trouvé'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Projections de Revenus: {businessPlan.name}</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <RevenueProjector
        businessPlanId={id}
        hourlyRates={businessPlan.businessModel?.hourlyRates || []}
        packages={businessPlan.businessModel?.packages || []}
        subscriptions={businessPlan.businessModel?.subscriptions || []}
        onSave={handleSaveProjections}
      />
    </div>
  );
}
