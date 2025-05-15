# UI Components Migration Guide - Standardized Interfaces

This guide helps developers migrate UI components to use the new standardized interfaces for ActionPlan, BusinessModel, and MarketAnalysis components.

## Overview

The DevIndé Tracker application is migrating to standardized interfaces for its core business components. This migration provides several benefits:

- **Improved Type Safety**: More explicit types with better TypeScript support
- **Consistent Data Structure**: Standardized naming and structure across all modules
- **Enhanced Developer Experience**: Clearer and more intuitive interfaces
- **Better Documentation**: Well-documented interfaces with JSDoc comments

The migration is being implemented progressively to maintain backward compatibility while enabling new UI components to work with the standardized data structures.

## Standardized Interfaces

### ActionPlan

**Old Interface**: 
```typescript
// From dataModels.ts
interface ActionPlanData {
  milestones: Milestone[];
  tasks: Task[];
  startDate?: string;
  endDate?: string;
}

interface Milestone {
  id?: string;
  title: string;
  description: string;
  targetDate: string;
  isCompleted: boolean;
  tasks?: Task[];
}

interface Task {
  id?: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  milestoneId?: string;
}
```

**New Interface**:
```typescript
// From ActionPlanInterfaces.ts
interface MilestoneWithDetails {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  status: ActionItemStatus;
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
  daysRemaining?: number;
  isLate?: boolean;
  dueDate: string;
  comments: TaskComment[];
}

interface TaskWithDetails {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: ActionItemStatus;
  assignee?: string;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  subtasks?: SubTask[];
  dependencies?: string[];
  comments: TaskComment[];
  tags: string[];
  isBlocking?: boolean;
  milestoneId?: string;
}
```

### BusinessModel

**Old Interface**:
```typescript
// From dataModels.ts
interface BusinessModelData {
  hourlyRates: HourlyRate[];
  packages: ServicePackage[];
  subscriptions: Subscription[];
}

interface HourlyRate {
  id?: string;
  serviceType: string;
  rate: number;
  currency: string;
}

interface ServicePackage {
  id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  services: string[];
}
```

**New Interface**:
```typescript
// From BusinessModelInterfaces.ts
interface BusinessModelCanvasData {
  partners: CanvasItem[];
  activities: CanvasItem[];
  resources: CanvasItem[];
  valueProposition: CanvasItem[];
  customerRelations: CanvasItem[];
  channels: CanvasItem[];
  segments: CanvasItem[];
  costStructure: CanvasItem[];
  revenueStreams: CanvasItem[];
}

interface PricingModel {
  hourlyRates: HourlyRateModel[];
  packages: PackageModel[];
  subscriptions: SubscriptionModel[];
  custom: CustomPricingModel[];
}
```

## Migration Strategy for UI Components

### Step 1: Update imports

Replace imports from legacy interfaces with the new standardized ones:

```typescript
// Before
import { ActionPlanData, Milestone, Task } from '../services/interfaces/dataModels';

// After
import {
  MilestoneWithDetails,
  TaskWithDetails,
  ActionItemStatus,
  TaskPriority
} from '../interfaces/ActionPlanInterfaces';
```

### Step 2: Update useActionPlan hook usage

When using the `useActionPlan` hook, switch to the standardized properties:

```typescript
// Before
const { actionPlanData, milestones, tasks } = useActionPlan(businessPlanId);

// After
const { standardizedPlan } = useActionPlan(businessPlanId);
const { milestones, tasks, statistics, viewSettings } = standardizedPlan || {};
```

### Step 3: Update component props and state

Update component props and state to use the standardized interfaces:

```typescript
// Before
interface MilestoneCardProps {
  milestone: Milestone;
  onComplete: (id: string) => void;
}

// After
interface MilestoneCardProps {
  milestone: MilestoneWithDetails;
  onComplete: (id: string) => void;
}
```

### Step 4: Update data manipulation

Update how you interact with the data:

```typescript
// Before - Checking if a milestone is completed
if (milestone.isCompleted) {
  // Do something
}

// After - Using standardized status
if (milestone.status === 'completed') {
  // Do something
}
```

