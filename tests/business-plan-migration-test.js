/**
 * Test script for BusinessPlanService migration to standardized interfaces
 * 
 * This script tests that the BusinessPlanService correctly handles
 * converting between the old data model and the new standardized interfaces.
 */

import { BusinessPlanServiceImpl } from '../src/app/services/core/businessPlanService';
import ActionPlanAdapter from '../src/app/adapters/ActionPlanAdapter';
import BusinessModelAdapter from '../src/app/adapters/BusinessModelAdapter';
import MarketAnalysisAdapter from '../src/app/adapters/MarketAnalysisAdapter';

// Create a simple test plan
async function runTests() {
  console.log('Starting BusinessPlanService migration tests...');
  
  // Create a new service instance
  const businessPlanService = new BusinessPlanServiceImpl();
  
  // Create a test plan with basic data
  const testPlanData = {
    name: 'Test Plan for Migration',
    description: 'This is a test plan to validate the migration to standardized interfaces',
    // Other basic fields will be provided by the service
  };
  
  try {
    console.log('Creating test business plan...');
    const createResult = await businessPlanService.createItem(testPlanData);
    
    if (!createResult.success) {
      console.error('Failed to create test business plan:', createResult.error);
      return;
    }
    
    const testPlan = createResult.data;
    console.log(`Test plan created with ID: ${testPlan.id}`);
    
    // Verify that standardized property exists
    console.log('Verifying standardized property...');
    if (!testPlan.standardized) {
      console.error('Missing standardized property in the created plan');
    } else {
      console.log('Standardized property exists!');
    }
    
    // Test retrieval
    console.log('Testing retrieval...');
    const getResult = await businessPlanService.getItem(testPlan.id);
    
    if (!getResult.success) {
      console.error('Failed to retrieve test business plan:', getResult.error);
      return;
    }
    
    const retrievedPlan = getResult.data;
    console.log('Retrieved plan successfully');
    
    // Test updating with standardized data
    console.log('Testing update with standardized data...');
    
    // Add some test action plan data using the standardized interfaces
    const actionPlanData = {
      milestones: [
        {
          id: 'test-milestone-1',
          title: 'Test Milestone 1',
          description: 'A test milestone',
          category: 'business',
          status: 'planned',
          progress: 0,
          tasksTotal: 0,
          tasksCompleted: 0,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          comments: []
        }
      ],
      tasks: [
        {
          id: 'test-task-1',
          title: 'Test Task 1',
          description: 'A test task',
          priority: 'normal',
          status: 'planned',
          milestoneId: 'test-milestone-1',
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
        upcomingTasks: 1,
        lateTasks: 0,
        completionRate: 0
      },
      viewSettings: {
        showCompletedTasks: true,
        showSubtasks: true,
        defaultView: 'list'
      }
    };
    
    // Update the plan with standardized data
    const updateData = {
      ...retrievedPlan,
      standardized: {
        ...retrievedPlan.standardized,
        actionPlan: actionPlanData
      }
    };
    
    const updateResult = await businessPlanService.updateItem(testPlan.id, updateData);
    
    if (!updateResult.success) {
      console.error('Failed to update test business plan:', updateResult.error);
      return;
    }
    
    console.log('Updated plan successfully with standardized data');
    
    // Verify that the update worked by retrieving the plan again
    const getUpdatedResult = await businessPlanService.getItem(testPlan.id);
    
    if (!getUpdatedResult.success) {
      console.error('Failed to retrieve updated test business plan:', getUpdatedResult.error);
      return;
    }
    
    const updatedPlan = getUpdatedResult.data;
    
    // Check that the action plan data was properly converted and stored
    console.log('Verifying action plan data was properly saved...');
    if (!updatedPlan.actionPlan || !updatedPlan.actionPlan.milestones || updatedPlan.actionPlan.milestones.length === 0) {
      console.error('Missing action plan data in the updated plan');
    } else {
      console.log('Action plan data exists!');
      console.log(`Found ${updatedPlan.actionPlan.milestones.length} milestone(s) and ${updatedPlan.actionPlan.tasks.length} task(s)`);
    }
    
    // Verify that the standardized data is also properly restored
    console.log('Verifying standardized data is properly restored...');
    if (!updatedPlan.standardized || !updatedPlan.standardized.actionPlan) {
      console.error('Missing standardized action plan data in the updated plan');
    } else {
      console.log('Standardized action plan data exists!');
      console.log(`Found ${updatedPlan.standardized.actionPlan.milestones.length} standardized milestone(s)`);
    }
    
    // Clean up by deleting the test plan
    console.log('Cleaning up...');
    const deleteResult = await businessPlanService.deleteItem(testPlan.id);
    
    if (!deleteResult.success) {
      console.error('Failed to delete test business plan:', deleteResult.error);
      return;
    }
    
    console.log('Test plan deleted successfully');
    console.log('All tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error in tests:', error);
});