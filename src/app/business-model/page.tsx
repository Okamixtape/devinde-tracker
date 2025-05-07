"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBusinessPlanService } from '@/app/services/serviceFactory';

/**
 * DÉPRÉCIÉ: Cette page est maintenue uniquement pour la rétrocompatibilité
 * Utiliser plutôt la version moderne à /plans/[id]/business-model
 */
export default function BusinessModelRedirect() {
  const router = useRouter();
  const businessPlanService = getBusinessPlanService();

  useEffect(() => {
    const redirectToModernVersion = async () => {
      try {
        // Récupérer le premier plan d'affaires disponible ou le plus récent
        const result = await businessPlanService.getItems();
        if (result.success && result.data && result.data.length > 0) {
          // Rediriger vers la version moderne avec l'ID du premier plan
          router.push(`/plans/${result.data[0].id}/business-model`);
        } else {
          // Si aucun plan n'existe, rediriger vers la page des plans
          router.push('/plans');
        }
      } catch (error) {
        console.error('Erreur lors de la redirection :', error);
        router.push('/plans');
      }
    };

    redirectToModernVersion();
  }, [router, businessPlanService]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl mb-4">Redirection en cours...</h2>
        <p className="text-gray-600">Vous êtes redirigé vers la version moderne de cette page.</p>
      </div>
    </div>
  );
}
