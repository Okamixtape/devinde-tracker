/**
 * ActionPlanInterfaces - Interfaces TypeScript pour le plan d'action
 * 
 * Ce fichier définit les interfaces utilisées pour la gestion des jalons,
 * des tâches et de la planification temporelle dans l'application.
 */

import { /* Imports conservés pour la référence, mais non utilisés directement */
  Milestone, 
  Task 
} from '../services/interfaces/dataModels';

/**
 * Catégories de jalons
 */
export type MilestoneCategory = 'all' | 'marketing' | 'business' | 'technical' | 'administrative' | 'client' | 'personal';

/**
 * Priorité des tâches
 */
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Statut des tâches et jalons
 */
export type ActionItemStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled' | 'delayed';

/**
 * Extension de l'interface Milestone avec des informations supplémentaires pour l'UI
 */
export interface MilestoneWithDetails {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  status: ActionItemStatus;
  progress: number; // Pourcentage de complétion (0-100)
  tasksTotal: number;
  tasksCompleted: number;
  daysRemaining?: number; // Jours restants jusqu'à la date d'échéance
  isLate?: boolean; // Si la date d'échéance est dépassée et le jalon n'est pas complété
  dueDate: string; // Date d'échéance (équivalent à targetDate dans Milestone)
  comments: TaskComment[]
}

/**
 * Extension de l'interface Task avec des informations supplémentaires pour l'UI
 */
export interface TaskWithDetails {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: ActionItemStatus;
  assignee?: string; // Personne assignée à la tâche
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  subtasks?: SubTask[]; // Sous-tâches
  dependencies?: string[]; // IDs des tâches dont celle-ci dépend
  comments: TaskComment[]; // Commentaires sur la tâche
  tags: string[]; // Tags pour catégorisation
  isBlocking?: boolean; // Si cette tâche bloque d'autres tâches
  milestoneId?: string; // ID du jalon associé
}

/**
 * Sous-tâches
 */
export interface SubTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: ActionItemStatus;
  completed: boolean;
  comments: TaskComment[];
  tags: string[];
  milestoneId?: string;
}

/**
 * Commentaires sur les tâches
 */
export interface TaskComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  edited?: boolean;
}

/**
 * Statistiques globales du plan d'action
 */
export interface ActionPlanStatistics {
  totalMilestones: number;
  completedMilestones: number;
  upcomingMilestones: number;
  lateMilestones: number;
  
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  upcomingTasks: number;
  lateTasks: number;
  
  overallProgress: number; // Pourcentage global d'avancement
  timelineHealth: 'good' | 'warning' | 'critical'; // État général du plan
}

/**
 * Planning hebdomadaire
 */
export interface WeeklySchedule {
  weekStartDate: string;
  weekEndDate: string;
  days: ScheduleDay[];
  totalHoursPlanned: number;
  totalHoursActual: number;
}

/**
 * Jour dans le planning
 */
export interface ScheduleDay {
  date: string;
  dayName: string;
  tasks: ScheduledTask[];
  hoursPlanned: number;
  hoursActual: number;
}

/**
 * Tâche planifiée dans le planning
 */
export interface ScheduledTask {
  taskId: string;
  title: string;
  startTime?: string;
  endTime?: string;
  hoursPlanned: number;
  hoursActual?: number;
  completed: boolean;
  milestoneId?: string;
  milestoneName?: string;
}

/**
 * Événement de calendrier
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // Date et heure de début (ISO)
  end: string; // Date et heure de fin (ISO)
  allDay: boolean;
  type: 'milestone' | 'task' | 'meeting' | 'deadline' | 'other';
  status: ActionItemStatus;
  color: string;
  linkedItemId?: string; // ID du jalon ou de la tâche associé
}

/**
 * Timeline pour le diagramme de Gantt
 */
export interface TimelineItem {
  id: string;
  title: string;
  type: 'milestone' | 'task' | 'subtask';
  start: string; // Date de début (ISO)
  end: string; // Date de fin (ISO)
  progress: number; // Pourcentage de complétion (0-100)
  status: ActionItemStatus;
  dependencies?: string[]; // IDs des éléments dont celui-ci dépend
  parentId?: string; // ID du parent (pour les sous-tâches)
  milestone?: string; // ID du jalon parent (pour les tâches)
  assignee?: string;
}

/**
 * Configuration des vues du plan d'action
 */
export interface ActionPlanViewSettings {
  defaultView: 'timeline' | 'list' | 'kanban' | 'calendar';
  showCompletedItems: boolean;
  groupBy: 'milestone' | 'status' | 'assignee' | 'priority' | 'category';
  sortBy: 'dueDate' | 'priority' | 'title' | 'status' | 'createdAt';
  sortDirection: 'asc' | 'desc';
  timelineZoom: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

/**
 * Configuration des rappels
 */
export interface ReminderSettings {
  enabled: boolean;
  advanceNoticeDays: number;
  reminderTime: string; // HH:MM format
  notificationMethods: ('email' | 'browser' | 'system')[];
}

/**
 * Filtres pour les vues du plan d'action
 */
export interface ActionPlanFilters {
  categories: MilestoneCategory[];
  statuses: ActionItemStatus[];
  assignees: string[];
  priorities: TaskPriority[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  searchText?: string;
}
