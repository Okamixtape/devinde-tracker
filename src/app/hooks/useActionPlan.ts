/**
 * useActionPlan - Hook pour la gestion du plan d'action
 * 
 * Ce hook facilite l'interaction entre les composants UI modernes et les services
 * existants pour la gestion des jalons et des tâches dans le plan d'action.
 * 
 * @version 2.0 - Updated to use standardized interfaces
 */

import { useState, useEffect, useCallback } from 'react';
import { BusinessPlanData, ActionPlanData, Milestone, Task } from '../services/interfaces/dataModels';
import { BusinessPlanServiceImpl } from '../services/core/businessPlanService';
import ActionPlanAdapter from '../adapters/ActionPlanAdapter';
import { 
  MilestoneWithDetails,
  TaskWithDetails,
  ActionPlanStatistics,
  ActionPlanViewSettings,
  MilestoneCategory,
  TaskPriority,
  ActionItemStatus
} from '../interfaces/ActionPlanInterfaces';
// Keep legacy imports for backward compatibility
import { MilestoneWithProgress, TaskWithRelations, DragDropItem } from '../interfaces/UIModels';

// Result interface for the hook, now supporting standardized interfaces
interface UseActionPlanResult {
  // Legacy data format (for backward compatibility)
  actionPlanData: ActionPlanData | null;
  milestones: MilestoneWithProgress[];
  tasks: TaskWithRelations[];
  
  // Standardized data format (new UI components should use these)
  standardizedPlan: {
    milestones: MilestoneWithDetails[];
    tasks: TaskWithDetails[];
    statistics: ActionPlanStatistics;
    viewSettings: ActionPlanViewSettings;
  } | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions for milestones (support both legacy and standardized interfaces)
  createMilestone: (milestone: Omit<Milestone, 'id'> | Omit<MilestoneWithDetails, 'id'>) => Promise<boolean>;
  updateMilestone: (milestone: Milestone | MilestoneWithDetails) => Promise<boolean>;
  deleteMilestone: (milestoneId: string) => Promise<boolean>;
  toggleMilestoneCompletion: (milestoneId: string) => Promise<boolean>;
  
  // Actions for tasks (support both legacy and standardized interfaces)
  createTask: (task: Omit<Task, 'id'> | Omit<TaskWithDetails, 'id'>) => Promise<boolean>;
  updateTask: (task: Task | TaskWithDetails) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: string | ActionItemStatus) => Promise<boolean>;
  moveTask: (taskId: string, newMilestoneId: string) => Promise<boolean>;
  changeTaskOrder: (dragItem: DragDropItem, hoverItem: DragDropItem) => Promise<boolean>;
}

/**
 * Hook pour gérer le plan d'action
 * Enhanced to support standardized interfaces
 */
