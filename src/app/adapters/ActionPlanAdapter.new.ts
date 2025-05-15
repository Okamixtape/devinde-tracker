/**
 * ActionPlanAdapter - Adaptateur pour les données du plan d'action
 * 
 * Transforme les données entre le format service (dataModels) et le format UI (ActionPlanInterfaces).
 * Implémente les conventions définies dans /docs/CONVENTIONS.md
 *
 * @version 1.0
 * @standardized true
 */

import { BusinessPlanData, Milestone, Task } from '../services/interfaces/dataModels';
import { 
  MilestoneWithDetails,
  TaskWithDetails,
  MilestoneCategory,
  ActionItemStatus,
  ActionPlanStatistics,
  TaskPriority,
  CalendarEvent,
  TimelineItem,
  SubTask,
  TaskComment
} from '../interfaces/ActionPlanInterfaces';

/**
 * Adaptateur pour le plan d'action
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * (BusinessPlanData) et le format UI (MilestoneWithDetails, TaskWithDetails, etc.).
 */
export class ActionPlanAdapter {
  /**
   * Transforme les données du format service vers le format UI
   * Cette méthode est le point d'entrée principal pour obtenir des données formatées pour l'UI
   * 
   * @param businessPlanData Données provenant du service
   * @returns Données formatées pour l'UI avec valeurs par défaut pour les champs manquants
   */
  static toUI(businessPlanData: BusinessPlanData): {
    milestones: MilestoneWithDetails[],
    tasks: TaskWithDetails[],
    taskHierarchy: TaskWithDetails[],
    statistics: ActionPlanStatistics
  } {
    // Protection contre les données nulles ou undefined
    if (!businessPlanData) {
      return {
        milestones: [],
        tasks: [],
        taskHierarchy: [],
        statistics: ActionPlanAdapter.createEmptyStatistics()
      };
    }
    
    // Transformation des données vers le format UI
    const milestones = ActionPlanAdapter.toDetailedMilestones(businessPlanData);
    const tasks = ActionPlanAdapter.toDetailedTasks(businessPlanData);
    const taskHierarchy = ActionPlanAdapter.buildTaskHierarchy(tasks);
    const statistics = ActionPlanAdapter.calculateActionPlanStatistics(milestones, tasks);
    
    return {
      milestones,
      tasks,
      taskHierarchy,
      statistics
    };
  }

  /**
   * Crée un objet de statistiques vide pour gérer les cas où les données sont manquantes
   * @private
   */
  private static createEmptyStatistics(): ActionPlanStatistics {
    return {
      totalMilestones: 0,
      completedMilestones: 0,
      upcomingMilestones: 0,
      lateMilestones: 0,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      upcomingTasks: 0,
      lateTasks: 0,
      overallProgress: 0,
      timelineHealth: 'good'
    };
  }

