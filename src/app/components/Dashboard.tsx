import React from "react";
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  CircleDollarSign, 
  Users, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  FileCog,
  Briefcase,
  LineChart,
  Target
} from "lucide-react";
import { UI_CLASSES } from "../styles/ui-classes";
import useBusinessPlanData from "../hooks/useBusinessPlanData";
import type { BusinessPlanData, SectionKey } from "./types";

// Types d'une section du business plan avec ses métadonnées
interface BusinessPlanSection {
  key: SectionKey;
  title: string;
  icon: React.ReactNode;
  color: string;
  completion: number;
  route: string;
}

// Type pour les statistiques clés
interface KeyStat {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  change?: number;
}

// Type pour le composant de carte interactive
interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

// Composant pour les cartes interactives
const ActionCard: React.FC<ActionCardProps> = ({ 
  title, 
  description, 
  icon, 
  color, 
  onClick 
}) => (
  <button
    onClick={onClick}
    className={`${UI_CLASSES.CARD} flex items-start space-x-4 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-left`}
  >
    <div className={`p-3 rounded-lg ${color} flex-shrink-0 mt-1`}>
      {icon}
    </div>
    <div>
      <h3 className={`font-medium mb-1 ${UI_CLASSES.TEXT}`}>{title}</h3>
      <p className={`${UI_CLASSES.TEXT_SMALL}`}>{description}</p>
      <div className="mt-2 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
        <span>Explorer</span>
        <ArrowRight size={16} className="ml-1" />
      </div>
    </div>
  </button>
);

