'use client';

import React, { useState, useEffect } from 'react';
import { CardContainer, TabNavigation, DataVisualization } from '@/app/components/core';
import useErrorHandler from '@/app/hooks/useErrorHandler';
import useBusinessModel from '@/app/hooks/useBusinessModel';
import { BusinessModelData, PricingStrategy } from '@/app/interfaces/BusinessModelInterfaces';
import { UIErrorBoundary } from '@/app/components/error';

// Mock business model data
const DEMO_BUSINESS_MODEL: BusinessModelData = {
  id: 'demo-business-model',
  name: 'Démo Business Model',
  description: 'Un modèle d\'affaires pour démonstration',
  targetMarket: 'PME, Startups, Freelances',
  pricingStrategy: {
    type: 'tiered' as PricingStrategy['type'],
    tiers: [
      { name: 'Basic', price: 99, description: 'Pour les indépendants', features: ['3 projets', 'Support par email'] },
      { name: 'Pro', price: 249, description: 'Pour les petites équipes', features: ['10 projets', 'Support prioritaire', 'Rapports avancés'] },
      { name: 'Enterprise', price: 599, description: 'Pour les grandes entreprises', features: ['Projets illimités', 'Support 24/7', 'API access', 'Formation'] }
    ]
  },
  revenue: {
    projections: [
      { period: 'Q1 2023', amount: 25000, costs: 18000, profit: 7000 },
      { period: 'Q2 2023', amount: 38000, costs: 22000, profit: 16000 },
      { period: 'Q3 2023', amount: 52000, costs: 28000, profit: 24000 },
      { period: 'Q4 2023', amount: 67000, costs: 32000, profit: 35000 }
    ]
  },
  keyMetrics: [
    { name: 'CAC', value: 350, unit: '€', trend: 'down' },
    { name: 'LTV', value: 2800, unit: '€', trend: 'up' },
    { name: 'MRR', value: 12500, unit: '€', trend: 'up' }
  ],
  costStructure: [
    { category: 'Développement', percentage: 40 },
    { category: 'Marketing', percentage: 25 },
    { category: 'Support', percentage: 20 },
    { category: 'Administration', percentage: 15 }
  ]
};

/**
 * BusinessModelDemo - A comprehensive demo component that uses the core components
 * to demonstrate a business model dashboard interface
 */
