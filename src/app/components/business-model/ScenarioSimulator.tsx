'use client';

import React, { useState, useEffect } from 'react';
import { useBusinessModel } from '@/app/hooks/useBusinessModel';
import { 
  BusinessModelSimulationParams, 
  RevenueProjections, 
  BreakEvenAnalysis, 
  MonthlyProjection, 
  QuarterlyProjection, 
  RevenueBySource,
  RevenueSources
} from '@/app/interfaces/BusinessModelInterfaces';
import { UI_CLASSES } from '@/app/styles/ui-classes';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Sliders, Clock, Calendar, DollarSign, Save, Repeat, ChevronDown, ChevronUp, Copy, GitBranch, TrendingUp, AlertCircle, BarChart2 } from 'lucide-react';

interface ScenarioSimulatorProps {
  planId: string;
  initialParams?: Partial<BusinessModelSimulationParams>;
}

// Couleurs pour les graphiques
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#4CAF50"];

// Formatter pour les montants en euros
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

/**
 * Composant de simulation de scénarios pour le modèle économique
 * 
 * Permet de visualiser l'impact des différents paramètres sur les revenus
 * et le point d'équilibre, et de comparer différents scénarios.
 */
const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ planId, initialParams }) => {
  const {
    businessPlanData,
    simulationParams,
    projections,
    breakEven,
    isLoading,
    error,
    updateSimulationParams,
    recalculateProjections,
    loadBusinessModel
  } = useBusinessModel({ 
    planId, 
    initialSimulationParams: initialParams, 
    autoLoad: true 
  });

  // États des scénarios sauvegardés
  const [scenarios, setScenarios] = useState<{ 
    name: string; 
    params: BusinessModelSimulationParams; 
    projections: RevenueProjections | null; 
    breakEven: BreakEvenAnalysis | null;
  }[]>([]);
  const [showScenarios, setShowScenarios] = useState(false);
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [showComparisonMode, setShowComparisonMode] = useState(false);
  const [comparisonScenario, setComparisonScenario] = useState<number | null>(null);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [temporaryParams, setTemporaryParams] = useState<BusinessModelSimulationParams | null>(null);

  // Configurer les paramètres temporaires quand les paramètres de simulation changent
  useEffect(() => {
    if (simulationParams) {
      setTemporaryParams({ ...simulationParams });
    }
  }, [simulationParams]);

  // Appliquer les modifications des paramètres
  const applyParamChanges = () => {
    if (temporaryParams) {
      updateSimulationParams(temporaryParams);
      setTimeout(() => {
        recalculateProjections();
      }, 100);
    }
  };

  // Mettre à jour un paramètre temporaire
  const updateParam = (param: keyof BusinessModelSimulationParams, value: number) => {
    if (temporaryParams) {
      setTemporaryParams({
        ...temporaryParams,
        [param]: value
      });
    }
  };

  // Réinitialiser les paramètres temporaires
  const resetParams = () => {
    if (simulationParams) {
      setTemporaryParams({ ...simulationParams });
    }
  };

  // Sauvegarder le scénario actuel
  const saveCurrentScenario = () => {
    if (!simulationParams || !projections || !breakEven) return;
    
    // Créer un nouveau scénario
    const newScenario = {
      name: newScenarioName || `Scénario ${scenarios.length + 1}`,
      params: { ...simulationParams },
      projections: { ...projections },
      breakEven: { ...breakEven }
    };
    
    // Ajouter le scénario à la liste
    setScenarios([...scenarios, newScenario]);
    
    // Réinitialiser le nom du nouveau scénario
    setNewScenarioName('');
  };

  // Dupliquer un scénario
  const duplicateScenario = (index: number) => {
    const scenarioCopy = { 
      ...scenarios[index],
      name: `${scenarios[index].name} (copie)`
    };
    setScenarios([...scenarios, scenarioCopy]);
  };

  // Supprimer un scénario
  const deleteScenario = (index: number) => {
    const newScenarios = [...scenarios];
    newScenarios.splice(index, 1);
    setScenarios(newScenarios);
    
    // Si le scénario actif est supprimé, réinitialiser
    if (activeScenario === index) {
      setActiveScenario(null);
    }
    
    // Si le scénario de comparaison est supprimé, réinitialiser
    if (comparisonScenario === index) {
      setComparisonScenario(null);
    }
  };

  // Charger un scénario
  const loadScenario = (index: number) => {
    setActiveScenario(index);
    updateSimulationParams(scenarios[index].params);
    setTimeout(() => {
      recalculateProjections();
    }, 100);
  };

  // Comparer avec un scénario
  const compareWithScenario = (index: number) => {
    setComparisonScenario(index);
    setShowComparisonMode(true);
  };

  // Données pour le graphique de comparaison des revenus
  const getComparisonData = () => {
    if (comparisonScenario === null || !projections || !scenarios[comparisonScenario]) {
      return [];
    }
    
    const currentData = projections.quarterly;
    const comparisonData = scenarios[comparisonScenario].projections?.quarterly || [];
    
    return currentData.map((quarter, index) => {
      const compQuarter = index < comparisonData.length ? comparisonData[index] : { revenue: 0 };
      return {
        name: quarter.label,
        actuel: quarter.revenue,
        comparaison: compQuarter.revenue,
        difference: quarter.revenue - compQuarter.revenue
      };
    });
  };

  // Si les données sont en cours de chargement
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si une erreur s'est produite
  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Erreur</h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => loadBusinessModel(planId)}
          className={`${UI_CLASSES.BUTTON_SECONDARY} mt-4`}
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Si les paramètres temporaires ne sont pas disponibles
  if (!temporaryParams) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Paramètres non disponibles</h3>
        <p className="text-yellow-600 dark:text-yellow-400">Les paramètres de simulation ne sont pas disponibles.</p>
        <button
          onClick={() => loadBusinessModel(planId)}
          className={`${UI_CLASSES.BUTTON_SECONDARY} mt-4`}
        >
          Charger les données
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Paramètres de simulation */}
        <div className="lg:col-span-1">
          <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={UI_CLASSES.HEADING_3}>
                <span className="flex items-center">
                  <Sliders className="mr-2" size={20} />
                  Paramètres de simulation
                </span>
              </h3>
              <button
                onClick={() => setAdvancedMode(!advancedMode)}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
              >
                {advancedMode ? 'Mode simple' : 'Mode avancé'}
                {advancedMode ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Paramètres communs */}
              <div>
                <label className={UI_CLASSES.LABEL}>
                  <Clock size={16} className="inline mr-2" />
                  Heures de travail par semaine
                </label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={1}
                  value={temporaryParams.hoursPerWeek}
                  onChange={(e) => updateParam('hoursPerWeek', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>10h</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{temporaryParams.hoursPerWeek}h</span>
                  <span>50h</span>
                </div>
              </div>
              
              <div>
                <label className={UI_CLASSES.LABEL}>
                  <Calendar size={16} className="inline mr-2" />
                  Nouveaux clients par mois
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={temporaryParams.newClientsPerMonth}
                  onChange={(e) => updateParam('newClientsPerMonth', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{temporaryParams.newClientsPerMonth}</span>
                  <span>10</span>
                </div>
              </div>
              
              {/* Paramètres avancés */}
              {advancedMode && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Paramètres détaillés</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className={UI_CLASSES.LABEL}>
                          <DollarSign size={16} className="inline mr-2" />
                          Taux horaire moyen (€)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={5}
                          value={temporaryParams.hourlyRate}
                          onChange={(e) => updateParam('hourlyRate', parseFloat(e.target.value))}
                          className={UI_CLASSES.INPUT}
                        />
                      </div>
                      
                      <div>
                        <label className={UI_CLASSES.LABEL}>
                          <DollarSign size={16} className="inline mr-2" />
                          Prix moyen des forfaits (€)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={temporaryParams.packageRate}
                          onChange={(e) => updateParam('packageRate', parseFloat(e.target.value))}
                          className={UI_CLASSES.INPUT}
                        />
                      </div>
                      
                      <div>
                        <label className={UI_CLASSES.LABEL}>
                          <Repeat size={16} className="inline mr-2" />
                          Prix moyen des abonnements (€/mois)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={10}
                          value={temporaryParams.subscriptionRate}
                          onChange={(e) => updateParam('subscriptionRate', parseFloat(e.target.value))}
                          className={UI_CLASSES.INPUT}
                        />
                      </div>
                      
                      <div>
                        <label className={UI_CLASSES.LABEL}>
                          <TrendingUp size={16} className="inline mr-2" />
                          Dépenses mensuelles (€)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={temporaryParams.monthlyExpenses}
                          onChange={(e) => updateParam('monthlyExpenses', parseFloat(e.target.value))}
                          className={UI_CLASSES.INPUT}
                        />
                      </div>
                      
                      <div>
                        <label className={UI_CLASSES.LABEL}>
                          <DollarSign size={16} className="inline mr-2" />
                          Investissement initial (€)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={500}
                          value={temporaryParams.initialInvestment || 0}
                          onChange={(e) => updateParam('initialInvestment', parseFloat(e.target.value))}
                          className={UI_CLASSES.INPUT}
                        />
                      </div>
                      
                      <div>
                        <label className={UI_CLASSES.LABEL}>
                          <Calendar size={16} className="inline mr-2" />
                          Années de projection
                        </label>
                        <select
                          value={temporaryParams.yearsProjection}
                          onChange={(e) => updateParam('yearsProjection', parseInt(e.target.value))}
                          className={UI_CLASSES.INPUT}
                        >
                          <option value={1}>1 an</option>
                          <option value={2}>2 ans</option>
                          <option value={3}>3 ans</option>
                          <option value={5}>5 ans</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex justify-between pt-2">
                <button
                  onClick={resetParams}
                  className={UI_CLASSES.BUTTON_SECONDARY}
                >
                  Réinitialiser
                </button>
                
                <button
                  onClick={applyParamChanges}
                  className={UI_CLASSES.BUTTON_PRIMARY}
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
          
          {/* Gestion des scénarios */}
          <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700 mt-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={UI_CLASSES.HEADING_3}>
                <span className="flex items-center">
                  <GitBranch className="mr-2" size={20} />
                  Scénarios
                </span>
              </h3>
              <button
                onClick={() => setShowScenarios(!showScenarios)}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
              >
                {showScenarios ? 'Masquer' : 'Afficher'}
                {showScenarios ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
              </button>
            </div>
            
            {showScenarios && (
              <div className="space-y-4">
                {/* Liste des scénarios sauvegardés */}
                {scenarios.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {scenarios.map((scenario, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded border ${activeScenario === index ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600' : 'border-gray-200 dark:border-gray-700'}`}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-800 dark:text-white">{scenario.name}</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => loadScenario(index)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Charger ce scénario"
                            >
                              {activeScenario === index ? 'Actif' : 'Charger'}
                            </button>
                            <button
                              onClick={() => compareWithScenario(index)}
                              className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                              title="Comparer avec ce scénario"
                            >
                              Comparer
                            </button>
                            <button
                              onClick={() => duplicateScenario(index)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              title="Dupliquer ce scénario"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              onClick={() => deleteScenario(index)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Supprimer ce scénario"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                          <div>{scenario.params.hoursPerWeek}h/semaine • {scenario.params.newClientsPerMonth} nouveaux clients/mois</div>
                          {scenario.breakEven && (
                            <div>Point d'équilibre: {scenario.breakEven.monthsToBreakEven.toFixed(1)} mois</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">Aucun scénario sauvegardé.</p>
                )}
                
                {/* Formulaire pour sauvegarder un nouveau scénario */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newScenarioName}
                      onChange={(e) => setNewScenarioName(e.target.value)}
                      placeholder="Nom du scénario"
                      className={`${UI_CLASSES.INPUT} flex-1`}
                    />
                    <button
                      onClick={saveCurrentScenario}
                      className={`${UI_CLASSES.BUTTON_PRIMARY} flex items-center whitespace-nowrap`}
                    >
                      <Save size={16} className="mr-2" />
                      Sauvegarder
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Visualisations et résultats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Résumé des résultats */}
          <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
            <h3 className={UI_CLASSES.HEADING_3}>
              <span className="flex items-center">
                <BarChart2 className="mr-2" size={20} />
                Résultats de la simulation
              </span>
            </h3>
            
            {projections && breakEven ? (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Revenu mensuel moyen</h4>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(projections.monthly.reduce((sum, month) => sum + month.revenue, 0) / projections.monthly.length)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Revenu annuel (1ère année)</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(projections.annual.firstYear.revenue)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Point d'équilibre</h4>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {breakEven.monthsToBreakEven.toFixed(1)} mois
                    </p>
                  </div>
                </div>
                
                {breakEven.daysToBreakEven < 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-start">
                    <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Le point d'équilibre n'est pas atteint</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Avec ces paramètres, les dépenses resteront supérieures aux revenus sur la période de projection.
                        Essayez d'augmenter vos revenus ou de réduire vos dépenses.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-4">
                <p className="text-gray-500 dark:text-gray-400 text-center">Aucune donnée disponible. Veuillez ajuster les paramètres et appliquer les changements.</p>
              </div>
            )}
          </div>
          
          {/* Mode comparaison */}
          {showComparisonMode && comparisonScenario !== null && scenarios[comparisonScenario] && (
            <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={UI_CLASSES.HEADING_3}>
                  <span className="flex items-center">
                    Comparaison avec "{scenarios[comparisonScenario].name}"
                  </span>
                </h3>
                <button
                  onClick={() => setShowComparisonMode(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Fermer la comparaison
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Revenus annuels</h4>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getComparisonData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="actuel" name="Scénario actuel" fill="#4F46E5" />
                        <Bar dataKey="comparaison" name={scenarios[comparisonScenario].name} fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Différences clés</h4>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Revenu mensuel moyen</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium">
                            {projections && scenarios[comparisonScenario].projections ? 
                              formatCurrency(
                                (projections.monthly.reduce((sum, month) => sum + month.revenue, 0) / projections.monthly.length) -
                                (scenarios[comparisonScenario].projections.monthly.reduce((sum, month) => sum + month.revenue, 0) / 
                                  scenarios[comparisonScenario].projections.monthly.length)
                              ) : 
                              '0 €'}
                          </span>
                          {projections && scenarios[comparisonScenario].projections && 
                            (projections.monthly.reduce((sum, month) => sum + month.revenue, 0) / projections.monthly.length) >
                            (scenarios[comparisonScenario].projections.monthly.reduce((sum, month) => sum + month.revenue, 0) / 
                              scenarios[comparisonScenario].projections.monthly.length) ? (
                              <TrendingUp size={16} className="text-green-500 ml-1" />
                            ) : (
                              <TrendingUp size={16} className="text-red-500 ml-1 transform rotate-180" />
                            )
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Point d'équilibre</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium">
                            {breakEven && scenarios[comparisonScenario].breakEven ? 
                              `${Math.abs(breakEven.monthsToBreakEven - scenarios[comparisonScenario].breakEven.monthsToBreakEven).toFixed(1)} mois ${
                                breakEven.monthsToBreakEven < scenarios[comparisonScenario].breakEven.monthsToBreakEven ? 'plus tôt' : 'plus tard'
                              }` : 
                              'N/A'}
                          </span>
                          {breakEven && scenarios[comparisonScenario].breakEven && 
                            breakEven.monthsToBreakEven < scenarios[comparisonScenario].breakEven.monthsToBreakEven ? (
                              <TrendingUp size={16} className="text-green-500 ml-1" />
                            ) : (
                              <TrendingUp size={16} className="text-red-500 ml-1 transform rotate-180" />
                            )
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Différences de paramètres</span>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        {simulationParams.hoursPerWeek !== scenarios[comparisonScenario].params.hoursPerWeek && (
                          <div>
                            Heures par semaine: {simulationParams.hoursPerWeek} vs {scenarios[comparisonScenario].params.hoursPerWeek}
                          </div>
                        )}
                        {simulationParams.newClientsPerMonth !== scenarios[comparisonScenario].params.newClientsPerMonth && (
                          <div>
                            Nouveaux clients/mois: {simulationParams.newClientsPerMonth} vs {scenarios[comparisonScenario].params.newClientsPerMonth}
                          </div>
                        )}
                        {simulationParams.hourlyRate !== scenarios[comparisonScenario].params.hourlyRate && (
                          <div>
                            Taux horaire: {simulationParams.hourlyRate}€ vs {scenarios[comparisonScenario].params.hourlyRate}€
                          </div>
                        )}
                        {simulationParams.monthlyExpenses !== scenarios[comparisonScenario].params.monthlyExpenses && (
                          <div>
                            Dépenses mensuelles: {simulationParams.monthlyExpenses}€ vs {scenarios[comparisonScenario].params.monthlyExpenses}€
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Graphiques */}
          {projections && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Graphique de revenus trimestriels */}
              <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
                <h3 className={UI_CLASSES.HEADING_3}>Revenus trimestriels</h3>
                <div className="h-[250px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projections.quarterly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="revenue" name="Revenu" fill="#4F46E5" />
                      <Bar dataKey="profit" name="Profit" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Graphique de revenus par source */}
              <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
                <h3 className={UI_CLASSES.HEADING_3}>Répartition des revenus</h3>
                <div className="h-[250px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projections.bySource}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        dataKey="amount"
                        nameKey="sourceType"
                        label={({ sourceType, percentage }) => `${sourceType}: ${(percentage * 100).toFixed(0)}%`}
                      >
                        {projections.bySource.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label) => {
                          if (label === RevenueSources.HOURLY) return "Taux horaires";
                          if (label === RevenueSources.PACKAGE) return "Forfaits";
                          if (label === RevenueSources.SUBSCRIPTION) return "Abonnements";
                          if (label === RevenueSources.CUSTOM) return "Personnalisé";
                          return label;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Graphique d'évolution des revenus */}
              <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700 md:col-span-2`}>
                <h3 className={UI_CLASSES.HEADING_3}>Évolution du bénéfice</h3>
                <div className="h-[250px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={breakEven.breakEvenChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="Revenus" stroke="#4F46E5" strokeWidth={2} />
                      <Line type="monotone" dataKey="expenses" name="Dépenses" stroke="#F43F5E" strokeWidth={2} />
                      <Line type="monotone" dataKey="cumulativeProfit" name="Bénéfice cumulé" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulator;