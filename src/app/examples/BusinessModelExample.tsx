'use client';

import React, { useEffect } from 'react';
import { CardContainer, TabNavigation, DataVisualization } from '@/app/components/core';
import { useAppState } from '@/app/contexts/AppStateContext';
import { useAppData } from '@/app/hooks/useAppData';
import { useDataFetching } from '@/app/hooks/useDataFetching';
import { BusinessModelData } from '@/app/interfaces/BusinessModelInterfaces';
import { UIErrorBoundary } from '@/app/components/error';

/**
 * Example component showing integration of the global state management system
 * with the core UI components
 */
const BusinessModelExample: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { state } = useAppState();
  const { fetchSectionData, saveSectionData, isLoading: appDataLoading } = useAppData<BusinessModelData>();
  const { data: businessModel, fetchData, isLoading: fetchLoading } = useDataFetching<BusinessModelData>();
  
  const isLoading = appDataLoading || fetchLoading;
  
  // Initial data fetch
  useEffect(() => {
    const loadBusinessModelData = async () => {
      // Fetch the section data using the appData hook
      const sectionData = await fetchSectionData(sectionId);
      
      if (sectionData) {
        // Use the data fetching hook to store it properly
        await fetchData(async () => {
          return {
            success: true,
            data: sectionData as BusinessModelData
          };
        });
      }
    };
    
    loadBusinessModelData();
  }, [sectionId, fetchSectionData, fetchData]);
  
  // Save handler
  const handleSave = async (updatedData: Partial<BusinessModelData>) => {
    if (!businessModel) return;
    
    // Merge data
    const newData = { ...businessModel, ...updatedData };
    
    // Save to section
    await saveSectionData(sectionId, newData);
    
    // Update local state
    fetchData(async () => ({
      success: true,
      data: newData
    }));
  };
  
  // Prepare data for visualization
  const revenueData = businessModel?.revenue?.projections?.map(item => ({
    label: item.period,
    value: item.amount,
    secondaryValue: item.profit
  })) || [];
  
  const costData = businessModel?.costStructure?.map(item => ({
    label: item.category,
    value: item.percentage
  })) || [];
  
  // Define tabs
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'pricing', label: 'Tarification' },
    { id: 'financials', label: 'Finances' }
  ];
  
  return (
    <UIErrorBoundary>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Modèle d'affaires</h1>
        
        <TabNavigation 
          tabs={tabs}
          activeTab="overview"
          onChange={() => {}}
          variant="underline"
        />
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardContainer
            title="Aperçu du modèle"
            subtitle="Informations clés sur votre modèle d'affaires"
            isLoading={isLoading}
          >
            {businessModel ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{businessModel.name}</h3>
                <p className="text-gray-600">{businessModel.description}</p>
                <div>
                  <h4 className="font-medium">Marché cible</h4>
                  <p>{businessModel.targetMarket}</p>
                </div>
              </div>
            ) : (
              <p>Aucune donnée disponible</p>
            )}
          </CardContainer>
          
          <CardContainer
            title="Structure de coûts"
            subtitle="Répartition de vos dépenses"
            isLoading={isLoading}
          >
            <DataVisualization.PieChart
              data={costData.map((item, index) => ({
                label: item.label,
                value: item.value,
                percentage: item.value
              }))}
              height={200}
              donut={true}
              showLegend={true}
            />
          </CardContainer>
          
          <CardContainer
            title="Performance financière"
            subtitle="Prévisions de revenus et profits"
            className="col-span-1 md:col-span-2"
            isLoading={isLoading}
          >
            <DataVisualization.BarChart
              data={revenueData}
              showComparison={true}
              height={250}
              formatValue={(value) => `${value.toLocaleString()} €`}
            />
          </CardContainer>
        </div>
      </div>
    </UIErrorBoundary>
  );
};

export default BusinessModelExample;