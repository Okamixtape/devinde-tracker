'use client';

import React, { useState } from 'react';
import { Milestone, Task } from '@/app/services/interfaces/dataModels';

interface MilestoneCardProps {
  milestone: Milestone;
  tasks: Task[];
  isEditing: boolean;
  readOnly?: boolean;
  onUpdateMilestone: (field: keyof Milestone, value: string | boolean) => void;
  onToggleEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onAddTask: () => void;
  calculateProgress: (milestoneId?: string) => number;
  formatDate: (dateString?: string) => string;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  tasks,
  isEditing,
  readOnly = false,
  onUpdateMilestone,
  onToggleEdit,
  onDelete,
  onSave,
  onAddTask,
  calculateProgress,
  formatDate
}) => {
  const [showTasks, setShowTasks] = useState(false);
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm transition-all">
      <div className="flex justify-between items-start mb-3">
        {/* Titre et date avec édition conditionnelle */}
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={milestone.title}
              onChange={(e) => onUpdateMilestone('title', e.target.value)}
              className="font-bold text-lg mb-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded w-full"
            />
          ) : (
            <h4 className="font-bold text-lg mb-1">{milestone.title || 'Jalon sans titre'}</h4>
          )}
          
          <div className="flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">
              {formatDate(milestone.targetDate)}
            </span>
            {isEditing && (
              <input
                type="date"
                value={milestone.targetDate?.split('T')[0] || ''}
                onChange={(e) => onUpdateMilestone('targetDate', e.target.value)}
                className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
              />
            )}
          </div>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex items-center space-x-2">
          {!readOnly && (
            <>
              {isEditing ? (
                <>
                  <button 
                    onClick={onSave}
                    className="text-sm py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Enregistrer
                  </button>
                  <button 
                    onClick={onToggleEdit}
                    className="text-sm py-1 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={onDelete}
                    className="text-sm py-1 px-3 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </>
              ) : (
                <button 
                  onClick={onToggleEdit}
                  className="text-sm py-1 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Éditer
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Progrès des Tâches
        </label>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all" 
            style={{ width: `${calculateProgress(milestone.id)}%` }}
          ></div>
        </div>
        <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
          {calculateProgress(milestone.id)}% complet
        </p>
      </div>
      
      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        {readOnly || !isEditing ? (
          <p className="whitespace-pre-line px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded">
            {milestone.description || 'Aucune description'}
          </p>
        ) : (
          <textarea
            value={milestone.description}
            onChange={(e) => onUpdateMilestone('description', e.target.value)}
            rows={3}
            placeholder="Description détaillée du jalon..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
        )}
      </div>
      
      {/* Tâches associées */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <button 
            onClick={() => setShowTasks(!showTasks)} 
            className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg 
              className={`w-4 h-4 mr-1 transition-transform ${showTasks ? 'rotate-90' : ''}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
            </svg>
            Tâches Associées ({tasks.length})
          </button>
          
          {!readOnly && (
            <button
              onClick={onAddTask}
              className="text-xs py-1 px-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
            >
              <span className="mr-1">+</span> Ajouter une tâche
            </button>
          )}
        </div>
        
        {/* Liste des tâches (conditionnellement affichée) */}
        {showTasks && (
          <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600 space-y-1">
            {tasks.length === 0 ? (
              <p className="text-sm italic text-gray-500 dark:text-gray-400 pl-2">
                Aucune tâche associée
              </p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} 
                  className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      task.status === 'done' ? 'bg-green-500' : 
                      task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    <span className={`text-sm ${
                      task.status === 'done' ? 'line-through text-gray-500 dark:text-gray-400' : ''
                    }`}>{task.title}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneCard;
