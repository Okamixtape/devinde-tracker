'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { BusinessPlanData } from "../services/interfaces/dataModels";
import { getBusinessPlanService } from '@/app/services/serviceFactory';
import { SectionManager } from '@/app/components/section/SectionManager';

/**
 * Page d'édition des sections d'un plan d'affaires
 * 
 * Permet aux utilisateurs de gérer les sections visibles et leur ordre
 * dans leur plan d'affaires
 */
export default function EditSectionsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [businessPlan, setBusinessPlan] = useState<BusinessPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialisation du service
  const businessPlanService = getBusinessPlanService();
  
  // Chargement du plan d'affaires
  useEffect(() => {
    const loadBusinessPlan = async () => {
      setLoading(true);
      try {
        const result = await businessPlanService.getItem(id);
        if (result.success && result.data) {
          setBusinessPlan(result.data);
        } else {
          setError(result.error?.message || 'Impossible de charger le plan d\'affaires');
          toast.error('Erreur : Impossible de charger le plan d\'affaires');
          router.push('/plans');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur s\'est produite';
        setError(errorMessage);
        toast.error(`Erreur : ${errorMessage}`);
        router.push('/plans');
      } finally {
        setLoading(false);
      }
    };
    
    loadBusinessPlan();
  }, [id, router, businessPlanService]);
  
  // Fonction de sauvegarde des modifications des sections
  const handleSaveSections = async (updatedPlan: BusinessPlanData) => {
    try {
      const result = await businessPlanService.updateItem(id, updatedPlan);
      if (result.success) {
        toast.success('Les sections ont été mises à jour avec succès');
        router.push(`/plans/${id}/dashboard`);
      } else {
        setError(result.error?.message || 'Impossible de sauvegarder les modifications');
        toast.error(`Erreur : ${result.error?.message || 'Impossible de sauvegarder les modifications'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur s\'est produite';
      setError(errorMessage);
      toast.error(`Erreur : ${errorMessage}`);
    }
  };
  
  // Annuler et retourner au tableau de bord
  const handleCancel = () => {
    router.push(`/plans/${id}/dashboard`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Personnalisation des Sections</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (!businessPlan) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Personnalisation des Sections</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error || 'Plan d\'affaires non trouvé'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Personnalisation des Sections: {businessPlan.name}</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <SectionManager 
        businessPlan={businessPlan} 
        onSave={handleSaveSections}
        onCancel={handleCancel}
      />
    </div>
  );
}
