'use client';

import React, { useState } from 'react';
import { MarketAnalysisData, TargetClient, Competitor } from '../../services/interfaces/data-models';

interface TargetAudienceAnalyzerProps {
  marketData?: MarketAnalysisData;
  onSave?: (marketData: MarketAnalysisData) => void;
  readOnly?: boolean;
}

/**
 * TargetAudienceAnalyzer Component
 * 
 * Provides tools for analyzing and defining target audience segments,
 * including competition analysis.
 */
export function TargetAudienceAnalyzer({
  marketData,
  onSave,
  readOnly = false
}: TargetAudienceAnalyzerProps) {
  // Initialize market analysis data
  const [analysisData, setAnalysisData] = useState<MarketAnalysisData>(marketData || {
    targetClients: [],
    competitors: [],
    trends: []
  });
  
  const [activeTab, setActiveTab] = useState<'clients' | 'competitors' | 'trends'>('clients');
  const [newTrend, setNewTrend] = useState('');
  
  // Add a new target client segment
  const handleAddTargetClient = () => {
    const newClient: TargetClient = {
      segment: '',
      needs: [],
      description: ''
    };
    
    setAnalysisData(prev => ({
      ...prev,
      targetClients: [...prev.targetClients, newClient]
    }));
  };
  
  // Update a target client segment
  const handleUpdateTargetClient = (index: number, field: keyof TargetClient, value: any) => {
    const updatedClients = [...analysisData.targetClients];
    
    if (field === 'needs' && typeof value === 'string') {
      // Handle needs as an array
      updatedClients[index] = {
        ...updatedClients[index],
        needs: value.split(',').map(need => need.trim())
      };
    } else {
      // Handle other fields
      updatedClients[index] = {
        ...updatedClients[index],
        [field]: value
      };
    }
    
    setAnalysisData(prev => ({
      ...prev,
      targetClients: updatedClients
    }));
  };
  
  // Remove a target client segment
  const handleRemoveTargetClient = (index: number) => {
    const updatedClients = [...analysisData.targetClients];
    updatedClients.splice(index, 1);
    
    setAnalysisData(prev => ({
      ...prev,
      targetClients: updatedClients
    }));
  };
  
  // Add a new competitor
  const handleAddCompetitor = () => {
    const newCompetitor: Competitor = {
      name: '',
      strengths: [],
      weaknesses: [],
      url: ''
    };
    
    setAnalysisData(prev => ({
      ...prev,
      competitors: [...prev.competitors, newCompetitor]
    }));
  };
  
  // Update a competitor
  const handleUpdateCompetitor = (index: number, field: keyof Competitor, value: any) => {
    const updatedCompetitors = [...analysisData.competitors];
    
    if ((field === 'strengths' || field === 'weaknesses') && typeof value === 'string') {
      // Handle arrays
      updatedCompetitors[index] = {
        ...updatedCompetitors[index],
        [field]: value.split(',').map(item => item.trim())
      };
    } else {
      // Handle other fields
      updatedCompetitors[index] = {
        ...updatedCompetitors[index],
        [field]: value
      };
    }
    
    setAnalysisData(prev => ({
      ...prev,
      competitors: updatedCompetitors
    }));
  };
  
  // Remove a competitor
  const handleRemoveCompetitor = (index: number) => {
    const updatedCompetitors = [...analysisData.competitors];
    updatedCompetitors.splice(index, 1);
    
    setAnalysisData(prev => ({
      ...prev,
      competitors: updatedCompetitors
    }));
  };
  
  // Add a new market trend
  const handleAddTrend = () => {
    if (!newTrend.trim()) return;
    
    setAnalysisData(prev => ({
      ...prev,
      trends: [...prev.trends, newTrend.trim()]
    }));
    
    setNewTrend('');
  };
  
  // Remove a market trend
  const handleRemoveTrend = (index: number) => {
    const updatedTrends = [...analysisData.trends];
    updatedTrends.splice(index, 1);
    
    setAnalysisData(prev => ({
      ...prev,
      trends: updatedTrends
    }));
  };
  
  // Handle saving the market analysis data
  const handleSave = () => {
    if (onSave) {
      onSave(analysisData);
    }
  };
  
  // Calculate possible business opportunities based on client needs and competitor weaknesses
  const calculateOpportunities = () => {
    const clientNeeds = analysisData.targetClients.flatMap(client => client.needs);
    const competitorWeaknesses = analysisData.competitors.flatMap(competitor => competitor.weaknesses);
    
    // Find intersections between client needs and competitor weaknesses
    const opportunities = clientNeeds.filter(need => 
      competitorWeaknesses.some(weakness => 
        weakness.toLowerCase().includes(need.toLowerCase()) || 
        need.toLowerCase().includes(weakness.toLowerCase())
      )
    );
    
    return [...new Set(opportunities)]; // Remove duplicates
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'clients' 
              ? 'text-blue-600 border-b-2 border-blue-500 dark:text-blue-400 dark:border-blue-400' 
              : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('clients')}
        >
          Segments Cibles
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'competitors' 
              ? 'text-blue-600 border-b-2 border-blue-500 dark:text-blue-400 dark:border-blue-400' 
              : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('competitors')}
        >
          Concurrents
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'trends' 
              ? 'text-blue-600 border-b-2 border-blue-500 dark:text-blue-400 dark:border-blue-400' 
              : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('trends')}
        >
          Tendances du Marché
        </button>
      </div>
      
      <div className="p-6">
        {/* Target Clients Tab */}
        {activeTab === 'clients' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Segments de Clientèle Cible</h3>
              {!readOnly && (
                <button
                  type="button"
                  onClick={handleAddTargetClient}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  + Ajouter un segment
                </button>
              )}
            </div>
            
            {analysisData.targetClients.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic mb-4">
                Aucun segment client défini
              </p>
            ) : (
              <div className="space-y-6">
                {analysisData.targetClients.map((client, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nom du Segment
                        </label>
                        {readOnly ? (
                          <p>{client.segment || 'Non défini'}</p>
                        ) : (
                          <input
                            type="text"
                            value={client.segment}
                            onChange={(e) => handleUpdateTargetClient(index, 'segment', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Besoins (séparés par des virgules)
                        </label>
                        {readOnly ? (
                          <p>{client.needs.join(', ') || 'Aucun besoin défini'}</p>
                        ) : (
                          <input
                            type="text"
                            value={client.needs.join(', ')}
                            onChange={(e) => handleUpdateTargetClient(index, 'needs', e.target.value)}
                            placeholder="ex: qualité, rapidité, prix abordable"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      {readOnly ? (
                        <p>{client.description || 'Aucune description'}</p>
                      ) : (
                        <textarea
                          value={client.description}
                          onChange={(e) => handleUpdateTargetClient(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                        />
                      )}
                    </div>
                    {!readOnly && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveTargetClient(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Competitors Tab */}
        {activeTab === 'competitors' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Analyse de la Concurrence</h3>
              {!readOnly && (
                <button
                  type="button"
                  onClick={handleAddCompetitor}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  + Ajouter un concurrent
                </button>
              )}
            </div>
            
            {analysisData.competitors.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic mb-4">
                Aucun concurrent défini
              </p>
            ) : (
              <div className="space-y-6">
                {analysisData.competitors.map((competitor, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nom du Concurrent
                        </label>
                        {readOnly ? (
                          <p>{competitor.name || 'Non défini'}</p>
                        ) : (
                          <input
                            type="text"
                            value={competitor.name}
                            onChange={(e) => handleUpdateCompetitor(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Site Web
                        </label>
                        {readOnly ? (
                          <p>{competitor.url || 'Non défini'}</p>
                        ) : (
                          <input
                            type="text"
                            value={competitor.url || ''}
                            onChange={(e) => handleUpdateCompetitor(index, 'url', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Forces (séparées par des virgules)
                        </label>
                        {readOnly ? (
                          <p>{competitor.strengths.join(', ') || 'Aucune force définie'}</p>
                        ) : (
                          <input
                            type="text"
                            value={competitor.strengths.join(', ')}
                            onChange={(e) => handleUpdateCompetitor(index, 'strengths', e.target.value)}
                            placeholder="ex: visibilité, expérience, prix"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Faiblesses (séparées par des virgules)
                        </label>
                        {readOnly ? (
                          <p>{competitor.weaknesses.join(', ') || 'Aucune faiblesse définie'}</p>
                        ) : (
                          <input
                            type="text"
                            value={competitor.weaknesses.join(', ')}
                            onChange={(e) => handleUpdateCompetitor(index, 'weaknesses', e.target.value)}
                            placeholder="ex: service clients, délais, qualité"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </div>
                    </div>
                    {!readOnly && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveCompetitor(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Market Trends Tab */}
        {activeTab === 'trends' && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Tendances du Marché</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Identifiez les tendances actuelles et futures dans votre secteur d&apos;activité.
              </p>
              
              {!readOnly && (
                <div className="flex mb-4">
                  <input
                    type="text"
                    value={newTrend}
                    onChange={(e) => setNewTrend(e.target.value)}
                    placeholder="Nouvelle tendance..."
                    className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddTrend}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </div>
              )}
              
              {analysisData.trends.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  Aucune tendance définie
                </p>
              ) : (
                <ul className="space-y-2">
                  {analysisData.trends.map((trend, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <span>{trend}</span>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTrend(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Supprimer
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        
        {/* Opportunities Analysis */}
        {(analysisData.targetClients.length > 0 && analysisData.competitors.length > 0) && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
            <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">
              Opportunités Potentielles
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Basé sur les besoins des clients et les faiblesses des concurrents, voici les opportunités
                potentielles identifiées:
              </p>
            </div>
            
            {calculateOpportunities().length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic">
                Aucune opportunité identifiée. Ajoutez plus de détails sur les besoins clients et les faiblesses concurrentes.
              </p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {calculateOpportunities().map((opportunity, index) => (
                  <li key={index} className="text-blue-800 dark:text-blue-200">
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {/* Save Button */}
        {!readOnly && onSave && (
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Enregistrer les Modifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
