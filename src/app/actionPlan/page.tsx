"use client";
import React from "react";
import { useBusinessPlanData } from "../hooks/useBusinessPlanData";
import ActionPlanTimeline from "../components/ActionPlanTimeline";
import Layout from "../components/Layout";
import { useSectionsData } from "../hooks/useSectionsData";

export default function ActionPlanPage() {
  const { businessPlanData, updateData, exportData, importData } = useBusinessPlanData();
  const { sections, activeSection, setActiveSection, toggleTheme } = useSectionsData("actionPlan");

  return (
    <Layout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      onExport={exportData}
      onImport={importData}
      onToggleTheme={toggleTheme}
      sections={sections}
    >
      <ActionPlanTimeline
        data={businessPlanData.actionPlan}
        updateData={updateData}
      />
    </Layout>
  );
}