export const useActionPlan = (businessPlanId?: string): UseActionPlanResult => {
  // Service to access business plan data
  const businessPlanService = new BusinessPlanServiceImpl();
  
  // Local state
  const [businessPlan, setBusinessPlan] = useState<any>(null); // Using any since we need to access standardized property
  const [actionPlanData, setActionPlanData] = useState<ActionPlanData | null>(null);
  const [milestones, setMilestones] = useState<MilestoneWithProgress[]>([]);
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [standardizedPlan, setStandardizedPlan] = useState<{
    milestones: MilestoneWithDetails[];
    tasks: TaskWithDetails[];
    statistics: ActionPlanStatistics;
    viewSettings: ActionPlanViewSettings;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Load the action plan from the business plan
   * Enhanced to handle standardized interfaces
   */
  const loadActionPlan = useCallback(async (planId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await businessPlanService.getItem(planId);
      
      if (result.success && result.data) {
        setBusinessPlan(result.data);
        setActionPlanData(result.data.actionPlan);
        
        // Transform data for legacy UI components
        // For backward compatibility
        if (result.data.actionPlan) {
          setMilestones(transformMilestones(result.data.actionPlan));
          setTasks(transformTasks(result.data.actionPlan));
        }
        
        // Set standardized data if available
        if (result.data.standardized && result.data.standardized.actionPlan) {
          setStandardizedPlan(result.data.standardized.actionPlan);
        } else if (result.data.actionPlan) {
          // If standardized data is not available, generate it using the adapter
          const standardized = ActionPlanAdapter.toUI(result.data);
          setStandardizedPlan(standardized);
        } else {
          setStandardizedPlan(null);
        }
      } else {
        setError(result.error?.message || 'Unknown error loading action plan');
      }
    } catch (err) {
      setError('Error loading action plan: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanService]);
  
  /**
   * Save the action plan in the business plan
   * Enhanced to handle standardized interfaces
   */
  const saveActionPlan = useCallback(async (updatedActionPlan: ActionPlanData): Promise<boolean> => {
    if (!businessPlan) {
      setError('No business plan loaded');
      return false;
    }
    
    try {
      // Update local state for legacy components
      setActionPlanData(updatedActionPlan);
      setMilestones(transformMilestones(updatedActionPlan));
      setTasks(transformTasks(updatedActionPlan));
      
      // Generate standardized data using the adapter
      const updatedStandardized = ActionPlanAdapter.toUI({
        ...businessPlan,
        actionPlan: updatedActionPlan
      });
      
      // Update standardized state
      setStandardizedPlan(updatedStandardized);
      
      // Update the business plan with the new action plan and standardized data
      const updatedBusinessPlan = {
        ...businessPlan,
        actionPlan: updatedActionPlan,
        standardized: {
          ...businessPlan.standardized,
          actionPlan: updatedStandardized
        }
      };
      
      // Save the changes
      const result = await businessPlanService.updateItem(businessPlan.id, updatedBusinessPlan);
      
      if (!result.success) {
        setError(result.error?.message || 'Unknown error during save');
        return false;
      }
      
      // Update local state with the updated business plan
      setBusinessPlan(updatedBusinessPlan);
      
      return true;
    } catch (err) {
      setError('Error saving: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [businessPlan, businessPlanService]);
  
  /**
   * Create a new milestone
   * Enhanced to handle standardized interfaces
   */
  const createMilestone = useCallback(async (milestone: Omit<Milestone, 'id'> | Omit<MilestoneWithDetails, 'id'>): Promise<boolean> => {
    if (!actionPlanData) {
      setError('Action plan not loaded');
      return false;
    }
    
    try {
      // Generate a unique ID
      const newId = `milestone-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Check if input is in standardized format (MilestoneWithDetails)
      const isStandardized = 'category' in milestone || 'status' in milestone || 'progress' in milestone;
      
      let newMilestone: Milestone;
      
      if (isStandardized) {
        // Convert from standardized format to legacy format
        const standardizedMilestone = milestone as Omit<MilestoneWithDetails, 'id'>;
        newMilestone = {
          id: newId,
          title: standardizedMilestone.title,
          description: standardizedMilestone.description,
          targetDate: standardizedMilestone.dueDate,
          isCompleted: standardizedMilestone.status === 'completed'
        };
      } else {
        // Legacy format
        newMilestone = {
          ...milestone as Omit<Milestone, 'id'>,
          id: newId,
          isCompleted: false
        };
      }
      
      // Add the milestone to the existing list
      const updatedMilestones = [...actionPlanData.milestones, newMilestone];
      
      // Update the action plan
      const updatedActionPlan = {
        ...actionPlanData,
        milestones: updatedMilestones
      };
      
      // Save the changes
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Error creating milestone: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlanData, saveActionPlan]);
  
  /**
   * Update an existing milestone
   * Enhanced to handle standardized interfaces
   */
  const updateMilestone = useCallback(async (milestone: Milestone | MilestoneWithDetails): Promise<boolean> => {
    if (!actionPlanData) {
      setError('Action plan not loaded');
      return false;
    }
    
    try {
      let milestoneToUpdate: Milestone;
      const milestoneId = milestone.id;
      
      // Check if input is in standardized format (MilestoneWithDetails)
      const isStandardized = 'category' in milestone || 'status' in milestone || 'progress' in milestone;
      
      if (isStandardized) {
        // Convert from standardized format to legacy format
        const standardizedMilestone = milestone as MilestoneWithDetails;
        milestoneToUpdate = {
          id: standardizedMilestone.id,
          title: standardizedMilestone.title,
          description: standardizedMilestone.description,
          targetDate: standardizedMilestone.dueDate,
          isCompleted: standardizedMilestone.status === 'completed'
        };
      } else {
        // Legacy format
        milestoneToUpdate = milestone as Milestone;
      }
      
      // Find the index of the milestone to update
      const milestoneIndex = actionPlanData.milestones.findIndex(m => m.id === milestoneId);
      
      if (milestoneIndex === -1) {
        setError('Milestone not found');
        return false;
      }
      
      // Update the milestone
      const updatedMilestones = [...actionPlanData.milestones];
      updatedMilestones[milestoneIndex] = milestoneToUpdate;
      
      // Update the action plan
      const updatedActionPlan = {
        ...actionPlanData,
        milestones: updatedMilestones
      };
      
      // Save the changes
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Error updating milestone: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlanData, saveActionPlan]);
  
  /**
   * Supprimer un jalon
   */
  const deleteMilestone = useCallback(async (milestoneId: string): Promise<boolean> => {
    if (!actionPlanData) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Filtrer le jalon à supprimer
      const updatedMilestones = actionPlanData.milestones.filter(m => m.id !== milestoneId);
      
      if (updatedMilestones.length === actionPlanData.milestones.length) {
        setError('Jalon non trouvé');
        return false;
      }
      
      // Filtrer également les tâches qui ont ce milestoneId
      const updatedTasks = actionPlanData.tasks.filter(t => t.milestoneId !== milestoneId);
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlanData,
        milestones: updatedMilestones,
        tasks: updatedTasks
      };
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors de la suppression du jalon: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlanData, saveActionPlan]);
  
  /**
   * Basculer l'état de complétion d'un jalon
   */
  const toggleMilestoneCompletion = useCallback(async (milestoneId: string): Promise<boolean> => {
    if (!actionPlanData) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Trouver l'index du jalon
      const milestoneIndex = actionPlanData.milestones.findIndex(m => m.id === milestoneId);
      
      if (milestoneIndex === -1) {
        setError('Jalon non trouvé');
        return false;
      }
      
      // Basculer l'état de complétion
      const updatedMilestones = [...actionPlanData.milestones];
      updatedMilestones[milestoneIndex] = {
        ...updatedMilestones[milestoneIndex],
        isCompleted: !updatedMilestones[milestoneIndex].isCompleted
      };
      
      // Si le jalon est marqué comme terminé, marquer toutes ses tâches comme terminées
      let updatedTasks = [...actionPlanData.tasks];
      if (updatedMilestones[milestoneIndex].isCompleted) {
        updatedTasks = updatedTasks.map(task => 
          task.milestoneId === milestoneId 
            ? { ...task, status: 'done' } 
            : task
        );
      }
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlanData,
        milestones: updatedMilestones,
        tasks: updatedTasks
      };
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors du changement de statut du jalon: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlanData, saveActionPlan]);
  
  /**
   * Create a new task
   * Enhanced to handle standardized interfaces
   */
  const createTask = useCallback(async (task: Omit<Task, 'id'> | Omit<TaskWithDetails, 'id'>): Promise<boolean> => {
    if (!actionPlanData) {
      setError('Action plan not loaded');
      return false;
    }
    
    try {
      // Generate a unique ID
      const newId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Check if input is in standardized format (TaskWithDetails)
      const isStandardized = 'priority' in task || 'assignee' in task || 'estimatedHours' in task;
      
      let newTask: Task;
      
      if (isStandardized) {
        // Convert from standardized format to legacy format
        const standardizedTask = task as Omit<TaskWithDetails, 'id'>;
        newTask = {
          id: newId,
          title: standardizedTask.title,
          description: standardizedTask.description,
          status: standardizedTask.status === 'planned' ? 'todo' : 
                 standardizedTask.status === 'in-progress' ? 'in-progress' : 
                 standardizedTask.status === 'completed' ? 'done' : 'todo',
          dueDate: standardizedTask.dueDate,
          milestoneId: standardizedTask.milestoneId
        };
      } else {
        // Legacy format
        newTask = {
          ...task as Omit<Task, 'id'>,
          id: newId,
          status: (task as Omit<Task, 'id'>).status || 'todo'
        };
      }
      
      // Add the task to the existing list
      const updatedTasks = [...actionPlanData.tasks, newTask];
      
      // Update the action plan
      const updatedActionPlan = {
        ...actionPlanData,
        tasks: updatedTasks
      };
      
      // Save the changes
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Error creating task: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlanData, saveActionPlan]);
  
  /**
   * Update an existing task
   * Enhanced to handle standardized interfaces
   */
  const updateTask = useCallback(async (task: Task | TaskWithDetails): Promise<boolean> => {
    if (!actionPlanData) {
      setError('Action plan not loaded');
      return false;
    }
    
    try {
      let taskToUpdate: Task;
      const taskId = task.id;
      
      // Check if input is in standardized format (TaskWithDetails)
      const isStandardized = 'priority' in task || 'assignee' in task || 'estimatedHours' in task;
      
      if (isStandardized) {
        // Convert from standardized format to legacy format
        const standardizedTask = task as TaskWithDetails;
        taskToUpdate = {
          id: standardizedTask.id,
          title: standardizedTask.title,
          description: standardizedTask.description,
          status: standardizedTask.status === 'planned' ? 'todo' : 
                 standardizedTask.status === 'in-progress' ? 'in-progress' : 
                 standardizedTask.status === 'completed' ? 'done' : 'todo',
          dueDate: standardizedTask.dueDate,
          milestoneId: standardizedTask.milestoneId
        };
      } else {
        // Legacy format
        taskToUpdate = task as Task;
      }
      
      // Find the index of the task to update
      const taskIndex = actionPlanData.tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        setError('Task not found');
        return false;
      }
      
      // Update the task
      const updatedTasks = [...actionPlanData.tasks];
      updatedTasks[taskIndex] = taskToUpdate;
      
      // Update the action plan
      const updatedActionPlan = {
        ...actionPlanData,
        tasks: updatedTasks
      };
      
      // Save the changes
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Error updating task: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlanData, saveActionPlan]);
  
  /**
   * Supprimer une tâche
   */
  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    if (!actionPlanData) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Filtrer la tâche à supprimer et ses sous-tâches
      const isSubtaskOf = (potentialParentId: string, taskToCheck: Task): boolean => {
        return taskToCheck.parentTaskId === potentialParentId ||
          (taskToCheck.parentTaskId && actionPlanData.tasks.some(t => 
            t.id === taskToCheck.parentTaskId && isSubtaskOf(potentialParentId, t)
          ));
      };
      
      const updatedTasks = actionPlanData.tasks.filter(t => 
        t.id !== taskId && !isSubtaskOf(taskId, t)
      );
      
      if (updatedTasks.length === actionPlanData.tasks.length) {
        setError('Tâche non trouvée');
        return false;
      }
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlanData,
        tasks: updatedTasks
      };
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors de la suppression de la tâche: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlanData, saveActionPlan]);
  
  /**
   * Update a task's status
   * Enhanced to handle standardized interfaces
   */
  const updateTaskStatus = useCallback(async (taskId: string, status: string | ActionItemStatus): Promise<boolean> => {
    if (!actionPlanData) {
      setError('Action plan not loaded');
      return false;
    }
    
    try {
      // Find the index of the task
      const taskIndex = actionPlanData.tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        setError('Task not found');
        return false;
      }
      
      // Convert standardized status to legacy status if needed
      let legacyStatus: string;
      
      // Check if status is a standardized enum value (ActionItemStatus)
      if (typeof status === 'string' && (
          status === 'planned' || 
          status === 'in-progress' || 
          status === 'completed' || 
          status === 'cancelled' || 
          status === 'delayed')) {
        // Convert from standardized status to legacy status
        switch (status) {
          case 'planned':
            legacyStatus = 'todo';
            break;
          case 'completed':
            legacyStatus = 'done';
            break;
          case 'in-progress':
            legacyStatus = 'in-progress';
            break;
          case 'cancelled':
          case 'delayed':
            legacyStatus = 'todo'; // Legacy doesn't have these statuses
            break;
          default:
            legacyStatus = 'todo';
        }
      } else {
        // Already in legacy format
        legacyStatus = status as string;
      }
      
      // Update the status
      const updatedTasks = [...actionPlanData.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        status: legacyStatus
      };
      
      // Update subtasks if the task is marked as completed
      if (legacyStatus === 'done') {
        const updateSubtasks = (parentId: string) => {
          updatedTasks.forEach((task, index) => {
            if (task.parentTaskId === parentId) {
              updatedTasks[index] = { ...task, status: 'done' };
              updateSubtasks(task.id);
            }
          });
        };
        
        updateSubtasks(taskId);
      }
      
      // Update the action plan
      const updatedActionPlan = {
        ...actionPlanData,
        tasks: updatedTasks
      };
      
      // Save the changes
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Error updating status: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlanData, saveActionPlan]);
  
  /**
   * Déplacer une tâche vers un autre jalon
   */
  const moveTask = useCallback(async (taskId: string, newMilestoneId: string): Promise<boolean> => {
    if (!actionPlanData) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Vérifier si le jalon cible existe
      if (newMilestoneId && !actionPlanData.milestones.some(m => m.id === newMilestoneId)) {
        setError('Jalon cible non trouvé');
        return false;
      }
      
      // Trouver l'index de la tâche
      const taskIndex = actionPlanData.tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        setError('Tâche non trouvée');
        return false;
      }
      
      // Mettre à jour le milestoneId de la tâche
      const updatedTasks = [...actionPlanData.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        milestoneId: newMilestoneId
      };
      
      // Mettre à jour également les sous-tâches
      const updateSubtasksMilestone = (parentId: string) => {
        updatedTasks.forEach((task, index) => {
          if (task.parentTaskId === parentId) {
            updatedTasks[index] = { ...task, milestoneId: newMilestoneId };
            updateSubtasksMilestone(task.id);
          }
        });
      };
      
      updateSubtasksMilestone(taskId);
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlanData,
        tasks: updatedTasks
      };
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors du déplacement de la tâche: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlanData, saveActionPlan]);
  
  /**
   * Changer l'ordre des tâches (via drag and drop)
   */
  const changeTaskOrder = useCallback(async (
    dragItem: DragDropItem, 
    hoverItem: DragDropItem
  ): Promise<boolean> => {
    if (!actionPlanData) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Créer une copie des tâches
      const updatedTasks = [...actionPlanData.tasks];
      
      // Trouver les indices des tâches concernées
      const dragIndex = updatedTasks.findIndex(t => t.id === dragItem.id);
      const hoverIndex = updatedTasks.findIndex(t => t.id === hoverItem.id);
      
      if (dragIndex === -1 || hoverIndex === -1) {
        setError('Tâche non trouvée');
        return false;
      }
      
      // Échanger les positions
      const dragTask = updatedTasks[dragIndex];
      updatedTasks.splice(dragIndex, 1);
      updatedTasks.splice(hoverIndex, 0, dragTask);
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlanData,
        tasks: updatedTasks
      };
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors du changement d\'ordre: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlanData, saveActionPlan]);
  
  // Charger le plan d'action initial si un ID est fourni
  useEffect(() => {
    if (businessPlanId) {
      loadActionPlan(businessPlanId);
    }
  }, [businessPlanId, loadActionPlan]);
  
  return {
    // Legacy data format for backward compatibility
    actionPlanData,
    milestones,
    tasks,
    
    // Standardized data format for new UI components
    standardizedPlan,
    
    // State
    isLoading,
    error,
    
    // Actions (supporting both interfaces)
    createMilestone,
    updateMilestone,
    deleteMilestone,
    toggleMilestoneCompletion,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    moveTask,
    changeTaskOrder
  };
};
