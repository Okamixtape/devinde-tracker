'use client';

import React, { useState, useEffect } from 'react';
import { useBusinessModel } from '@/app/hooks/useBusinessModel';
import { 
  BusinessKPIs,
  BusinessModelCanvasData,
  PricingModel,
  RevenueSources
} from '@/app/interfaces/BusinessModelInterfaces';
import { UI_CLASSES } from '@/app/styles/ui-classes';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, TrendingDown, Zap, Users, Clock, ActivitySquare, Target, Percent, AlertCircle, ArrowUpRight, AlertTriangle } from 'lucide-react';

interface KPIDashboardProps {
  planId: string;
}

/**
 * Tableau de bord des KPIs du modèle économique
 * 
 * Affiche les indicateurs clés de performance et fournit des recommandations
 * automatiques basées sur l'analyse des données.
 */
const KPIDashboard: React.FC<KPIDashboardProps> = ({ planId }) => {
  const {
    businessPlanData,
    standardizedBusinessModel,
    standardizedPricing,
    projections,
    breakEven,
    isLoading,
    error,
    loadBusinessModel
  } = useBusinessModel({ planId, autoLoad: true });

  // États locaux
  const [kpis, setKpis] = useState<BusinessKPIs | null>(null);
  const [recommendations, setRecommendations] = useState<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    type: 'pricing' | 'efficiency' | 'revenue' | 'client';
  }[]>([]);
  const [selectedTab, setSelectedTab] = useState<'kpis' | 'recommendations'>('kpis');

  // Calculer les KPIs lorsque les données sont disponibles
  useEffect(() => {
    if (businessPlanData && projections && standardizedPricing) {
      calculateKPIs();
    }
  }, [businessPlanData, projections, standardizedPricing]);

  // Calculer les KPIs
  const calculateKPIs = () => {
    if (!businessPlanData || !projections || !standardizedPricing) return;

    // Valeurs par défaut pour éviter les erreurs
    const hourlyRates = standardizedPricing.hourlyRates || [];
    const allProjects = projections.monthly.length;
    const monthlyProjectRevenue = projections.monthly[0]?.revenue || 0;
    const servicesCount = (standardizedPricing.hourlyRates.length || 0) + 
                          (standardizedPricing.packages.length || 0) + 
                          (standardizedPricing.subscriptions.length || 0);
    
    // Calculer la répartition des revenus par source
    const revenueBySource = projections.bySource || [];
    const hourlyRevenue = revenueBySource.find(s => s.sourceType === RevenueSources.HOURLY)?.amount || 0;
    const packageRevenue = revenueBySource.find(s => s.sourceType === RevenueSources.PACKAGE)?.amount || 0;
    const subscriptionRevenue = revenueBySource.find(s => s.sourceType === RevenueSources.SUBSCRIPTION)?.amount || 0;
    
    // Calculer les métriques
    const calculatedKpis: BusinessKPIs = {
      // Revenu mensuel récurrent (abonnements)
      monthlyRecurringRevenue: subscriptionRevenue,
      
      // Revenu moyen par client
      averageRevenuePerClient: monthlyProjectRevenue / Math.max(1, businessPlanData.marketAnalysis?.targetClients?.length || 1),
      
      // Valeur à vie d'un client (estimée sur 12 mois)
      clientLifetimeValue: (monthlyProjectRevenue / Math.max(1, businessPlanData.marketAnalysis?.targetClients?.length || 1)) * 12,
      
      // Ratio coût d'acquisition / valeur client (simulé)
      acquisitionCostRatio: 0.2, // Valeur simulée: 20% du revenu moyen par client
      
      // Marge bénéficiaire
      profitMargin: (projections.annual.firstYear.profit / projections.annual.firstYear.revenue) * 100,
      
      // Taux horaire effectif (revenus totaux / heures totales)
      hourlyEffectiveRate: hourlyRevenue / Math.max(1, hourlyRates.reduce((sum, rate) => sum + (rate.minHours || 0), 40)),
      
      // Taux de complétion des projets (simulé)
      projectCompletionRate: 90, // Valeur simulée: 90%
      
      // Taux d'utilisation (heures facturables / heures disponibles)
      utilisationRate: 70 // Valeur simulée: 70%
    };
    
    setKpis(calculatedKpis);
    
    // Générer des recommandations basées sur les KPIs
    generateRecommendations(calculatedKpis, standardizedPricing, standardizedBusinessModel);
  };

  // Générer des recommandations basées sur les KPIs
  const generateRecommendations = (
    kpis: BusinessKPIs, 
    pricing: PricingModel,
    canvas: BusinessModelCanvasData | null
  ) => {
    const newRecommendations = [];
    
    // Vérifier la marge bénéficiaire
    if (kpis.profitMargin < 20) {
      newRecommendations.push({
        title: "Augmentez vos tarifs",
        description: "Votre marge bénéficiaire est inférieure à 20%. Envisagez d'augmenter vos tarifs horaires et forfaits d'au moins 10-15% pour améliorer votre rentabilité.",
        impact: "high" as const,
        type: "pricing" as const
      });
    }
    
    // Vérifier le taux d'utilisation
    if (kpis.utilisationRate < 75) {
      newRecommendations.push({
        title: "Optimisez votre temps facturable",
        description: "Votre taux d'utilisation est bas. Identifiez les tâches administratives qui peuvent être automatisées ou déléguées pour augmenter vos heures facturables.",
        impact: "medium" as const,
        type: "efficiency" as const
      });
    }
    
    // Vérifier les revenus récurrents
    if (kpis.monthlyRecurringRevenue / (projections?.monthly[0]?.revenue || 1) < 0.3) {
      newRecommendations.push({
        title: "Développez vos services par abonnement",
        description: "Vos revenus récurrents représentent moins de 30% de vos revenus totaux. Créez plus d'offres d'abonnement pour stabiliser vos revenus mensuels.",
        impact: "high" as const,
        type: "revenue" as const
      });
    }
    
    // Vérifier le nombre de services
    if ((pricing.hourlyRates.length + pricing.packages.length + pricing.subscriptions.length) < 3) {
      newRecommendations.push({
        title: "Diversifiez vos offres",
        description: "Vous proposez peu de services. Développez votre catalogue d'offres pour attirer différents segments de clients et augmenter vos opportunités commerciales.",
        impact: "medium" as const,
        type: "pricing" as const
      });
    }
    
    // Vérifier le taux horaire effectif
    if (kpis.hourlyEffectiveRate < 40) {
      newRecommendations.push({
        title: "Réévaluez votre taux horaire",
        description: "Votre taux horaire effectif est bas. Réévaluez vos forfaits pour vous assurer qu'ils reflètent correctement le temps passé sur chaque projet.",
        impact: "high" as const,
        type: "pricing" as const
      });
    }
    
    // Vérifier la valeur client
    if (kpis.clientLifetimeValue < 3000) {
      newRecommendations.push({
        title: "Augmentez la valeur client",
        description: "La valeur à vie de vos clients est relativement basse. Développez des stratégies de montée en gamme (upsell) et de vente croisée (cross-sell) pour augmenter cette valeur.",
        impact: "medium" as const,
        type: "client" as const
      });
    }
    
    // Vérifier la proposition de valeur dans le canvas
    if (canvas && (!canvas.valueProposition || canvas.valueProposition.length < 2)) {
      newRecommendations.push({
        title: "Clarifiez votre proposition de valeur",
        description: "Votre proposition de valeur n'est pas suffisamment définie. Une proposition claire permet de justifier des tarifs plus élevés et d'attirer des clients de qualité.",
        impact: "high" as const,
        type: "revenue" as const
      });
    }
    
    setRecommendations(newRecommendations);
  };

  // Formatter pour les montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Formatter pour les pourcentages
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Données pour le graphique radar des KPIs
  const getRadarData = () => {
    if (!kpis) return [];
    
    return [
      {
        subject: 'Marge',
        value: Math.min(100, Math.max(0, kpis.profitMargin / 40 * 100)),
        fullMark: 100,
      },
      {
        subject: 'Revenu récurrent',
        value: Math.min(100, Math.max(0, kpis.monthlyRecurringRevenue / 2000 * 100)),
        fullMark: 100,
      },
      {
        subject: 'Valeur client',
        value: Math.min(100, Math.max(0, kpis.clientLifetimeValue / 5000 * 100)),
        fullMark: 100,
      },
      {
        subject: 'Taux horaire',
        value: Math.min(100, Math.max(0, kpis.hourlyEffectiveRate / 80 * 100)),
        fullMark: 100,
      },
      {
        subject: 'Utilisation',
        value: Math.min(100, Math.max(0, kpis.utilisationRate)),
        fullMark: 100,
      },
    ];
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

  // Si les KPIs ne sont pas disponibles
  if (!kpis) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Données insuffisantes</h3>
        <p className="text-yellow-600 dark:text-yellow-400">
          Impossible de calculer les KPIs. Veuillez d'abord définir votre modèle économique et exécuter des simulations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sélection des onglets */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
            selectedTab === 'kpis'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => setSelectedTab('kpis')}
        >
          Indicateurs de Performance
        </button>
        <button
          className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
            selectedTab === 'recommendations'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => setSelectedTab('recommendations')}
        >
          Recommandations
          {recommendations.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
              {recommendations.length}
            </span>
          )}
        </button>
      </div>

      {/* Onglet KPIs */}
      {selectedTab === 'kpis' && (
        <div className="space-y-6">
          {/* KPIs principaux */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Revenu mensuel récurrent */}
            <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenu mensuel récurrent</h3>
                <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Repeat size={16} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(kpis.monthlyRecurringRevenue)}
              </p>
              <div className="mt-1 flex items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400 mr-2">% du revenu total:</span>
                <span className="font-medium">
                  {formatPercent((kpis.monthlyRecurringRevenue / (projections?.monthly[0]?.revenue || 1)) * 100)}
                </span>
              </div>
            </div>
            
            {/* Valeur client */}
            <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Valeur client (LTV)</h3>
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Users size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(kpis.clientLifetimeValue)}
              </p>
              <div className="mt-1 flex items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400 mr-2">CAC Ratio:</span>
                <span className="font-medium">
                  {kpis.acquisitionCostRatio.toFixed(2)}:1
                </span>
                {kpis.acquisitionCostRatio > 3 ? (
                  <TrendingUp size={12} className="text-green-500 ml-1" />
                ) : (
                  <TrendingDown size={12} className="text-yellow-500 ml-1" />
                )}
              </div>
            </div>
            
            {/* Marge bénéficiaire */}
            <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Marge bénéficiaire</h3>
                <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Percent size={16} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatPercent(kpis.profitMargin)}
              </p>
              <div className="mt-1 flex items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400 mr-2">Benchmark secteur:</span>
                <span className="font-medium">
                  {kpis.profitMargin >= 25 ? 'Excellent' : 
                   kpis.profitMargin >= 20 ? 'Bon' : 
                   kpis.profitMargin >= 15 ? 'Moyen' : 'À améliorer'}
                </span>
                {kpis.profitMargin >= 20 ? (
                  <TrendingUp size={12} className="text-green-500 ml-1" />
                ) : (
                  <TrendingDown size={12} className="text-yellow-500 ml-1" />
                )}
              </div>
            </div>
            
            {/* Taux horaire effectif */}
            <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Taux horaire effectif</h3>
                <div className="p-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(kpis.hourlyEffectiveRate)}/h
              </p>
              <div className="mt-1 flex items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400 mr-2">Taux d'utilisation:</span>
                <span className="font-medium">
                  {formatPercent(kpis.utilisationRate)}
                </span>
                {kpis.utilisationRate >= 70 ? (
                  <TrendingUp size={12} className="text-green-500 ml-1" />
                ) : (
                  <TrendingDown size={12} className="text-yellow-500 ml-1" />
                )}
              </div>
            </div>
          </div>
          
          {/* Graphiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Graphique radar des KPIs */}
            <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
              <h3 className={UI_CLASSES.HEADING_3}>Vue d'ensemble des indicateurs</h3>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="KPIs actuels"
                      dataKey="value"
                      stroke="#4F46E5"
                      fill="#4F46E5"
                      fillOpacity={0.5}
                    />
                    <Tooltip formatter={(value) => `${value.toFixed(0)}%`} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Graphique de tendance */}
            <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
              <h3 className={UI_CLASSES.HEADING_3}>Activité et revenu projeté</h3>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projections?.monthly.slice(0, 6) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis yAxisId="left" orientation="left" stroke="#4F46E5" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenu"
                      stroke="#4F46E5"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="profit"
                      name="Profit"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Statistiques détaillées */}
          <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
            <h3 className={UI_CLASSES.HEADING_3}>Indicateurs de performance détaillés</h3>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Revenu moyen par client</h4>
                  <Users size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
                <p className="text-xl font-semibold text-gray-800 dark:text-white">
                  {formatCurrency(kpis.averageRevenuePerClient)}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Taux de complétion des projets</h4>
                  <Target size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
                <p className="text-xl font-semibold text-gray-800 dark:text-white">
                  {formatPercent(kpis.projectCompletionRate)}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Point d'équilibre</h4>
                  <ActivitySquare size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
                <p className="text-xl font-semibold text-gray-800 dark:text-white">
                  {breakEven ? `${breakEven.monthsToBreakEven.toFixed(1)} mois` : 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Information contextuelle */}
            <div className="mt-4 p-3 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Comment utiliser ces indicateurs</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    Ces KPIs vous aident à prendre des décisions éclairées sur votre modèle économique. 
                    Portez une attention particulière à votre marge bénéficiaire, votre taux d'utilisation 
                    et vos revenus récurrents pour optimiser votre rentabilité.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onglet Recommandations */}
      {selectedTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendations.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {recommendations.length} recommandation{recommendations.length > 1 ? 's' : ''} basée{recommendations.length > 1 ? 's' : ''} sur l'analyse de vos données
                </p>
              </div>
              {/* Liste des recommandations */}
              {recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className={`${UI_CLASSES.CARD} border ${
                    rec.impact === 'high' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' :
                    rec.impact === 'medium' ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20' :
                    'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${
                      rec.impact === 'high' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' :
                      rec.impact === 'medium' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' :
                      'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                    }`}>
                      {rec.type === 'pricing' && <DollarSign size={18} />}
                      {rec.type === 'efficiency' && <Zap size={18} />}
                      {rec.type === 'revenue' && <TrendingUp size={18} />}
                      {rec.type === 'client' && <Users size={18} />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${
                          rec.impact === 'high' ? 'text-red-800 dark:text-red-300' :
                          rec.impact === 'medium' ? 'text-amber-800 dark:text-amber-300' :
                          'text-blue-800 dark:text-blue-300'
                        }`}>
                          {rec.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          rec.impact === 'high' ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200' :
                          rec.impact === 'medium' ? 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200' :
                          'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        }`}>
                          Impact {
                            rec.impact === 'high' ? 'élevé' :
                            rec.impact === 'medium' ? 'moyen' : 'faible'
                          }
                        </span>
                      </div>
                      
                      <p className={`mt-2 text-sm ${
                        rec.impact === 'high' ? 'text-red-600 dark:text-red-400' :
                        rec.impact === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                        {rec.description}
                      </p>
                      
                      <div className="mt-3 flex justify-end">
                        <button className={`text-xs flex items-center font-medium ${
                          rec.impact === 'high' ? 'text-red-700 dark:text-red-300' :
                          rec.impact === 'medium' ? 'text-amber-700 dark:text-amber-300' :
                          'text-blue-700 dark:text-blue-300'
                        }`}>
                          <span>En savoir plus</span>
                          <ArrowUpRight size={14} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
              <div className="flex justify-center mb-4">
                <Target size={40} className="text-green-500 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Tout semble optimal !</h3>
              <p className="text-green-600 dark:text-green-400">
                Votre modèle économique est bien optimisé. Continuez à suivre vos indicateurs 
                pour maintenir cette performance.
              </p>
            </div>
          )}
          
          {/* Message de contexte */}
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle size={20} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ces recommandations sont générées automatiquement en analysant vos données. 
                  Elles sont fournies à titre indicatif et peuvent ne pas refléter toutes les 
                  nuances de votre activité. Consultez un expert-comptable pour des conseils personnalisés.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPIDashboard;