"use client";

import React, { useState, useEffect } from 'react';
import { useBusinessPlanData } from "@/app/hooks/useBusinessPlanData";
import type { ActionPlanData } from "@/app/services/interfaces/dataModels";
import { ActionPlanManager } from '@/app/components/action-plan/ActionPlanManager';
import Layout from "@/app/components/Layout";
import { useSectionsData } from "@/app/hooks/useSectionsData";

/**
 * Page du Plan d'Action
 * 
 * Version améliorée utilisant ActionPlanManager pour une meilleure gestion
 * des plans d'action avec une UI plus moderne et des fonctionnalités étendues.
 */
export default function ActionPlanPage() {
  const { businessPlanData, exportData, importData } = useBusinessPlanData();
  const { sections, activeSection, setActiveSection, toggleTheme } = useSectionsData("actionPlan");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Vérifier que les données sont chargées correctement
  useEffect(() => {
    setLoading(!businessPlanData);
    if (!businessPlanData) {
      setError("Impossible de charger les données du plan d'affaires");
    } else {
      setError(null);
    }
  }, [businessPlanData]);

  // Fonction pour sauvegarder les données du plan d'action
  const handleSaveActionPlan = (newActionPlanData: ActionPlanData) => {
    if (businessPlanData) {
      // Créer une nouvelle copie complète des données
      const updatedBusinessPlan = {
        ...businessPlanData,
        actionPlan: newActionPlanData
      };

      try {
        // Sauvegarder dans localStorage
        localStorage.setItem('devinde-tracker-data', JSON.stringify(updatedBusinessPlan));
        
        // Mettre à jour l'UI avec les nouvelles données sans rafraîchir la page
        const event = new CustomEvent('businessPlanDataUpdated');
        window.dispatchEvent(event);
        
        // Afficher un message de confirmation
        alert("Les modifications ont été enregistrées avec succès!");
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
      }
    }
  };

  // Afficher un état de chargement
  if (loading) {
    return (
      <Layout
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onExport={exportData}
        onImport={importData}
        onToggleTheme={toggleTheme}
        sections={sections}
      >
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <Layout
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onExport={exportData}
        onImport={importData}
        onToggleTheme={toggleTheme}
        sections={sections}
      >
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur :</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </Layout>
    );
  }

  // Render le plan d'action avec le nouveau composant ActionPlanManager
  return (
    <Layout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      onExport={exportData}
      onImport={importData}
      onToggleTheme={toggleTheme}
      sections={sections}
    >
      {businessPlanData && (
        <ActionPlanManager
          actionPlanData={businessPlanData.actionPlan || { milestones: [], tasks: [] }}
          onSave={handleSaveActionPlan}
          readOnly={false}
        />
      )}
    </Layout>
  );
}
