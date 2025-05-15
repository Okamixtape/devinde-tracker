/**
 * UIModels - Interfaces TypeScript pour les composants UI de la refonte
 * 
 * Ce fichier définit les interfaces utilisées par les composants UI modernes
 * de la nouvelle version de DevIndé Tracker, tout en assurant la compatibilité
 * avec les modèles de données existants.
 */

import { 
  BusinessPlanData, 
  PitchData, 
  BusinessModelData, 
  MarketAnalysisData, 
  ServicesData,
  FinancialsData, 
  ActionPlanData,
  FinancialProject,
  Milestone,
  Task
} from '../services/interfaces/dataModels';

/**
 * Menu principal et navigation
 */

export interface SidebarSection {
  id: string;
  name: string;
  iconName: string;
  path: string;
  progress: number;
  children?: SidebarSection[];
}

export interface BreadcrumbItem {
  label: string;
  path: string;
}

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
}

/**
 * Dashboard
 */

export interface KeyMetric {
  id: string;
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  iconName: string;
  color?: string;
}

export interface RevenueProjection {
  period: string;
  projected: number;
  actual?: number;
  sources: {
    name: string;
    value: number;
    color?: string;
  }[];
}

export interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  path: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UserActivity {
  id: string;
  action: string;
  section: string;
  timestamp: string;
  user?: string; 
}

/**
 * Business Model Canvas
 */

export interface BusinessModelCanvasItem {
  id: string;
  section: 'key_partners' | 'key_activities' | 'key_resources' | 'value_propositions' | 
          'customer_relationships' | 'channels' | 'customer_segments' | 'cost_structure' | 'revenue_streams';
  content: string;
  color?: string;
}

export interface CanvasSection {
  id: string;
  title: string;
  description: string;
  items: BusinessModelCanvasItem[];
}

/**
 * Financial Module
 */

