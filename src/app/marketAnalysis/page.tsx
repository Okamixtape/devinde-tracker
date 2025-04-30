"use client";
import React from "react";
import { useBusinessPlanData } from "../hooks/useBusinessPlanData";
import MarketAnalysisSection from "../components/MarketAnalysisSection";
import Layout from "../components/Layout";
import { useSectionsData } from "../hooks/useSectionsData";

export default function MarketAnalysisPage() {
  const { businessPlanData, addListItem, removeListItem, exportData, importData } = useBusinessPlanData();
  const { sections, activeSection, setActiveSection, toggleTheme } = useSectionsData("marketAnalysis");

  return (
    <Layout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      onExport={exportData}
      onImport={importData}
      onToggleTheme={toggleTheme}
      sections={sections}
    >
      <MarketAnalysisSection
        data={businessPlanData.marketAnalysis}
        addListItem={addListItem}
        removeListItem={removeListItem}
      />
    </Layout>
  );
}
