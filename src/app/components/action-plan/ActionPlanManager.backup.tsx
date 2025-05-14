'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ActionPlanData, Milestone, Task } from '@/app/services/interfaces/dataModels';
import ActionPlanTimeline from './ActionPlanTimeline';

interface ActionPlanManagerProps {
  actionPlanData?: ActionPlanData;
  onSave?: (actionPlanData: ActionPlanData) => void;
  readOnly?: boolean;
}

/**
 * ActionPlanManager Component
 * 
 * Manages milestones and tasks for the action plan section of a business plan.
 * Follows the service architecture pattern by connecting UI to the underlying data services.
 */
export function ActionPlanManager({
  actionPlanData,
  onSave,
  readOnly = false
}: ActionPlanManagerProps) {
  // Initialize action plan data
  const [actionPlan, setActionPlan] = useState<ActionPlanData>(actionPlanData || {
    milestones: [],
    tasks: []
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState<'timeline' | 'milestones' | 'tasks'>('timeline');
  // État pour le mode d'édition individuel par carte
  const [editingMilestoneIds, setEditingMilestoneIds] = useState<{[id: string]: boolean}>({});
  const [editingTaskIds, setEditingTaskIds] = useState<{[id: string]: boolean}>({});
  // État pour suivre les jalons pour lesquels on affiche la section d'ajout de tâche
  const [showingAddTaskForms, setShowingAddTaskForms] = useState<{[id: string]: boolean}>({}); 
  // État pour stocker les nouvelles tâches en cours de création
  const [newTasksByMilestone, setNewTasksByMilestone] = useState<{[milestoneId: string]: Partial<Task>}>({}); 
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | undefined>(undefined);
  
  // Add a new milestone
  const handleAddMilestone = () => {
    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}`,
      title: '',
      description: '',
      targetDate: new Date().toISOString().split('T')[0],
      isCompleted: false
    };
    
    setActionPlan(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));
    
    setEditingMilestoneIds(prev => ({
      ...prev,
      [newMilestone.id as keyof typeof prev]: true
    }));
  };
  
  // Update a milestone with proper type safety
  const handleUpdateMilestone = (id: string, field: keyof Milestone, value: Milestone[keyof Milestone]) => {
    const updatedMilestones = [...actionPlan.milestones];
    const index = updatedMilestones.findIndex(m => m.id === id);
    if (index !== -1) {
      updatedMilestones[index] = {
        ...updatedMilestones[index],
        [field]: field === 'isCompleted' ? Boolean(value) : value
      };
    }
    
    setActionPlan(prev => ({
      ...prev,
      milestones: updatedMilestones
    }));
  };
  
  // Find a milestone by ID
  const findMilestone = (id: string): Milestone | undefined => {
    return actionPlan.milestones.find(m => m.id === id);
  };

  // Remove a milestone
  const handleRemoveMilestone = (id: string) => {
    // Remove associated tasks or clear their milestoneId
    const updatedTasks = actionPlan.tasks.map(task => {
      if (task.milestoneId === id) {
        return { ...task, milestoneId: undefined };
      }
      return task;
    });
    
    setActionPlan(prev => ({
      ...prev,
      milestones: actionPlan.milestones.filter(m => m.id !== id),
      tasks: updatedTasks
    }));
    
    if (editingMilestoneIds[id]) {
      setEditingMilestoneIds(prev => ({
        ...prev,
        [id as keyof typeof prev]: false
      }));
    }
  };
  
  // Add a new task
  const handleAddTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      status: 'todo',
      dueDate: new Date().toISOString().split('T')[0],
      milestoneId: undefined
    };
    
    setActionPlan(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
    
    setEditingTaskIds(prev => ({
      ...prev,
      [newTask.id as keyof typeof prev]: true
    }));
  };
  
  // Update a task with proper type safety
  const handleUpdateTask = (id: string, field: keyof Task, value: Task[keyof Task]) => {
    const updatedTasks = [...actionPlan.tasks];
    const index = updatedTasks.findIndex(t => t.id === id);
    if (index !== -1) {
      updatedTasks[index] = {
        ...updatedTasks[index],
        [field]: value
      };
    }
    
    setActionPlan(prev => ({
      ...prev,
      tasks: updatedTasks
    }));
  };
  
  // Remove a task
  const handleRemoveTask = (id: string) => {
    const updatedTasks = actionPlan.tasks.filter(t => t.id !== id);
    
    setActionPlan(prev => ({
      ...prev,
      tasks: updatedTasks
    }));
    
    if (editingTaskIds[id]) {
      setEditingTaskIds(prev => ({
        ...prev,
        [id as keyof typeof prev]: false
      }));
    }
  };
  
  // Handle task status change
  const handleTaskStatusChange = (id: string, status: 'todo' | 'in-progress' | 'done') => {
    handleUpdateTask(id, 'status', status);
  };
  
  // Handle milestone completion toggle
  const handleMilestoneCompletion = (id: string) => {
    const milestone = findMilestone(id);
    if (milestone) {
      handleUpdateMilestone(id, 'isCompleted', !milestone.isCompleted);
    }
  };
  
  // Activer le mode édition pour un jalon spécifique
  const toggleMilestoneEditMode = (milestoneId: string) => {
    setEditingMilestoneIds(prev => ({
      ...prev,
      [milestoneId as keyof typeof prev]: !prev[milestoneId as keyof typeof prev]
    }));
  };

  // Activer le mode édition pour une tâche spécifique
  const toggleTaskEditMode = (taskId: string) => {
    setEditingTaskIds(prev => ({
      ...prev,
      [taskId as keyof typeof prev]: !prev[taskId as keyof typeof prev]
    }));
  };
  
  // Vérifier si un jalon est en mode édition
  const isMilestoneEditing = (milestoneId: string): boolean => {
    return Boolean(editingMilestoneIds[milestoneId]);
  };
  
  // Vérifier si une tâche est en mode édition
  const isTaskEditing = (taskId: string): boolean => {
    return Boolean(editingTaskIds[taskId]);
  };
  
  // Afficher/masquer le formulaire d'ajout de tâche pour un jalon
  const toggleAddTaskForm = (milestoneId?: string) => {
    if (milestoneId) {
      setSelectedMilestoneId(milestoneId);
      
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: '',
        description: '',
        status: 'todo',
        milestoneId: milestoneId
      };
      
      setActionPlan(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask]
      }));
      
      setEditingTaskIds(prev => ({
        ...prev,
        [newTask.id as keyof typeof prev]: true
      }));
    } else {
      setSelectedMilestoneId(undefined);
    }
  };
  
  // Vérifier si le formulaire d'ajout de tâche est visible pour un jalon
  const isAddTaskFormVisible = (milestoneId: string): boolean => {
    return Boolean(showingAddTaskForms[milestoneId]);
  };
  
  // Mettre à jour les données d'une nouvelle tâche
  const updateNewTaskField = (milestoneId: string, field: keyof Task, value: string) => {
    setNewTasksByMilestone(prev => ({
      ...prev,
      [milestoneId]: {
        ...prev[milestoneId],
        [field]: value
      }
    }));
  };
  
  // Ajouter une nouvelle tâche à un jalon spécifique
  const addTaskToMilestone = (milestoneId: string) => {
    const newTask = newTasksByMilestone[milestoneId];
    if (newTask && newTask.title && newTask.title.trim()) {
      // S'assurer que la tâche a tous les champs requis d'une tâche valide
      const taskWithId: Task = {
        id: `task-${Date.now()}`,  // Générer un ID unique
        title: newTask.title,
        description: newTask.description || '',
        status: newTask.status || 'todo',
        dueDate: newTask.dueDate || '',
        milestoneId: milestoneId
      };
      
      // Ajouter la tâche à la liste des tâches
      setActionPlan(prev => ({
        ...prev,
        tasks: [...prev.tasks, taskWithId]
      }));
      
      // Reinitialiser la nouvelle tâche
      setNewTasksByMilestone(prev => ({
        ...prev,
        [milestoneId]: {
          title: '',
          status: 'todo' as 'todo' | 'in-progress' | 'done',
          description: '',
          milestoneId: milestoneId,
          dueDate: actionPlan.milestones.find(m => m.id === milestoneId)?.targetDate || ''
        }
      }));
      
      // Masquer le formulaire
      toggleAddTaskForm(milestoneId);
      
      // Sauvegarder les changements
      if (onSave) {
        onSave(actionPlan);
      }
    }
  };

  // Handle saving a milestone
  const handleSaveMilestone = (milestone: Milestone) => {
    if (onSave) {
      onSave(actionPlan);
      // Désactiver le mode édition pour ce jalon spécifique
      if (milestone.id) {
        toggleMilestoneEditMode(milestone.id);
      }
      
      // Notification de succès
      const notification = document.getElementById('save-notification');
      if (notification) {
        notification.classList.remove('hidden');
        setTimeout(() => {
          notification.classList.add('hidden');
        }, 3000);
      }
    }
  };
  
  // Handle saving a task
  const handleSaveTask = (task: Task) => {
    if (onSave) {
      onSave(actionPlan);
      // Désactiver le mode édition pour cette tâche spécifique
      if (task.id) {
        toggleTaskEditMode(task.id);
      }
      
      // Notification de succès
      const notification = document.getElementById('save-notification');
      if (notification) {
        notification.classList.remove('hidden');
        setTimeout(() => {
          notification.classList.add('hidden');
        }, 3000);
      }
    }
  };
  
  // Calculate milestone progress based on associated tasks
  const calculateMilestoneProgress = (milestoneId?: string): number => {
    if (!milestoneId) return 0;
    
    const milestoneTasks = actionPlan.tasks.filter(task => task.milestoneId === milestoneId);
    if (milestoneTasks.length === 0) return 0;
    
    const completedTasks = milestoneTasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / milestoneTasks.length) * 100);
  };
  
  // Format date for display (e.g., "10 mai 2023")
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Non définie';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md relative">
      {/* Notification de sauvegarde réussie */}
      <div id="save-notification" className="hidden absolute top-0 right-0 left-0 mx-auto w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 border-l-4 border-green-500 transition-all duration-300 ease-in-out z-50">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div className="ml-3 text-sm font-normal">Les modifications ont été enregistrées avec succès.</div>
        </div>
      </div>
      {/* Navigation des onglets */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2 font-medium ${activeTab === 'timeline' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-2 font-medium ${activeTab === 'tasks' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Tâches
          </button>
          <button
            onClick={() => handleAddMilestone()}
            className="ml-auto text-sm py-1 px-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Ajouter un jalon
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <ActionPlanTimeline
            actionPlan={actionPlan}
            editingMilestoneIds={editingMilestoneIds}
            editingTaskIds={editingTaskIds}
            onToggleMilestoneEdit={toggleMilestoneEditMode}
            onToggleTaskEdit={toggleTaskEditMode}
            onUpdateMilestone={(index, field, value) => {
              const milestone = actionPlan.milestones[index];
              if (milestone && milestone.id) {
                handleUpdateMilestone(milestone.id, field, value);
              }
            }}
            onUpdateTask={(index, field, value) => {
              const task = actionPlan.tasks[index];
              if (task && task.id) {
                handleUpdateTask(task.id, field, value);
              }
            }}
            onSaveMilestone={handleSaveMilestone}
            onSaveTask={handleSaveTask}
            readOnly={readOnly || false}
            onAddTask={toggleAddTaskForm}
          />
                        <p className="text-sm italic text-gray-500 dark:text-gray-400">
                          Aucune tâche associée
                        </p>
                      ) : (
                        <ul className="space-y-1">
                          {actionPlan.tasks
                            .filter(task => task.milestoneId === milestone.id)
                            .map((task, taskIndex) => (
                              <li key={taskIndex} className="flex items-center space-x-2">
                                <span className={`inline-block w-2 h-2 rounded-full ${
                                  task.status === 'done' ? 'bg-green-500' : 
                                  task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></span>
                                <span className={`text-sm ${
                                  task.status === 'done' ? 'line-through text-gray-500 dark:text-gray-400' : ''
                                }`}>{task.title}</span>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                    
                    {!readOnly && isMilestoneEditing(milestone.id || '') && (
                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(milestone.id || '')}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Tâches</h3>
              {!readOnly && (
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  + Ajouter une tâche
                </button>
              )}
            </div>
            
            {actionPlan.tasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic mb-4">
                Aucune tâche définie
              </p>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">Titre</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Statut</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Date</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Jalon</th>
                      {!readOnly && (
                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {actionPlan.tasks.map((task, index) => (
                      <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        task.status === 'done' ? 'bg-gray-50 dark:bg-gray-900/20' : ''
                      }`}>
                        <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                          {readOnly || !isTaskEditing(task.id || '') ? (
                            <span className={`text-sm ${
                              task.status === 'done' ? 'line-through text-gray-500 dark:text-gray-400' : ''
                            }`}>{task.title}</span>
                          ) : (
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => handleUpdateTask(task.id || '', 'title', e.target.value)}
                              placeholder="Titre de la tâche"
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                            />
                          )}
                          {task.description && !readOnly && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                              {task.description}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-4 text-sm">
                          {readOnly || !isTaskEditing(task.id || '') ? (
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              task.status === 'done' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                : task.status === 'in-progress' 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {task.status === 'done' ? 'Terminé' : task.status === 'in-progress' ? 'En cours' : 'À faire'}
                            </span>
                          ) : (
                            <select
                              value={task.status}
                              onChange={(e) => handleTaskStatusChange(task.id || '', e.target.value as 'todo' | 'in-progress' | 'done')}
                              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                            >
                              <option value="todo">À faire</option>
                              <option value="in-progress">En cours</option>
                              <option value="done">Terminé</option>
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-4 text-sm">
                          {readOnly ? (
                            formatDate(task.dueDate)
                          ) : (
                            <input
                              type="date"
                              value={task.dueDate?.split('T')[0] || ''}
                              onChange={(e) => handleUpdateTask(task.id || '', 'dueDate', e.target.value)}
                              className="block w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                            />
                          )}
                        </td>
                        <td className="px-3 py-4 text-sm">
                          {readOnly ? (
                            <span>
                              {actionPlan.milestones.find(m => m.id === task.milestoneId)?.title || 'Non associée'}
                            </span>
                          ) : (
                            <select
                              value={task.milestoneId || ''}
                              onChange={(e) => handleUpdateTask(task.id || '', 'milestoneId', e.target.value || undefined)}
                              className="block w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                            >
                              <option value="">Aucun jalon</option>
                              {actionPlan.milestones.map((milestone, mIndex) => (
                                <option key={mIndex} value={milestone.id}>
                                  {milestone.title}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        {!readOnly && (
                          <td className="px-3 py-4 text-sm text-right">
                            <div className="flex space-x-2">
                              {isTaskEditing(task.id || '') ? (
                                <>
                                  <button 
                                    onClick={() => handleSaveTask(task)}
                                    className="text-sm py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600"
                                  >
                                    Enregistrer
                                  </button>
                                  <button 
                                    onClick={() => toggleTaskEditMode(task.id || '')}
                                    className="text-sm py-1 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTask(task.id || '')}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    Supprimer
                                  </button>
                                </>
                              ) : (
                                <button 
                                  onClick={() => toggleTaskEditMode(task.id || '')}
                                  className="text-sm py-1 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                  Éditer
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Save Button */}
        {!readOnly && onSave && (
          <div className="flex justify-end mt-6">
            <span id="save-notification" className="hidden text-green-500 mr-4">Modifications enregistrées avec succès!</span>
          </div>
        )}
      </div>
    </div>
  );
}
