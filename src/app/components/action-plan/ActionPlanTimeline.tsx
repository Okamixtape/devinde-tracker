'use client';

import React, { useMemo, useState } from 'react';
import { ActionPlanData, Milestone, Task } from '@/app/services/interfaces/dataModels';

interface ActionPlanTimelineProps {
  actionPlan: ActionPlanData;
  showDetails?: boolean;
  editingMilestoneIds: {[id: string]: boolean};
  editingTaskIds: {[id: string]: boolean};
  onToggleMilestoneEdit: (milestoneId: string) => void;
  onToggleTaskEdit: (taskId: string) => void;
  onUpdateMilestone: (index: number, field: keyof Milestone, value: string | boolean) => void;
  onUpdateTask: (index: number, field: keyof Task, value: string) => void;
  onSaveMilestone: (milestone: Milestone) => void;
  onSaveTask: (task: Task) => void;
  readOnly?: boolean;
  onAddTask: (milestoneId: string) => void;
}

/**
 * Composant de timeline pour visualiser les jalons et tâches d'un plan d'action
 */
export const ActionPlanTimeline = ({ 
  actionPlan, 
  showDetails = true,
  editingMilestoneIds,
  editingTaskIds,
  onToggleMilestoneEdit,
  onToggleTaskEdit,
  onUpdateMilestone,
  onUpdateTask,
  onSaveMilestone,
  onSaveTask,
  readOnly = false,
  onAddTask
}: ActionPlanTimelineProps) => {
  // État local pour le suivi des jalons développés/réduits
  const [expandedMilestones, setExpandedMilestones] = useState<{[key: string]: boolean}>({});
  
  // Toggle pour afficher/masquer les détails d'un jalon
  const toggleMilestoneDetails = (id: string) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [id]: !prev[id]
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
  
  // Trier les jalons par date
  const sortedMilestones = useMemo(() => {
    return [...actionPlan.milestones].sort((a, b) => {
      const dateA = new Date(a.targetDate).getTime();
      const dateB = new Date(b.targetDate).getTime();
      return dateA - dateB;
    });
  }, [actionPlan.milestones]);

  // Trouver les tâches associées à un jalon
  const getMilestoneTasks = (milestoneId?: string) => {
    if (!milestoneId) return [];
    return actionPlan.tasks.filter(task => task.milestoneId === milestoneId);
  };
  
  // Calculer le pourcentage de complétion d'un jalon
  const calculateCompletion = (milestoneId?: string) => {
    const tasks = getMilestoneTasks(milestoneId);
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };
  
  // Formater une date au format JJ/MM/YYYY
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
  
  // Déterminer le statut d'un jalon (en retard, à venir, complété)
  const getMilestoneStatus = (milestone: Milestone) => {
    if (milestone.isCompleted) return { class: 'bg-green-100 dark:bg-green-900/30 border-green-500', text: 'Complété' };
    
    const now = new Date();
    const targetDate = new Date(milestone.targetDate);
    
    if (targetDate < now) {
      return { class: 'bg-red-100 dark:bg-red-900/30 border-red-500', text: 'En retard' };
    }
    
    // À moins de 7 jours de l'échéance
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    if (targetDate <= sevenDaysFromNow) {
      return { class: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500', text: 'Échéance proche' };
    }
    
    return { class: 'bg-blue-100 dark:bg-blue-900/30 border-blue-500', text: 'À venir' };
  };
  
  // Si aucun jalon n'est défini
  if (sortedMilestones.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-xl text-gray-600 dark:text-gray-300">Aucun jalon défini</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Ajoutez des jalons dans l'onglet "Jalons" pour les voir apparaître sur cette timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-5 mb-8">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9.75v7.5" />
        </svg>
        Timeline du Plan d'Action
      </h2>
      
      <div className="relative">
        {/* Ligne verticale de la timeline */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800" />
        
        {/* Points de la timeline */}
        <div className="space-y-8">
          {sortedMilestones.map((milestone, index) => {
            const status = getMilestoneStatus(milestone);
            const completionPercent = calculateCompletion(milestone.id);
            const tasks = getMilestoneTasks(milestone.id);
            
            return (
              <div key={milestone.id || index} className="relative pl-10">
                {/* Point de la timeline */}
                <div 
                  className={`absolute left-0 top-1.5 w-8 h-8 rounded-full flex items-center justify-center border-2 ${status.class} ${!readOnly ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={() => {
                    if (!readOnly && milestone.id) {
                      const milestoneIndex = actionPlan.milestones.findIndex(m => m.id === milestone.id);
                      if (milestoneIndex !== -1) {
                        onUpdateMilestone(milestoneIndex, 'isCompleted', !milestone.isCompleted);
                      }
                    }
                  }}
                  title={!readOnly ? (milestone.isCompleted ? "Marquer comme non terminé" : "Marquer comme terminé") : ""}
                >
                  {milestone.isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                
                {/* Contenu du jalon */}
                <div className={`border-l-4 rounded-lg p-4 ${status.class}`}>
                  <div className="flex justify-between items-start mb-2">
                    {isMilestoneEditing(milestone.id || '') ? (
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => {
                          const milestoneIndex = actionPlan.milestones.findIndex(m => m.id === milestone.id);
                          if (milestoneIndex !== -1) {
                            onUpdateMilestone(milestoneIndex, 'title', e.target.value);
                          }
                        }}
                        className="text-lg font-semibold w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold">{milestone.title}</h3>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${status.class}`}>
                        {status.text}
                      </span>
                      
                      {/* Boutons d'action individuels */}
                      {!readOnly && (
                        isMilestoneEditing(milestone.id || '') ? (
                          <>
                            <button 
                              onClick={() => onSaveMilestone(milestone)}
                              className="text-xs py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Enregistrer
                            </button>
                            <button 
                              onClick={() => onToggleMilestoneEdit(milestone.id || '')}
                              className="text-xs py-1 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => onToggleMilestoneEdit(milestone.id || '')}
                            className="text-xs py-1 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            Éditer
                          </button>
                        )}
                      </div>
                      
                      {/* Bouton toggle pour afficher/masquer les détails */}
                      <button 
                        className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                        onClick={() => toggleMilestoneDetails(milestone.id || `milestone-${index}`)}
                        title={expandedMilestones[milestone.id || `milestone-${index}`] ? "Réduire les détails" : "Afficher les détails"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-gray-600 dark:text-gray-400">
                          {expandedMilestones[milestone.id || `milestone-${index}`] ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <span className="font-medium">Échéance:</span> 
                    {isMilestoneEditing(milestone.id || '') ? (
                      <input
                        type="date"
                        value={milestone.targetDate}
                        onChange={(e) => {
                          const milestoneIndex = actionPlan.milestones.findIndex(m => m.id === milestone.id);
                          if (milestoneIndex !== -1) {
                            onUpdateMilestone(milestoneIndex, 'targetDate', e.target.value);
                          }
                        }}
                        className="ml-2 bg-transparent border-b border-gray-300 dark:border-gray-600 p-1 focus:outline-none focus:border-blue-500 text-sm"
                      />
                    ) : (
                      <span className="ml-1">{formatDate(milestone.targetDate)}</span>
                    )}
                  </div>
                  
                  {isMilestoneEditing(milestone.id || '') ? (
                    <div className="mb-3">
                      <textarea
                        value={milestone.description}
                        onChange={(e) => {
                          const milestoneIndex = actionPlan.milestones.findIndex(m => m.id === milestone.id);
                          if (milestoneIndex !== -1) {
                            onUpdateMilestone(milestoneIndex, 'description', e.target.value);
                          }
                        }}
                        placeholder="Description du jalon"
                        rows={2}
                        className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ) : milestone.description ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{milestone.description}</p>
                  ) : null}
                  
                  {/* Barre de progression */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" 
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <span>{tasks.length} tâches</span>
                    <span>{completionPercent}% complété</span>
                  </div>
                  
                  {/* Liste des tâches associées (conditionnelle) */}
                  {(showDetails || expandedMilestones[milestone.id || `milestone-${index}`]) && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tâches associées :</h4>
                      {tasks.length > 0 ? (
                        <ul className="space-y-2">
                          {tasks.map((task, taskIndex) => {
                            const taskIndexInArray = actionPlan.tasks.findIndex(t => t.id === task.id);
                            
                            return (
                              <li key={task.id || taskIndex} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div 
                                    className={`w-3 h-3 rounded-full mr-2 ${
                                      task.status === 'done' ? 'bg-green-500' : 
                                      task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                                    } ${!readOnly ? 'cursor-pointer' : ''}`}
                                    onClick={() => {
                                      if (!readOnly && taskIndexInArray !== -1) {
                                        const nextStatus = task.status === 'todo' ? 'in-progress' : 
                                                        task.status === 'in-progress' ? 'done' : 'todo';
                                        onUpdateTask(taskIndexInArray, 'status', nextStatus);
                                      }
                                    }}
                                    title={!readOnly ? "Cliquer pour changer le statut" : ""}
                                  />
                                  {isTaskEditing(task.id || '') && taskIndexInArray !== -1 ? (
                                    <input
                                      type="text"
                                      value={task.title}
                                      onChange={(e) => onUpdateTask(taskIndexInArray, 'title', e.target.value)}
                                      className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                                    />
                                  ) : (
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {task.title}
                                    </span>
                                  )}
                                </div>
                                {!readOnly && (
                                  <div className="flex items-center space-x-2">
                                    {isTaskEditing(task.id || '') ? (
                                      <select 
                                        value={task.status} 
                                        onChange={(e) => onUpdateTask(taskIndexInArray, 'status', e.target.value)}
                                        className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 text-gray-600 dark:text-gray-400"
                                      >
                                        <option value="todo">À faire</option>
                                        <option value="in-progress">En cours</option>
                                        <option value="done">Terminé</option>
                                      </select>
                                    ) : (
                                      <button
                                        onClick={() => onToggleTaskEdit(task.id || '')}
                                        className="text-xs py-0.5 px-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 ml-2"
                                      >
                                        Éditer
                                      </button>
                                    )}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-sm italic text-gray-500 dark:text-gray-400">Aucune tâche associée</p>
                      )}
                      
                      {!readOnly && onAddTask && (
                        <button 
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                          onClick={() => onAddTask(milestone.id || '')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Ajouter une tâche
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActionPlanTimeline;
