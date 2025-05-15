'use client';

import React, { useState, useEffect } from 'react';
import { CardContainer, TabNavigation, DataVisualization } from '@/app/components/core';
import Card from '@/app/components/common/Card';
import { DataTable, Column } from '@/app/components/data/DataTable';
import useErrorHandler from '@/app/hooks/useErrorHandler';
import { AppError } from '@/app/services/utils/errorHandling';
import { useResponsive } from '@/app/hooks/useResponsive';
import BusinessModelDemo from '@/app/components/business/BusinessModel/BusinessModelDemo';

// Type definitions for our demo components
interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface DemoDataItem {
  id: number;
  name: string;
  category: string;
  value: number;
  status: 'active' | 'pending' | 'archived';
  lastUpdated: string;
}

// Mock data for demonstrations
const DEMO_DATA: DemoDataItem[] = [
  { id: 1, name: 'Revenue Analysis', category: 'Financial', value: 45000, status: 'active', lastUpdated: '2023-10-15' },
  { id: 2, name: 'Market Research', category: 'Analysis', value: 12500, status: 'active', lastUpdated: '2023-10-12' },
  { id: 3, name: 'Client Onboarding', category: 'Process', value: 8750, status: 'pending', lastUpdated: '2023-10-10' },
  { id: 4, name: 'Product Development', category: 'Strategy', value: 67000, status: 'active', lastUpdated: '2023-10-08' },
  { id: 5, name: 'Legacy System', category: 'Technical', value: 23400, status: 'archived', lastUpdated: '2023-09-30' },
];

