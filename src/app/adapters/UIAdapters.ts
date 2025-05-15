/**
 * UIAdapters - Adaptateurs pour la transformation des données
 * 
 * Ce fichier contient des fonctions utilitaires pour transformer les données
 * entre le format de stockage et le format utilisé par l'interface utilisateur.
 * Ces adaptateurs assurent une séparation propre entre la logique métier et l'UI.
 */

import {
  BusinessPlanData,
  FinancialProject,
  ActionPlanData,
  Milestone,
  Task
} from '../services/interfaces/dataModels';

import {
  SidebarSection,
  KeyMetric,
  RevenueProjection,
  SmartSuggestion,
  UserActivity,
  FinancialProjectSummary,
  FinancialProjectCard,
  MilestoneWithProgress,
  TaskWithRelations
} from '../interfaces/UIModels';

/**
 * Génère les métriques clés à partir des données du plan d'affaires
 */
export const generateKeyMetrics = (businessPlanData: BusinessPlanData): KeyMetric[] => {
  const { financials, actionPlan, marketAnalysis } = businessPlanData;
  
  // Calculer les métriques financières
  const totalRevenue = financials.quarterlyGoals.reduce((sum, goal) => sum + goal.amount, 0);
  const totalExpenses = financials.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  
  // Calculer les métriques du plan d'action
  const totalMilestones = actionPlan.milestones?.length || 0;
  const completedMilestones = actionPlan.milestones?.filter(m => m.isCompleted).length || 0;
  const milestoneProgress = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : 0;
  
  // Générer les métriques clés
  return [
    {
      id: 'revenue',
      title: 'Revenu prévu',
      value: `${totalRevenue.toLocaleString('fr-FR')} €`,
      trend: '+12% vs T-1',
      trendDirection: 'up',
      iconName: 'TrendingUp',
      color: 'green'
    },
    {
      id: 'expenses',
      title: 'Dépenses prévues',
      value: `${totalExpenses.toLocaleString('fr-FR')} €`,
      trend: '+5% vs T-1',
      trendDirection: 'up',
      iconName: 'TrendingDown',
      color: 'yellow'
    },
    {
      id: 'profit',
      title: 'Bénéfice net',
      value: `${netProfit.toLocaleString('fr-FR')} €`,
      trend: '+15% vs T-1',
      trendDirection: 'up',
      iconName: 'DollarSign',
      color: 'green'
    },
    {
      id: 'milestones',
      title: 'Avancement Plan',
      value: `${milestoneProgress}%`,
      trend: '+10%',
      trendDirection: 'up',
      iconName: 'CheckSquare',
      color: 'blue'
    }
  ];
};

/**
 * Génère les projections de revenus à partir des données financières
 */
export const generateRevenueProjections = (businessPlanData: BusinessPlanData): RevenueProjection[] => {
  const { financials, services } = businessPlanData;
  
  // Générer des projections par trimestre
  return financials.quarterlyGoals.map((goal, index) => {
    // Déterminer les sources de revenus basées sur les services offerts
    const sources = services.offerings.map((offering, idx) => {
      // Répartir le revenu total en fonction des services (simulation)
      const percentage = 0.1 + (idx * 0.15); // Distribuer entre 10% et 55%
      const value = Math.round(goal.amount * percentage);
      
      return {
        name: offering.name,
        value,
        color: getServiceColor(idx)
      };
    });
    
    return {
      period: `T${index + 1}`,
      projected: goal.amount,
      // Ajouter des valeurs réelles pour les trimestres passés (simulation)
      actual: index === 0 ? goal.amount * 0.95 : undefined,
      sources
    };
  });
};

/**
 * Génère des suggestions intelligentes basées sur l'état actuel du plan d'affaires
 */
export const generateSmartSuggestions = (businessPlanData: BusinessPlanData): SmartSuggestion[] => {
  const suggestions: SmartSuggestion[] = [];
  
  // Vérifier les sections incomplètes
  if (!businessPlanData.pitch.vision || businessPlanData.pitch.vision.length < 50) {
    suggestions.push({
      id: 'incomplete-vision',
      title: 'Vision incomplète',
      description: 'Votre vision d\'entreprise n\'est pas assez développée. Une vision claire vous aide à rester focalisé.',
      action: 'Compléter la vision',
      path: '/plans/pitch',
      priority: 'high'
    });
  }
  
  // Vérifier les finances
  if (businessPlanData.financials.expenses.length < 3) {
    suggestions.push({
      id: 'few-expenses',
      title: 'Dépenses sous-estimées',
      description: 'Vous avez peu de catégories de dépenses. Assurez-vous de prendre en compte tous les coûts.',
      action: 'Réviser les dépenses',
      path: '/plans/finances',
      priority: 'medium'
    });
  }
  
  // Vérifier le plan d'action
  const now = new Date();
  const upcomingMilestones = businessPlanData.actionPlan.milestones
    ?.filter(m => !m.isCompleted && new Date(m.dueDate) > now)
    ?.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  if (upcomingMilestones && upcomingMilestones.length > 0) {
    const nextMilestone = upcomingMilestones[0];
    const dueDate = new Date(nextMilestone.dueDate);
    const daysRemaining = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 14) {
      suggestions.push({
        id: 'upcoming-milestone',
        title: 'Jalon à venir',
        description: `Le jalon "${nextMilestone.title}" arrive dans ${daysRemaining} jours. Assurez-vous d'être sur la bonne voie.`,
        action: 'Voir le jalon',
        path: '/plans/action-plan',
        priority: daysRemaining <= 7 ? 'high' : 'medium'
      });
    }
  }
  
  return suggestions;
};

