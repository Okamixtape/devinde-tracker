'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BusinessPlanData, FinancialsData } from "@/app/services/interfaces/dataModels";
import { FinancialCalculator } from '@/app/components/financial/FinancialCalculator';
import { 
  getBusinessPlanService, 
  getSectionService 
} from '@/app/services/serviceFactory';

/**
 * Finances Page Component
 * 
 * Displays the financial calculator for a specific business plan.
 * Demonstrates integration between page components, UI components, and the service layer.
 */
export default function FinancesPage() {
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
  
  // Handle saving financial data
  const handleSaveFinancials = async (financialsData: FinancialsData) => {
    if (!businessPlan) return;
    
    try {
      // Update the business plan with new financial data
      const updatedPlan = {
        ...businessPlan,
        financials: financialsData
      };
      
      const result = await businessPlanService.updateItem(id, updatedPlan);
      
      if (result.success) {
        setBusinessPlan(result.data);
        
        // Update section completion if there's a financials section
        const financialsSection = businessPlan.sections?.find(section => section.key === 'financials');
        if (financialsSection) {
          // Calculate completion based on filled data
          const hasExpenses = financialsData.expenses.length > 0;
          const hasInitialInvestment = financialsData.initialInvestment > 0;
          const hasQuarterlyGoals = financialsData.quarterlyGoals.some(goal => goal > 0);
          
          // Simple completion calculation (more sophisticated logic could be implemented)
          const completionPercentage = [
            hasExpenses ? 50 : 0,
            hasInitialInvestment ? 25 : 0,
            hasQuarterlyGoals ? 25 : 0
          ].reduce((a, b) => a + b, 0);
          
          await sectionService.updateSectionCompletion(financialsSection.id, completionPercentage);
        }
      } else {
        setError(result.error?.message || 'Échec de l\'enregistrement des données financières');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur s\'est produite');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Finances</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (!businessPlan) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Finances</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error || 'Plan d\'affaires non trouvé'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Finances: {businessPlan.name}</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <FinancialCalculator
        businessPlanId={id}
        financialsData={businessPlan.financials}
        onSave={handleSaveFinancials}
        hourlyRates={businessPlan.businessModel?.hourlyRates || []}
        packages={businessPlan.businessModel?.packages || []}
        subscriptions={businessPlan.businessModel?.subscriptions || []}
      />
    </div>
  );
}