// Composant pour afficher une carte de statistique
const StatCard: React.FC<KeyStat> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  bgColor, 
  change 
}) => (
  <div className={`${UI_CLASSES.CARD} overflow-hidden`}>
    <div className="flex justify-between items-start">
      <div>
        <p className={`${UI_CLASSES.TEXT_SMALL} mb-1`}>{title}</p>
        <p className={`text-2xl font-bold ${UI_CLASSES.TEXT}`}>
          {value}
        </p>
        <p className={`${UI_CLASSES.TEXT_SMALL} mt-1`}>{subtitle}</p>
        
        {change !== undefined && (
          <div className={`mt-2 text-sm flex items-center ${
            change >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {change >= 0 
              ? <TrendingUp size={16} className="mr-1" /> 
              : <TrendingUp size={16} className="mr-1 transform rotate-180" />
            }
            <span>{Math.abs(change)}% {change >= 0 ? 'augmentation' : 'diminution'}</span>
          </div>
        )}
      </div>
      <div className={`${bgColor} p-3 rounded-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

// Composant pour afficher le progrès d'une section
const ProgressBar: React.FC<{ 
  label: string; 
  value: number; 
  color: string;
  onClick?: () => void;
}> = ({ label, value, color, onClick }) => (
  <div 
    className={`mb-4 ${onClick ? 'cursor-pointer' : ''} transition-opacity duration-200 hover:opacity-90`}
    onClick={onClick}
  >
    <div className="flex justify-between items-center mb-1">
      <span className={`${UI_CLASSES.TEXT_SMALL} font-medium`}>{label}</span>
      <span className={`${UI_CLASSES.TEXT_SMALL}`}>{value}%</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${color}`} 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

// Fonction utilitaire pour déterminer la couleur de la barre de progression
const getProgressBarColor = (value: number): string => {
  if (value < 30) return 'bg-red-500';
  if (value < 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

// Composant principal
interface DashboardProps {
  businessPlanData: BusinessPlanData;
}

const Dashboard: React.FC<DashboardProps> = ({ businessPlanData }) => {
  // Calcul des taux de complétion de toutes les sections
  const calculateSectionCompletion = <T extends object>(section: T): number => {
    let totalFields = 0;
    let completedFields = 0;

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
  };

  // Calcul des taux de complétion par section
  const sectionsProgress: BusinessPlanSection[] = [
    {
      key: "pitch",
      title: "Pitch",
      icon: <FileCog size={18} className="text-blue-500 dark:text-blue-400" />,
      color: "bg-blue-500/10 dark:bg-blue-500/20",
      completion: calculateSectionCompletion(businessPlanData.pitch),
      route: "/pitch"
    },
    {
      key: "services",
      title: "Services",
      icon: <Briefcase size={18} className="text-purple-500 dark:text-purple-400" />,
      color: "bg-purple-500/10 dark:bg-purple-500/20",
      completion: calculateSectionCompletion(businessPlanData.services),
      route: "/services"
    },
    {
      key: "businessModel",
      title: "Modèle économique",
      icon: <CircleDollarSign size={18} className="text-green-500 dark:text-green-400" />,
      color: "bg-green-500/10 dark:bg-green-500/20",
      completion: calculateSectionCompletion(businessPlanData.businessModel),
      route: "/business-model"
    },
    {
      key: "marketAnalysis",
      title: "Analyse de marché",
      icon: <LineChart size={18} className="text-orange-500 dark:text-orange-400" />,
      color: "bg-orange-500/10 dark:bg-orange-500/20",
      completion: calculateSectionCompletion(businessPlanData.marketAnalysis),
      route: "/market-analysis"
    },
    {
      key: "financials",
      title: "Finances",
      icon: <CircleDollarSign size={18} className="text-indigo-500 dark:text-indigo-400" />,
      color: "bg-indigo-500/10 dark:bg-indigo-500/20",
      completion: calculateSectionCompletion(businessPlanData.financials),
      route: "/financials"
    },
    {
      key: "actionPlan",
      title: "Plan d'action",
      icon: <Target size={18} className="text-rose-500 dark:text-rose-400" />,
      color: "bg-rose-500/10 dark:bg-rose-500/20",
      completion: calculateSectionCompletion(businessPlanData.actionPlan),
      route: "/action-plan"
    }
  ];

  // Calcul du taux de complétion global
  const globalCompletion = Math.round(
    sectionsProgress.reduce((acc, section) => acc + section.completion, 0) / sectionsProgress.length
  );

  // Sections incomplètes
  const incompleteSections = sectionsProgress
    .filter(section => section.completion < 70)
    .sort((a, b) => a.completion - b.completion);

  // Préparation des données pour les graphiques
  const quarterlyData = businessPlanData.financials.quarterlyGoals.map((value: number, index: number) => ({
    name: `T${index + 1}`,
    revenu: value
  }));

  // Données pour le graphique circulaire (répartition des revenus)
  const revenueDistributionData = [
    { name: 'Taux horaires', value: businessPlanData.businessModel.hourlyRates.length * 2000 },
    { name: 'Packages', value: businessPlanData.businessModel.packages.length * 3500 },
    { name: 'Abonnements', value: businessPlanData.businessModel.subscriptions.length * 1000 }
  ];

  // Couleurs pour les graphiques
  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];

  // Calcul des statistiques clés
  const totalRevenue = businessPlanData.financials.quarterlyGoals.reduce((sum: number, goal: number) => sum + goal, 0);
  const clientsCount = businessPlanData.marketAnalysis.targetClients.length;
  const initialInvestment = businessPlanData.financials.initialInvestment;
  const milestonesCount = businessPlanData.actionPlan.milestones.length;

  // Préparation des statistiques clés
  const keyStats: KeyStat[] = [
    {
      title: "Chiffre d'affaires",
      value: `${totalRevenue.toLocaleString('fr-FR')}€`,
      subtitle: "Prévisionnel année 1",
      icon: <CircleDollarSign size={24} className="text-white" />,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      change: 5
    },
    {
      title: "Investissement",
      value: `${initialInvestment.toLocaleString('fr-FR')}€`,
      subtitle: "Capital initial",
      icon: <TrendingUp size={24} className="text-white" />,
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Clients cibles",
      value: clientsCount,
      subtitle: "Segments identifiés",
      icon: <Users size={24} className="text-white" />,
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      change: 8
    },
    {
      title: "Jalons",
      value: milestonesCount,
      subtitle: "Objectifs définis",
      icon: <Calendar size={24} className="text-white" />,
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    }
  ];

  // Fonction simulée pour naviguer vers une section (dans un vrai projet, utiliserait un router)
  const navigateToSection = (sectionKey: SectionKey) => {
    console.log(`Navigation vers ${sectionKey}`);
    // Dans un vrai projet: router.push(`/${sectionKey}`);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête avec avancement global */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className={UI_CLASSES.HEADING_1 + " mb-2 sm:mb-0"}>Tableau de bord</h1>
        <div className="bg-blue-500 text-white py-2 px-4 rounded-md font-medium flex items-center space-x-2">
          <span>Avancement global</span>
          <div className="w-24 bg-blue-600 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-white" 
              style={{ width: `${globalCompletion}%` }}
            ></div>
          </div>
          <span className="font-bold">{globalCompletion}%</span>
        </div>
      </div>

      {/* Statistiques clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objectifs trimestriels (graphique à barres) */}
        <div className={UI_CLASSES.CARD}>
          <h2 className={UI_CLASSES.HEADING_3 + " mb-4"}>Objectifs trimestriels</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => `${value}€`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString('fr-FR')}€`, 'Revenu']}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar 
                  dataKey="revenu" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition des revenus (graphique circulaire) */}
        <div className={UI_CLASSES.CARD}>
          <h2 className={UI_CLASSES.HEADING_3 + " mb-4"}>Répartition des revenus</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {revenueDistributionData.map((entry, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString('fr-FR')}€`, 'Montant']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progression par section du business plan */}
        <div className={UI_CLASSES.CARD}>
          <h2 className={UI_CLASSES.HEADING_3 + " mb-4"}>Progression par section</h2>
          <div className="space-y-1">
            {sectionsProgress.map((section) => (
              <ProgressBar
                key={section.key}
                label={section.title}
                value={section.completion}
                color={getProgressBarColor(section.completion)}
                onClick={() => navigateToSection(section.key)}
              />
            ))}
          </div>
        </div>

        {/* Cartes interactives pour sections incomplètes */}
        <div className={UI_CLASSES.CARD}>
          <h2 className={UI_CLASSES.HEADING_3 + " mb-4"}>
            Sections à compléter
            {incompleteSections.length === 0 && (
              <span className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                Tout est complété !
              </span>
            )}
          </h2>

          {incompleteSections.length > 0 ? (
            <div className="space-y-4">
              {incompleteSections.map((section) => (
                <div 
                  key={section.key}
                  className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => navigateToSection(section.key)}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${section.color} mr-3`}>{section.icon}</div>
                    <div className="flex-grow">
                      <h3 className={`${UI_CLASSES.TEXT} font-medium`}>{section.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <div className="w-full max-w-[200px] bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                          <div 
                            className={`h-2 rounded-full ${getProgressBarColor(section.completion)}`} 
                            style={{ width: `${section.completion}%` }}
                          ></div>
                        </div>
                        <span className={`${UI_CLASSES.TEXT_SMALL}`}>{section.completion}%</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 ml-2" />
                  </div>
                </div>
              ))}

              {incompleteSections.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start">
                  <AlertCircle className="text-yellow-500 mr-2 flex-shrink-0 mt-1" size={18} />
                  <p className={`text-sm ${UI_CLASSES.TEXT}`}>
                    Complétez ces sections pour améliorer votre business plan et obtenir une meilleure vision de votre activité.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-start">
              <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-1" size={18} />
              <p className={`text-sm ${UI_CLASSES.TEXT}`}>
                Félicitations ! Toutes les sections de votre business plan sont bien documentées.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Accès rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard
          title="Analyser votre marché"
          description="Identifiez vos concurrents et segments de clients cibles."
          icon={<LineChart size={20} className="text-white" />}
          color="bg-indigo-500"
          onClick={() => navigateToSection("marketAnalysis")}
        />
        <ActionCard
          title="Définir vos objectifs financiers"
          description="Établissez vos prévisions financières et suivez votre progression."
          icon={<CircleDollarSign size={20} className="text-white" />}
          color="bg-blue-500"
          onClick={() => navigateToSection("financials")}
        />
        <ActionCard
          title="Planifier vos jalons"
          description="Créez votre plan d'action avec des étapes claires et mesurables."
          icon={<Target size={20} className="text-white" />}
          color="bg-rose-500"
          onClick={() => navigateToSection("actionPlan")}
        />
      </div>
    </div>
  );
};

// Wrapper qui utilise le hook et passe les données au composant
const DashboardContainer: React.FC = () => {
  const businessPlanHook = useBusinessPlanData();
  
  // Vérifie si le hook est prêt
  if (!businessPlanHook || !businessPlanHook.businessPlanData) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Chargement des données...
        </div>
      </div>
    );
  }
  
  return <Dashboard businessPlanData={businessPlanHook.businessPlanData} />;
};

export default DashboardContainer;