  /**
   * Transforme les données du format UI vers le format service
   * Utilisé lors de la création ou la sauvegarde complète de données
   * 
   * @param uiData Données provenant de l'UI
   * @returns Données formatées pour le service
   */
  static toService(uiData: {
    milestones?: MilestoneWithDetails[],
    tasks?: TaskWithDetails[],
  }): Partial<BusinessPlanData> {
    // Protection contre les données nulles ou undefined
    if (!uiData) return {};

    const result: Partial<BusinessPlanData> = {
      actionPlan: {
        milestones: [],
        tasks: []
      }
    };

    // Conversion des jalons de l'UI vers le format service
    if (uiData.milestones && Array.isArray(uiData.milestones)) {
      result.actionPlan.milestones = uiData.milestones.map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        targetDate: milestone.dueDate || '',
        isCompleted: milestone.status === 'completed',
        tasks: [] // Les relations sont gérées via les milestoneId dans les tâches
      }));
    }

    // Conversion des tâches de l'UI vers le format service
    if (uiData.tasks && Array.isArray(uiData.tasks)) {
      // Fonction récursive pour aplatir la hiérarchie des tâches
      const flattenTasks = (tasks: TaskWithDetails[]): TaskWithDetails[] => {
        return tasks.reduce<TaskWithDetails[]>((acc, task) => {
          acc.push(task);
          if (task.subtasks && task.subtasks.length > 0) {
            // Convertir les sous-tâches en TaskWithDetails
            const subtasksAsTaskDetails: TaskWithDetails[] = task.subtasks.map(st => ({
              id: st.id, 
              title: st.title,
              description: st.description,
              priority: st.priority,
              status: st.status,
              comments: st.comments,
              tags: st.tags,
              milestoneId: st.milestoneId,
              dueDate: '',
              subtasks: [] as SubTask[]
            }));
            acc.push(...flattenTasks(subtasksAsTaskDetails));
          }
          return acc;
        }, []);
      };

      const flatTasks = flattenTasks(uiData.tasks);
      result.actionPlan.tasks = flatTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: ActionPlanAdapter.convertUIStatusToServiceStatus(task.status),
        dueDate: task.dueDate || undefined,
        milestoneId: task.milestoneId
      }));
    }

    return result;
  }

  /**
   * Convertit le statut du format UI vers le format service
   * @private
   */
  private static convertUIStatusToServiceStatus(uiStatus: ActionItemStatus): 'todo' | 'in-progress' | 'done' {
    switch (uiStatus) {
      case 'completed':
        return 'done';
      case 'in-progress':
        return 'in-progress';
      case 'delayed':
        return 'in-progress';
      case 'cancelled':
        return 'todo';
      case 'planned':
      default:
        return 'todo';
    }
  }

  /**
   * Met à jour partiellement les données du service avec les modifications de l'UI
   * Méthode clé pour les mises à jour partielles qui préserve les données non modifiées
   * 
   * @param businessPlanData Données complètes du service
   * @param uiChanges Modifications partielles de l'UI
   * @returns Données service mises à jour avec fusion intelligente
   */
  static updateServiceWithUIChanges(
    businessPlanData: BusinessPlanData,
    uiChanges: {
      milestones?: MilestoneWithDetails[],
      tasks?: TaskWithDetails[],
      updatedMilestone?: MilestoneWithDetails,
      updatedTask?: TaskWithDetails
    }
  ): BusinessPlanData {
    // Protection contre les données nulles ou undefined
    if (!businessPlanData) return {} as BusinessPlanData;
    if (!uiChanges) return businessPlanData;

    // Créer une copie pour éviter des modifications directes
    const result = { ...businessPlanData };

    // S'assurer que result.actionPlan existe
    if (!result.actionPlan) {
      result.actionPlan = {
        milestones: [],
        tasks: []
      };
    }
    
    // Traitement d'un jalon mis à jour individuellement
    if (uiChanges.updatedMilestone) {
      const milestoneToUpdate: Milestone = {
        id: uiChanges.updatedMilestone.id,
        title: uiChanges.updatedMilestone.title,
        description: uiChanges.updatedMilestone.description,
        targetDate: uiChanges.updatedMilestone.dueDate || '',
        isCompleted: uiChanges.updatedMilestone.status === 'completed',
        tasks: []
      };
      result.actionPlan.milestones = mergeById(result.actionPlan.milestones || [], [milestoneToUpdate]);
    }

    // Traitement d'une tâche mise à jour individuellement
    if (uiChanges.updatedTask) {
      const taskToUpdate: Task = {
        id: uiChanges.updatedTask.id,
        title: uiChanges.updatedTask.title,
        description: uiChanges.updatedTask.description,
        status: ActionPlanAdapter.convertUIStatusToServiceStatus(uiChanges.updatedTask.status),
        dueDate: uiChanges.updatedTask.dueDate,
        milestoneId: uiChanges.updatedTask.milestoneId
      };
      result.actionPlan.tasks = mergeById(result.actionPlan.tasks || [], [taskToUpdate]);
    }

    // Traitement d'un ensemble complet de jalons
    if (uiChanges.milestones && Array.isArray(uiChanges.milestones)) {
      const serviceMilestones: Milestone[] = uiChanges.milestones.map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        targetDate: milestone.dueDate || '',
        isCompleted: milestone.status === 'completed',
        tasks: []
      }));

      result.actionPlan.milestones = mergeById(result.actionPlan.milestones || [], serviceMilestones);
    }

    // Traitement d'un ensemble complet de tâches
    if (uiChanges.tasks && Array.isArray(uiChanges.tasks)) {
      // Fonction récursive pour aplatir la hiérarchie des tâches
      const flattenTasks = (tasks: TaskWithDetails[]): TaskWithDetails[] => {
        return tasks.reduce<TaskWithDetails[]>((acc, task) => {
          acc.push(task);
          if (task.subtasks && task.subtasks.length > 0) {
            // Convertir les sous-tâches en TaskWithDetails
            const subtasksAsTaskDetails: TaskWithDetails[] = task.subtasks.map(st => ({
              id: st.id, 
              title: st.title,
              description: st.description,
              priority: st.priority,
              status: st.status,
              comments: st.comments,
              tags: st.tags,
              milestoneId: st.milestoneId,
              dueDate: '',
              subtasks: [] as SubTask[]
            }));
            acc.push(...flattenTasks(subtasksAsTaskDetails));
          }
          return acc;
        }, []);
      };

      const flatTasks = flattenTasks(uiChanges.tasks);
      const serviceTasks: Task[] = flatTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: ActionPlanAdapter.convertUIStatusToServiceStatus(task.status),
        dueDate: task.dueDate,
        milestoneId: task.milestoneId
      }));

      result.actionPlan.tasks = mergeById(result.actionPlan.tasks || [], serviceTasks);
    }

    return result;
  }

  /**
   * Génère des événements de calendrier à partir des jalons et tâches
   * 
   * @param milestones Liste des jalons
   * @param tasks Liste des tâches
   * @returns Liste d'événements pour un calendrier
   */
  static generateCalendarEvents(
    milestones: MilestoneWithDetails[],
    tasks: TaskWithDetails[]
  ): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    
    // Créer des événements pour les jalons
    milestones.forEach(milestone => {
      if (milestone.dueDate) {
        // Couleur selon la catégorie
        let color = '#4CAF50'; // vert par défaut
        switch (milestone.category) {
          case 'marketing': color = '#2196F3'; break; // bleu
          case 'technical': color = '#673AB7'; break; // violet
          case 'administrative': color = '#FF9800'; break; // orange
          case 'client': color = '#E91E63'; break; // rose
          case 'personal': color = '#009688'; break; // teal
        }
        
        events.push({
          id: `milestone-${milestone.id}`,
          title: milestone.title,
          start: milestone.dueDate,
          end: milestone.dueDate,
          allDay: true,
          type: 'milestone',
          status: milestone.status,
          color,
          linkedItemId: milestone.id
        });
      }
    });
    
    // Créer des événements pour les tâches
    tasks.forEach(task => {
      if (task.dueDate) {
        // Couleur selon la priorité
        let color = '#607D8B'; // gris par défaut
        switch (task.priority) {
          case 'urgent': color = '#F44336'; break; // rouge
          case 'high': color = '#FF5722'; break; // orange foncé
          case 'normal': color = '#8BC34A'; break; // vert clair
          case 'low': color = '#03A9F4'; break; // bleu clair
        }
        
        const start = task.startDate || task.dueDate;
        
        events.push({
          id: `task-${task.id}`,
          title: task.title,
          start,
          end: task.dueDate,
          allDay: !task.startDate, // Toute la journée si pas d'heure de début spécifique
          type: 'task',
          status: task.status,
          color,
          linkedItemId: task.id
        });
      }
    });
    
    return events;
  }
