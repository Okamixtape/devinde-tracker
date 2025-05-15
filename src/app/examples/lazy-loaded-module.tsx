'use client';

import React, { lazy, Suspense } from 'react';
import { CardContainer } from '@/app/components/core';

// Import dynamique du composant BusinessModel
// Ce modèle peut être appliqué à tous les modules lourds qui n'ont pas besoin
// d'être chargés immédiatement au démarrage de l'application
const BusinessModelDemo = lazy(() => import('@/app/components/business/BusinessModel/BusinessModelDemo'));

/**
 * Exemple démontrant le lazy-loading des modules
 * 
 * Cette approche permet de réduire la taille du bundle initial et d'améliorer
 * les performances de chargement de l'application.
 */
const LazyLoadedExample: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lazy Loading Example</h1>
      <p className="mb-6">
        Cette page démontre comment charger des modules à la demande pour améliorer 
        les performances initiales de l'application.
      </p>
      
      <CardContainer
        title="Module chargé à la demande"
        subtitle="Ce module n'est chargé que lorsque l'utilisateur visite cette page"
      >
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }>
          <BusinessModelDemo sectionId="demo-section" />
        </Suspense>
      </CardContainer>
    </div>
  );
};

export default LazyLoadedExample;