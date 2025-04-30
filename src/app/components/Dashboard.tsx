import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CircleDollarSign, Users, TrendingUp, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import type { 
  BusinessPlanData, 
  PitchSection, 
  ServicesSection, 
  BusinessModelSection, 
  MarketAnalysisSection, 
  FinancialsSection, 
  ActionPlanSection 
} from "./types";
import { UI_CLASSES } from "../styles/ui-classes";

/**
 * Composant pour afficher une carte de statistique
 */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className={UI_CLASSES.CARD + " flex items-center space-x-4"}>
    <div className={`p-3 rounded-full ${color}`}>{icon}</div>
    <div>
      <p className={UI_CLASSES.TEXT_SMALL}>{title}</p>
      <p className={`text-xl font-semibold ${UI_CLASSES.TEXT}`}>{value}</p>
    </div>
  </div>
);

/**
 * Composant pour afficher une barre de progression d'une section
 */
interface IncompleteSectionProps {
  section: string;
  completion: number;
}

const IncompleteSection: React.FC<IncompleteSectionProps> = ({ section, completion }) => (
  <div className="flex items-center justify-between mb-2">
    <span className={`text-sm ${UI_CLASSES.TEXT}`}>{section}</span>
    <div className="flex items-center">
      <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
        <div 
          className={`h-2 rounded-full ${
            completion < 30 ? 'bg-red-500' : 
            completion < 70 ? 'bg-yellow-500' : 
            'bg-green-500'
          }`}
          style={{ width: `${completion}%` }}
        ></div>
      </div>
      <span className={`text-xs ${UI_CLASSES.TEXT_SMALL}`}>{completion}%</span>
    </div>
  </div>
);

/**
 * Fonction utilitaire pour calculer le taux de complétion d'une section
 * Accepte n'importe quelle section du business plan
 */
function calculateSectionCompletion<T extends object>(section: T): number {
  let totalFields = 0;
  let completedFields = 0;

  // Parcourir toutes les propriétés de l'objet
  for (const key in section) {
    if (Object.prototype.hasOwnProperty.call(section, key)) {
      totalFields++;
      const value = section[key as keyof T];
      
      if (Array.isArray(value)) {
        if (value.length > 0) completedFields++;
      } else if (typeof value === 'number') {
        if (value > 0) completedFields++;
      } else if (typeof value === 'string') {
        if (value.trim().length > 0) completedFields++;
      }
    }
  }

  return Math.round((completedFields / totalFields) * 100);
}

/**
 * Fonction utilitaire pour formater les données des graphiques
 */
const formatQuarterlyData = (goals: number[]) => {
  return goals.map((value, index) => ({
    name: `T${index + 1}`,
    revenu: value
  }));
};

/**
 * Composant principal du tableau de bord
 */
interface DashboardProps {
  businessPlanData: BusinessPlanData;
}

