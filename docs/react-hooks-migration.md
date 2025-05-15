# React Hooks Migration to Standardized Interfaces

## Overview

This document describes the migration of React hooks to use the new standardized interfaces for ActionPlan, BusinessModel, and MarketAnalysis components. The migration adopts a progressive approach to maintain backward compatibility while enabling new UI components to work with the standardized data structures.

## Hooks Migration Status

| Hook                | Status      | Standardized Interface Support |
|---------------------|-------------|--------------------------------|
| useActionPlan       | Completed   | ✅ Full support                |
| useBusinessModel    | Planned     | ❌ Not started                 |
| useMarketAnalysis   | Planned     | ❌ Not started                 |
| useBusinessPlan     | Planned     | ❌ Not started                 |
| useFinancialProjects| Planned     | ❌ Not started                 |

## Changes Made to useActionPlan

### 1. Updated Imports

Added imports for the standardized interfaces from:
- `ActionPlanInterfaces.ts`

Added imports for the adapters:
- `ActionPlanAdapter`

### 2. Updated Result Interface

Extended the `UseActionPlanResult` interface to include standardized data:

```typescript
interface UseActionPlanResult {
  // Legacy data format (for backward compatibility)
  actionPlanData: ActionPlanData | null;
  milestones: MilestoneWithProgress[];
  tasks: TaskWithRelations[];
  
  // Standardized data format (new UI components should use these)
  standardizedPlan: {
    milestones: MilestoneWithDetails[];
    tasks: TaskWithDetails[];
    statistics: ActionPlanStatistics;
    viewSettings: ActionPlanViewSettings;
  } | null;
  
  // ... methods and state
}
```

### 3. Enhanced Methods

Modified methods to support both legacy and standardized interfaces:

- `loadActionPlan`: Now loads both legacy and standardized data
- `saveActionPlan`: Now saves changes to both legacy and standardized formats
- `createMilestone`: Now accepts both legacy and standardized milestone formats
- `updateMilestone`: Now accepts both legacy and standardized milestone formats
- `createTask`: Now accepts both legacy and standardized task formats
- `updateTask`: Now accepts both legacy and standardized task formats
- `updateTaskStatus`: Now accepts both legacy and standardized status values

### 4. State Management

Added new state to track standardized data:

```typescript
const [standardizedPlan, setStandardizedPlan] = useState<{
  milestones: MilestoneWithDetails[];
  tasks: TaskWithDetails[];
  statistics: ActionPlanStatistics;
  viewSettings: ActionPlanViewSettings;
} | null>(null);
```

### 5. Added Test File

A test script (`tests/useActionPlan-migration-test.js`) has been created to validate:
- Loading of business plans with standardized interfaces
- Creating milestones using both legacy and standardized interfaces
- Creating tasks using both legacy and standardized interfaces
- Updating task status using both legacy and standardized values

## Migration Approach

The migration follows a progressive approach:

1. **Dual Interface Support**: The hook now supports both legacy and standardized interfaces
2. **Bidirectional Conversion**: Handles conversion in both directions (service to UI and UI to service)
3. **Backward Compatibility**: Maintains the old interface structure while supporting the new one
4. **Forward Compatibility**: New data can be stored in standardized format for future use

## Usage in Components

Components can now use the hook in one of two ways:

### Legacy Mode

```typescript
const { actionPlanData, milestones, tasks } = useActionPlan(businessPlanId);
```

### Standardized Mode

```typescript
const { standardizedPlan } = useActionPlan(businessPlanId);
const { milestones, tasks, statistics, viewSettings } = standardizedPlan;
```

## Testing

To test the migration:

1. Run the test script:
   ```
   npm test tests/useActionPlan-migration-test.js
   ```

2. Verify that all operations work correctly:
   - Loading a business plan with standardized data
   - Creating milestones and tasks using both interfaces
   - Updating task status using both formats

## Potential Issues and Mitigations

### Data Inconsistency

**Issue**: Inconsistency between legacy and standardized data during transitions.

**Mitigation**: The hook ensures both formats are kept in sync. When data is modified using either interface, both are updated together.

### Performance Impact

**Issue**: Potential performance impact from additional data conversion.

**Mitigation**: Data conversion happens only when needed, and adapters are optimized for performance.

## Next Steps

1. Migrate the remaining hooks to use standardized interfaces:
   - useBusinessModel
   - useMarketAnalysis
   - useBusinessPlan
   - useFinancialProjects

2. Update UI components to use the standardized data formats.

3. Add more comprehensive tests for the migrated hooks.