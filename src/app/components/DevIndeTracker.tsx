"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Home } from "lucide-react";

// Composants
import Dashboard from "./Dashboard";
import PricingSection from "./PricingSection";
import FinancialDashboard from "./FinancialDashboard";
import ActionPlanTimeline from "./ActionPlanTimeline";
import PitchSection from "./PitchSection";
import ServicesSection from "./ServicesSection";
import MarketAnalysisSection from "./MarketAnalysisSection";
import Layout from "./Layout";
import { ExtendedSectionKey, NavSection } from "./Sidebar";

// Types et hooks
import type { SectionKey } from "./types";
import { useBusinessPlanData } from "../hooks/useBusinessPlanData";
import { useTheme } from "../context/ThemeContext";
import { webFreelanceData } from "../data/demo-data";

/**
 * Mapping des clés de section aux libellés affichés
 */
const SECTION_LABELS: Record<string, string> = {
  dashboard: "Tableau de bord",
  businessModel: "Modèle économique",
  marketAnalysis: "Analyse de marché",
  actionPlan: "Plan d'action",
  financials: "Finances",
  pitch: "Pitch",
  services: "Services"
};

/**
 * Composant principal de l'application DevIndé Tracker
 * Gère l'affichage des différentes sections et la navigation
 */
const DevIndeTracker: React.FC = () => {
  const {
    businessPlanData,
    updateData,
    addListItem,
    removeListItem,
    importData,
    exportData,
    loadDemoData
  } = useBusinessPlanData();

  // État pour la section active
  const [activeSection, setActiveSection] = useState<ExtendedSectionKey>("dashboard");
  const { toggleTheme } = useTheme();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Charger les données de démo lors du premier rendu
  useEffect(() => {
    if (isFirstLoad) {
      loadDemoData(webFreelanceData);
      setIsFirstLoad(false);
    }
  }, [isFirstLoad, loadDemoData]);

  // Gestion des ajouts d'éléments dans les listes avec validation
  const handleAddListItem = useCallback((section: SectionKey, field: string) => {
    const input = document.getElementById(`new-${section}-${field}`) as HTMLInputElement;
    if (input && input.value.trim()) {
      addListItem(section, field);
    }
  }, [addListItem]);

  // Construction des sections pour la barre latérale
  const sidebarSections = useMemo<NavSection[]>(() => {
    const dashboardSection = { 
      key: "dashboard", 
      label: SECTION_LABELS.dashboard, 
      icon: <Home size={18} /> 
    };
    
    const businessPlanSections = Object.keys(businessPlanData).map(key => ({
      key,
      label: SECTION_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1)
    }));
    
    return [dashboardSection, ...businessPlanSections];
  }, [businessPlanData]);

  // Gestionnaire d'import avec feedback
  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const result = await importData(event);
      if (result.success) {
        // On pourrait ajouter un toast ou une notification ici
        console.log("Import réussi !");
      } else {
        console.error("Erreur d'import:", result.error);
        // Affichage d'un message d'erreur à l'utilisateur
        alert(`Erreur lors de l'import: ${result.error}`);
      }
    } catch (error) {
      console.error("Erreur inattendue lors de l'import:", error);
      alert("Une erreur inattendue est survenue lors de l'import");
    }
  }, [importData]);

  /**
   * Rendu des sections en fonction de la section active
   */
  const renderSectionContent = useCallback(() => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard businessPlanData={businessPlanData} />;
      
      case "pitch":
        return (
          <PitchSection
            data={businessPlanData.pitch}
            updateData={updateData}
            addListItem={addListItem}
            removeListItem={removeListItem}
          />
        );
      
      case "services":
        return (
          <ServicesSection
            data={businessPlanData.services}
            addListItem={handleAddListItem}
            removeListItem={removeListItem}
          />
        );
      
      case "businessModel":
        return (
          <PricingSection
            data={businessPlanData.businessModel}
            updateData={updateData}
          />
        );
      
      case "marketAnalysis":
        return (
          <MarketAnalysisSection
            data={businessPlanData.marketAnalysis}
            addListItem={addListItem}
            removeListItem={removeListItem}
          />
        );
      
      case "financials":
        return (
          <FinancialDashboard
            data={businessPlanData.financials}
            updateData={updateData}
          />
        );
      
      case "actionPlan":
        return (
          <ActionPlanTimeline
            data={businessPlanData.actionPlan}
            updateData={updateData}
          />
        );
      
      default:
        return <Dashboard businessPlanData={businessPlanData} />;
    }
  }, [
    activeSection, 
    businessPlanData, 
    updateData, 
    addListItem, 
    handleAddListItem, 
    removeListItem
  ]);

  return (
    <Layout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      onExport={exportData}
      onImport={handleImport}
      onToggleTheme={toggleTheme}
      sections={sidebarSections}
    >
      {renderSectionContent()}
    </Layout>
  );
};

export default DevIndeTracker;