'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ActionPlanManager } from '../../../components/action-plan/ActionPlanManager';
import { 
  getBusinessPlanService, 
  getSectionService 
} from '../../../services/service-factory';
import { BusinessPlanData, ActionPlanData } from '../../../services/interfaces/data-models';

/**
 * Action Plan Page
 * 
 * Displays the action plan manager for a specific business plan.
 * Follows the established service architecture pattern.
 */
export default function ActionPlanPage() {
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
  
  // Handle saving action plan data
  const handleSaveActionPlan = async (actionPlanData: ActionPlanData) => {
    if (!businessPlan) return;
    
    try {
      // Update the business plan with new action plan data
      const updatedPlan = {
        ...businessPlan,
        actionPlan: actionPlanData
      };
      
      const result = await businessPlanService.updateItem(id, updatedPlan);
      
      if (result.success) {
        setBusinessPlan(result.data);
        
        // Update section completion if there's an action plan section
        const actionPlanSection = businessPlan.sections?.find(section => section.key === 'action-plan');
        if (actionPlanSection) {
          // Calculate completion based on filled data
          const hasMilestones = actionPlanData.milestones.length > 0;
          const hasTasks = actionPlanData.tasks.length > 0;
          const hasCompletedMilestones = actionPlanData.milestones.some(m => m.isCompleted);
          const hasCompletedTasks = actionPlanData.tasks.some(t => t.status === 'done');
          
          // Simple completion calculation
          let completionPercentage = 0;
          
          if (hasMilestones) completionPercentage += 25;
          if (hasTasks) completionPercentage += 25;
          if (hasCompletedMilestones) completionPercentage += 25;
          if (hasCompletedTasks) completionPercentage += 25;
          
          await sectionService.updateSectionCompletion(actionPlanSection.id, completionPercentage);
        }
      } else {
        setError(result.error?.message || 'Échec de l\'enregistrement du plan d\'action');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur s\'est produite');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Plan d&apos;Action</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (!businessPlan) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Plan d&apos;Action</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error || 'Plan d\'affaires non trouvé'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Plan d&apos;Action: {businessPlan.name}</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <ActionPlanManager
        actionPlanData={businessPlan.actionPlan}
        onSave={handleSaveActionPlan}
      />
    </div>
  );
}
