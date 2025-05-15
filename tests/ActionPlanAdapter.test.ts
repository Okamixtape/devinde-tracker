/**
 * Test unitaire pour ActionPlanAdapter
 * 
 * Teste les fonctionnalités de conversion bidirectionnelle et les mises à jour partielles.
 */

import { ActionPlanAdapter } from '../src/app/adapters/ActionPlanAdapter';
import { BusinessPlanData } from '../src/app/services/interfaces/dataModels';
import { 
  MilestoneWithDetails,
  TaskWithDetails,
  ActionPlanStatistics
} from '../src/app/interfaces/ActionPlanInterfaces';

describe('ActionPlanAdapter', () => {
  // Données de test
  const mockServiceData: BusinessPlanData = {
    id: 'test-123',
    name: 'Test Business Plan',
    actionPlan: {
      milestones: [
        { 
          id: 'milestone-1', 
          title: 'Lancement du site', 
          description: 'Mise en ligne du site web', 
          targetDate: '2023-12-31',
          isCompleted: false,
          tasks: []
        },
        { 
          id: 'milestone-2', 
          title: 'Développement API', 
          description: 'Développement des endpoints d\'API', 
          targetDate: '2023-10-15',
          isCompleted: true,
          tasks: []
        }
      ],
      tasks: [
        { 
          id: 'task-1', 
          title: 'Conception maquettes', 
          description: 'Créer les maquettes du site', 
          status: 'todo',
          milestoneId: 'milestone-1'
        },
        { 
          id: 'task-2', 
          title: 'Intégration HTML', 
          description: 'Intégrer les maquettes en HTML/CSS', 
          status: 'in-progress',
          milestoneId: 'milestone-1',
          dueDate: '2023-11-30'
        },
        { 
          id: 'task-3', 
          title: 'Documentation API', 
          description: 'Documenter les endpoints API', 
          status: 'done',
          milestoneId: 'milestone-2',
          dueDate: '2023-10-10'
        }
      ]
    },
    // Ajout des champs requis pour la structure BusinessPlanData
    pitch: { title: '', summary: '', vision: '', values: [] },
    services: { offerings: [], technologies: [], process: [] },
    marketAnalysis: { competitors: [], targetClients: [], trends: [] },
    financials: { initialInvestment: 0, quarterlyGoals: [], expenses: [] },
    businessModel: { 
      hourlyRates: [], 
      packages: [], 
      subscriptions: [] 
    }
  };

  describe('toUI', () => {
    test('devrait transformer correctement les données de service en données UI', () => {
      // Act
      const uiData = ActionPlanAdapter.toUI(mockServiceData);
      
      // Assert
      expect(uiData).toBeDefined();
      expect(uiData.milestones).toBeDefined();
      expect(uiData.tasks).toBeDefined();
      expect(uiData.taskHierarchy).toBeDefined();
      expect(uiData.statistics).toBeDefined();
      
      // Vérifier les jalons
      expect(uiData.milestones.length).toBe(2);
      expect(uiData.milestones[0].title).toBe('Lancement du site');
      expect(uiData.milestones[0].status).toBe('planned');
      expect(uiData.milestones[1].status).toBe('completed');
      
      // Vérifier les tâches
      expect(uiData.tasks.length).toBe(3);
      expect(uiData.tasks[0].title).toBe('Conception maquettes');
      expect(uiData.tasks[0].status).toBe('planned');
      expect(uiData.tasks[1].status).toBe('in-progress');
      expect(uiData.tasks[2].status).toBe('completed');
      
      // Vérifier les statistiques
      expect(uiData.statistics.totalMilestones).toBe(2);
      expect(uiData.statistics.completedMilestones).toBe(1);
      expect(uiData.statistics.totalTasks).toBe(3);
      expect(uiData.statistics.completedTasks).toBe(1);
    });

    test('devrait gérer les données nulles ou undefined', () => {
      // Arrange
      const emptyData = null;
      const incompleteData: Partial<BusinessPlanData> = {
        id: 'incomplete',
        name: 'Incomplet',
        actionPlan: {
          milestones: [],
          tasks: []
        }
      };
      
      // Act
      const emptyResult = ActionPlanAdapter.toUI(emptyData as any);
      const incompleteResult = ActionPlanAdapter.toUI(incompleteData as BusinessPlanData);
      
      // Assert
      expect(emptyResult).toBeDefined();
      expect(emptyResult.milestones).toEqual([]);
      expect(emptyResult.tasks).toEqual([]);
      
      expect(incompleteResult).toBeDefined();
      expect(incompleteResult.milestones).toEqual([]);
      expect(incompleteResult.tasks).toEqual([]);
    });
  });

  describe('toService', () => {
    test('devrait transformer correctement les données UI en données de service', () => {
      // Arrange
      const uiData = ActionPlanAdapter.toUI(mockServiceData);
      
      // Act
      const serviceData = ActionPlanAdapter.toService(uiData);
      
      // Assert
      expect(serviceData).toBeDefined();
      expect(serviceData.actionPlan).toBeDefined();
      
      // Vérifier les jalons
      const milestones = serviceData.actionPlan?.milestones || [];
      expect(milestones.length).toBe(2);
      expect(milestones[0].title).toBe('Lancement du site');
      expect(milestones[0].isCompleted).toBe(false);
      expect(milestones[1].isCompleted).toBe(true);
      
      // Vérifier les tâches
      const tasks = serviceData.actionPlan?.tasks || [];
      expect(tasks.length).toBe(3);
      expect(tasks[0].title).toBe('Conception maquettes');
      expect(tasks[0].status).toBe('todo');
      expect(tasks[1].status).toBe('in-progress');
      expect(tasks[2].status).toBe('done');
    });

    test('devrait gérer les données UI partielles', () => {
      // Arrange
      const partialUiData = {
        milestones: [
          { 
            id: 'new-milestone', 
            title: 'Nouveau Jalon', 
            description: 'Description test', 
            dueDate: '2024-01-15',
            status: 'planned' as const,
            category: 'marketing' as const,
            progress: 0,
            tasksTotal: 0,
            tasksCompleted: 0,
            comments: []
          }
        ]
      };
      
      // Act
      const serviceData = ActionPlanAdapter.toService(partialUiData);
      
      // Assert
      expect(serviceData).toBeDefined();
      expect(serviceData.actionPlan).toBeDefined();
      const milestones = serviceData.actionPlan?.milestones || [];
      expect(milestones.length).toBe(1);
      expect(milestones[0].title).toBe('Nouveau Jalon');
      expect(milestones[0].targetDate).toBe('2024-01-15');
    });
  });

  describe('updateServiceWithUIChanges', () => {
    test('devrait fusionner correctement les modifications partielles', () => {
      // Arrange
      const originalData = { ...mockServiceData };
      const uiChanges = {
        updatedMilestone: {
          id: 'milestone-1',
          title: 'Lancement du site web',
          description: 'Version initiale du site web',
          dueDate: '2024-01-15',
          status: 'in-progress' as const,
          category: 'business' as const,
          progress: 30,
          tasksTotal: 2,
          tasksCompleted: 0,
          comments: []
        }
      };
      
      // Act
      const updatedData = ActionPlanAdapter.updateServiceWithUIChanges(originalData, uiChanges);
      
      // Assert
      expect(updatedData).toBeDefined();
      expect(updatedData.actionPlan).toBeDefined();
      
      // Vérifier que le jalon a été mis à jour
      const milestones = updatedData.actionPlan?.milestones || [];
      const updatedMilestone = milestones.find(m => m.id === 'milestone-1');
      expect(updatedMilestone).toBeDefined();
      expect(updatedMilestone?.title).toBe('Lancement du site web');
      expect(updatedMilestone?.targetDate).toBe('2024-01-15');
      
      // Vérifier que l'autre jalon n'a pas été modifié
      const otherMilestone = milestones.find(m => m.id === 'milestone-2');
      expect(otherMilestone).toBeDefined();
      expect(otherMilestone?.title).toBe('Développement API');
    });

    test('devrait gérer les mises à jour de tâches individuelles', () => {
      // Arrange
      const originalData = { ...mockServiceData };
      const uiChanges = {
        updatedTask: {
          id: 'task-2',
          title: 'Intégration HTML/CSS',
          description: 'Intégrer les maquettes avec des animations CSS',
          dueDate: '2023-12-05',
          status: 'completed' as const,
          priority: 'high' as const,
          milestoneId: 'milestone-1',
          comments: []
        }
      };
      
      // Act
      const updatedData = ActionPlanAdapter.updateServiceWithUIChanges(originalData, uiChanges);
      
      // Assert
      expect(updatedData).toBeDefined();
      expect(updatedData.actionPlan).toBeDefined();
      
      // Vérifier que la tâche a été mise à jour
      const tasks = updatedData.actionPlan?.tasks || [];
      const updatedTask = tasks.find(t => t.id === 'task-2');
      expect(updatedTask).toBeDefined();
      expect(updatedTask?.title).toBe('Intégration HTML/CSS');
      expect(updatedTask?.status).toBe('done');
      expect(updatedTask?.dueDate).toBe('2023-12-05');
      
      // Vérifier que les autres tâches n'ont pas été modifiées
      const otherTask = tasks.find(t => t.id === 'task-1');
      expect(otherTask).toBeDefined();
      expect(otherTask?.title).toBe('Conception maquettes');
    });

    test('devrait gérer les valeurs undefined et null', () => {
      // Arrange
      const originalData = { ...mockServiceData };
      
      // Act
      const nullResult = ActionPlanAdapter.updateServiceWithUIChanges(originalData, null as any);
      const undefinedResult = ActionPlanAdapter.updateServiceWithUIChanges(originalData, undefined as any);
      const emptyResult = ActionPlanAdapter.updateServiceWithUIChanges(originalData, {});
      
      // Assert
      expect(nullResult).toEqual(originalData);
      expect(undefinedResult).toEqual(originalData);
      expect(emptyResult).toEqual(originalData);
    });
  });

  describe('Fonctionnalités additionnelles', () => {
    test('generateCalendarEvents devrait créer des événements de calendrier', () => {
      // Arrange
      const uiData = ActionPlanAdapter.toUI(mockServiceData);
      
      // Act
      const events = ActionPlanAdapter.generateCalendarEvents(uiData.milestones, uiData.tasks);
      
      // Assert
      expect(events).toBeDefined();
      expect(events.length).toBe(3); // 2 milestones + 2 tasks with due dates
      
      // Vérifier les événements de type 'milestone'
      const milestoneEvents = events.filter(e => e.type === 'milestone');
      expect(milestoneEvents.length).toBe(2);
      
      // Vérifier les événements de type 'task'
      const taskEvents = events.filter(e => e.type === 'task');
      expect(taskEvents.length).toBe(1);
    });

    test('generateTimelineItems devrait créer des items de timeline', () => {
      // Arrange
      const uiData = ActionPlanAdapter.toUI(mockServiceData);
      
      // Act
      const timelineItems = ActionPlanAdapter.generateTimelineItems(uiData.milestones, uiData.tasks);
      
      // Assert
      expect(timelineItems).toBeDefined();
      expect(timelineItems.length).toBe(5); // 2 milestones + 3 tasks
      
      // Vérifier les items de type 'milestone'
      const milestoneItems = timelineItems.filter(item => item.type === 'milestone');
      expect(milestoneItems.length).toBe(2);
      
      // Vérifier les items de type 'task'
      const taskItems = timelineItems.filter(item => item.type === 'task');
      expect(taskItems.length).toBe(3);
    });
  });

  describe('Méthodes dépréciées', () => {
    test('transformToDetailedMilestones devrait appeler toDetailedMilestones', () => {
      // Arrange
      const spy = jest.spyOn(ActionPlanAdapter, 'toDetailedMilestones');
      
      // Act
      ActionPlanAdapter.transformToDetailedMilestones(mockServiceData);
      
      // Assert
      expect(spy).toHaveBeenCalledWith(mockServiceData);
      
      // Cleanup
      spy.mockRestore();
    });

    test('transformToDetailedTasks devrait appeler toDetailedTasks', () => {
      // Arrange
      const spy = jest.spyOn(ActionPlanAdapter, 'toDetailedTasks');
      
      // Act
      ActionPlanAdapter.transformToDetailedTasks(mockServiceData);
      
      // Assert
      expect(spy).toHaveBeenCalledWith(mockServiceData);
      
      // Cleanup
      spy.mockRestore();
    });
  });
});