### Step 5: Use enum values instead of string literals

```typescript
// Before
task.status = 'in-progress';

// After
import { ActionItemStatus } from '../interfaces/ActionPlanInterfaces';
task.status = ActionItemStatus.IN_PROGRESS;
```

## Example: Migrating a Component

### Before Migration

```typescript
import React from 'react';
import { Milestone, Task } from '../services/interfaces/dataModels';
import { useActionPlan } from '../hooks/useActionPlan';

interface MilestoneCardProps {
  milestone: Milestone;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone }) => {
  const { tasks, toggleMilestoneCompletion } = useActionPlan();
  
  // Get tasks for this milestone
  const milestoneTasks = tasks.filter(task => task.milestoneId === milestone.id);
  
  return (
    <div className="card">
      <h3>{milestone.title}</h3>
      <p>{milestone.description}</p>
      <p>Due date: {milestone.targetDate}</p>
      <p>Status: {milestone.isCompleted ? 'Completed' : 'In progress'}</p>
      
      <button onClick={() => toggleMilestoneCompletion(milestone.id)}>
        {milestone.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      </button>
      
      <div>
        <h4>Tasks ({milestoneTasks.length})</h4>
        <ul>
          {milestoneTasks.map(task => (
            <li key={task.id}>{task.title} - {task.status}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

### After Migration

```typescript
import React from 'react';
import { 
  MilestoneWithDetails, 
  TaskWithDetails,
  ActionItemStatus
} from '../interfaces/ActionPlanInterfaces';
import { useActionPlan } from '../hooks/useActionPlan';

interface MilestoneCardProps {
  milestone: MilestoneWithDetails;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone }) => {
  const { standardizedPlan, toggleMilestoneCompletion } = useActionPlan();
  
  // Get tasks for this milestone
  const milestoneTasks = standardizedPlan?.tasks.filter(
    task => task.milestoneId === milestone.id
  ) || [];
  
  const isCompleted = milestone.status === ActionItemStatus.COMPLETED;
  
  return (
    <div className="card">
      <h3>{milestone.title}</h3>
      <p>{milestone.description}</p>
      <p>Due date: {milestone.dueDate}</p>
      <p>Status: {isCompleted ? 'Completed' : 'In progress'}</p>
      <p>Progress: {milestone.progress}%</p>
      <p>Tasks: {milestone.tasksCompleted} of {milestone.tasksTotal} completed</p>
      
      <button onClick={() => toggleMilestoneCompletion(milestone.id)}>
        {isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      </button>
      
      <div>
        <h4>Tasks ({milestoneTasks.length})</h4>
        <ul>
          {milestoneTasks.map(task => (
            <li key={task.id}>
              {task.title} - {task.status}
              {task.assignee && <span> (Assigned to: {task.assignee})</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

## Testing the Migration

1. Make sure the migrated hook successfully loads data:
   ```typescript
   const { standardizedPlan, isLoading, error } = useActionPlan(businessPlanId);
   
   if (isLoading) {
     return <Spinner />;
   }
   
   if (error) {
     return <ErrorDisplay message={error} />;
   }
   
   if (!standardizedPlan) {
     return <EmptyState message="No action plan found" />;
   }
   ```

2. Verify that the component renders correctly with the standardized data.

3. Confirm that updates work correctly (create, update, delete operations).

## Progressive Migration Approach

You don't need to migrate all components at once. Follow this approach:

1. First, migrate the hooks to support both legacy and standardized interfaces.
2. Then, migrate individual components one by one, starting with the simplest ones.
3. Test thoroughly after each component migration.
4. Once all components are migrated, you can consider removing the legacy interfaces.

## Need Help?

If you have questions or encounter issues during migration, refer to the following resources:

- Documentation in `/docs/` directory
- Adapter implementations in `/src/app/adapters/` directory
- Standardized interfaces in `/src/app/interfaces/` directory
- React hooks in `/src/app/hooks/` directory