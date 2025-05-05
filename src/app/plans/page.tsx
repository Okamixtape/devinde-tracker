'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBusinessPlanService } from '../services/service-factory';
import { BusinessPlanData } from '../services/interfaces/data-models';

/**
 * BusinessPlans Page
 * 
 * Lists all business plans and provides options to create, edit, duplicate
 * or delete a plan. Demonstrates clean integration with the service layer.
 */
export default function BusinessPlansPage() {
  const [plans, setPlans] = useState<BusinessPlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Initialize service
  const businessPlanService = getBusinessPlanService();
  
  // Load business plans
  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      try {
        const result = await businessPlanService.getItems();
        if (result.success) {
          setPlans(result.data || []);
        } else {
          setError(result.error?.message || 'Impossible de charger les plans');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Une erreur s\'est produite');
      } finally {
        setLoading(false);
      }
    };
    
    loadPlans();
  }, []);
  
  // Handle plan creation
  const handleCreatePlan = () => {
    router.push('/plans/new');
  };
  
  // Handle plan editing
  const handleEditPlan = (id: string) => {
    router.push(`/plans/${id}`);
  };
  
  // Handle viewing a plan's dashboard
  const handleViewPlan = (id: string) => {
    router.push(`/plans/${id}/dashboard`);
  };
  
  // Handle plan duplication
  const handleDuplicatePlan = async (id: string) => {
    try {
      setLoading(true);
      const result = await businessPlanService.duplicateBusinessPlan(id);
      if (result.success && result.data) {
        // Refresh the list
        const updatedPlans = await businessPlanService.getItems();
        if (updatedPlans.success) {
          setPlans(updatedPlans.data || []);
        }
      } else {
        setError(result.error?.message || 'Impossible de dupliquer le plan');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur s\'est produite');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle plan deletion
  const handleDeletePlan = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      setLoading(true);
      const result = await businessPlanService.deleteItem(id);
      if (result.success) {
        // Remove the plan from the list
        setPlans(plans.filter(plan => plan.id !== id));
      } else {
        setError(result.error?.message || 'Impossible de supprimer le plan');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur s\'est produite');
    } finally {
      setLoading(false);
    }
  };
  
  // Render loading state
  if (loading && plans.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Mes Plans d&apos;Affaires</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Plans d&apos;Affaires</h1>
        <button
          onClick={handleCreatePlan}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Nouveau Plan
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {plans.length === 0 && !loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium mb-2">Aucun plan d&apos;affaires</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Commencez par créer votre premier plan d&apos;affaires
          </p>
          <button
            onClick={handleCreatePlan}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Créer un Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div 
                className="p-6 cursor-pointer"
                onClick={() => handleViewPlan(plan.id!)}
              >
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {plan.description || 'Aucune description'}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Créé le: {new Date(plan.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPlan(plan.id!);
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Éditer
                </button>
                <div className="space-x-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPlan(plan.id!);
                    }}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Voir le tableau de bord
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicatePlan(plan.id!);
                    }}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Dupliquer
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlan(plan.id!);
                    }}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
