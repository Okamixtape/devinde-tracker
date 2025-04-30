"use client";
import React from "react";
import { useBusinessPlanData } from "../hooks/useBusinessPlanData";
import ServicesSection from "../components/ServicesSection";
import Layout from "../components/Layout";
import { useSectionsData } from "../hooks/useSectionsData";
import { BusinessPlanData } from "../components/types";

export default function ServicesPage() {
  const { businessPlanData, addListItem, removeListItem, exportData, importData } = useBusinessPlanData();
  const { sections, activeSection, setActiveSection, toggleTheme } = useSectionsData("services");

  // Gestion des ajouts d'éléments dans les listes avec validation
  const handleAddListItem = (field: string) => {
    const input = document.getElementById(`new-services-${field}`) as HTMLInputElement;
    if (input && input.value.trim()) {
      addListItem("services" as keyof BusinessPlanData, field);
    }
  };

  return (
    <Layout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      onExport={exportData}
      onImport={importData}
      onToggleTheme={toggleTheme}
      sections={sections}
    >
      <ServicesSection
        data={businessPlanData.services}
        addListItem={handleAddListItem}
        removeListItem={removeListItem}
      />
    </Layout>
  );
}
