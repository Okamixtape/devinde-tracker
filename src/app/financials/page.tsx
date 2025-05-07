"use client";
import React from "react";
import { useBusinessPlanData } from "@/app/hooks/useBusinessPlanData";
import FinancialDashboard from "@/app/components/FinancialDashboard";
import Layout from "@/app/components/Layout";
import { useSectionsData } from "@/app/hooks/useSectionsData";

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
