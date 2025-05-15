/**
 * ActionPlanAdapter - Adaptateur pour les données du plan d'action
 * 
 * Transforme les données entre le format service (dataModels) et le format UI standardisé.
 * Implémente les conventions définies dans /docs/CONVENTIONS.md
 *
 * @version 2.0
 * @standardized true
 */

import { BusinessPlanData, ActionPlanData } from '../services/interfaces/dataModels';
import { 
  UIMilestone,
  UITask,
  UISubTask,
  UITaskComment,
  UIActionPlanStatistics,
  UIActionPlanViewSettings,
  UIActionPlanFilters,
  UIActionPlan,
  ServiceMilestone,
  ServiceTask,
  ServiceSubTask,
  ServiceTaskComment,
  MilestoneCategory
} from '../interfaces/action-plan/action-plan';
import { ItemStatus, PriorityLevel } from '../interfaces/common/common-types';
import { 
  MilestoneWithDetails,
  TaskWithDetails,
  ActionPlanStatistics,
  CalendarEvent,
  TimelineItem
} from '../interfaces/ActionPlanInterfaces';

/**
 * Adaptateur pour le plan d'action
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * et le format UI standardisé.
 */
export class ActionPlanAdapter {
  /**
   * Transforme les données du format service vers le format UI
   * Cette méthode est le point d'entrée principal pour obtenir des données formatées pour l'UI
   * 
   * @param businessPlanData Données provenant du service
   * @returns Données formatées pour l'UI avec valeurs par défaut pour les champs manquants
   */
  static toUI(businessPlanData: BusinessPlanData): UIActionPlan {
    // Protection contre les données nulles ou undefined
    if (!businessPlanData) {
      return ActionPlanAdapter.createDefaultUIData();
    }

    const actionPlan = businessPlanData.actionPlan || {} as ActionPlanData;
    
    // Transformation des jalons
    const milestones = ActionPlanAdapter.milestonesToUI(actionPlan.milestones || []);
    
    // Transformation des tâches
    const tasks = ActionPlanAdapter.tasksToUI(actionPlan.tasks || [], milestones);
    
    // Calcul des statistiques
    const statistics = ActionPlanAdapter.calculateStatistics(milestones, tasks);
    
    // Construction de la hiérarchie des tâches pour la vue d'arborescence
    const taskHierarchy = ActionPlanAdapter.buildTaskHierarchy(tasks, milestones);
    
    // Paramètres d'affichage par défaut
    const viewSettings: UIActionPlanViewSettings = {
      showCompletedTasks: true,
      showSubtasks: true,
      activeFilters: {
        statuses: Object.values(ItemStatus),
        priorities: Object.values(PriorityLevel),
        milestoneCategories: Object.values(MilestoneCategory),
        tags: [],
        assignees: [],
        searchTerm: ''
      },
      defaultView: 'list',
      showDependencies: true
    };
    
    return {
      milestones,
      tasks,
      statistics,
      taskHierarchy,
      viewSettings
    };
  }

  /**
   * Transforme les données du format UI vers le format service
   * Utilisé lors de la création ou la sauvegarde complète de données
   * 
   * @param uiData Données provenant de l'UI
   * @returns Données formatées pour le service (partiel BusinessPlanData)
   */
  static toService(uiData: UIActionPlan): Partial<BusinessPlanData> {
    if (!uiData) {
      return { actionPlan: { milestones: [], tasks: [] } };
    }
    
    return {
      actionPlan: {
        milestones: ActionPlanAdapter.milestonesToService(uiData.milestones || []),
        tasks: ActionPlanAdapter.tasksToService(uiData.tasks || [])
      }
    };
  }
  
