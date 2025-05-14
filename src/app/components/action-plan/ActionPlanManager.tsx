'use client';

import React, { useState } from 'react';
import { ActionPlanData, Milestone, Task } from '@/app/services/interfaces/dataModels';
import MilestoneCard from './MilestoneCard';
import TaskCard from './TaskCard';

interface ActionPlanManagerProps {
  actionPlanData?: ActionPlanData;
  onSave?: (actionPlanData: ActionPlanData) => void;
  readOnly?: boolean;
}

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
  const [editingMilestoneIds, setEditingMilestoneIds] = useState<{[id: string]: boolean}>({});
  const [editingTaskIds, setEditingTaskIds] = useState<{[id: string]: boolean}>({});
  
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
      [newMilestone.id as string]: true
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
    
    setEditingMilestoneIds(prev => {
      const newState = {...prev};
      delete newState[id];
      return newState;
    });
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
      [newTask.id as string]: true
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
    setActionPlan(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
    
    setEditingTaskIds(prev => {
      const newState = {...prev};
      delete newState[id];
      return newState;
    });
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
  
  // Toggle editing mode for a specific milestone
  const toggleMilestoneEditMode = (milestoneId: string) => {
    setEditingMilestoneIds(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }));
  };

  // Toggle editing mode for a specific task
  const toggleTaskEditMode = (taskId: string) => {
    setEditingTaskIds(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  // Check if a milestone is in editing mode
  const isMilestoneEditing = (milestoneId: string): boolean => {
    return Boolean(editingMilestoneIds[milestoneId]);
  };
  
  // Check if a task is in editing mode
  const isTaskEditing = (taskId: string): boolean => {
    return Boolean(editingTaskIds[taskId]);
  };
  
  // Toggle add task form for a milestone
  const toggleAddTaskForm = (milestoneId?: string) => {
    if (milestoneId) {
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
        [newTask.id as string]: true
      }));
    }
  };
  
  // Handle saving a milestone
  const handleSaveMilestone = (milestone: Milestone) => {
    if (onSave) {
      onSave(actionPlan);
      
      if (milestone.id) {
        toggleMilestoneEditMode(milestone.id);
      }
      
      // Success notification
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
      
      if (task.id) {
        toggleTaskEditMode(task.id);
      }
      
      // Success notification
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
      {/* Success notification */}
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
      
      {/* Tab navigation */}
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
            onClick={handleAddMilestone}
            className="ml-auto text-sm py-1 px-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Ajouter un jalon
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-8">
            {actionPlan.milestones.map((milestone) => (
              <MilestoneCard 
                key={milestone.id}
                milestone={milestone}
                tasks={actionPlan.tasks.filter(task => task.milestoneId === milestone.id)}
                isEditing={isMilestoneEditing(milestone.id || '')}
                readOnly={readOnly}
                onUpdateMilestone={(field, value) => handleUpdateMilestone(milestone.id || '', field, value)}
                onToggleEdit={() => toggleMilestoneEditMode(milestone.id || '')}
                onDelete={() => handleRemoveMilestone(milestone.id || '')}
                onSave={() => handleSaveMilestone(milestone)}
                onAddTask={() => toggleAddTaskForm(milestone.id)}
                calculateProgress={calculateMilestoneProgress}
                formatDate={formatDate}
              />
            ))}

            {actionPlan.milestones.length === 0 && (
              <div className="text-center p-8">
                <p className="text-gray-500 dark:text-gray-400">Aucun jalon défini pour le moment</p>
                <button
                  onClick={handleAddMilestone}
                  className="mt-4 text-sm py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Créer votre premier jalon
                </button>
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
            
            <div className="space-y-4">
              {actionPlan.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  milestones={actionPlan.milestones}
                  isEditing={isTaskEditing(task.id || '')}
                  readOnly={readOnly}
                  onUpdateTask={(field, value) => handleUpdateTask(task.id || '', field, value as string)}
                  onToggleEdit={() => toggleTaskEditMode(task.id || '')}
                  onDelete={() => handleRemoveTask(task.id || '')}
                  onSave={() => handleSaveTask(task)}
                  onStatusChange={(status) => handleTaskStatusChange(task.id || '', status)}
                  formatDate={formatDate}
                />
              ))}
              
              {actionPlan.tasks.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 italic mb-4">
                  Aucune tâche définie
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
