"use client";
/**
 * @deprecated Cette page utilise l'ancienne structure de route.
 * Utiliser plutôt la route moderne: /plans/[id]/business-model
 * Cette page sera supprimée dans une future version.
 */
import React from "react";
import { useBusinessPlanData } from "@/app/hooks/useBusinessPlanData";
import PricingSection from "@/app/components/PricingSection";
import Layout from "@/app/components/Layout";
import { useSectionsData } from "@/app/hooks/useSectionsData";

export default function BusinessModelPage() {
  const { businessPlanData, updateData, exportData, importData } = useBusinessPlanData();
  const { sections, activeSection, setActiveSection, toggleTheme } = useSectionsData("businessModel");

  return (
    <Layout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      onExport={exportData}
      onImport={importData}
      onToggleTheme={toggleTheme}
      sections={sections}
    >
      <PricingSection
        data={businessPlanData.businessModel}
        updateData={updateData}
      />
    </Layout>
  );
}