  /**
   * Met à jour partiellement les données du service avec les modifications de l'UI
   * 
   * @param businessPlanData Données complètes du service
   * @param uiChanges Modifications partielles de l'UI
   * @returns Données service mises à jour avec fusion intelligente
   */
  static updateServiceWithUIChanges(
    businessPlanData: BusinessPlanData,
    uiChanges: Partial<UIActionPlan>
  ): BusinessPlanData {
    if (!businessPlanData) return {} as BusinessPlanData;
    if (!uiChanges) return businessPlanData;
    
    // Créer une copie pour éviter des modifications directes
    const result = { ...businessPlanData };
    
    // Initialiser le plan d'action s'il n'existe pas
    if (!result.actionPlan) {
      result.actionPlan = { milestones: [], tasks: [] };
    }
    
    // Mettre à jour les jalons si fournis
    if (uiChanges.milestones) {
      result.actionPlan.milestones = ActionPlanAdapter.milestonesToService(uiChanges.milestones);
    }
    
    // Mettre à jour les tâches si fournies
    if (uiChanges.tasks) {
      result.actionPlan.tasks = ActionPlanAdapter.tasksToService(uiChanges.tasks);
    }
    
    // Traiter les mises à jour partielles individuelles
    if (uiChanges.updatedMilestone) {
      const updatedMilestone = ActionPlanAdapter.milestoneToService(uiChanges.updatedMilestone);
      const existingIndex = result.actionPlan.milestones.findIndex(m => m.id === updatedMilestone.id);
      
      if (existingIndex >= 0) {
        // Mise à jour d'un jalon existant
        result.actionPlan.milestones[existingIndex] = {
          ...result.actionPlan.milestones[existingIndex],
          ...updatedMilestone
        };
      } else {
        // Ajout d'un nouveau jalon
        result.actionPlan.milestones.push(updatedMilestone);
      }
    }
    
    // Traiter les mises à jour de tâches individuelles
    if (uiChanges.updatedTask) {
      const updatedTask = ActionPlanAdapter.taskToService(uiChanges.updatedTask);
      const existingIndex = result.actionPlan.tasks.findIndex(t => t.id === updatedTask.id);
      
      if (existingIndex >= 0) {
        // Mise à jour d'une tâche existante
        result.actionPlan.tasks[existingIndex] = {
          ...result.actionPlan.tasks[existingIndex],
          ...updatedTask
        };
      } else {
        // Ajout d'une nouvelle tâche
        result.actionPlan.tasks.push(updatedTask);
      }
    }
    
    return result;
  }
  
