"use client";
import React, { useState } from "react";
import PitchSection from "./PitchSection";
import ServicesSection from "./ServicesSection";
import BusinessModelSection from "./BusinessModelSection";
import MarketAnalysisSection from "./MarketAnalysisSection";
import FinancialsSection from "./FinancialsSection";
import ActionPlanSection from "./ActionPlanSection";
import type { SectionKey } from "./types";
import { useBusinessPlanData } from "../hooks/useBusinessPlanData";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DevIndeTracker = () => {
  const {
    businessPlanData,
    updateData,
    addListItem,
    removeListItem,
    importData,
    exportData,
  } = useBusinessPlanData();

  const [activeSection, setActiveSection] = useState<SectionKey>("pitch");

  // Section rendering
  const renderSectionContent = () => {
    switch (activeSection) {
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
            updateData={updateData}
            addListItem={addListItem}
            removeListItem={removeListItem}
          />
        );
      case "businessModel":
        return (
          <BusinessModelSection
            data={businessPlanData.businessModel}
            updateData={updateData}
            addListItem={addListItem}
            removeListItem={removeListItem}
          />
        );
      case "marketAnalysis":
        return (
          <MarketAnalysisSection
            data={businessPlanData.marketAnalysis}
            updateData={updateData}
            addListItem={addListItem}
            removeListItem={removeListItem}
          />
        );
      case "financials":
        return (
          <FinancialsSection
            data={businessPlanData.financials}
            updateData={updateData}
            addListItem={addListItem}
            removeListItem={removeListItem}
          />
        );
      case "actionPlan":
        return (
          <ActionPlanSection
            data={businessPlanData.actionPlan}
            updateData={updateData}
            addListItem={addListItem}
            removeListItem={removeListItem}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Header />
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onExport={exportData}
          onImport={importData}
        />
        <main className="flex-1 p-8 overflow-y-auto">
          {renderSectionContent()}
        </main>
      </div>
    </div>
  );
};

export default DevIndeTracker;