  /**
   * Transforme les jalons du format service vers le format UI détaillé
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Jalons transformés avec détails additionnels pour l'UI
   */
  static toDetailedMilestones(businessPlanData: BusinessPlanData): MilestoneWithDetails[] {
    const { actionPlan } = businessPlanData;
    const milestones = actionPlan?.milestones || [];
    const tasks = actionPlan?.tasks || [];
    const now = new Date();
    
    return milestones.map(milestone => {
      // Trouver les tâches associées à ce jalon
      const milestoneTasks = tasks.filter(task => task.milestoneId === milestone.id);
      const tasksCompleted = milestoneTasks.filter(task => task.status === 'done').length;
      
      // Calculer la progression
      const progress = milestoneTasks.length > 0 
        ? Math.round((tasksCompleted / milestoneTasks.length) * 100) 
        : milestone.isCompleted ? 100 : 0;
      
      // Déterminer la date d'échéance (si non spécifiée, utiliser une valeur par défaut)
      const dueDate = milestone.targetDate || '';
      
      // Calculer les jours restants jusqu'à la date d'échéance
      const dueDateObject = new Date(dueDate);
      const daysRemaining = Math.round((dueDateObject.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isLate = daysRemaining < 0 && !milestone.isCompleted;
      
      // Déterminer le statut du jalon
      let status: ActionItemStatus = 'planned';
      if (milestone.isCompleted) {
        status = 'completed';
      } else if (progress > 0) {
        status = 'in-progress';
      } else if (isLate) {
        status = 'delayed';
      }
      
      // Déterminer la catégorie (si non spécifiée, utiliser une valeur par défaut basée sur le nom)
      let category: MilestoneCategory = 'business';
      if (milestone.title?.toLowerCase().includes('market') || 
          milestone.title?.toLowerCase().includes('client')) {
        category = 'marketing';
      } else if (milestone.title?.toLowerCase().includes('code') || 
                 milestone.title?.toLowerCase().includes('develop') || 
                 milestone.title?.toLowerCase().includes('technique')) {
        category = 'technical';
      } else if (milestone.title?.toLowerCase().includes('admin') || 
                 milestone.title?.toLowerCase().includes('légal')) {
        category = 'administrative';
      }
      
      return {
        id: milestone.id || '',
        title: milestone.title || '',
        description: milestone.description || '',
        category,
        status,
        progress,
        tasksTotal: milestoneTasks.length,
        tasksCompleted,
        daysRemaining: Math.max(0, daysRemaining),
        isLate,
        dueDate,
        comments: [] as TaskComment[]
      };
    });
  }

  /**
   * Transforme les tâches du format service vers le format UI détaillé
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Tâches transformées avec détails additionnels pour l'UI
   */
  static toDetailedTasks(businessPlanData: BusinessPlanData): TaskWithDetails[] {
    const { actionPlan } = businessPlanData;
    const tasks = actionPlan?.tasks || [];
    
    return tasks.map(task => {
      // Déterminer la priorité de la tâche (si non spécifiée, déduire de la description ou du titre)
      let priority: TaskPriority = 'normal';
      if (task.title?.toLowerCase().includes('urgent') || 
          task.description?.toLowerCase().includes('urgent') || 
          task.title?.toLowerCase().includes('critiq')) {
        priority = 'urgent';
      } else if (task.title?.toLowerCase().includes('import') || 
                 task.description?.toLowerCase().includes('import')) {
        priority = 'high';
      } else if (task.title?.toLowerCase().includes('optionn') || 
                 task.title?.toLowerCase().includes('plus tard') || 
                 task.description?.toLowerCase().includes('si possible')) {
        priority = 'low';
      }
      
      // Convertir le statut dans le nouveau format
      let status: ActionItemStatus = 'planned';
      if (task.status === 'done') {
        status = 'completed';
      } else if (task.status === 'in-progress') {
        status = 'in-progress';
      }
      
      // Déterminer les dates de début et de fin si non spécifiées
      const dueDate = task.dueDate || '';
      
      // Variables pour stocker les propriétés UI supplémentaires
      const startDate = '';
      const estimatedHours = undefined;
      const actualHours = undefined;
      
      return {
        id: task.id || '',
        title: task.title || '',
        description: task.description || '',
        priority,
        status,
        startDate,
        dueDate,
        estimatedHours,
        actualHours,
        subtasks: [] as SubTask[],
        dependencies: [] as string[],
        comments: [] as TaskComment[],
        tags: [] as string[],
        isBlocking: false,
        milestoneId: task.milestoneId
      };
    });
  }

  /**
   * Organise les tâches en arborescence parent/enfant
   * 
   * @param tasks Liste de tâches à organiser
   * @returns Hiérarchie de tâches avec leurs sous-tâches
   */
  static buildTaskHierarchy(tasks: TaskWithDetails[]): TaskWithDetails[] {
    // Créer un map pour un accès rapide aux tâches par ID
    const taskMap = new Map<string, TaskWithDetails>();
    tasks.forEach(task => {
      taskMap.set(task.id, { ...task, subtasks: [] });
    });
    
    // Identifier les relations parent/enfant si les tâches ont une propriété parentTaskId
    const rootTasks: TaskWithDetails[] = [];
    
    tasks.forEach(task => {
      if ('parentTaskId' in task && task.parentTaskId) {
        // C'est une sous-tâche, l'ajouter au parent
        const parent = taskMap.get(task.parentTaskId);
        if (parent && parent.subtasks) {
          parent.subtasks.push(taskMap.get(task.id) || task);
        } else {
          // Si le parent n'est pas trouvé, l'ajouter comme tâche racine
          rootTasks.push(taskMap.get(task.id) || task);
        }
      } else {
        // C'est une tâche racine
        rootTasks.push(taskMap.get(task.id) || task);
      }
    });
    
    return rootTasks;
  }

  /**
   * Calcule les statistiques globales du plan d'action
   * 
   * @param milestones Liste des jalons
   * @param tasks Liste des tâches
   * @returns Statistiques calculées sur le plan d'action
   */
  static calculateActionPlanStatistics(
    milestones: MilestoneWithDetails[],
    tasks: TaskWithDetails[]
  ): ActionPlanStatistics {
    const now = new Date();
    
    // Statistiques des jalons
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const lateMilestones = milestones.filter(m => m.isLate).length;
    const upcomingMilestones = milestones.filter(m => 
      m.status !== 'completed' && 
      m.status !== 'cancelled' && 
      !m.isLate && 
      new Date(m.dueDate) > now
    ).length;
    
    // Statistiques des tâches
    const flatTasks = tasks.reduce<TaskWithDetails[]>((all, task) => {
      const flattenTask = (t: TaskWithDetails, result: TaskWithDetails[]) => {
        result.push(t);
        t.subtasks?.forEach(sub => {
          // Convertir SubTask en TaskWithDetails pour la récursion
          const subAsTask: TaskWithDetails = {
            id: sub.id,
            title: sub.title,
            description: sub.description,
            priority: sub.priority,
            status: sub.status,
            comments: sub.comments,
            tags: sub.tags,
            milestoneId: sub.milestoneId,
            dueDate: '',
            subtasks: [] as SubTask[]
          };
          flattenTask(subAsTask, result);
        });
        return result;
      };
      return flattenTask(task, all);
    }, []);
    
    const totalTasks = flatTasks.length;
    const completedTasks = flatTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = flatTasks.filter(t => t.status === 'in-progress').length;
    const lateTasks = flatTasks.filter(t => 
      t.status !== 'completed' && 
      t.status !== 'cancelled' && 
      t.dueDate && 
      new Date(t.dueDate) < now
    ).length;
    const upcomingTasks = flatTasks.filter(t => 
      t.status !== 'completed' && 
      t.status !== 'cancelled' && 
      t.dueDate && 
      new Date(t.dueDate) > now
    ).length;
    
    // Calcul de la progression globale
    const overallProgress = totalMilestones > 0 && totalTasks > 0
      ? Math.round(
          ((completedMilestones / totalMilestones) * 0.5) + 
          ((completedTasks / totalTasks) * 0.5)
        ) * 100
      : 0;
    
    // Déterminer l'état général du plan
    let timelineHealth: 'good' | 'warning' | 'critical' = 'good';
    
    const lateRatio = totalTasks > 0 ? lateTasks / totalTasks : 0;
    if (lateRatio > 0.2 || lateMilestones > 1) {
      timelineHealth = 'critical';
    } else if (lateRatio > 0.1 || lateMilestones > 0) {
      timelineHealth = 'warning';
    }
    
    return {
      totalMilestones,
      completedMilestones,
      upcomingMilestones,
      lateMilestones,
      
      totalTasks,
      completedTasks,
      inProgressTasks,
      upcomingTasks,
      lateTasks,
      
      overallProgress,
      timelineHealth
    };
  }
