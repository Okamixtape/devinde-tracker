"use client";
import React from "react";
import { useBusinessPlanData } from "../hooks/useBusinessPlanData";
import Dashboard from "../components/Dashboard";
import Layout from "../components/Layout";
import { useSectionsData } from "../hooks/useSectionsData";

export default function DashboardPage() {
  const { businessPlanData, exportData, importData } = useBusinessPlanData();
  const { sections, activeSection, setActiveSection, toggleTheme } = useSectionsData("dashboard");

  return (
    <Layout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      onExport={exportData}
      onImport={importData}
      onToggleTheme={toggleTheme}
      sections={sections}
    >
      <Dashboard businessPlanData={businessPlanData} />
    </Layout>
  );
}
