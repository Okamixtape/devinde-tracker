/**
 * Test script for useActionPlan hook migration to standardized interfaces
 * 
 * This script tests that the useActionPlan hook correctly handles
 * both legacy and standardized interfaces.
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useActionPlan } from '../src/app/hooks/useActionPlan';
import { BusinessPlanServiceImpl } from '../src/app/services/core/businessPlanService';

// Mock the BusinessPlanServiceImpl
jest.mock('../src/app/services/core/businessPlanService', () => {
  return {
    BusinessPlanServiceImpl: jest.fn().mockImplementation(() => {
      return {
        getItem: jest.fn().mockResolvedValue({
          success: true,
          data: {
            id: 'test-plan',
            name: 'Test Plan',
            actionPlan: {
              milestones: [
                {
                  id: 'milestone-1',
                  title: 'Test Milestone',
                  description: 'A test milestone',
                  targetDate: '2023-12-31',
                  isCompleted: false
                }
              ],
              tasks: [
                {
                  id: 'task-1',
                  title: 'Test Task',
                  description: 'A test task',
                  status: 'todo',
                  milestoneId: 'milestone-1'
                }
              ]
            },
            standardized: {
              actionPlan: {
                milestones: [
                  {
                    id: 'milestone-1',
                    title: 'Test Milestone',
                    description: 'A test milestone',
                    category: 'business',
                    status: 'planned',
                    progress: 0,
                    tasksTotal: 1,
                    tasksCompleted: 0,
                    dueDate: '2023-12-31',
                    comments: []
                  }
                ],
                tasks: [
                  {
                    id: 'task-1',
                    title: 'Test Task',
                    description: 'A test task',
                    priority: 'normal',
                    status: 'planned',
                    milestoneId: 'milestone-1',
                    comments: []
                  }
                ],
                statistics: {
                  totalMilestones: 1,
                  completedMilestones: 0,
                  upcomingMilestones: 1,
                  lateMilestones: 0,
                  totalTasks: 1,
                  completedTasks: 0,
                  inProgressTasks: 0,
                  lateTasks: 0,
                  completionRate: 0
                },
                viewSettings: {
                  showCompletedTasks: true,
                  showSubtasks: true,
                  defaultView: 'list'
                }
              }
            }
          }
        }),
        updateItem: jest.fn().mockResolvedValue({
          success: true,
          data: {}
        })
      };
    })
  };
});

describe('useActionPlan hook', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should load a business plan with both legacy and standardized data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useActionPlan('test-plan'));
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the async operation to complete
    await waitForNextUpdate();
    
    // Should not be loading anymore
    expect(result.current.isLoading).toBe(false);
    
    // Should have legacy data
    expect(result.current.actionPlanData).not.toBeNull();
    expect(result.current.milestones.length).toBe(1);
    expect(result.current.tasks.length).toBe(1);
    
    // Should have standardized data
    expect(result.current.standardizedPlan).not.toBeNull();
    expect(result.current.standardizedPlan.milestones.length).toBe(1);
    expect(result.current.standardizedPlan.tasks.length).toBe(1);
  });

  it('should create a milestone using legacy interface', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useActionPlan('test-plan'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Create a milestone using legacy interface
    await act(async () => {
      const success = await result.current.createMilestone({
        title: 'New Legacy Milestone',
        description: 'A new milestone using legacy interface',
        targetDate: '2023-12-31',
        isCompleted: false
      });
      
      expect(success).toBe(true);
    });
    
    // The BusinessPlanServiceImpl.updateItem should have been called
    expect(BusinessPlanServiceImpl().updateItem).toHaveBeenCalled();
  });

  it('should create a milestone using standardized interface', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useActionPlan('test-plan'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Create a milestone using standardized interface
    await act(async () => {
      const success = await result.current.createMilestone({
        title: 'New Standardized Milestone',
        description: 'A new milestone using standardized interface',
        category: 'business',
        status: 'planned',
        progress: 0,
        dueDate: '2023-12-31',
        comments: []
      });
      
      expect(success).toBe(true);
    });
    
    // The BusinessPlanServiceImpl.updateItem should have been called
    expect(BusinessPlanServiceImpl().updateItem).toHaveBeenCalled();
  });

  it('should create a task using legacy interface', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useActionPlan('test-plan'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Create a task using legacy interface
    await act(async () => {
      const success = await result.current.createTask({
        title: 'New Legacy Task',
        description: 'A new task using legacy interface',
        status: 'todo',
        milestoneId: 'milestone-1'
      });
      
      expect(success).toBe(true);
    });
    
    // The BusinessPlanServiceImpl.updateItem should have been called
    expect(BusinessPlanServiceImpl().updateItem).toHaveBeenCalled();
  });

  it('should create a task using standardized interface', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useActionPlan('test-plan'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Create a task using standardized interface
    await act(async () => {
      const success = await result.current.createTask({
        title: 'New Standardized Task',
        description: 'A new task using standardized interface',
        priority: 'normal',
        status: 'planned',
        milestoneId: 'milestone-1',
        comments: []
      });
      
      expect(success).toBe(true);
    });
    
    // The BusinessPlanServiceImpl.updateItem should have been called
    expect(BusinessPlanServiceImpl().updateItem).toHaveBeenCalled();
  });

  it('should update task status with legacy status string', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useActionPlan('test-plan'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Update task status using legacy status
    await act(async () => {
      const success = await result.current.updateTaskStatus('task-1', 'in-progress');
      
      expect(success).toBe(true);
    });
    
    // The BusinessPlanServiceImpl.updateItem should have been called
    expect(BusinessPlanServiceImpl().updateItem).toHaveBeenCalled();
  });

  it('should update task status with standardized status', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useActionPlan('test-plan'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Update task status using standardized status
    await act(async () => {
      const success = await result.current.updateTaskStatus('task-1', 'completed');
      
      expect(success).toBe(true);
    });
    
    // The BusinessPlanServiceImpl.updateItem should have been called
    expect(BusinessPlanServiceImpl().updateItem).toHaveBeenCalled();
  });
});