export interface FinancialProjectSummary {
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface FinancialProjectCard extends FinancialProject {
  clientName: string;
  daysRemaining?: number;
  healthStatus: 'good' | 'warning' | 'critical';
}

/**
 * Action Plan
 */

export interface DragDropItem {
  id: string;
  type: 'milestone' | 'task';
  index: number;
  parentId?: string;
}

export interface MilestoneWithProgress extends Milestone {
  completionPercentage: number;
  tasksCount: number;
  completedTasksCount: number;
  daysRemaining?: number;
  isLate?: boolean;
}

export interface TaskWithRelations extends Task {
  assignee?: string;
  dependencies?: string[];
  subtasks?: TaskWithRelations[];
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

/**
 * Adaptateurs de données
 * 
 * Ces fonctions permettent de convertir entre les modèles de données existants
 * et les nouveaux modèles d'interface utilisateur.
 */

export const convertToUISection = (businessPlanData: BusinessPlanData): SidebarSection[] => {
  const sections: SidebarSection[] = [
    {
      id: "tableau-de-bord",
      name: "Tableau de Bord",
      iconName: "Home",
      path: "/dashboard",
      progress: calculateSectionProgress(businessPlanData, 'all')
    },
    {
      id: "pitch",
      name: "Pitch",
      iconName: "FileText",
      path: "/plans/pitch",
      progress: calculateSectionProgress(businessPlanData, 'pitch')
    },
    {
      id: "services",
      name: "Services",
      iconName: "Briefcase",
      path: "/plans/services",
      progress: calculateSectionProgress(businessPlanData, 'services')
    },
    {
      id: "modele-economique",
      name: "Modèle Économique",
      iconName: "DollarSign",
      path: "/plans/business-model",
      progress: calculateSectionProgress(businessPlanData, 'businessModel')
    },
    {
      id: "analyse-marche",
      name: "Analyse de Marché",
      iconName: "PieChart",
      path: "/plans/market-analysis",
      progress: calculateSectionProgress(businessPlanData, 'marketAnalysis')
    },
    {
      id: "finances",
      name: "Finances",
      iconName: "BarChart2",
      path: "/plans/finances",
      progress: calculateSectionProgress(businessPlanData, 'financials')
    },
    {
      id: "plan-action",
      name: "Plan d'Action",
      iconName: "Target",
      path: "/plans/action-plan",
      progress: calculateSectionProgress(businessPlanData, 'actionPlan')
    }
  ];
  
  return sections;
};

// Fonction helper pour calculer le pourcentage de complétion d'une section
const calculateSectionProgress = (
  businessPlanData: BusinessPlanData, 
  section: 'pitch' | 'services' | 'businessModel' | 'marketAnalysis' | 'financials' | 'actionPlan' | 'all'
): number => {
  if (section === 'all') {
    // Calcul de la moyenne de toutes les sections
    let totalProgress = 0;
    let sectionCount = 0;
    
    for (const s of ['pitch', 'services', 'businessModel', 'marketAnalysis', 'financials', 'actionPlan'] as const) {
      totalProgress += calculateSectionProgress(businessPlanData, s);
      sectionCount++;
    }
    
    return Math.round(totalProgress / sectionCount);
  }
  
  // Logique de calcul spécifique pour chaque section
  switch (section) {
    case 'pitch':
      return calculatePitchProgress(businessPlanData.pitch);
    case 'services':
      return calculateServicesProgress(businessPlanData.services);
    case 'businessModel':
      return calculateBusinessModelProgress(businessPlanData.businessModel);
    case 'marketAnalysis':
      return calculateMarketAnalysisProgress(businessPlanData.marketAnalysis);
    case 'financials':
      return calculateFinancialsProgress(businessPlanData.financials);
    case 'actionPlan':
      return calculateActionPlanProgress(businessPlanData.actionPlan);
    default:
      return 0;
  }
};

// Fonctions spécifiques pour calculer le pourcentage de complétion de chaque section
// Ces implémentations sont simplifiées et devraient être adaptées selon les besoins réels
const calculatePitchProgress = (pitchData: PitchData): number => {
  let filledFields = 0;
  let totalFields = 0;
  
  // Compter les champs non vides
  for (const key of Object.keys(pitchData) as Array<keyof PitchData>) {
    totalFields++;
    
    const value = pitchData[key];
    if (value && (typeof value === 'string' ? value.trim() !== '' : true)) {
      filledFields++;
    }
  }
  
  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
};

const calculateServicesProgress = (servicesData: ServicesData): number => {
  let progress = 0;
  let totalItems = 3; // offerings, technologies, process
  
  if (servicesData.offerings && servicesData.offerings.length > 0) progress++;
  if (servicesData.technologies && servicesData.technologies.length > 0) progress++;
  if (servicesData.process && servicesData.process.length > 0) progress++;
  
  return Math.round((progress / totalItems) * 100);
};

const calculateBusinessModelProgress = (businessModelData: BusinessModelData): number => {
  let progress = 0;
  let totalItems = 3; // hourlyRates, packages, subscriptions
  
  if (businessModelData.hourlyRates && businessModelData.hourlyRates.length > 0) progress++;
  if (businessModelData.packages && businessModelData.packages.length > 0) progress++;
  if (businessModelData.subscriptions && businessModelData.subscriptions.length > 0) progress++;
  
  return Math.round((progress / totalItems) * 100);
};

const calculateMarketAnalysisProgress = (marketAnalysisData: MarketAnalysisData): number => {
  let progress = 0;
  let totalItems = 3; // competitors, targetClients, trends
  
  if (marketAnalysisData.competitors && marketAnalysisData.competitors.length > 0) progress++;
  if (marketAnalysisData.targetClients && marketAnalysisData.targetClients.length > 0) progress++;
  if (marketAnalysisData.trends && marketAnalysisData.trends.length > 0) progress++;
  
  return Math.round((progress / totalItems) * 100);
};

const calculateFinancialsProgress = (financialsData: FinancialsData): number => {
  let progress = 0;
  let totalItems = 3; // initialInvestment, quarterlyGoals, expenses
  
  if (financialsData.initialInvestment > 0) progress++;
  if (financialsData.quarterlyGoals && financialsData.quarterlyGoals.length > 0) progress++;
  if (financialsData.expenses && financialsData.expenses.length > 0) progress++;
  
  return Math.round((progress / totalItems) * 100);
};

const calculateActionPlanProgress = (actionPlanData: ActionPlanData): number => {
  if (!actionPlanData.milestones || actionPlanData.milestones.length === 0) {
    return 0;
  }
  
  // Calculer le pourcentage de jalons complétés
  const completedMilestones = actionPlanData.milestones.filter(m => m.isCompleted).length;
  const totalMilestones = actionPlanData.milestones.length;
  
  // Calculer le pourcentage de tâches complétées
  let completedTasks = 0;
  let totalTasks = 0;
  
  if (actionPlanData.tasks && actionPlanData.tasks.length > 0) {
    totalTasks = actionPlanData.tasks.length;
    completedTasks = actionPlanData.tasks.filter(t => t.status === 'done').length;
  }
  
  // Moyenne pondérée: 60% pour les jalons, 40% pour les tâches
  const milestonesWeight = 0.6;
  const tasksWeight = 0.4;
  
  const milestonesProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const tasksProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Si aucune tâche n'est définie, utiliser uniquement les jalons
  if (totalTasks === 0) {
    return Math.round(milestonesProgress);
  }
  
  // Sinon, calculer la moyenne pondérée
  return Math.round((milestonesProgress * milestonesWeight) + (tasksProgress * tasksWeight));
};
