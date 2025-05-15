import React, { useState, useEffect } from 'react';
import { useProjections } from '../../hooks/useProjections';
import { UIRevenueProjection, UIFinancialProjection } from '../../interfaces/projections';

interface ProjectionsManagerProps {
  planId: string;
}

export default function ProjectionsManager({ planId }: ProjectionsManagerProps) {
  const {
    revenueProjections,
    financialProjections,
    isLoading,
    error,
    createRevenueProjection,
    createFinancialProjection,
    updateRevenueProjection,
    updateFinancialProjection,
    deleteRevenueProjection,
    deleteFinancialProjection,
    saveProjections
  } = useProjections(planId);
  
  const [activeTab, setActiveTab] = useState<'revenue' | 'financial'>('revenue');
  const [selectedRevenueProjection, setSelectedRevenueProjection] = useState<UIRevenueProjection | null>(null);
  const [selectedFinancialProjection, setSelectedFinancialProjection] = useState<UIFinancialProjection | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Select first projection on initial load
  useEffect(() => {
    if (!isLoading) {
      if (activeTab === 'revenue' && revenueProjections.length > 0 && !selectedRevenueProjection) {
        setSelectedRevenueProjection(revenueProjections[0]);
      } else if (activeTab === 'financial' && financialProjections.length > 0 && !selectedFinancialProjection) {
        setSelectedFinancialProjection(financialProjections[0]);
      }
    }
  }, [isLoading, activeTab, revenueProjections, financialProjections, selectedRevenueProjection, selectedFinancialProjection]);
  
  // Handle tab change
  const handleTabChange = (tab: 'revenue' | 'financial') => {
    setActiveTab(tab);
  };
  
  // Handle creating new projections
  const handleCreateRevenueProjection = () => {
    const newProjection = createRevenueProjection();
    if (newProjection) {
      setSelectedRevenueProjection(newProjection);
      setUnsavedChanges(true);
    }
  };
  
  const handleCreateFinancialProjection = () => {
    const newProjection = createFinancialProjection();
    if (newProjection) {
      setSelectedFinancialProjection(newProjection);
      setUnsavedChanges(true);
    }
  };
  
  // Handle selecting projections
  const handleSelectRevenueProjection = (projection: UIRevenueProjection) => {
    setSelectedRevenueProjection(projection);
  };
  
  const handleSelectFinancialProjection = (projection: UIFinancialProjection) => {
    setSelectedFinancialProjection(projection);
  };
  
  // Handle updating projections
  const handleUpdateRevenueProjection = (updatedProjection: UIRevenueProjection) => {
    updateRevenueProjection(updatedProjection);
    setSelectedRevenueProjection(updatedProjection);
    setUnsavedChanges(true);
  };
  
  const handleUpdateFinancialProjection = (updatedProjection: UIFinancialProjection) => {
    updateFinancialProjection(updatedProjection);
    setSelectedFinancialProjection(updatedProjection);
    setUnsavedChanges(true);
  };
  
  // Handle deleting projections
  const handleDeleteRevenueProjection = (projectionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette projection ?')) {
      deleteRevenueProjection(projectionId);
      setSelectedRevenueProjection(revenueProjections.length > 1 ? revenueProjections[0] : null);
      setUnsavedChanges(true);
    }
  };
  
  const handleDeleteFinancialProjection = (projectionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette projection ?')) {
      deleteFinancialProjection(projectionId);
      setSelectedFinancialProjection(financialProjections.length > 1 ? financialProjections[0] : null);
      setUnsavedChanges(true);
    }
  };
  
  // Handle saving all projections
  const handleSave = async () => {
    const success = await saveProjections();
    if (success) {
      setUnsavedChanges(false);
    }
  };
  
  if (isLoading) {
    return <div>Chargement des projections...</div>;
  }
  
  if (error) {
    return <div>Erreur: {error}</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projections</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!unsavedChanges}
            className={`px-4 py-2 rounded-md ${
              unsavedChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Sauvegarder
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex -mb-px">
          <button
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
              activeTab === 'revenue'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleTabChange('revenue')}
          >
            Projections de Revenus
          </button>
          <button
            className={`ml-8 py-2 px-4 text-center border-b-2 font-medium text-sm ${
              activeTab === 'financial'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleTabChange('financial')}
          >
            Projections Financières
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div>
        {activeTab === 'revenue' && (
          <div>
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Projections de Revenus</h3>
              <button
                onClick={handleCreateRevenueProjection}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Nouvelle Projection
              </button>
            </div>
            
            {revenueProjections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune projection de revenus. Créez-en une nouvelle pour commencer.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 border-r pr-4">
                  <h4 className="font-medium mb-2">Projections Disponibles</h4>
                  <div className="space-y-2">
                    {revenueProjections.map((projection) => (
                      <div
                        key={projection.id}
                        className={`p-3 rounded-md cursor-pointer ${
                          selectedRevenueProjection?.id === projection.id
                            ? 'bg-blue-100 border border-blue-300'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                        onClick={() => handleSelectRevenueProjection(projection)}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{projection.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRevenueProjection(projection.id);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-sm text-gray-500">
                          {projection.period.periodType.charAt(0).toUpperCase() + projection.period.periodType.slice(1)}
                        </div>
                        <div className="text-sm font-medium mt-1">{projection.formattedTotalRevenue}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2 pl-4">
                  {selectedRevenueProjection ? (
                    <div>
                      <h4 className="font-medium mb-4">Détails de la Projection</h4>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input
                          type="text"
                          value={selectedRevenueProjection.name}
                          onChange={(e) => handleUpdateRevenueProjection({
                            ...selectedRevenueProjection,
                            name: e.target.value
                          })}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={selectedRevenueProjection.description}
                          onChange={(e) => handleUpdateRevenueProjection({
                            ...selectedRevenueProjection,
                            description: e.target.value
                          })}
                          className="w-full p-2 border rounded-md"
                          rows={2}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Total</label>
                          <div className="text-xl font-bold">{selectedRevenueProjection.formattedTotalRevenue}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Croissance</label>
                          <div className="text-xl font-bold">{selectedRevenueProjection.percentGrowth}</div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h5 className="font-medium mb-2">Scénarios</h5>
                        <div className="space-y-3">
                          {selectedRevenueProjection.scenarios.map((scenario, index) => (
                            <div key={scenario.id} className="p-3 border rounded-md">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{scenario.name}</span>
                                <span 
                                  className="text-sm px-2 py-1 rounded-full"
                                  style={{ backgroundColor: scenario.colorCode + '20', color: scenario.colorCode }}
                                >
                                  {scenario.probabilityPercentage}%
                                </span>
                              </div>
                              <div className="mt-2 text-gray-600">
                                {scenario.description}
                              </div>
                              <div className="mt-2 flex justify-between">
                                <span>Revenu projeté:</span>
                                <span className="font-medium">{scenario.formattedRevenue}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {selectedRevenueProjection.breakEvenAnalysis && (
                        <div className="mb-6">
                          <h5 className="font-medium mb-2">Analyse du Point Mort</h5>
                          <div className="p-4 border rounded-md">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm text-gray-500">Point d'équilibre</span>
                                <div className="font-bold">{selectedRevenueProjection.breakEvenAnalysis.formattedBreakEvenPoint}</div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500">Date d'atteinte</span>
                                <div className="font-bold">{selectedRevenueProjection.breakEvenAnalysis.formattedBreakEvenDate}</div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500">Mois jusqu'au seuil</span>
                                <div 
                                  className="font-bold"
                                  style={{ color: selectedRevenueProjection.breakEvenAnalysis.statusColor }}
                                >
                                  {selectedRevenueProjection.breakEvenAnalysis.formattedMonthsToBreakEven}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      Sélectionnez une projection ou créez-en une nouvelle
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'financial' && (
          <div>
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Projections Financières</h3>
              <button
                onClick={handleCreateFinancialProjection}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Nouvelle Projection
              </button>
            </div>
            
            {financialProjections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune projection financière. Créez-en une nouvelle pour commencer.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 border-r pr-4">
                  <h4 className="font-medium mb-2">Projections Disponibles</h4>
                  <div className="space-y-2">
                    {financialProjections.map((projection) => (
                      <div
                        key={projection.id}
                        className={`p-3 rounded-md cursor-pointer ${
                          selectedFinancialProjection?.id === projection.id
                            ? 'bg-blue-100 border border-blue-300'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                        onClick={() => handleSelectFinancialProjection(projection)}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{projection.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFinancialProjection(projection.id);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-sm text-gray-500">
                          {projection.period.periodType.charAt(0).toUpperCase() + projection.period.periodType.slice(1)}
                        </div>
                        <div className="text-sm font-medium mt-1">{projection.formattedNetProfit}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2 pl-4">
                  {selectedFinancialProjection ? (
                    <div>
                      <h4 className="font-medium mb-4">Détails de la Projection</h4>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input
                          type="text"
                          value={selectedFinancialProjection.name}
                          onChange={(e) => handleUpdateFinancialProjection({
                            ...selectedFinancialProjection,
                            name: e.target.value
                          })}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={selectedFinancialProjection.description}
                          onChange={(e) => handleUpdateFinancialProjection({
                            ...selectedFinancialProjection,
                            description: e.target.value
                          })}
                          className="w-full p-2 border rounded-md"
                          rows={2}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Revenus</label>
                          <div className="text-xl font-bold">{selectedFinancialProjection.formattedTotalRevenue}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dépenses</label>
                          <div className="text-xl font-bold">{selectedFinancialProjection.formattedTotalExpenses}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bénéfice Net</label>
                          <div className="text-xl font-bold">{selectedFinancialProjection.formattedNetProfit}</div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h5 className="font-medium mb-2">Compte de Résultat</h5>
                        <div className="p-4 border rounded-md">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Chiffre d'affaires</span>
                              <span className="font-medium">{selectedFinancialProjection.incomeStatement.formattedRevenue}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Coût des ventes</span>
                              <span className="font-medium">{selectedFinancialProjection.incomeStatement.formattedCostOfSales}</span>
                            </div>
                            <div className="flex justify-between font-medium border-t pt-2">
                              <span>Marge brute</span>
                              <span>{selectedFinancialProjection.incomeStatement.formattedGrossProfit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Charges d'exploitation</span>
                              <span className="font-medium">{selectedFinancialProjection.incomeStatement.formattedOperatingExpenses}</span>
                            </div>
                            <div className="flex justify-between font-medium border-t pt-2">
                              <span>Résultat d'exploitation</span>
                              <span>{selectedFinancialProjection.incomeStatement.formattedOperatingProfit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Impôts</span>
                              <span className="font-medium">{selectedFinancialProjection.incomeStatement.formattedTaxes}</span>
                            </div>
                            <div className="flex justify-between font-medium border-t pt-2">
                              <span>Résultat net</span>
                              <span>{selectedFinancialProjection.incomeStatement.formattedNetProfit}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {selectedFinancialProjection.profitabilityAnalysis && (
                        <div className="mb-6">
                          <h5 className="font-medium mb-2">Analyse de Rentabilité</h5>
                          <div className="p-4 border rounded-md">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm text-gray-500">ROI</span>
                                <div className="font-bold">{selectedFinancialProjection.profitabilityAnalysis.formattedROI}</div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500">VAN</span>
                                <div 
                                  className={`font-bold ${
                                    selectedFinancialProjection.profitabilityAnalysis.npvStatus === 'positive'
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {selectedFinancialProjection.profitabilityAnalysis.formattedNPV}
                                </div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500">TRI</span>
                                <div className="font-bold">{selectedFinancialProjection.profitabilityAnalysis.formattedIRR}</div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500">Délai de récupération</span>
                                <div className="font-bold">{selectedFinancialProjection.profitabilityAnalysis.formattedPaybackPeriod}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      Sélectionnez une projection ou créez-en une nouvelle
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}