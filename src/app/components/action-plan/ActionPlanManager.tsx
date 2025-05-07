'use client';

import React, { useState } from 'react';
import { ActionPlanData, Milestone, Task } from "@/app/services/interfaces/dataModels";

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
  const [activeTab, setActiveTab] = useState<'milestones' | 'tasks'>('milestones');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  
  // Add a new milestone
  const handleAddMilestone = () => {
    const newMilestone: Milestone = {
      title: '',
      description: '',
      targetDate: new Date().toISOString().split('T')[0],
      isCompleted: false
    };
    
    setActionPlan(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));
    
    setEditingMilestone(newMilestone);
  };
  
  // Update a milestone with proper type safety
  const handleUpdateMilestone = (index: number, field: keyof Milestone, value: Milestone[keyof Milestone]) => {
    const updatedMilestones = [...actionPlan.milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: field === 'isCompleted' ? Boolean(value) : value
    };
    
    setActionPlan(prev => ({
      ...prev,
      milestones: updatedMilestones
    }));
  };
  
  // Remove a milestone
  const handleRemoveMilestone = (index: number) => {
    const milestoneId = actionPlan.milestones[index].id;
    
    // Remove the milestone
    const updatedMilestones = [...actionPlan.milestones];
    updatedMilestones.splice(index, 1);
    
    // Remove associated tasks or clear their milestoneId
    const updatedTasks = actionPlan.tasks.map(task => {
      if (task.milestoneId === milestoneId) {
        return { ...task, milestoneId: undefined };
      }
      return task;
    });
    
    setActionPlan(prev => ({
      ...prev,
      milestones: updatedMilestones,
      tasks: updatedTasks
    }));
    
    if (editingMilestone && actionPlan.milestones[index] === editingMilestone) {
      setEditingMilestone(null);
    }
  };
  
  // Add a new task
  const handleAddTask = () => {
    const newTask: Task = {
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
    
    setEditingTask(newTask);
  };
  
  // Update a task with proper type safety
  const handleUpdateTask = (index: number, field: keyof Task, value: Task[keyof Task]) => {
    const updatedTasks = [...actionPlan.tasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      [field]: value
    };
    
    setActionPlan(prev => ({
      ...prev,
      tasks: updatedTasks
    }));
  };
  
  // Remove a task
  const handleRemoveTask = (index: number) => {
    const updatedTasks = [...actionPlan.tasks];
    updatedTasks.splice(index, 1);
    
    setActionPlan(prev => ({
      ...prev,
      tasks: updatedTasks
    }));
    
    if (editingTask && actionPlan.tasks[index] === editingTask) {
      setEditingTask(null);
    }
  };
  
  // Handle task status change
  const handleTaskStatusChange = (index: number, status: 'todo' | 'in-progress' | 'done') => {
    handleUpdateTask(index, 'status', status);
  };
  
  // Handle milestone completion toggle
  const handleMilestoneCompletion = (index: number) => {
    handleUpdateMilestone(index, 'isCompleted', !actionPlan.milestones[index].isCompleted);
  };
  
  // Handle saving the action plan data
  const handleSave = () => {
    if (onSave) {
      onSave(actionPlan);
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'milestones' 
              ? 'text-blue-600 border-b-2 border-blue-500 dark:text-blue-400 dark:border-blue-400' 
              : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('milestones')}
        >
          Jalons
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'tasks' 
              ? 'text-blue-600 border-b-2 border-blue-500 dark:text-blue-400 dark:border-blue-400' 
              : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('tasks')}
        >
          Tâches
        </button>
      </div>
      
      <div className="p-6">
        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Jalons du Plan d&apos;Action</h3>
              {!readOnly && (
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  + Ajouter un jalon
                </button>
              )}
            </div>
            
            {actionPlan.milestones.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic mb-4">
                Aucun jalon défini
              </p>
            ) : (
              <div className="space-y-6">
                {actionPlan.milestones.map((milestone, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-grow">
                        {readOnly ? (
                          <h4 className="text-lg font-medium">{milestone.title || 'Jalon sans titre'}</h4>
                        ) : (
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => handleUpdateMilestone(index, 'title', e.target.value)}
                            placeholder="Titre du jalon"
                            className="w-full px-3 py-2 text-lg font-medium border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </div>
                      <div className="flex items-center ml-4">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={milestone.isCompleted}
                            onChange={() => handleMilestoneCompletion(index)}
                            disabled={readOnly}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date Cible
                        </label>
                        {readOnly ? (
                          <p>{formatDate(milestone.targetDate)}</p>
                        ) : (
                          <input
                            type="date"
                            value={milestone.targetDate?.split('T')[0] || ''}
                            onChange={(e) => handleUpdateMilestone(index, 'targetDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Progrès des Tâches
                        </label>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${calculateMilestoneProgress(milestone.id)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                          {calculateMilestoneProgress(milestone.id)}% complet
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      {readOnly ? (
                        <p className="whitespace-pre-line">{milestone.description || 'Aucune description'}</p>
                      ) : (
                        <textarea
                          value={milestone.description}
                          onChange={(e) => handleUpdateMilestone(index, 'description', e.target.value)}
                          rows={3}
                          placeholder="Description détaillée du jalon..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                        />
                      )}
                    </div>
                    
                    {/* Related tasks */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tâches Associées
                      </label>
                      {actionPlan.tasks.filter(task => task.milestoneId === milestone.id).length === 0 ? (
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
                    
                    {!readOnly && (
                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(index)}
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
                          {readOnly ? (
                            <span className={task.status === 'done' ? 'line-through text-gray-500 dark:text-gray-400' : ''}>
                              {task.title || 'Tâche sans titre'}
                            </span>
                          ) : (
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => handleUpdateTask(index, 'title', e.target.value)}
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
                          {readOnly ? (
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              task.status === 'done' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                : task.status === 'in-progress' 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {task.status === 'done' ? 'Terminée' : task.status === 'in-progress' ? 'En cours' : 'À faire'}
                            </span>
                          ) : (
                            <select
                              value={task.status}
                              onChange={(e) => handleTaskStatusChange(index, e.target.value as 'todo' | 'in-progress' | 'done')}
                              className="block w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                            >
                              <option value="todo">À faire</option>
                              <option value="in-progress">En cours</option>
                              <option value="done">Terminée</option>
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
                              onChange={(e) => handleUpdateTask(index, 'dueDate', e.target.value)}
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
                              onChange={(e) => handleUpdateTask(index, 'milestoneId', e.target.value || undefined)}
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
                            <button
                              type="button"
                              onClick={() => handleRemoveTask(index)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Supprimer
                            </button>
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
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Enregistrer les Modifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
