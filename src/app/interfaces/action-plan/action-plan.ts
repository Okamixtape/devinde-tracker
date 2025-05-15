/**
 * Interfaces standardisées pour le plan d'action
 * 
 * Ce fichier définit les interfaces normalisées pour la gestion des jalons,
 * des tâches et de la planification temporelle dans l'application.
 * @standardized true
 * @version 1.0
 */

import { BaseModel, ServiceModel, UIModel } from '../common/base-models';
import { PriorityLevel, ItemStatus } from '../common/common-types';

/**
 * Catégories de jalons
 */
export enum MilestoneCategory {
  ALL = 'all',
  MARKETING = 'marketing',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  ADMINISTRATIVE = 'administrative',
  CLIENT = 'client',
  PERSONAL = 'personal'
}

// ==================== INTERFACES UI ====================

/**
 * Commentaire sur une tâche (UI)
 */
export interface UITaskComment extends UIModel {
  /** Auteur du commentaire */
  author: string;
  /** Contenu du commentaire */
  content: string;
  /** Date et heure du commentaire */
  timestamp: string;
  /** Indique si le commentaire a été modifié */
  edited?: boolean;
}

/**
 * Sous-tâche (UI)
 */
export interface UISubTask extends UIModel {
  /** Titre de la sous-tâche */
  title: string;
  /** Description de la sous-tâche */
  description: string;
  /** Priorité de la sous-tâche */
  priority: PriorityLevel;
  /** Statut de la sous-tâche */
  status: ItemStatus;
  /** Indique si la sous-tâche est terminée */
  completed: boolean;
  /** Commentaires sur la sous-tâche */
  comments: UITaskComment[];
  /** Tags pour la catégorisation */
  tags: string[];
  /** ID du jalon associé (optionnel) */
  milestoneId?: string;
}

/**
 * Tâche avec détails (UI)
 */
export interface UITask extends UIModel {
  /** Titre de la tâche */
  title: string;
  /** Description de la tâche */
  description: string;
  /** Priorité de la tâche */
  priority: PriorityLevel;
  /** Statut de la tâche */
  status: ItemStatus;
  /** Personne assignée à la tâche (optionnel) */
  assignee?: string;
  /** Date de début (optionnel) */
  startDate?: string;
  /** Date d'échéance (optionnel) */
  dueDate?: string;
  /** Heures estimées (optionnel) */
  estimatedHours?: number;
  /** Heures réelles (optionnel) */
  actualHours?: number;
  /** Sous-tâches (optionnel) */
  subtasks?: UISubTask[];
  /** IDs des tâches dont celle-ci dépend (optionnel) */
  dependencies?: string[];
  /** Commentaires sur la tâche */
  comments: UITaskComment[];
  /** Tags pour la catégorisation */
  tags: string[];
  /** Indique si cette tâche bloque d'autres tâches (optionnel) */
  isBlocking?: boolean;
  /** ID du jalon associé (optionnel) */
  milestoneId?: string;
}

/**
 * Jalon avec détails (UI)
 */
export interface UIMilestone extends UIModel {
  /** Titre du jalon */
  title: string;
  /** Description du jalon */
  description: string;
  /** Catégorie du jalon */
  category: MilestoneCategory;
  /** Statut du jalon */
  status: ItemStatus;
  /** Pourcentage de complétion (0-100) */
  progress: number;
  /** Nombre total de tâches */
  tasksTotal: number;
  /** Nombre de tâches complétées */
  tasksCompleted: number;
  /** Jours restants jusqu'à la date d'échéance (optionnel) */
  daysRemaining?: number;
  /** Indique si la date d'échéance est dépassée et le jalon n'est pas complété (optionnel) */
  isLate?: boolean;
  /** Date d'échéance */
  dueDate: string;
  /** Commentaires sur le jalon */
  comments: UITaskComment[];
}

/**
 * Statistiques du plan d'action (UI)
 */
export interface UIActionPlanStatistics {
  /** Nombre total de jalons */
  totalMilestones: number;
  /** Nombre de jalons complétés */
  completedMilestones: number;
  /** Nombre de jalons à venir */
  upcomingMilestones: number;
  /** Nombre de jalons en retard */
  lateMilestones: number;
  /** Nombre total de tâches */
  totalTasks: number;
  /** Nombre de tâches complétées */
  completedTasks: number;
  /** Nombre de tâches en cours */
  inProgressTasks: number;
  /** Nombre de tâches en retard */
  lateTasks: number;
  /** Taux de complétion global (pourcentage) */
  completionRate: number;
  /** Tâches par priorité */
  tasksByPriority: Record<PriorityLevel, number>;
  /** Tâches par statut */
  tasksByStatus: Record<ItemStatus, number>;
}

