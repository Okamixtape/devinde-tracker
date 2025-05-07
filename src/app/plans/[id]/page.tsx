'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BusinessPlanEditor } from '@/app/components/business-plan/BusinessPlanEditor';

/**
 * BusinessPlan Edit/Create Page
 * 
 * Handles both creation of new business plans and editing existing ones.
 * Demonstrates the proper pattern for connecting page components to UI components
 * that integrate with the service layer.
 */
export default function BusinessPlanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isNew = id === 'new';
  
  // Handle save completion
  const handleSave = (planId: string) => {
    // Rediriger vers le tableau de bord du plan nouvellement créé
    router.push(`/plans/${planId}/dashboard`);
  };
  
  // Handle cancellation
  const handleCancel = () => {
    router.push('/plans');
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? 'Créer un Nouveau Plan' : 'Modifier le Plan'}
      </h1>
      
      <BusinessPlanEditor 
        businessPlanId={isNew ? undefined : id}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
