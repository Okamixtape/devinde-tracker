/**
 * ActionPlanAdapter - Adaptateur pour les données du plan d'action
 * 
 * Transforme les données entre le format service (dataModels) et le format UI standardisé.
 * Implémente les conventions définies dans /docs/CONVENTIONS.md
 *
 * @version 2.0
 * @standardized true
 */

import { BusinessPlanData } from '../services/interfaces/dataModels';
import StandardizedAdapter from './ActionPlanAdapter.standardized';
import {
  MilestoneWithDetails,
  TaskWithDetails,
  CalendarEvent,
  TimelineItem
} from '../interfaces/ActionPlanInterfaces';
import { 
  UIMilestone,
  UITask,
  UIActionPlan
} from '../interfaces/action-plan/action-plan';

/**
 * Adaptateur pour le plan d'action
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * et le format UI standardisé.
 */
export class ActionPlanAdapter {
  /**
   * Transforme les données du format service vers le format UI
   * Cette méthode est le point d'entrée principal pour obtenir des données formatées pour l'UI
   * 
   * @param businessPlanData Données provenant du service
   * @returns Données formatées pour l'UI avec valeurs par défaut pour les champs manquants
   */
  static toUI(businessPlanData: BusinessPlanData): UIActionPlan {
    return StandardizedAdapter.toUI(businessPlanData);
  }

  /**
   * Transforme les données du format UI vers le format service
   * Utilisé lors de la création ou la sauvegarde complète de données
   * 
   * @param uiData Données provenant de l'UI
   * @returns Données formatées pour le service (partiel BusinessPlanData)
   */
  static toService(uiData: UIActionPlan): Partial<BusinessPlanData> {
    return StandardizedAdapter.toService(uiData);
  }
  
  /**
   * Met à jour partiellement les données du service avec les modifications de l'UI
   * 
   * @param businessPlanData Données complètes du service
   * @param uiChanges Modifications partielles de l'UI
   * @returns Données service mises à jour avec fusion intelligente
   */
  static updateServiceWithUIChanges(
    businessPlanData: BusinessPlanData,
    uiChanges: Partial<UIActionPlan>
  ): BusinessPlanData {
    return StandardizedAdapter.updateServiceWithUIChanges(businessPlanData, uiChanges);
  }
  
  /**
   * Transforme les données en jalons détaillés
   * @param businessPlanData Données du plan d'affaires
   * @returns Array de jalons avec détails
   */
  static toDetailedMilestones(businessPlanData: BusinessPlanData): MilestoneWithDetails[] {
    return StandardizedAdapter.toDetailedMilestones(businessPlanData);
  }
  
  /**
   * Transforme les données en tâches détaillées
   * @param businessPlanData Données du plan d'affaires
   * @returns Array de tâches avec détails
   */
  static toDetailedTasks(businessPlanData: BusinessPlanData): TaskWithDetails[] {
    return StandardizedAdapter.toDetailedTasks(businessPlanData);
  }
  
  /**
   * Génère les événements de calendrier à partir des jalons et tâches
   * @param milestones Jalons UI
   * @param tasks Tâches UI
   * @returns Liste d'événements calendrier
   */
  static generateCalendarEvents(milestones: UIMilestone[], tasks: UITask[]): CalendarEvent[] {
    return StandardizedAdapter.generateCalendarEvents(milestones, tasks);
  }
  
  /**
   * Génère les éléments de la timeline à partir des jalons et tâches
   * @param milestones Jalons UI
   * @param tasks Tâches UI
   * @returns Liste d'éléments timeline
   */
  static generateTimelineItems(milestones: UIMilestone[], tasks: UITask[]): TimelineItem[] {
    return StandardizedAdapter.generateTimelineItems(milestones, tasks);
  }
  
  /**
   * @deprecated Utiliser toDetailedMilestones à la place
   */
  static transformToDetailedMilestones(businessPlanData: BusinessPlanData): MilestoneWithDetails[] {
    console.warn('ActionPlanAdapter: transformToDetailedMilestones est déprécié, utiliser toDetailedMilestones à la place');
    return ActionPlanAdapter.toDetailedMilestones(businessPlanData);
  }
  
  /**
   * @deprecated Utiliser toDetailedTasks à la place
   */
  static transformToDetailedTasks(businessPlanData: BusinessPlanData): TaskWithDetails[] {
    console.warn('ActionPlanAdapter: transformToDetailedTasks est déprécié, utiliser toDetailedTasks à la place');
    return ActionPlanAdapter.toDetailedTasks(businessPlanData);
  }
  
  /**
   * @deprecated Utiliser toUI à la place
   */
  static transformToUIFormat(businessPlanData: BusinessPlanData): UIActionPlan {
    console.warn('ActionPlanAdapter: transformToUIFormat est déprécié, utiliser toUI à la place');
    return ActionPlanAdapter.toUI(businessPlanData);
  }
}

// Export par défaut pour usage simple
export default ActionPlanAdapter;