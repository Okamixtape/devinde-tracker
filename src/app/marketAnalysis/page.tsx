"use client";
import React from "react";
import { useBusinessPlanData } from "@/app/hooks/useBusinessPlanData";
import MarketAnalysisSection from "@/app/components/MarketAnalysisSection";
import Layout from "@/app/components/Layout";
import { useSectionsData } from "@/app/hooks/useSectionsData";

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
