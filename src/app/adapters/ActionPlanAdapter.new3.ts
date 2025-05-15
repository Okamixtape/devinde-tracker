  /**
   * Génère des éléments de timeline à partir des jalons et tâches
   * 
   * @param milestones Liste des jalons
   * @param tasks Liste des tâches
   * @returns Liste d'éléments pour une timeline chronologique
   */
  static generateTimelineItems(
    milestones: MilestoneWithDetails[],
    tasks: TaskWithDetails[]
  ): TimelineItem[] {
    const items: TimelineItem[] = [];
    
    // Créer des éléments de timeline pour les jalons
    milestones.forEach(milestone => {
      if (milestone.dueDate) {
        items.push({
          id: `milestone-${milestone.id}`,
          title: milestone.title,
          description: milestone.description || '',
          date: milestone.dueDate,
          type: 'milestone',
          status: milestone.status,
          icon: milestone.category === 'marketing' ? 'trending_up' : 
                 milestone.category === 'technical' ? 'code' :
                 milestone.category === 'administrative' ? 'assignment' :
                 milestone.category === 'client' ? 'people' :
                 milestone.category === 'personal' ? 'person' : 'flag',
          linkedItemId: milestone.id,
          category: milestone.category
        });
      }
    });
    
    // Créer des éléments de timeline pour les tâches importantes
    tasks.forEach(task => {
      if (task.dueDate && (task.priority === 'high' || task.priority === 'urgent')) {
        items.push({
          id: `task-${task.id}`,
          title: task.title,
          description: task.description || '',
          date: task.dueDate,
          type: 'task',
          status: task.status,
          icon: task.priority === 'urgent' ? 'priority_high' : 'arrow_upward',
          linkedItemId: task.id,
          category: 'task'
        });
      }
    });
    
    // Trier les éléments par date
    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

/**
 * Fonction utilitaire pour fusionner deux tableaux d'objets par ID
 * Les éléments du second tableau remplacent/ajoutent à ceux du premier
 */
function mergeById<T extends { id: string }>(original: T[], updates: T[]): T[] {
  const result = [...original];
  
  // Map pour accès rapide par ID
  const idToIndexMap = new Map<string, number>();
  result.forEach((item, index) => {
    idToIndexMap.set(item.id, index);
  });
  
  // Appliquer les mises à jour
  updates.forEach(update => {
    const existingIndex = idToIndexMap.get(update.id);
    
    if (existingIndex !== undefined) {
      // Mise à jour d'un élément existant
      result[existingIndex] = { ...result[existingIndex], ...update };
    } else {
      // Ajout d'un nouvel élément
      result.push(update);
    }
  });
  
  return result;
}

// Méthodes de compatibilité pour maintenir la rétrocompatibilité avec le code existant
// Marquées comme dépréciées, à remplacer par les méthodes standards de classe

/**
 * @deprecated Utilisez ActionPlanAdapter.toDetailedMilestones
 */
export function getMilestonesWithDetails(businessPlanData: BusinessPlanData): MilestoneWithDetails[] {
  console.warn('Méthode dépréciée: Utilisez ActionPlanAdapter.toDetailedMilestones');
  return ActionPlanAdapter.toDetailedMilestones(businessPlanData);
}

/**
 * @deprecated Utilisez ActionPlanAdapter.toDetailedTasks
 */
export function getTasksWithDetails(businessPlanData: BusinessPlanData): TaskWithDetails[] {
  console.warn('Méthode dépréciée: Utilisez ActionPlanAdapter.toDetailedTasks');
  return ActionPlanAdapter.toDetailedTasks(businessPlanData);
}

/**
 * @deprecated Utilisez ActionPlanAdapter.buildTaskHierarchy
 */
export function buildTaskHierarchy(tasks: TaskWithDetails[]): TaskWithDetails[] {
  console.warn('Méthode dépréciée: Utilisez ActionPlanAdapter.buildTaskHierarchy');
  return ActionPlanAdapter.buildTaskHierarchy(tasks);
}

export default ActionPlanAdapter;
