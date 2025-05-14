'use client';

import React from 'react';
import { Milestone, Task } from '@/app/services/interfaces/dataModels';

interface TaskCardProps {
  task: Task;
  milestones: Milestone[];
  isEditing: boolean;
  readOnly?: boolean;
  onUpdateTask: (field: keyof Task, value: string) => void;
  onToggleEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onStatusChange: (status: 'todo' | 'in-progress' | 'done') => void;
  formatDate: (dateString?: string) => string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  milestones,
  isEditing,
  readOnly = false,
  onUpdateTask,
  onToggleEdit,
  onDelete,
  onSave,
  onStatusChange,
  formatDate
}) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'done': 
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress': 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: 
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };
  
  const getMilestoneName = (milestoneId?: string) => {
    if (!milestoneId) return 'Aucun';
    const milestone = milestones.find(m => m.id === milestoneId);
    return milestone?.title || 'Non trouvé';
  };
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-4">
      <div className="flex justify-between items-start mb-3">
        {/* Titre */}
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={task.title}
              onChange={(e) => onUpdateTask('title', e.target.value)}
              className="font-medium text-base mb-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded w-full"
            />
          ) : (
            <h4 className="font-medium text-base mb-1">{task.title || 'Tâche sans titre'}</h4>
          )}
        </div>
        
        {/* Statut */}
        <div className="ml-2">
          {isEditing ? (
            <select
              value={task.status}
              onChange={(e) => onUpdateTask('status', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
            >
              <option value="todo">À faire</option>
              <option value="in-progress">En cours</option>
              <option value="done">Terminé</option>
            </select>
          ) : (
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(task.status)}`}>
              {task.status === 'todo' ? 'À faire' : 
               task.status === 'in-progress' ? 'En cours' : 
               'Terminé'}
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        {/* Date d'échéance */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Date d'échéance
          </label>
          {isEditing ? (
            <input
              type="date"
              value={task.dueDate?.split('T')[0] || ''}
              onChange={(e) => onUpdateTask('dueDate', e.target.value)}
              className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
            />
          ) : (
            <p className="text-sm">{formatDate(task.dueDate)}</p>
          )}
        </div>
        
        {/* Jalon associé */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Jalon associé
          </label>
          {isEditing ? (
            <select
              value={task.milestoneId || ''}
              onChange={(e) => onUpdateTask('milestoneId', e.target.value)}
              className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
            >
              <option value="">Aucun jalon</option>
              {milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.title}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm">{getMilestoneName(task.milestoneId)}</p>
          )}
        </div>
      </div>
      
      {/* Description */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Description
        </label>
        {isEditing ? (
          <textarea
            value={task.description}
            onChange={(e) => onUpdateTask('description', e.target.value)}
            rows={2}
            placeholder="Description détaillée de la tâche..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
        ) : (
          <p className="text-sm whitespace-pre-line px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded">
            {task.description || 'Aucune description'}
          </p>
        )}
      </div>
      
      {/* Boutons d'action */}
      {!readOnly && (
        <div className="flex justify-end space-x-2">
          {isEditing ? (
            <>
              <button 
                onClick={onSave}
                className="text-xs py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Enregistrer
              </button>
              <button 
                onClick={onToggleEdit}
                className="text-xs py-1 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={onDelete}
                className="text-xs py-1 px-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer
              </button>
            </>
          ) : (
            <button 
              onClick={onToggleEdit}
              className="text-xs py-1 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Éditer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