// Main Demo Page Component
export default function ComponentDemoPage() {
  const { error, handleError, clearError, isLoading, handlePromise } = useErrorHandler();
  const [demoData, setDemoData] = useState<DemoDataItem[]>([]);
  const [hasTriggeredError, setHasTriggeredError] = useState(false);
  const [activeTab, setActiveTab] = useState('cards');
  
  // Simulate data loading with error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        await handlePromise(new Promise<void>((resolve) => {
          // Simulate API delay
          setTimeout(() => {
            setDemoData(DEMO_DATA);
            resolve();
          }, 1000);
        }));
      } catch (err) {
        // Error already handled by the hook
        console.error('Data loading error caught in component:', err);
      }
    };
    
    fetchData();
  }, [handlePromise]);
  
  // Columns configuration for the DataTable
  const columns: Column<DemoDataItem>[] = [
    { 
      key: 'name', 
      header: 'Name', 
      width: '25%',
      sortable: true,
      filterable: true
    },
    { 
      key: 'category', 
      header: 'Category',
      sortable: true,
      filterable: true
    },
    { 
      key: 'value', 
      header: 'Value',
      sortable: true,
      render: (value) => `$${Number(value).toLocaleString()}`
    },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      render: (value) => {
        const statusClasses = {
          active: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          archived: 'bg-gray-100 text-gray-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[value as 'active' | 'pending' | 'archived']}`}>
            {value as string}
          </span>
        );
      }
    },
    { 
      key: 'lastUpdated', 
      header: 'Last Updated',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString()
    }
  ];

  // Demo tabs configuration
  const demoTabs = [
    {
      id: 'cards',
      label: 'Cards',
    },
    {
      id: 'data-visualization',
      label: 'Data Visualization',
    },
    {
      id: 'business-components',
      label: 'Composants Métier',
    },
    {
      id: 'data-tables',
      label: 'Data Tables',
    },
    {
      id: 'error-handling',
      label: 'Error Handling',
    }
  ];

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'cards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardContainer 
              title="Basic Card Example" 
              subtitle="A simple card with header and content"
            >
              <p className="text-gray-700">
                This is a basic card component that can be used to display content with a header.
                It supports various configurations including different padding, shadows, and border styles.
              </p>
            </CardContainer>
            
            <CardContainer 
              title="Card with Actions" 
              subtitle="Demonstrates action buttons in header"
              actions={
                <>
                  <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    Cancel
                  </button>
                </>
              }
            >
              <p className="text-gray-700">
                This card demonstrates how to include action buttons in the header section.
                Actions are fully customizable and can contain any React elements.
              </p>
            </CardContainer>
            
            <CardContainer 
              title="Card with Data Visualization" 
              subtitle="Bar chart example"
              className="col-span-1 md:col-span-2"
            >
              <DataVisualization.BarChart
                data={[
                  { label: 'January', value: 12500 },
                  { label: 'February', value: 18200 },
                  { label: 'March', value: 16700 },
                  { label: 'April', value: 21300 },
                  { label: 'May', value: 24800 }
                ]}
                height={200}
                showLegend={true}
                formatValue={(value) => `${value.toLocaleString()} €`}
              />
            </CardContainer>
          </div>
        );
      case 'data-visualization':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardContainer title="Bar Chart" subtitle="Value comparison">
              <DataVisualization.BarChart
                data={[
                  { label: 'Research', value: 25000 },
                  { label: 'Development', value: 45000 },
                  { label: 'Marketing', value: 30000 },
                  { label: 'Operations', value: 20000 }
                ]}
                height={200}
                showDataLabels={true}
              />
            </CardContainer>
            
            <CardContainer title="Pie Chart" subtitle="Percentage distribution">
              <DataVisualization.PieChart
                data={[
                  { label: 'Consulting', value: 45 },
                  { label: 'Development', value: 30 },
                  { label: 'Training', value: 15 },
                  { label: 'Support', value: 10 }
                ]}
                height={200}
                showLegend={true}
                donut={true}
              />
            </CardContainer>
            
            <CardContainer title="Metric Cards" subtitle="Key performance indicators">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DataVisualization.MetricCard
                  data={{
                    title: "Revenu Mensuel",
                    value: 42500,
                    unit: "€",
                    status: "positive",
                    change: {
                      value: 12,
                      direction: "up",
                      percentage: true,
                      label: "vs. mois précédent"
                    }
                  }}
                />
                <DataVisualization.MetricCard
                  data={{
                    title: "Nouveaux Clients",
                    value: 18,
                    status: "positive",
                    change: {
                      value: 5,
                      direction: "up",
                      percentage: false,
                      label: "vs. mois précédent"
                    }
                  }}
                />
              </div>
            </CardContainer>
            
            <CardContainer title="Progress Bars" subtitle="Suivi d'objectifs">
              <div className="space-y-4">
                <DataVisualization.ProgressBar
                  title="Objectif Ventes Q2"
                  value={65}
                  target={80}
                  color="blue"
                  showPercentage={true}
                />
                <DataVisualization.ProgressBar
                  title="Recrutement"
                  value={90}
                  target={75}
                  color="green"
                  showPercentage={true}
                />
                <DataVisualization.ProgressBar
                  title="Déploiement Produit"
                  value={30}
                  target={100}
                  color="yellow"
                  showPercentage={true}
                />
              </div>
            </CardContainer>
          </div>
        );
      case 'business-components':
        return <BusinessModelDemo />;
      case 'data-tables':
        return (
          <CardContainer 
            title="Interactive Data Table" 
            subtitle="Supports sorting, filtering, and pagination"
          >
            <DataTable<DemoDataItem>
              columns={columns}
              fetchData={() => Promise.resolve(demoData)}
              initialData={demoData}
              rowKey="id"
              onRowClick={(item) => alert(`You clicked on: ${item.name}`)}
            />
          </CardContainer>
        );
      case 'error-handling':
        return (
          <CardContainer 
            title="Error Handling Demo" 
            subtitle="Demonstrates error handling with IErrorService"
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                This section demonstrates how to handle errors using the error handling system.
                Click the button below to trigger a demo error that will be caught and displayed.
              </p>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error.message || 'An error occurred'}
                      </p>
                      {error.details && (
                        <p className="mt-1 text-xs text-red-700">
                          Details: {JSON.stringify(error.details)}
                        </p>
                      )}
                      <button 
                        onClick={clearError}
                        className="mt-2 text-sm font-medium text-red-800 hover:text-red-600"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    handleError(new AppError('VALIDATION_ERROR', {
                      message: 'Demo validation error',
                      details: { field: 'demoField', constraint: 'Demo constraint failure' }
                    }));
                    setHasTriggeredError(true);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Trigger Validation Error
                </button>
                
                <button
                  onClick={() => {
                    handleError(new AppError('AUTH_ERROR', {
                      code: 'AUTH_REQUIRED',
                      message: 'Demo authentication error',
                      details: { resource: 'DemoResource' }
                    }));
                    setHasTriggeredError(true);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                >
                  Trigger Auth Error
                </button>
                
                <button
                  onClick={() => {
                    clearError();
                    setHasTriggeredError(false);
                  }}
                  disabled={!hasTriggeredError}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  Clear Error
                </button>
              </div>
            </div>
          </CardContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Component Demo</h1>
        <p className="text-gray-600">
          This page showcases the core UI components used throughout the DevInde Tracker application.
          Browse through the tabs below to see examples of each component type.
        </p>
      </div>

      <TabNavigation 
        tabs={demoTabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId)}
        variant="underline"
      />
      
      <div className="py-4">
        {renderTabContent()}
      </div>
    </div>
  );
}