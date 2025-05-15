/**
 * useActionPlan - Hook standardisé pour la gestion du plan d'action
 * 
 * Ce hook facilite l'interaction entre les composants UI et les services
 * existants pour la gestion des jalons et des tâches dans le plan d'action.
 * Implémente les conventions définies dans /docs/CONVENTIONS.md
 * 
 * @version 2.0
 * @standardized true
 */

import { useState, useEffect, useCallback } from 'react';
import { BusinessPlanServiceImpl } from '../services/core/businessPlanService';
import ActionPlanAdapter from '../adapters/ActionPlanAdapter.standardized';
import { BusinessPlanData } from '../services/interfaces/dataModels';
import {
  UIMilestone,
  UITask,
  UIActionPlan,
  ServiceMilestone,
  ServiceTask,
  MilestoneCategory
} from '../interfaces/action-plan/action-plan';
import { ItemStatus, PriorityLevel } from '../interfaces/common/common-types';

interface UseActionPlanResult {
  // Données
  actionPlan: UIActionPlan | null;
  
  // État
  isLoading: boolean;
  error: string | null;
  
  // Actions pour les jalons
  createMilestone: (milestone: Omit<UIMilestone, 'id'>) => Promise<boolean>;
  updateMilestone: (milestone: UIMilestone) => Promise<boolean>;
  deleteMilestone: (milestoneId: string) => Promise<boolean>;
  toggleMilestoneStatus: (milestoneId: string, status: ItemStatus) => Promise<boolean>;
  
  // Actions pour les tâches
  createTask: (task: Omit<UITask, 'id'>) => Promise<boolean>;
  updateTask: (task: UITask) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: ItemStatus) => Promise<boolean>;
  moveTask: (taskId: string, newMilestoneId: string) => Promise<boolean>;
  
  // Filtrage et tri
  filterByCategory: (category: MilestoneCategory) => UIActionPlan;
  filterByStatus: (status: ItemStatus) => UIActionPlan;
  filterByPriority: (priority: PriorityLevel) => UIActionPlan;
  searchTasks: (searchTerm: string) => UITask[];
  searchMilestones: (searchTerm: string) => UIMilestone[];
}

/**
 * Hook pour gérer le plan d'action avec les interfaces standardisées
 * @param businessPlanId Identifiant du plan d'affaires (optionnel)
 */