const BusinessModelDemo: React.FC = () => {
  const { error, handleError, clearError, isLoading, handlePromise } = useErrorHandler();
  const { getBusinessModel, updateBusinessModel } = useBusinessModel();
  const [businessModel, setBusinessModel] = useState<BusinessModelData | null>(null);

  // Simulate data loading with error handling
  useEffect(() => {
    const fetchBusinessModel = async () => {
      try {
        // Simulating API call with the hook's handlePromise method
        await handlePromise(
          new Promise<void>((resolve) => {
            setTimeout(() => {
              setBusinessModel(DEMO_BUSINESS_MODEL);
              resolve();
            }, 1000);
          })
        );
      } catch (err) {
        console.error('Failed to load business model data', err);
      }
    };

    fetchBusinessModel();
  }, [handlePromise]);

  // Transform data for visualizations
  const revenueData = businessModel?.revenue.projections.map(item => ({
    label: item.period,
    value: item.amount
  })) || [];

  const profitData = businessModel?.revenue.projections.map(item => ({
    label: item.period,
    value: item.profit
  })) || [];

  const costStructureData = businessModel?.costStructure.map(item => ({
    label: item.category,
    value: item.percentage
  })) || [];

  // Define tabs for the business model sections
  const businessModelTabs = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardContainer
            title="Informations Générales"
            subtitle="Détails du modèle d'affaires"
            isLoading={isLoading}
            error={error}
            errorService={undefined}
            onRetry={() => {
              clearError();
              setBusinessModel(DEMO_BUSINESS_MODEL);
            }}
          >
            {businessModel && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{businessModel.name}</h3>
                  <p className="text-gray-600">{businessModel.description}</p>
                </div>
                <div>
                  <h4 className="text-md font-medium">Marché cible</h4>
                  <p className="text-gray-600">{businessModel.targetMarket}</p>
                </div>
                <div className="flex space-x-4">
                  {businessModel.keyMetrics.map(metric => (
                    <DataVisualization.MetricCard
                      key={metric.name}
                      data={{
                        title: metric.name,
                        value: metric.value,
                        unit: metric.unit,
                        status: metric.trend === 'up' ? 'positive' : metric.trend === 'down' ? 'negative' : 'neutral',
                        change: {
                          value: metric.trend === 'up' ? 10 : -5,
                          direction: metric.trend === 'up' ? 'up' : 'down',
                          percentage: true
                        }
                      }}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContainer>

          <CardContainer
            title="Structure de Coûts"
            subtitle="Répartition des dépenses par catégorie"
            isLoading={isLoading}
            error={error}
            onRetry={() => {
              clearError();
              setBusinessModel(DEMO_BUSINESS_MODEL);
            }}
          >
            <DataVisualization.PieChart
              data={costStructureData.map((item, index) => ({
                label: item.label,
                value: item.value,
                percentage: item.value
              }))}
              height={200}
              showLegend={true}
              donut={true}
            />
          </CardContainer>

          <CardContainer
            title="Projections de Revenus"
            subtitle="Évolution des revenus par période"
            className="col-span-1 md:col-span-2"
            isLoading={isLoading}
            error={error}
            onRetry={() => {
              clearError();
              setBusinessModel(DEMO_BUSINESS_MODEL);
            }}
          >
            <DataVisualization.BarChart
              data={revenueData.map((item, index) => ({
                label: item.label,
                value: item.value,
                secondaryValue: profitData[index]?.value,
                secondaryLabel: 'Profit'
              }))}
              height={250}
              showComparison={true}
              formatValue={(value) => `${value.toLocaleString()} €`}
              showLegend={true}
            />
          </CardContainer>
        </div>
      )
    },
    {
      id: 'pricing',
      label: 'Stratégie Tarifaire',
      content: (
        <CardContainer
          title="Stratégie de Prix"
          subtitle={`Type: ${businessModel?.pricingStrategy.type}`}
          isLoading={isLoading}
          error={error}
          onRetry={() => {
            clearError();
            setBusinessModel(DEMO_BUSINESS_MODEL);
          }}
        >
          {businessModel && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {businessModel.pricingStrategy.tiers.map((tier, index) => (
                <div 
                  key={tier.name}
                  className={`border rounded-lg p-4 ${
                    index === 1 ? 'border-blue-500 shadow-md' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">{tier.name}</h3>
                    {index === 1 && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Populaire
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{tier.description}</p>
                  <div className="text-2xl font-bold mb-4">{tier.price}€<span className="text-sm text-gray-500">/mois</span></div>
                  
                  <ul className="space-y-2">
                    {tier.features.map(feature => (
                      <li key={feature} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className={`w-full mt-4 py-2 rounded-md ${
                      index === 1 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Sélectionner
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContainer>
      )
    },
    {
      id: 'revenue',
      label: 'Analyse de Revenus',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardContainer
            title="Tendance du Profit"
            subtitle="Évolution du profit par période"
            isLoading={isLoading}
            error={error}
            onRetry={() => {
              clearError();
              setBusinessModel(DEMO_BUSINESS_MODEL);
            }}
          >
            <div className="mt-2">
              <DataVisualization.BarChart
                data={profitData}
                height={200}
                formatValue={(value) => `${value.toLocaleString()} €`}
              />
              
              <DataVisualization.ProgressBar
                title="Objectif de profit Q4"
                value={Math.round((businessModel?.revenue.projections[3]?.profit || 0) / 40000 * 100)}
                target={85}
                color="green"
                showPercentage={true}
                formatLabel={(value) => `${value}% (${businessModel?.revenue.projections[3]?.profit.toLocaleString() || 0}€ / 40,000€)`}
                className="mt-4"
              />
            </div>
          </CardContainer>

          <CardContainer
            title="Ratio Coûts/Revenus"
            subtitle="Analyse de la rentabilité"
            isLoading={isLoading}
            error={error}
            onRetry={() => {
              clearError();
              setBusinessModel(DEMO_BUSINESS_MODEL);
            }}
          >
            {businessModel && (
              <div className="space-y-4 mt-2">
                {businessModel.revenue.projections.map(period => {
                  const ratio = Math.round((period.costs / period.amount) * 100);
                  return (
                    <DataVisualization.ProgressBar
                      key={period.period}
                      title={period.period}
                      value={ratio}
                      color={ratio > 80 ? 'red' : ratio > 60 ? 'yellow' : 'green'}
                      showPercentage={true}
                      formatLabel={(value) => `${value}% des revenus`}
                    />
                  );
                })}
              </div>
            )}
          </CardContainer>
        </div>
      )
    }
  ];

  return (
    <UIErrorBoundary>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Business Model</h1>
          <p className="text-gray-600">
            Visualisation et analyse du modèle d'affaires à l'aide des composants core (CardContainer, TabNavigation, DataVisualization)
          </p>
        </div>
        
        <TabNavigation 
          tabs={businessModelTabs.map(tab => ({
            id: tab.id,
            label: tab.label
          }))}
          activeTab={businessModelTabs[0].id}
          onChange={() => {}}
          variant="underline"
          size="md"
        />
        
        <div className="mt-4">
          {businessModelTabs[0].content}
        </div>
      </div>
    </UIErrorBoundary>
  );
};

export default BusinessModelDemo;