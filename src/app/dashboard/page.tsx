'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBusinessPlanService } from "@/app/services/serviceFactory";

/**
 * Composant DashboardPage
 * 
 * Cette version du tableau de bord est obsolète et redirige vers
 * la nouvelle version plus cohérente avec l'expérience globale.
 */
export default function DashboardPage() {
  const router = useRouter();
  const businessPlanService = getBusinessPlanService();
  
  useEffect(() => {
    const redirectToNewDashboard = async () => {
      try {
        // Récupérer tous les plans d'affaires de l'utilisateur
        const result = await businessPlanService.getItems();
        
        if (result.success && result.data && result.data.length > 0) {
          // S'il existe au moins un plan, rediriger vers le premier
          const firstPlan = result.data[0];
          router.replace(`/plans/${firstPlan.id}/dashboard`);
        } else {
          // Sinon, rediriger vers la liste des plans
          router.replace('/plans');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des plans:', error);
        // En cas d'erreur, rediriger vers la liste des plans
        router.replace('/plans');
      }
    };
    
    redirectToNewDashboard();
  }, [router, businessPlanService]);
  
  // Afficher un chargement pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers votre tableau de bord...</p>
      </div>
    </div>
  );
}