  /**
   * Transforme les jalons du format service vers le format UI
   * @private
   */
  private static milestonesToUI(milestones: any[]): UIMilestone[] {
    if (!milestones || !Array.isArray(milestones)) return [];
    
    return milestones.map(milestone => {
      const tasksTotal = 0; // À calculer en fonction des tâches associées
      const tasksCompleted = 0; // À calculer en fonction des tâches associées
      
      return {
        id: milestone.id || `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: milestone.title || '',
        description: milestone.description || '',
        category: ActionPlanAdapter.serviceToUIMilestoneCategory(milestone.category),
        status: ActionPlanAdapter.serviceToUIStatus(milestone.status || milestone.isCompleted ? 'done' : 'planned'),
        progress: milestone.progress || 0,
        tasksTotal,
        tasksCompleted,
        daysRemaining: milestone.daysRemaining,
        isLate: milestone.isLate,
        dueDate: milestone.dueDate || milestone.targetDate || '',
        comments: (milestone.comments || []).map(ActionPlanAdapter.commentToUI),
        createdAt: milestone.createdAt || new Date().toISOString(),
        updatedAt: milestone.updatedAt || new Date().toISOString(),
        isEditing: false,
        validationErrors: {}
      };
    });
  }
  
  /**
   * Transforme les jalons du format UI vers le format service
   * @private
   */
  private static milestonesToService(milestones: UIMilestone[]): ServiceMilestone[] {
    if (!milestones || !Array.isArray(milestones)) return [];
    
    return milestones.map(milestone => ActionPlanAdapter.milestoneToService(milestone));
  }
  
  /**
   * Transforme un jalon du format UI vers le format service
   * @private
   */
  private static milestoneToService(milestone: UIMilestone): ServiceMilestone {
    return {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      category: ActionPlanAdapter.uiToServiceMilestoneCategory(milestone.category),
      status: ActionPlanAdapter.uiToServiceStatus(milestone.status),
      isCompleted: milestone.status === ItemStatus.COMPLETED,
      targetDate: milestone.dueDate,
      dueDate: milestone.dueDate,
      comments: (milestone.comments || []).map(ActionPlanAdapter.commentToService),
      createdAt: milestone.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Transforme les tâches du format service vers le format UI
   * @private
   */
  private static tasksToUI(tasks: any[], milestones: UIMilestone[]): UITask[] {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    return tasks.map(task => ({
      id: task.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: task.title || '',
      description: task.description || '',
      priority: ActionPlanAdapter.serviceToUIPriority(task.priority),
      status: ActionPlanAdapter.serviceToUIStatus(task.status),
      assignee: task.assignee || '',
      startDate: task.startDate || '',
      dueDate: task.dueDate || '',
      estimatedHours: task.estimatedHours || 0,
      actualHours: task.actualHours || 0,
      subtasks: (task.subtasks || []).map(ActionPlanAdapter.subtaskToUI),
      dependencies: task.dependencies || [],
      comments: (task.comments || []).map(ActionPlanAdapter.commentToUI),
      tags: task.tags || [],
      isBlocking: task.isBlocking || false,
      milestoneId: task.milestoneId || '',
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || new Date().toISOString(),
      isEditing: false,
      validationErrors: {}
    }));
  }
  
  /**
   * Transforme les tâches du format UI vers le format service
   * @private
   */
  private static tasksToService(tasks: UITask[]): ServiceTask[] {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    return tasks.map(task => ActionPlanAdapter.taskToService(task));
  }
  
  /**
   * Transforme une tâche du format UI vers le format service
   * @private
   */
  private static taskToService(task: UITask): ServiceTask {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: ActionPlanAdapter.uiToServicePriority(task.priority),
      status: ActionPlanAdapter.uiToServiceStatus(task.status),
      assignee: task.assignee,
      startDate: task.startDate,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      subtasks: (task.subtasks || []).map(ActionPlanAdapter.subtaskToService),
      dependencies: task.dependencies || [],
      comments: (task.comments || []).map(ActionPlanAdapter.commentToService),
      tags: task.tags || [],
      isBlocking: task.isBlocking,
      milestoneId: task.milestoneId,
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Transforme une sous-tâche du format service vers le format UI
   * @private
   */
  private static subtaskToUI(subtask: any): UISubTask {
    return {
      id: subtask.id || `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: subtask.title || '',
      description: subtask.description || '',
      priority: ActionPlanAdapter.serviceToUIPriority(subtask.priority),
      status: ActionPlanAdapter.serviceToUIStatus(subtask.status),
      completed: subtask.completed || false,
      comments: (subtask.comments || []).map(ActionPlanAdapter.commentToUI),
      tags: subtask.tags || [],
      milestoneId: subtask.milestoneId || '',
      createdAt: subtask.createdAt || new Date().toISOString(),
      updatedAt: subtask.updatedAt || new Date().toISOString(),
      isEditing: false,
      validationErrors: {}
    };
  }
  
  /**
   * Transforme une sous-tâche du format UI vers le format service
   * @private
   */
  private static subtaskToService(subtask: UISubTask): ServiceSubTask {
    return {
      id: subtask.id,
      title: subtask.title,
      description: subtask.description,
      priority: ActionPlanAdapter.uiToServicePriority(subtask.priority),
      status: ActionPlanAdapter.uiToServiceStatus(subtask.status),
      completed: subtask.completed,
      comments: (subtask.comments || []).map(ActionPlanAdapter.commentToService),
      tags: subtask.tags || [],
      milestoneId: subtask.milestoneId,
      createdAt: subtask.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Transforme un commentaire du format service vers le format UI
   * @private
   */
  private static commentToUI(comment: any): UITaskComment {
    return {
      id: comment.id || `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      author: comment.author || '',
      content: comment.content || '',
      timestamp: comment.timestamp || new Date().toISOString(),
      edited: comment.edited || false,
      createdAt: comment.createdAt || new Date().toISOString(),
      updatedAt: comment.updatedAt || new Date().toISOString(),
      isEditing: false,
      validationErrors: {}
    };
  }
  
  /**
   * Transforme un commentaire du format UI vers le format service
   * @private
   */
  private static commentToService(comment: UITaskComment): ServiceTaskComment {
    return {
      id: comment.id,
      author: comment.author,
      content: comment.content,
      timestamp: comment.timestamp,
      edited: comment.edited,
      createdAt: comment.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Calcule les statistiques du plan d'action
   * @private
   */
  private static calculateStatistics(milestones: UIMilestone[], tasks: UITask[]): UIActionPlanStatistics {
    // Statistiques des jalons
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === ItemStatus.COMPLETED).length;
    const upcomingMilestones = milestones.filter(m => m.status === ItemStatus.PENDING).length;
    const lateMilestones = milestones.filter(m => m.isLate).length;
    
    // Statistiques des tâches
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === ItemStatus.COMPLETED).length;
    const inProgressTasks = tasks.filter(t => t.status === ItemStatus.IN_PROGRESS).length;
    const lateTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date() && t.status !== ItemStatus.COMPLETED;
    }).length;
    
    // Taux de complétion
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Tâches par priorité
    const tasksByPriority = {
      [PriorityLevel.LOW]: tasks.filter(t => t.priority === PriorityLevel.LOW).length,
      [PriorityLevel.MEDIUM]: tasks.filter(t => t.priority === PriorityLevel.MEDIUM).length,
      [PriorityLevel.HIGH]: tasks.filter(t => t.priority === PriorityLevel.HIGH).length,
      [PriorityLevel.URGENT]: tasks.filter(t => t.priority === PriorityLevel.URGENT).length
    };
    
    // Tâches par statut
    const tasksByStatus = {
      [ItemStatus.PENDING]: tasks.filter(t => t.status === ItemStatus.PENDING).length,
      [ItemStatus.IN_PROGRESS]: inProgressTasks,
      [ItemStatus.COMPLETED]: completedTasks,
      [ItemStatus.CANCELLED]: tasks.filter(t => t.status === ItemStatus.CANCELLED).length,
      [ItemStatus.DELAYED]: tasks.filter(t => t.status === ItemStatus.DELAYED).length
    };
    
    return {
      totalMilestones,
      completedMilestones,
      upcomingMilestones,
      lateMilestones,
      totalTasks,
      completedTasks,
      inProgressTasks,
      lateTasks,
      completionRate,
      tasksByPriority,
      tasksByStatus
    };
  }
  
  /**
   * Construit une hiérarchie des tâches groupées par jalons
   * @private
   */
  private static buildTaskHierarchy(tasks: UITask[], milestones: UIMilestone[]) {
    const result: Record<string, UITask[]> = {};
    
    // Initialiser chaque jalon avec un tableau vide
    milestones.forEach(milestone => {
      result[milestone.id] = [];
    });
    
    // Ajouter une catégorie pour les tâches sans jalon
    result['unassigned'] = [];
    
    // Grouper les tâches par jalons
    tasks.forEach(task => {
      if (task.milestoneId && result[task.milestoneId]) {
        result[task.milestoneId].push(task);
      } else {
        result['unassigned'].push(task);
      }
    });
    
    return result;
  }
  
  /**
   * Crée un objet de données UI par défaut
   * @private
   */
  private static createDefaultUIData(): UIActionPlan {
    return {
      milestones: [],
      tasks: [],
      taskHierarchy: { unassigned: [] },
      statistics: {
        totalMilestones: 0,
        completedMilestones: 0,
        upcomingMilestones: 0,
        lateMilestones: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        lateTasks: 0,
        completionRate: 0,
        tasksByPriority: {
          [PriorityLevel.LOW]: 0,
          [PriorityLevel.MEDIUM]: 0,
          [PriorityLevel.HIGH]: 0,
          [PriorityLevel.URGENT]: 0
        },
        tasksByStatus: {
          [ItemStatus.PENDING]: 0,
          [ItemStatus.IN_PROGRESS]: 0,
          [ItemStatus.COMPLETED]: 0,
          [ItemStatus.CANCELLED]: 0,
          [ItemStatus.DELAYED]: 0
        }
      },
      viewSettings: {
        showCompletedTasks: true,
        showSubtasks: true,
        activeFilters: {
          statuses: Object.values(ItemStatus),
          priorities: Object.values(PriorityLevel),
          milestoneCategories: Object.values(MilestoneCategory),
          tags: [],
          assignees: [],
          searchTerm: ''
        },
        defaultView: 'list',
        showDependencies: true
      }
    };
  }
  
  /**
   * Convertit le statut du format service vers le format UI
   * @private
   */
  private static serviceToUIStatus(serviceStatus: string): ItemStatus {
    switch (serviceStatus) {
      case 'done':
      case 'completed':
        return ItemStatus.COMPLETED;
      case 'in-progress':
      case 'in_progress':
        return ItemStatus.IN_PROGRESS;
      case 'delayed':
        return ItemStatus.DELAYED;
      case 'cancelled':
        return ItemStatus.CANCELLED;
      case 'todo':
      case 'planned':
      default:
        return ItemStatus.PENDING;
    }
  }
  
  /**
   * Convertit le statut du format UI vers le format service
   * @private
   */
  private static uiToServiceStatus(uiStatus: ItemStatus): string {
    switch (uiStatus) {
      case ItemStatus.COMPLETED:
        return 'done';
      case ItemStatus.IN_PROGRESS:
        return 'in-progress';
      case ItemStatus.DELAYED:
        return 'delayed';
      case ItemStatus.CANCELLED:
        return 'cancelled';
      case ItemStatus.PENDING:
      default:
        return 'planned';
    }
  }
  
  /**
   * Convertit la priorité du format service vers le format UI
   * @private
   */
  private static serviceToUIPriority(servicePriority: string): PriorityLevel {
    switch (servicePriority) {
      case 'low':
        return PriorityLevel.LOW;
      case 'high':
        return PriorityLevel.HIGH;
      case 'urgent':
        return PriorityLevel.URGENT;
      case 'normal':
      case 'medium':
      default:
        return PriorityLevel.MEDIUM;
    }
  }
  
  /**
   * Convertit la priorité du format UI vers le format service
   * @private
   */
  private static uiToServicePriority(uiPriority: PriorityLevel): string {
    switch (uiPriority) {
      case PriorityLevel.LOW:
        return 'low';
      case PriorityLevel.HIGH:
        return 'high';
      case PriorityLevel.URGENT:
        return 'urgent';
      case PriorityLevel.MEDIUM:
      default:
        return 'normal';
    }
  }
  
  /**
   * Convertit la catégorie de jalon du format service vers le format UI
   * @private
   */
  private static serviceToUIMilestoneCategory(serviceCategory: string): MilestoneCategory {
    switch (serviceCategory) {
      case 'marketing':
        return MilestoneCategory.MARKETING;
      case 'business':
        return MilestoneCategory.BUSINESS;
      case 'technical':
        return MilestoneCategory.TECHNICAL;
      case 'administrative':
        return MilestoneCategory.ADMINISTRATIVE;
      case 'client':
        return MilestoneCategory.CLIENT;
      case 'personal':
        return MilestoneCategory.PERSONAL;
      case 'all':
      default:
        return MilestoneCategory.ALL;
    }
  }
  
  /**
   * Convertit la catégorie de jalon du format UI vers le format service
   * @private
   */
  private static uiToServiceMilestoneCategory(uiCategory: MilestoneCategory): string {
    switch (uiCategory) {
      case MilestoneCategory.MARKETING:
        return 'marketing';
      case MilestoneCategory.BUSINESS:
        return 'business';
      case MilestoneCategory.TECHNICAL:
        return 'technical';
      case MilestoneCategory.ADMINISTRATIVE:
        return 'administrative';
      case MilestoneCategory.CLIENT:
        return 'client';
      case MilestoneCategory.PERSONAL:
        return 'personal';
      case MilestoneCategory.ALL:
      default:
        return 'all';
    }
  }
  
  /**
   * Transforme les données en jalons détaillés
   * @param businessPlanData Données du plan d'affaires
   * @returns Array de jalons avec détails
   * @standardized true
   */
  static toDetailedMilestones(businessPlanData: BusinessPlanData): MilestoneWithDetails[] {
    // Protection contre les données nulles
    if (!businessPlanData || !businessPlanData.actionPlan || !businessPlanData.actionPlan.milestones) {
      return [];
    }
    
    const actionPlan = businessPlanData.actionPlan;
    const milestones = actionPlan.milestones || [];
    const tasks = actionPlan.tasks || [];
    
    return milestones.map(milestone => {
      // Compter les tâches associées à ce jalon
      const milestoneTasks = tasks.filter(task => task.milestoneId === milestone.id);
      const tasksTotal = milestoneTasks.length;
      const tasksCompleted = milestoneTasks.filter(task => task.status === 'done' || task.status === 'completed').length;
      
      // Calculer les jours restants
      let daysRemaining: number | undefined;
      let isLate = false;
      
      if (milestone.targetDate || milestone.dueDate) {
        const targetDate = new Date(milestone.targetDate || milestone.dueDate);
        const today = new Date();
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        daysRemaining = diffDays;
        isLate = diffDays < 0 && !milestone.isCompleted;
      }
      
      return {
        id: milestone.id,
        title: milestone.title,
        description: milestone.description || '',
        category: milestone.category as any || 'all',
        status: milestone.isCompleted ? 'completed' : 'planned',
        progress: tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0,
        tasksTotal,
        tasksCompleted,
        daysRemaining,
        isLate,
        dueDate: milestone.targetDate || milestone.dueDate || '',
        comments: milestone.comments || []
      };
    });
  }
  
  /**
   * Transforme les données en tâches détaillées
   * @param businessPlanData Données du plan d'affaires
   * @returns Array de tâches avec détails
   * @standardized true
   */
  static toDetailedTasks(businessPlanData: BusinessPlanData): TaskWithDetails[] {
    // Protection contre les données nulles
    if (!businessPlanData || !businessPlanData.actionPlan || !businessPlanData.actionPlan.tasks) {
      return [];
    }
    
    const tasks = businessPlanData.actionPlan.tasks || [];
    
    return tasks.map(task => {
      // Mapper le statut
      let status: any = 'planned';
      if (task.status === 'done' || task.status === 'completed') {
        status = 'completed';
      } else if (task.status === 'in-progress' || task.status === 'in_progress') {
        status = 'in-progress';
      } else if (task.status === 'delayed') {
        status = 'delayed';
      } else if (task.status === 'cancelled') {
        status = 'cancelled';
      }
      
      return {
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'normal',
        status,
        assignee: task.assignee,
        startDate: task.startDate,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        subtasks: task.subtasks || [],
        dependencies: task.dependencies || [],
        comments: task.comments || [],
        tags: task.tags || [],
        isBlocking: task.isBlocking || false,
        milestoneId: task.milestoneId
      };
    });
  }
  
  /**
   * Génère les événements de calendrier à partir des jalons et tâches
   * @param milestones Jalons UI
   * @param tasks Tâches UI
   * @returns Liste d'événements calendrier
   * @standardized true
   */
  static generateCalendarEvents(milestones: UIMilestone[], tasks: UITask[]): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    
    // Ajouter les jalons au calendrier
    milestones.forEach(milestone => {
      if (milestone.dueDate) {
        const dueDate = new Date(milestone.dueDate);
        events.push({
          id: `milestone-${milestone.id}`,
          title: milestone.title,
          start: milestone.dueDate,
          end: milestone.dueDate,
          allDay: true,
          type: 'milestone',
          status: milestone.status as any,
          color: milestone.status === ItemStatus.COMPLETED ? '#4CAF50' : '#2196F3',
          linkedItemId: milestone.id
        });
      }
    });
    
    // Ajouter les tâches au calendrier
    tasks.forEach(task => {
      if (task.dueDate) {
        // Déterminer la couleur en fonction du statut
        let color = '#FF9800'; // Orange par défaut
        
        if (task.status === ItemStatus.COMPLETED) {
          color = '#4CAF50'; // Vert
        } else if (task.status === ItemStatus.DELAYED) {
          color = '#F44336'; // Rouge
        }
        
        events.push({
          id: `task-${task.id}`,
          title: task.title,
          start: task.startDate || task.dueDate,
          end: task.dueDate,
          allDay: true,
          type: 'task',
          status: task.status as any,
          color,
          linkedItemId: task.id
        });
      }
    });
    
    return events;
  }
  
  /**
   * Génère les éléments de la timeline à partir des jalons et tâches
   * @param milestones Jalons UI
   * @param tasks Tâches UI
   * @returns Liste d'éléments timeline
   * @standardized true
   */
  static generateTimelineItems(milestones: UIMilestone[], tasks: UITask[]): TimelineItem[] {
    const items: TimelineItem[] = [];
    
    // Ajouter les jalons à la timeline
    milestones.forEach(milestone => {
      if (milestone.dueDate) {
        // Calculer la date de début (par défaut 1 mois avant la date d'échéance)
        const dueDate = new Date(milestone.dueDate);
        const startDate = new Date(dueDate);
        startDate.setMonth(startDate.getMonth() - 1);
        
        items.push({
          id: `milestone-${milestone.id}`,
          title: milestone.title,
          type: 'milestone',
          start: startDate.toISOString().split('T')[0],
          end: milestone.dueDate,
          progress: milestone.progress,
          status: milestone.status as any,
          dependencies: []
        });
      }
    });
    
    // Ajouter les tâches à la timeline
    tasks.forEach(task => {
      if (task.dueDate || task.startDate) {
        const endDate = task.dueDate || new Date().toISOString().split('T')[0];
        const startDate = task.startDate || new Date(new Date(endDate).setDate(new Date(endDate).getDate() - 7)).toISOString().split('T')[0];
        
        items.push({
          id: `task-${task.id}`,
          title: task.title,
          type: 'task',
          start: startDate,
          end: endDate,
          progress: task.status === ItemStatus.COMPLETED ? 100 : (task.status === ItemStatus.IN_PROGRESS ? 50 : 0),
          status: task.status as any,
          dependencies: task.dependencies,
          milestone: task.milestoneId,
          assignee: task.assignee
        });
        
        // Ajouter les sous-tâches à la timeline
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach((subtask, index) => {
            items.push({
              id: `subtask-${subtask.id}`,
              title: subtask.title,
              type: 'subtask',
              start: startDate,
              end: endDate,
              progress: subtask.completed ? 100 : 0,
              status: subtask.status as any,
              parentId: `task-${task.id}`,
              milestone: task.milestoneId
            });
          });
        }
      }
    });
    
    return items;
  }
  
  /**
   * @deprecated Utiliser toDetailedMilestones à la place
   */
  static transformToDetailedMilestones(businessPlanData: BusinessPlanData): MilestoneWithDetails[] {
    console.warn('ActionPlanAdapter: transformToDetailedMilestones est déprécié, utiliser toDetailedMilestones à la place');
    return ActionPlanAdapter.toDetailedMilestones(businessPlanData);
  }
  
  /**
   * @deprecated Utiliser toDetailedTasks à la place
   */
  static transformToDetailedTasks(businessPlanData: BusinessPlanData): TaskWithDetails[] {
    console.warn('ActionPlanAdapter: transformToDetailedTasks est déprécié, utiliser toDetailedTasks à la place');
    return ActionPlanAdapter.toDetailedTasks(businessPlanData);
  }
  
  /**
   * @deprecated Utiliser toUI à la place
   */
  static transformToUIFormat(businessPlanData: BusinessPlanData): UIActionPlan {
    console.warn('ActionPlanAdapter: transformToUIFormat est déprécié, utiliser toUI à la place');
    return ActionPlanAdapter.toUI(businessPlanData);
  }
}

// Export par défaut pour usage simple
export default ActionPlanAdapter;