/**
 * Paramètres d'affichage du plan d'action (UI)
 */
export interface UIActionPlanViewSettings {
  /** Indique si les tâches complétées sont visibles */
  showCompletedTasks: boolean;
  /** Indique si les sous-tâches sont visibles */
  showSubtasks: boolean;
  /** Filtres actifs */
  activeFilters: UIActionPlanFilters;
  /** Vue par défaut */
  defaultView: 'list' | 'kanban' | 'calendar' | 'gantt';
  /** Période de temps à afficher */
  timeframe?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  /** Indique si les dépendances sont visibles */
  showDependencies: boolean;
}

/**
 * Filtres pour le plan d'action (UI)
 */
export interface UIActionPlanFilters {
  /** Statuts à afficher */
  statuses: ItemStatus[];
  /** Priorités à afficher */
  priorities: PriorityLevel[];
  /** Catégories de jalons à afficher */
  milestoneCategories: MilestoneCategory[];
  /** Tags à filtrer */
  tags: string[];
  /** Personnes assignées à filtrer */
  assignees: string[];
  /** Terme de recherche */
  searchTerm: string;
  /** Plage de dates de début */
  startDateRange?: { from: string; to: string };
  /** Plage de dates d'échéance */
  dueDateRange?: { from: string; to: string };
}

/**
 * Plan d'action complet (UI)
 */
export interface UIActionPlan {
  /** Jalons du plan d'action */
  milestones: UIMilestone[];
  /** Tâches du plan d'action */
  tasks: UITask[];
  /** Statistiques du plan d'action */
  statistics: UIActionPlanStatistics;
  /** Paramètres d'affichage */
  viewSettings: UIActionPlanViewSettings;
}

// ==================== INTERFACES SERVICE ====================

/**
 * Commentaire sur une tâche (Service)
 */
export interface ServiceTaskComment extends ServiceModel {
  /** Auteur du commentaire */
  author: string;
  /** Contenu du commentaire */
  content: string;
  /** Date et heure du commentaire */
  timestamp: string;
  /** Indique si le commentaire a été modifié */
  edited?: boolean;
}

/**
 * Sous-tâche (Service)
 */
export interface ServiceSubTask extends ServiceModel {
  /** Titre de la sous-tâche */
  title: string;
  /** Description de la sous-tâche */
  description: string;
  /** Priorité de la sous-tâche */
  priority: string;
  /** Statut de la sous-tâche */
  status: string;
  /** Indique si la sous-tâche est terminée */
  completed: boolean;
  /** Commentaires sur la sous-tâche */
  comments: ServiceTaskComment[];
  /** Tags pour la catégorisation */
  tags: string[];
  /** ID du jalon associé (optionnel) */
  milestoneId?: string;
}

/**
 * Tâche (Service)
 */
export interface ServiceTask extends ServiceModel {
  /** Titre de la tâche */
  title: string;
  /** Description de la tâche */
  description: string;
  /** Priorité de la tâche */
  priority: string;
  /** Statut de la tâche */
  status: string;
  /** Personne assignée à la tâche (optionnel) */
  assignee?: string;
  /** Date de début (optionnel) */
  startDate?: string;
  /** Date d'échéance (optionnel) */
  dueDate?: string;
  /** Heures estimées (optionnel) */
  estimatedHours?: number;
  /** Heures réelles (optionnel) */
  actualHours?: number;
  /** Sous-tâches (optionnel) */
  subtasks?: ServiceSubTask[];
  /** IDs des tâches dont celle-ci dépend (optionnel) */
  dependencies?: string[];
  /** Commentaires sur la tâche */
  comments: ServiceTaskComment[];
  /** Tags pour la catégorisation */
  tags: string[];
  /** Indique si cette tâche bloque d'autres tâches (optionnel) */
  isBlocking?: boolean;
  /** ID du jalon associé (optionnel) */
  milestoneId?: string;
}

/**
 * Jalon (Service)
 */
export interface ServiceMilestone extends ServiceModel {
  /** Titre du jalon */
  title: string;
  /** Description du jalon */
  description: string;
  /** Catégorie du jalon */
  category: string;
  /** Statut du jalon */
  status: string;
  /** Date d'échéance (équivalent à targetDate) */
  dueDate: string;
  /** Commentaires sur le jalon */
  comments: ServiceTaskComment[];
}

/**
 * Structure des données du plan d'action (Service)
 */
export interface ServiceActionPlan extends ServiceModel {
  /** Jalons du plan d'action */
  milestones: ServiceMilestone[];
  /** Tâches du plan d'action */
  tasks: ServiceTask[];
}
