"use client";
import React from "react";
import { useBusinessPlanData } from "../hooks/useBusinessPlanData";
import PitchSection from "../components/PitchSection";
import Layout from "../components/Layout";
import { useSectionsData } from "../hooks/useSectionsData";

export default function PitchPage() {
  const { businessPlanData, updateData, addListItem, removeListItem, exportData, importData } = useBusinessPlanData();
  const { sections, activeSection, setActiveSection, toggleTheme } = useSectionsData("pitch");

  return (
    <Layout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      onExport={exportData}
      onImport={importData}
      onToggleTheme={toggleTheme}
      sections={sections}
    >
      <PitchSection
        data={businessPlanData.pitch}
        updateData={updateData}
        addListItem={addListItem}
        removeListItem={removeListItem}
      />
    </Layout>
  );
}