/**
 * Transforme les projets financiers en cartes pour l'affichage
 */
export const transformFinancialProjects = (projects: FinancialProject[]): FinancialProjectCard[] => {
  const now = new Date();
  
  return projects.map(project => {
    // Calculer les jours restants
    const endDate = new Date(project.endDate);
    const daysRemaining = Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculer la balance financière
    const totalIncome = project.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = project.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    const budgetRatio = project.budget > 0 ? balance / project.budget : 0;
    
    // Déterminer la santé du projet
    let healthStatus: 'good' | 'warning' | 'critical' = 'good';
    
    if (daysRemaining < 0 && project.status !== 'completed') {
      healthStatus = 'critical';
    } else if (budgetRatio < 0) {
      healthStatus = 'critical';
    } else if (daysRemaining < 7 || budgetRatio < 0.1) {
      healthStatus = 'warning';
    }
    
    return {
      ...project,
      clientName: project.client || 'Client sans nom',
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      healthStatus,
    };
  });
};

/**
 * Calcule un résumé des projets financiers
 */
export const calculateFinancialProjectsSummary = (projects: FinancialProject[]): FinancialProjectSummary => {
  const activeProjects = projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled');
  
  let totalIncome = 0;
  let totalExpenses = 0;
  
  projects.forEach(project => {
    project.transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });
  });
  
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  
  return {
    totalProjects: projects.length,
    activeProjects: activeProjects.length,
    totalBudget,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses
  };
};

/**
 * Transforme les jalons en jalons avec informations de progression
 */
export const transformMilestones = (
  actionPlanData: ActionPlanData
): MilestoneWithProgress[] => {
  const { milestones, tasks } = actionPlanData;
  const now = new Date();
  
  return milestones.map(milestone => {
    // Filtrer les tâches associées à ce jalon
    const milestoneTasks = tasks.filter(task => task.milestoneId === milestone.id);
    const completedTasks = milestoneTasks.filter(task => task.status === 'done');
    
    // Calculer le pourcentage de complétion
    const completionPercentage = milestoneTasks.length > 0 
      ? Math.round((completedTasks.length / milestoneTasks.length) * 100)
      : milestone.isCompleted ? 100 : 0;
    
    // Calculer les jours restants
    const dueDate = new Date(milestone.dueDate);
    const daysRemaining = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isLate = daysRemaining < 0 && !milestone.isCompleted;
    
    return {
      ...milestone,
      completionPercentage,
      tasksCount: milestoneTasks.length,
      completedTasksCount: completedTasks.length,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      isLate
    };
  });
};

/**
 * Transforme les tâches en tâches avec relations
 */
export const transformTasks = (
  actionPlanData: ActionPlanData
): TaskWithRelations[] => {
  const { tasks } = actionPlanData;
  
  // Créer un map des tâches pour un accès rapide
  const taskMap = new Map<string, Task>();
  tasks.forEach(task => taskMap.set(task.id, task));
  
  // Identifier les relations parent-enfant
  const childrenMap = new Map<string, string[]>();
  tasks.forEach(task => {
    if (task.parentTaskId) {
      const children = childrenMap.get(task.parentTaskId) || [];
      children.push(task.id);
      childrenMap.set(task.parentTaskId, children);
    }
  });
  
  // Transformer les tâches racines (sans parent)
  return tasks
    .filter(task => !task.parentTaskId)
    .map(task => transformTaskWithChildren(task, taskMap, childrenMap));
};

/**
 * Fonction récursive pour transformer une tâche avec ses enfants
 */
const transformTaskWithChildren = (
  task: Task,
  taskMap: Map<string, Task>,
  childrenMap: Map<string, string[]>
): TaskWithRelations => {
  const childrenIds = childrenMap.get(task.id) || [];
  const subtasks = childrenIds
    .map(id => taskMap.get(id))
    .filter((t): t is Task => !!t)
    .map(t => transformTaskWithChildren(t, taskMap, childrenMap));
  
  return {
    ...task,
    subtasks: subtasks.length > 0 ? subtasks : undefined,
    // Ajouter d'autres propriétés selon les besoins
    assignee: '',  // À remplir avec des données réelles
    dependencies: [],  // À remplir avec des données réelles
    comments: []  // À remplir avec des données réelles
  };
};

/**
 * Fonctions utilitaires
 */

// Génère une couleur pour un service basé sur son index
const getServiceColor = (index: number): string => {
  const colors = ['#4C51BF', '#38B2AC', '#ED8936', '#667EEA', '#9F7AEA', '#F56565'];
  return colors[index % colors.length];
};