const Dashboard: React.FC<DashboardProps> = ({ businessPlanData }) => {
  // Calcul des taux de complétion de toutes les sections
  const completionRates = useMemo(() => ({
    pitch: calculateSectionCompletion<PitchSection>(businessPlanData.pitch),
    services: calculateSectionCompletion<ServicesSection>(businessPlanData.services),
    businessModel: calculateSectionCompletion<BusinessModelSection>(businessPlanData.businessModel),
    marketAnalysis: calculateSectionCompletion<MarketAnalysisSection>(businessPlanData.marketAnalysis),
    financials: calculateSectionCompletion<FinancialsSection>(businessPlanData.financials),
    actionPlan: calculateSectionCompletion<ActionPlanSection>(businessPlanData.actionPlan)
  }), [businessPlanData]);

  // Calcul du taux de complétion global
  const globalCompletion = useMemo(() => {
    const sections = Object.values(completionRates);
    return Math.round(sections.reduce((acc, value) => acc + value, 0) / sections.length);
  }, [completionRates]);

  // Préparation des données pour le graphique
  const quarterlyData = useMemo(() => 
    formatQuarterlyData(businessPlanData.financials.quarterlyGoals),
  [businessPlanData.financials.quarterlyGoals]);

  // Calcul des statistiques principales
  const stats = useMemo(() => {
    const totalClients = businessPlanData.marketAnalysis.targetClients.length;
    const totalRevenue = businessPlanData.financials.quarterlyGoals.reduce((sum, goal) => sum + goal, 0);
    const milestonesCount = businessPlanData.actionPlan.milestones.length;
    
    return {
      totalRevenue,
      totalClients,
      initialInvestment: businessPlanData.financials.initialInvestment,
      milestonesCount
    };
  }, [
    businessPlanData.marketAnalysis.targetClients.length,
    businessPlanData.financials.quarterlyGoals,
    businessPlanData.actionPlan.milestones.length,
    businessPlanData.financials.initialInvestment
  ]);
  
  // Sections incomplètes (moins de 70% de complétion)
  const incompleteSections = useMemo(() => {
    return Object.entries(completionRates)
      .filter(([, rate]) => rate < 70)
      .sort(([, rateA], [, rateB]) => rateA - rateB);
  }, [completionRates]);

  const formatValue = (value: number) => {
    return value.toLocaleString('fr-FR');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className={UI_CLASSES.HEADING_1}>Tableau de bord</h1>
        <div className="bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold">
          Avancement global: {globalCompletion}%
        </div>
      </header>
      
      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="CA Année 1 (prévisionnel)"
          value={`${formatValue(stats.totalRevenue)}€`}
          icon={<CircleDollarSign className="text-white" size={24} />}
          color="bg-blue-500 dark:bg-blue-600"
        />
        <StatCard 
          title="Investissement initial"
          value={`${formatValue(stats.initialInvestment)}€`}
          icon={<TrendingUp className="text-white" size={24} />}
          color="bg-green-500 dark:bg-green-600"
        />
        <StatCard 
          title="Clients cibles identifiés"
          value={stats.totalClients}
          icon={<Users className="text-white" size={24} />}
          color="bg-purple-500 dark:bg-purple-600"
        />
        <StatCard 
          title="Jalons définis"
          value={stats.milestonesCount}
          icon={<Calendar className="text-white" size={24} />}
          color="bg-orange-500 dark:bg-orange-600"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Statistiques clés */}
        <div className={UI_CLASSES.CARD}>
          <h2 className={UI_CLASSES.HEADING_3}>Statistiques clés</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <h3 className="text-blue-800 dark:text-blue-300 font-medium mb-1">Revenu total prévisionnel</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatValue(stats.totalRevenue)}€</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <h3 className="text-green-800 dark:text-green-300 font-medium mb-1">Investissement initial</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatValue(stats.initialInvestment)}€</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <h3 className="text-purple-800 dark:text-purple-300 font-medium mb-1">Client cibles</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalClients}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
              <h3 className="text-orange-800 dark:text-orange-300 font-medium mb-1">Concurrents identifiés</h3>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{businessPlanData.marketAnalysis.competitors.length}</p>
            </div>
          </div>
        </div>
      
        {/* Prévisions financières */}
        <div className={UI_CLASSES.CARD}>
          <h2 className={UI_CLASSES.HEADING_3}>Prévisions financières</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#666', strokeWidth: 1 }} 
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={{ stroke: '#666', strokeWidth: 1 }}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    color: '#333',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                  itemStyle={{ color: '#333' }}
                  labelStyle={{ fontWeight: 'bold', color: '#333' }}
                />
                <Bar 
                  dataKey="revenu" 
                  name="Prévision de revenus" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  barSize={30} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Sections à compléter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={UI_CLASSES.CARD}>
          <h2 className={UI_CLASSES.HEADING_3}>
            Sections à compléter
            {incompleteSections.length === 0 && (
              <span className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                Tout est complété !
              </span>
            )}
          </h2>
          
          {incompleteSections.length > 0 ? (
            <div className="mt-4 space-y-2">
              {incompleteSections.map(([section, rate]) => (
                <IncompleteSection 
                  key={section} 
                  section={
                    section === "pitch" ? "Pitch" :
                    section === "services" ? "Services" :
                    section === "businessModel" ? "Modèle économique" :
                    section === "marketAnalysis" ? "Analyse de marché" :
                    section === "financials" ? "Finances" :
                    section === "actionPlan" ? "Plan d'action" :
                    section
                  } 
                  completion={rate} 
                />
              ))}
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start">
                <AlertCircle className="text-yellow-500 mr-2 flex-shrink-0 mt-1" size={18} />
                <p className={`text-sm ${UI_CLASSES.TEXT}`}>
                  Complétez ces sections pour améliorer votre business plan et obtenir une vision plus précise de votre activité.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-start">
              <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-1" size={18} />
              <p className={`text-sm ${UI_CLASSES.TEXT}`}>
                Félicitations ! Toutes les sections de votre business plan sont bien documentées. 
                Vous pouvez maintenant explorer les différentes sections en détail.
              </p>
            </div>
          )}
        </div>
        
        <div className={UI_CLASSES.CARD}>
          <h2 className={UI_CLASSES.HEADING_3}>Progression par section</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(completionRates).map(([section, rate]) => (
              <IncompleteSection 
                key={section} 
                section={
                  section === "pitch" ? "Pitch" :
                  section === "services" ? "Services" :
                  section === "businessModel" ? "Modèle économique" :
                  section === "marketAnalysis" ? "Analyse de marché" :
                  section === "financials" ? "Finances" :
                  section === "actionPlan" ? "Plan d'action" :
                  section
                } 
                completion={rate} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;