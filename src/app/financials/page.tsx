"use client";
import React from "react";
import { useBusinessPlanData } from "../hooks/useBusinessPlanData";
import FinancialDashboard from "../components/FinancialDashboard";
import Layout from "../components/Layout";
import { useSectionsData } from "../hooks/useSectionsData";

export default function FinancialsPage() {
  const { businessPlanData, updateData, exportData, importData } = useBusinessPlanData();
  const { sections, activeSection, setActiveSection, toggleTheme } = useSectionsData("financials");

  return (
    <Layout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      onExport={exportData}
      onImport={importData}
      onToggleTheme={toggleTheme}
      sections={sections}
    >
      <FinancialDashboard
        data={businessPlanData.financials}
        updateData={updateData}
      />
    </Layout>
  );
}