export const useActionPlan = (businessPlanId?: string): UseActionPlanResult => {
  // Service pour accéder aux données du plan d'affaires
  const businessPlanService = new BusinessPlanServiceImpl();
  
  // État local
  const [businessPlanData, setBusinessPlanData] = useState<BusinessPlanData | null>(null);
  const [actionPlan, setActionPlan] = useState<UIActionPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Charger le plan d'action depuis le plan d'affaires
   */
  const loadActionPlan = useCallback(async (planId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await businessPlanService.getBusinessPlan(planId);
      
      if (result.success && result.data) {
        // Stocker les données du service
        setBusinessPlanData(result.data);
        
        // Transformer les données pour l'UI en utilisant l'adaptateur standardisé
        const uiActionPlan = ActionPlanAdapter.toUI(result.data);
        setActionPlan(uiActionPlan);
      } else {
        setError(result.error || 'Erreur inconnue lors du chargement du plan d\'action');
      }
    } catch (err) {
      setError('Erreur lors du chargement du plan d\'action: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanService]);
  
  /**
   * Sauvegarder le plan d'action dans le plan d'affaires
   */
  const saveActionPlan = useCallback(async (updatedActionPlan: UIActionPlan): Promise<boolean> => {
    if (!businessPlanData) {
      setError('Aucun plan d\'affaires chargé');
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Mettre à jour l'état local
      setActionPlan(updatedActionPlan);
      
      // Transformer les données de l'UI vers le service
      const serviceData = ActionPlanAdapter.updateServiceWithUIChanges(
        businessPlanData,
        updatedActionPlan
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.saveBusinessPlan(serviceData);
      
      if (!result.success) {
        setError(result.error || 'Erreur inconnue lors de la sauvegarde');
        return false;
      }
      
      // Mettre à jour l'état local avec les données du service mises à jour
      if (result.data) {
        setBusinessPlanData(result.data);
      }
      
      return true;
    } catch (err) {
      setError('Erreur lors de la sauvegarde: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanData, businessPlanService]);
  
  /**
   * Créer un nouveau jalon
   */
  const createMilestone = useCallback(async (milestone: Omit<UIMilestone, 'id'>): Promise<boolean> => {
    if (!actionPlan) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Générer un nouvel ID unique
      const newId = `milestone-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Créer le nouveau jalon avec les valeurs par défaut pour les champs obligatoires
      const newMilestone: UIMilestone = {
        ...milestone,
        id: newId,
        status: milestone.status || ItemStatus.PENDING,
        progress: milestone.progress || 0,
        tasksTotal: milestone.tasksTotal || 0,
        tasksCompleted: milestone.tasksCompleted || 0,
        dueDate: milestone.dueDate || new Date().toISOString(),
        comments: milestone.comments || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEditing: false,
        validationErrors: {}
      };
      
      // Ajouter le jalon à la liste existante
      const updatedMilestones = [...actionPlan.milestones, newMilestone];
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlan,
        milestones: updatedMilestones
      };
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors de la création du jalon: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlan, saveActionPlan]);
  
  /**
   * Mettre à jour un jalon existant
   */
  const updateMilestone = useCallback(async (milestone: UIMilestone): Promise<boolean> => {
    if (!actionPlan) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Trouver l'index du jalon à mettre à jour
      const milestoneIndex = actionPlan.milestones.findIndex(m => m.id === milestone.id);
      
      if (milestoneIndex === -1) {
        setError('Jalon non trouvé');
        return false;
      }
      
      // Mettre à jour le jalon
      const updatedMilestones = [...actionPlan.milestones];
      updatedMilestones[milestoneIndex] = {
        ...milestone,
        updatedAt: new Date().toISOString()
      };
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlan,
        milestones: updatedMilestones
      };
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors de la mise à jour du jalon: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlan, saveActionPlan]);
  
  /**
   * Supprimer un jalon
   */
  const deleteMilestone = useCallback(async (milestoneId: string): Promise<boolean> => {
    if (!actionPlan) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Filtrer le jalon à supprimer
      const updatedMilestones = actionPlan.milestones.filter(m => m.id !== milestoneId);
      
      if (updatedMilestones.length === actionPlan.milestones.length) {
        setError('Jalon non trouvé');
        return false;
      }
      
      // Filtrer également les tâches qui ont ce milestoneId
      const updatedTasks = actionPlan.tasks.filter(t => t.milestoneId !== milestoneId);
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlan,
        milestones: updatedMilestones,
        tasks: updatedTasks
      };
      
      // Recalculer les statistiques
      updatedActionPlan.statistics = {
        ...actionPlan.statistics,
        totalMilestones: updatedMilestones.length,
        completedMilestones: updatedMilestones.filter(m => m.status === ItemStatus.COMPLETED).length,
        upcomingMilestones: updatedMilestones.filter(m => m.status === ItemStatus.PENDING).length,
        lateMilestones: updatedMilestones.filter(m => m.isLate).length
      };
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors de la suppression du jalon: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlan, saveActionPlan]);
  
  /**
   * Basculer le statut d'un jalon
   */
  const toggleMilestoneStatus = useCallback(async (milestoneId: string, status: ItemStatus): Promise<boolean> => {
    if (!actionPlan) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Trouver l'index du jalon
      const milestoneIndex = actionPlan.milestones.findIndex(m => m.id === milestoneId);
      
      if (milestoneIndex === -1) {
        setError('Jalon non trouvé');
        return false;
      }
      
      // Mettre à jour le statut
      const updatedMilestones = [...actionPlan.milestones];
      updatedMilestones[milestoneIndex] = {
        ...updatedMilestones[milestoneIndex],
        status,
        updatedAt: new Date().toISOString()
      };
      
      // Si le jalon est marqué comme terminé, mettre à jour la progression
      if (status === ItemStatus.COMPLETED) {
        updatedMilestones[milestoneIndex].progress = 100;
      }
      
      // Mettre à jour les tâches associées si le jalon est terminé ou annulé
      let updatedTasks = [...actionPlan.tasks];
      if (status === ItemStatus.COMPLETED || status === ItemStatus.CANCELLED) {
        updatedTasks = updatedTasks.map(task => 
          task.milestoneId === milestoneId 
            ? { ...task, status, updatedAt: new Date().toISOString() } 
            : task
        );
      }
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlan,
        milestones: updatedMilestones,
        tasks: updatedTasks
      };
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors du changement de statut du jalon: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlan, saveActionPlan]);
  
  /**
   * Créer une nouvelle tâche
   */
  const createTask = useCallback(async (task: Omit<UITask, 'id'>): Promise<boolean> => {
    if (!actionPlan) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Générer un nouvel ID unique
      const newId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Créer la nouvelle tâche avec valeurs par défaut pour les champs obligatoires
      const newTask: UITask = {
        ...task,
        id: newId,
        status: task.status || ItemStatus.PENDING,
        priority: task.priority || PriorityLevel.MEDIUM,
        comments: task.comments || [],
        tags: task.tags || [],
        dependencies: task.dependencies || [],
        subtasks: task.subtasks || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEditing: false,
        validationErrors: {}
      };
      
      // Ajouter la tâche à la liste existante
      const updatedTasks = [...actionPlan.tasks, newTask];
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlan,
        tasks: updatedTasks
      };
      
      // Mettre à jour les statistiques du jalon associé
      if (task.milestoneId) {
        const milestoneIndex = updatedActionPlan.milestones.findIndex(m => m.id === task.milestoneId);
        if (milestoneIndex !== -1) {
          const milestone = updatedActionPlan.milestones[milestoneIndex];
          updatedActionPlan.milestones[milestoneIndex] = {
            ...milestone,
            tasksTotal: milestone.tasksTotal + 1,
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors de la création de la tâche: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlan, saveActionPlan]);
  
  /**
   * Mettre à jour une tâche existante
   */
  const updateTask = useCallback(async (task: UITask): Promise<boolean> => {
    if (!actionPlan) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Trouver l'index de la tâche à mettre à jour
      const taskIndex = actionPlan.tasks.findIndex(t => t.id === task.id);
      
      if (taskIndex === -1) {
        setError('Tâche non trouvée');
        return false;
      }
      
      // Récupérer l'ancien milestoneId pour vérifier si la tâche a changé de jalon
      const oldMilestoneId = actionPlan.tasks[taskIndex].milestoneId;
      
      // Mettre à jour la tâche
      const updatedTasks = [...actionPlan.tasks];
      updatedTasks[taskIndex] = {
        ...task,
        updatedAt: new Date().toISOString()
      };
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlan,
        tasks: updatedTasks
      };
      
      // Mettre à jour les statistiques des jalons concernés si le jalon a changé
      if (oldMilestoneId !== task.milestoneId) {
        // Mettre à jour l'ancien jalon
        if (oldMilestoneId) {
          const oldMilestoneIndex = updatedActionPlan.milestones.findIndex(m => m.id === oldMilestoneId);
          if (oldMilestoneIndex !== -1) {
            const oldMilestone = updatedActionPlan.milestones[oldMilestoneIndex];
            updatedActionPlan.milestones[oldMilestoneIndex] = {
              ...oldMilestone,
              tasksTotal: Math.max(0, oldMilestone.tasksTotal - 1),
              updatedAt: new Date().toISOString()
            };
          }
        }
        
        // Mettre à jour le nouveau jalon
        if (task.milestoneId) {
          const newMilestoneIndex = updatedActionPlan.milestones.findIndex(m => m.id === task.milestoneId);
          if (newMilestoneIndex !== -1) {
            const newMilestone = updatedActionPlan.milestones[newMilestoneIndex];
            updatedActionPlan.milestones[newMilestoneIndex] = {
              ...newMilestone,
              tasksTotal: newMilestone.tasksTotal + 1,
              updatedAt: new Date().toISOString()
            };
          }
        }
      }
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors de la mise à jour de la tâche: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlan, saveActionPlan]);
  
  /**
   * Supprimer une tâche
   */
  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    if (!actionPlan) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Trouver la tâche à supprimer pour récupérer son milestoneId
      const taskToDelete = actionPlan.tasks.find(t => t.id === taskId);
      
      if (!taskToDelete) {
        setError('Tâche non trouvée');
        return false;
      }
      
      // Filtrer la tâche à supprimer
      const updatedTasks = actionPlan.tasks.filter(t => t.id !== taskId);
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlan,
        tasks: updatedTasks
      };
      
      // Mettre à jour les statistiques du jalon associé
      if (taskToDelete.milestoneId) {
        const milestoneIndex = updatedActionPlan.milestones.findIndex(m => m.id === taskToDelete.milestoneId);
        if (milestoneIndex !== -1) {
          const milestone = updatedActionPlan.milestones[milestoneIndex];
          updatedActionPlan.milestones[milestoneIndex] = {
            ...milestone,
            tasksTotal: Math.max(0, milestone.tasksTotal - 1),
            tasksCompleted: taskToDelete.status === ItemStatus.COMPLETED 
              ? Math.max(0, milestone.tasksCompleted - 1) 
              : milestone.tasksCompleted,
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors de la suppression de la tâche: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlan, saveActionPlan]);
  
  /**
   * Mettre à jour le statut d'une tâche
   */
  const updateTaskStatus = useCallback(async (taskId: string, status: ItemStatus): Promise<boolean> => {
    if (!actionPlan) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Trouver l'index de la tâche
      const taskIndex = actionPlan.tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        setError('Tâche non trouvée');
        return false;
      }
      
      // Récupérer l'ancien statut pour savoir si le statut a changé
      const oldStatus = actionPlan.tasks[taskIndex].status;
      
      // Mettre à jour le statut
      const updatedTasks = [...actionPlan.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        status,
        updatedAt: new Date().toISOString()
      };
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlan,
        tasks: updatedTasks
      };
      
      // Mettre à jour les statistiques du jalon associé si le statut a changé
      if (oldStatus !== status && updatedTasks[taskIndex].milestoneId) {
        const milestoneIndex = updatedActionPlan.milestones.findIndex(
          m => m.id === updatedTasks[taskIndex].milestoneId
        );
        
        if (milestoneIndex !== -1) {
          const milestone = updatedActionPlan.milestones[milestoneIndex];
          const tasksCompleted = oldStatus === ItemStatus.COMPLETED
            ? milestone.tasksCompleted - 1 // Tâche qui était complétée et ne l'est plus
            : status === ItemStatus.COMPLETED
              ? milestone.tasksCompleted + 1 // Tâche qui devient complétée
              : milestone.tasksCompleted; // Pas de changement de complétion
          
          updatedActionPlan.milestones[milestoneIndex] = {
            ...milestone,
            tasksCompleted: Math.max(0, tasksCompleted),
            progress: milestone.tasksTotal > 0 
              ? Math.round((Math.max(0, tasksCompleted) / milestone.tasksTotal) * 100)
              : 0,
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlan, saveActionPlan]);
  
  /**
   * Déplacer une tâche vers un autre jalon
   */
  const moveTask = useCallback(async (taskId: string, newMilestoneId: string): Promise<boolean> => {
    if (!actionPlan) {
      setError('Plan d\'action non chargé');
      return false;
    }
    
    try {
      // Vérifier si le jalon cible existe
      if (newMilestoneId && !actionPlan.milestones.some(m => m.id === newMilestoneId)) {
        setError('Jalon cible non trouvé');
        return false;
      }
      
      // Trouver l'index de la tâche
      const taskIndex = actionPlan.tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        setError('Tâche non trouvée');
        return false;
      }
      
      // Récupérer l'ancien milestoneId
      const oldMilestoneId = actionPlan.tasks[taskIndex].milestoneId;
      
      // Si le jalon n'a pas changé, ne rien faire
      if (oldMilestoneId === newMilestoneId) {
        return true;
      }
      
      // Mettre à jour le milestoneId de la tâche
      const updatedTasks = [...actionPlan.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        milestoneId: newMilestoneId,
        updatedAt: new Date().toISOString()
      };
      
      // Mettre à jour le plan d'action
      const updatedActionPlan = {
        ...actionPlan,
        tasks: updatedTasks
      };
      
      // Mettre à jour les statistiques des jalons concernés
      
      // Ancien jalon
      if (oldMilestoneId) {
        const oldMilestoneIndex = updatedActionPlan.milestones.findIndex(m => m.id === oldMilestoneId);
        if (oldMilestoneIndex !== -1) {
          const oldMilestone = updatedActionPlan.milestones[oldMilestoneIndex];
          const isTaskCompleted = updatedTasks[taskIndex].status === ItemStatus.COMPLETED;
          
          updatedActionPlan.milestones[oldMilestoneIndex] = {
            ...oldMilestone,
            tasksTotal: Math.max(0, oldMilestone.tasksTotal - 1),
            tasksCompleted: isTaskCompleted 
              ? Math.max(0, oldMilestone.tasksCompleted - 1) 
              : oldMilestone.tasksCompleted,
            progress: oldMilestone.tasksTotal > 1 
              ? Math.round((oldMilestone.tasksCompleted - (isTaskCompleted ? 1 : 0)) / (oldMilestone.tasksTotal - 1) * 100)
              : 0,
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      // Nouveau jalon
      if (newMilestoneId) {
        const newMilestoneIndex = updatedActionPlan.milestones.findIndex(m => m.id === newMilestoneId);
        if (newMilestoneIndex !== -1) {
          const newMilestone = updatedActionPlan.milestones[newMilestoneIndex];
          const isTaskCompleted = updatedTasks[taskIndex].status === ItemStatus.COMPLETED;
          
          updatedActionPlan.milestones[newMilestoneIndex] = {
            ...newMilestone,
            tasksTotal: newMilestone.tasksTotal + 1,
            tasksCompleted: isTaskCompleted 
              ? newMilestone.tasksCompleted + 1 
              : newMilestone.tasksCompleted,
            progress: Math.round((newMilestone.tasksCompleted + (isTaskCompleted ? 1 : 0)) / (newMilestone.tasksTotal + 1) * 100),
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      // Sauvegarder les modifications
      return saveActionPlan(updatedActionPlan);
    } catch (err) {
      setError('Erreur lors du déplacement de la tâche: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [actionPlan, saveActionPlan]);
  
  /**
   * Filtrer le plan d'action par catégorie de jalon
   */
  const filterByCategory = useCallback((category: MilestoneCategory): UIActionPlan => {
    if (!actionPlan) return ActionPlanAdapter.createDefaultUIData();
    
    // Si la catégorie est "ALL", retourner tout le plan
    if (category === MilestoneCategory.ALL) return actionPlan;
    
    // Filtrer les jalons par catégorie
    const filteredMilestones = actionPlan.milestones.filter(m => m.category === category);
    
    // Récupérer les IDs des jalons filtrés
    const milestoneIds = filteredMilestones.map(m => m.id);
    
    // Filtrer les tâches qui appartiennent à ces jalons
    const filteredTasks = actionPlan.tasks.filter(t => t.milestoneId && milestoneIds.includes(t.milestoneId));
    
    return {
      ...actionPlan,
      milestones: filteredMilestones,
      tasks: filteredTasks
    };
  }, [actionPlan]);
  
  /**
   * Filtrer le plan d'action par statut
   */
  const filterByStatus = useCallback((status: ItemStatus): UIActionPlan => {
    if (!actionPlan) return ActionPlanAdapter.createDefaultUIData();
    
    // Filtrer les jalons par statut
    const filteredMilestones = actionPlan.milestones.filter(m => m.status === status);
    
    // Filtrer les tâches par statut
    const filteredTasks = actionPlan.tasks.filter(t => t.status === status);
    
    return {
      ...actionPlan,
      milestones: filteredMilestones,
      tasks: filteredTasks
    };
  }, [actionPlan]);
  
  /**
   * Filtrer les tâches par priorité
   */
  const filterByPriority = useCallback((priority: PriorityLevel): UIActionPlan => {
    if (!actionPlan) return ActionPlanAdapter.createDefaultUIData();
    
    // Filtrer les tâches par priorité
    const filteredTasks = actionPlan.tasks.filter(t => t.priority === priority);
    
    // Récupérer les milestones associés à ces tâches
    const milestoneIds = new Set(filteredTasks.map(t => t.milestoneId).filter(Boolean) as string[]);
    const filteredMilestones = actionPlan.milestones.filter(m => milestoneIds.has(m.id));
    
    return {
      ...actionPlan,
      milestones: filteredMilestones,
      tasks: filteredTasks
    };
  }, [actionPlan]);
  
  /**
   * Rechercher des tâches par terme de recherche
   */
  const searchTasks = useCallback((searchTerm: string): UITask[] => {
    if (!actionPlan) return [];
    if (!searchTerm.trim()) return actionPlan.tasks;
    
    const lowercaseTerm = searchTerm.toLowerCase();
    
    return actionPlan.tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseTerm) ||
      task.description.toLowerCase().includes(lowercaseTerm) ||
      task.tags.some(tag => tag.toLowerCase().includes(lowercaseTerm))
    );
  }, [actionPlan]);
  
  /**
   * Rechercher des jalons par terme de recherche
   */
  const searchMilestones = useCallback((searchTerm: string): UIMilestone[] => {
    if (!actionPlan) return [];
    if (!searchTerm.trim()) return actionPlan.milestones;
    
    const lowercaseTerm = searchTerm.toLowerCase();
    
    return actionPlan.milestones.filter(milestone => 
      milestone.title.toLowerCase().includes(lowercaseTerm) ||
      milestone.description.toLowerCase().includes(lowercaseTerm)
    );
  }, [actionPlan]);
  
  // Charger le plan d'action initial si un ID est fourni
  useEffect(() => {
    if (businessPlanId) {
      loadActionPlan(businessPlanId);
    }
  }, [businessPlanId, loadActionPlan]);
  
  return {
    actionPlan,
    isLoading,
    error,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    toggleMilestoneStatus,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    moveTask,
    filterByCategory,
    filterByStatus,
    filterByPriority,
    searchTasks,
    searchMilestones
  };
};

export default useActionPlan;