import React, { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CircleDollarSign, Users, TrendingUp, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import type { BusinessPlanData } from "./types";

// Couleurs pour les graphiques
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// Composant pour les cartes de statistiques
const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-xl font-semibold dark:text-white">{value}</p>
    </div>
  </div>
);

// Composant pour les sections incomplètes
const IncompleteSection = ({ section, completion }: { section: string; completion: number }) => (
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm dark:text-gray-300">{section}</span>
    <div className="flex items-center">
      <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
        <div 
          className={`h-2 rounded-full ${completion < 30 ? 'bg-red-500' : completion < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${completion}%` }}
        ></div>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">{completion}%</span>
    </div>
  </div>
);

// Composant principal Dashboard
const Dashboard = ({ businessPlanData }: { businessPlanData: BusinessPlanData }) => {
  // Fonction générique pour calculer le taux de complétion d'une section
  const calculateSectionCompletion = useCallback((section: Record<string, unknown>): number => {
    let totalFields = 0;
    let completedFields = 0;

    for (const key in section) {
      totalFields++;
      const value = section[key];
      
      if (Array.isArray(value)) {
        if (value.length > 0) completedFields++;
      } else if (typeof value === 'number') {
        if (value > 0) completedFields++;
      } else if (typeof value === 'string') {
        if (value.trim().length > 0) completedFields++;
      }
    }

    return Math.round((completedFields / totalFields) * 100);
  }, []);

  // Calcul du taux de complétion de chaque section
  const calculateCompletion = useCallback(() => {
    return {
      pitch: calculateSectionCompletion(businessPlanData.pitch),
      services: calculateSectionCompletion(businessPlanData.services),
      businessModel: calculateSectionCompletion(businessPlanData.businessModel),
      marketAnalysis: calculateSectionCompletion(businessPlanData.marketAnalysis),
      financials: calculateSectionCompletion(businessPlanData.financials),
      actionPlan: calculateSectionCompletion(businessPlanData.actionPlan),
    };
  }, [businessPlanData, calculateSectionCompletion]);

  // Données de complétion calculées
  const [completion, setCompletion] = useState(calculateCompletion());
  
  useEffect(() => {
    setCompletion(calculateCompletion());
  }, [calculateCompletion]);

  // Calcul du taux de complétion global
  const globalCompletion = Math.round(
    Object.values(completion).reduce((sum, val) => sum + val, 0) / Object.values(completion).length
  );

  // Liste des sections incomplètes (moins de 100%)
  const incompleteSections = Object.entries(completion)
    .filter(([, value]) => value < 100)
    .sort((a, b) => a[1] - b[1])
    .map(([key, value]) => ({ 
      section: key === 'businessModel' ? 'Modèle économique' :
               key === 'marketAnalysis' ? 'Analyse de marché' :
               key === 'actionPlan' ? 'Plan d\'action' : 
               key.charAt(0).toUpperCase() + key.slice(1), 
      completion: value 
    }));

  // Préparation des données pour le graphique financier
  const financeData = [
    { name: 'T1', revenu: businessPlanData.financials.quarterlyGoals[0] || 0 },
    { name: 'T2', revenu: businessPlanData.financials.quarterlyGoals[1] || 0 },
    { name: 'T3', revenu: businessPlanData.financials.quarterlyGoals[2] || 0 },
    { name: 'T4', revenu: businessPlanData.financials.quarterlyGoals[3] || 0 },
  ];

  // Préparation des données pour le graphique de complétion
  const completionData = Object.entries(completion)
    .filter(([, value]) => value > 0) // Ne garder que les valeurs supérieures à 0%
    .map(([key, value]) => ({
      name: key === 'businessModel' ? 'Modèle éco.' :
            key === 'marketAnalysis' ? 'Marché' :
            key === 'actionPlan' ? 'Action' : 
            key.charAt(0).toUpperCase() + key.slice(1),
      value
    }));

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold dark:text-white">Tableau de bord</h1>
        <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
          Avancement global: {globalCompletion}%
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="CA Année 1 (prévisionnel)" 
          value={`${businessPlanData.financials.quarterlyGoals.reduce((a, b) => a + b, 0)}€`} 
          icon={<CircleDollarSign className="text-white" size={20} />}
          color="bg-blue-500"
        />
        <StatCard 
          title="Investissement initial" 
          value={`${businessPlanData.financials.initialInvestment}€`} 
          icon={<TrendingUp className="text-white" size={20} />}
          color="bg-green-500"
        />
        <StatCard 
          title="Clients cibles identifiés" 
          value={businessPlanData.marketAnalysis.targetClients.length} 
          icon={<Users className="text-white" size={20} />}
          color="bg-purple-500"
        />
        <StatCard 
          title="Jalons définis" 
          value={businessPlanData.actionPlan.milestones.length} 
          icon={<Calendar className="text-white" size={20} />}
          color="bg-orange-500"
        />
      </div>

      {/* Graphiques et tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique financier */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Prévisions financières</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={financeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#ddd' }} />
              <Legend />
              <Bar dataKey="revenu" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique de complétion */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Complétion du business plan</h2>
          {completionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#ddd' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              Aucune section complétée pour le moment
            </div>
          )}
        </div>

        {/* Sections à compléter */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Sections à compléter</h2>
          {incompleteSections.length > 0 ? (
            <div className="space-y-3">
              {incompleteSections.map((section, index) => (
                <IncompleteSection key={index} section={section.section} completion={section.completion} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="mx-auto text-green-500 mb-2" size={40} />
              <p className="text-gray-700 dark:text-gray-300">Toutes les sections sont complétées à 100% !</p>
            </div>
          )}
        </div>

        {/* Prochaines étapes */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Prochaines étapes</h2>
          {businessPlanData.actionPlan.milestones.length > 0 ? (
            <div className="space-y-3">
              {businessPlanData.actionPlan.milestones.slice(0, 3).map((milestone, index) => (
                <div key={index} className="flex items-start p-2 border-l-2 border-blue-500">
                  <div className="ml-2">
                    <p className="font-medium dark:text-white">{milestone}</p>
                  </div>
                </div>
              ))}
              {businessPlanData.actionPlan.milestones.length > 3 && (
                <p className="text-sm text-right text-blue-500 dark:text-blue-400">
                  +{businessPlanData.actionPlan.milestones.length - 3} autres jalons...
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-4 text-yellow-600">
              <div className="p-1 rounded-full bg-yellow-100">
                <AlertCircle className="text-yellow-600" size={16} />
              </div>
              <span className="ml-2 dark:text-yellow-400">Aucun jalon défini dans votre plan d&apos;action</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;