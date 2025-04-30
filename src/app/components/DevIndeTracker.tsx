"use client";
import React, { useState } from "react";
import { Settings, Download, Upload, Home } from "lucide-react";

// Composants améliorés
import Dashboard from "./Dashboard";
import PricingSection from "./PricingSection";
import FinancialDashboard from "./FinancialDashboard";
import ActionPlanTimeline from "./ActionPlanTimeline";

// Composants existants (à utiliser pour des fonctionnalités non encore améliorées)
import PitchSection from "./PitchSection";
import ServicesSection from "./ServicesSection";
import MarketAnalysisSection from "./MarketAnalysisSection";

import Sidebar from "./Sidebar";
import Header from "./Header";

import type { SectionKey } from "./types";
import { useBusinessPlanData } from "../hooks/useBusinessPlanData";

// Composant principal
const DevIndeTracker: React.FC = () => {
  const {
    businessPlanData,
    updateData,
    addListItem,
    removeListItem,
    importData,
    exportData,
  } = useBusinessPlanData();

  // État pour la section active et le thème
  const [activeSection, setActiveSection] = useState<SectionKey | "dashboard">("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Rendu des sections
  const renderSectionContent = () => {
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
            addListItem={(section, field) => {
              const input = document.getElementById(`new-${section}-${field}`) as HTMLInputElement;
              if (input && input.value.trim()) {
                addListItem(section, field);
              }
            }}
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
  };

  // Sections pour la barre latérale (avec le tableau de bord ajouté)
  const sections = [
    { key: "dashboard", label: "Tableau de bord", icon: <Home size={18} className="mr-2" /> },
    ...Object.keys(businessPlanData).map(key => ({
      key,
      label: key === "businessModel" 
        ? "Modèle économique" 
        : key === "marketAnalysis" 
          ? "Analyse de marché" 
          : key === "actionPlan" 
            ? "Plan d'action" 
            : key === "financials" 
              ? "Finances" 
              : key.charAt(0).toUpperCase() + key.slice(1),
      // Note: Les icônes sont définies dans le composant Sidebar
    }))
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <Header darkMode={darkMode} />
      
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onExport={exportData}
          onImport={importData}
          sections={sections}
          darkMode={darkMode}
        />
        
        <main className={`flex-1 overflow-y-auto pb-16 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {renderSectionContent()}
          
          {/* Bouton flottant pour les paramètres */}
          <div className="fixed bottom-6 right-6 flex space-x-2">
            <button 
              className={`p-3 rounded-full shadow-lg ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`}
              onClick={() => setDarkMode(!darkMode)}
              title="Changer le thème"
            >
              <Settings size={20} />
            </button>
            
            <button 
              className={`p-3 rounded-full shadow-lg ${darkMode ? 'bg-green-600' : 'bg-green-500'} text-white`}
              onClick={exportData}
              title="Exporter les données"
            >
              <Download size={20} />
            </button>
            
            <label className={`p-3 rounded-full shadow-lg ${darkMode ? 'bg-orange-600' : 'bg-orange-500'} text-white cursor-pointer`} title="Importer des données">
              <Upload size={20} />
              <input type="file" accept="application/json" className="hidden" onChange={importData} />
            </label>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DevIndeTracker;