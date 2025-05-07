'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BusinessPlan } from "@/app/services/interfaces/serviceInterfaces";
import { HourlyRate, ServicePackage, Subscription } from "@/app/services/interfaces/dataModels";
import { RevenueProjector, RevenueProjectionData } from '@/app/components/revenue/RevenueProjector';
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
  
  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null);
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
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Une erreur s\'est produite');
        router.push('/plans');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadBusinessPlan();
    }
  }, [id, router, businessPlanService]);
  
  // Handle saving projection data with proper type safety
  const handleSaveProjections = async (projectionData: RevenueProjectionData) => {
    if (!businessPlan) return;
    
    try {
      // Update the business plan with new projection data
      const updatedPlan: Partial<BusinessPlan> = {
        ...businessPlan,
        revenueProjections: projectionData
      };
      
      const result = await businessPlanService.updateItem(id, updatedPlan);
      
      if (result.success && result.data) {
        setBusinessPlan(result.data);
        
        // Update section completion if there's a revenue section
        const revenueSection = businessPlan.sections?.find(section => {
          const sectionObj = section as Record<string, unknown>;
          return sectionObj.key === 'revenue';
        });
        
        if (revenueSection) {
          const sectionObj = revenueSection as Record<string, unknown>;
          const sectionId = String(sectionObj.id);
          await sectionService.updateSectionCompletion(sectionId, 100);
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
        hourlyRates={(businessPlan as Record<string, unknown>).hourlyRates as HourlyRate[] || []}
        packages={(businessPlan as Record<string, unknown>).packages as ServicePackage[] || []}
        subscriptions={(businessPlan as Record<string, unknown>).subscriptions as Subscription[] || []}
        onSave={handleSaveProjections}
        readOnly={false}
      />
    </div>
  );
}
