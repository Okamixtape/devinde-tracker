# DevIndé Tracker - Data Access Patterns

## 1. Introduction

This document provides comprehensive documentation of data access patterns, query optimization guidelines, and data lifecycle management procedures for the DevIndé Tracker application. It builds upon the database schema and indexing strategy defined in the previous documents.

## 2. Common Data Access Patterns

This section outlines the most common data access patterns in the DevIndé Tracker application, providing recommended implementation approaches for each pattern.

### 2.1. Business Plan Management

#### 2.1.1. Fetching a Single Business Plan

**Access Pattern:** Retrieve a complete business plan with its associated metadata and settings.

**Implementation:**

```typescript
// Using localStorage
function getBusinessPlan(id: string): BusinessPlanData | null {
  const allPlans = JSON.parse(localStorage.getItem('devinde-tracker-plans') || '[]');
  return allPlans.find(plan => plan.id === id) || null;
}

// Future API implementation
async function getBusinessPlan(id: string): Promise<BusinessPlanData> {
  const response = await fetch(`/api/business-plans/${id}`);
  if (!response.ok) throw new Error('Failed to fetch business plan');
  return response.json();
}
```

**Query Example (SQL):**

```sql
SELECT 
  bp.id, bp.user_id, bp.name, bp.created_at, bp.updated_at,
  bpm.last_updated, bpm.version, bpm.export_count,
  us.theme, us.language, us.notifications
FROM 
  business_plans bp
LEFT JOIN 
  business_plan_meta bpm ON bp.id = bpm.business_plan_id
LEFT JOIN 
  user_settings us ON bp.id = us.business_plan_id
WHERE 
  bp.id = :business_plan_id;
```

#### 2.1.2. Listing User's Business Plans

**Access Pattern:** Retrieve a list of all business plans owned by a specific user.

**Implementation:**

```typescript
// Using localStorage
function getUserBusinessPlans(userId: string): BusinessPlanSummary[] {
  const allPlans = JSON.parse(localStorage.getItem('devinde-tracker-plans') || '[]');
  return allPlans
    .filter(plan => plan.userId === userId)
    .map(({ id, name, createdAt, updatedAt }) => ({ 
      id, name, createdAt, updatedAt 
    }));
}

// Future API implementation
async function getUserBusinessPlans(userId: string): Promise<BusinessPlanSummary[]> {
  const response = await fetch(`/api/users/${userId}/business-plans`);
  if (!response.ok) throw new Error('Failed to fetch user business plans');
  return response.json();
}
```

**Query Example (SQL):**

```sql
SELECT 
  id, name, created_at, updated_at
FROM 
  business_plans
WHERE 
  user_id = :user_id
ORDER BY 
  updated_at DESC;
```

### 2.2. Section Management

#### 2.2.1. Fetching Sections for a Business Plan

**Access Pattern:** Retrieve all sections belonging to a specific business plan.

**Implementation:**

```typescript
// Using localStorage
function getBusinessPlanSections(businessPlanId: string): Section[] {
  const businessPlan = getBusinessPlan(businessPlanId);
  return businessPlan?.sections || [];
}

// Future API implementation
async function getBusinessPlanSections(businessPlanId: string): Promise<Section[]> {
  const response = await fetch(`/api/business-plans/${businessPlanId}/sections`);
  if (!response.ok) throw new Error('Failed to fetch sections');
  return response.json();
}
```

**Query Example (SQL):**

```sql
SELECT 
  id, key, title, icon, color, completion, route
FROM 
  sections
WHERE 
  business_plan_id = :business_plan_id
ORDER BY 
  key;
```

#### 2.2.2. Updating Section Completion Status

**Access Pattern:** Update the completion percentage of a specific section.

**Implementation:**

```typescript
// Using localStorage
function updateSectionCompletion(sectionId: string, completion: number): void {
  const allPlans = JSON.parse(localStorage.getItem('devinde-tracker-plans') || '[]');
  
  // Find the plan containing this section
  for (const plan of allPlans) {
    const sectionIndex = plan.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex !== -1) {
      plan.sections[sectionIndex].completion = Math.min(100, Math.max(0, completion));
      localStorage.setItem('devinde-tracker-plans', JSON.stringify(allPlans));
      break;
    }
  }
}

// Future API implementation
async function updateSectionCompletion(sectionId: string, completion: number): Promise<void> {
  const response = await fetch(`/api/sections/${sectionId}/completion`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completion: Math.min(100, Math.max(0, completion)) }),
  });
  
  if (!response.ok) throw new Error('Failed to update section completion');
}
```

**Query Example (SQL):**

```sql
UPDATE 
  sections
SET 
  completion = :completion
WHERE 
  id = :section_id;
```

### 2.3. Section Data Management

#### 2.3.1. Fetching Section Data

**Access Pattern:** Retrieve all data associated with a specific section.

**Implementation:**

```typescript
// Using localStorage
function getSectionData(sectionId: string): Record<string, any> {
  const allPlans = JSON.parse(localStorage.getItem('devinde-tracker-plans') || '[]');
  
  // Find the plan containing this section
  for (const plan of allPlans) {
    const section = plan.sections.find(s => s.id === sectionId);
    if (section) {
      return section.data || {};
    }
  }
  
  return {};
}

// Future API implementation
async function getSectionData(sectionId: string): Promise<Record<string, any>> {
  const response = await fetch(`/api/sections/${sectionId}/data`);
  if (!response.ok) throw new Error('Failed to fetch section data');
  return response.json();
}
```

**Query Example (SQL):**

```sql
SELECT 
  data_key, data_value, updated_at
FROM 
  section_data
WHERE 
  section_id = :section_id;
```

#### 2.3.2. Updating Section Data

**Access Pattern:** Update specific data fields within a section.

**Implementation:**

```typescript
// Using localStorage
function updateSectionData(sectionId: string, dataKey: string, dataValue: any): void {
  const allPlans = JSON.parse(localStorage.getItem('devinde-tracker-plans') || '[]');
  
  // Find the plan containing this section
  for (const plan of allPlans) {
    const sectionIndex = plan.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex !== -1) {
      if (!plan.sections[sectionIndex].data) {
        plan.sections[sectionIndex].data = {};
      }
      
      plan.sections[sectionIndex].data[dataKey] = dataValue;
      plan.sections[sectionIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('devinde-tracker-plans', JSON.stringify(allPlans));
      break;
    }
  }
}

// Future API implementation
async function updateSectionData(sectionId: string, dataKey: string, dataValue: any): Promise<void> {
  const response = await fetch(`/api/sections/${sectionId}/data/${dataKey}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value: dataValue }),
  });
  
  if (!response.ok) throw new Error('Failed to update section data');
}
```

**Query Example (SQL):**

```sql
INSERT INTO section_data (id, section_id, data_key, data_value, updated_at)
VALUES (UUID(), :section_id, :data_key, :data_value, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE
  data_value = :data_value,
  updated_at = CURRENT_TIMESTAMP;
```

## 3. Query Optimization Guidelines

This section provides guidelines for optimizing data access in the DevIndé Tracker application.

### 3.1. Client-Side Query Optimization

#### 3.1.1. Batch Loading

When multiple items need to be loaded, use batch loading instead of individual requests:

```typescript
// AVOID: Multiple individual requests
async function loadDashboardBad(businessPlanId: string) {
  const businessPlan = await getBusinessPlan(businessPlanId);
  const sections = await getBusinessPlanSections(businessPlanId);
  const metadata = await getBusinessPlanMetadata(businessPlanId);
  // Individual requests for each dependency
}

// BETTER: Batch loading
async function loadDashboardGood(businessPlanId: string) {
  const dashboardData = await fetchDashboardData(businessPlanId);
  // Single request that returns all necessary data
}
```

#### 3.1.2. Lazy Loading

Use lazy loading for data that isn't immediately needed:

```typescript
function SectionComponent({ sectionId }) {
  const [sectionData, setSectionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadSectionData = useCallback(async () => {
    if (!sectionData && !isLoading) {
      setIsLoading(true);
      try {
        const data = await getSectionData(sectionId);
        setSectionData(data);
      } finally {
        setIsLoading(false);
      }
    }
  }, [sectionId, sectionData, isLoading]);
  
  // Load data when component becomes visible or on user interaction
  // instead of loading all section data upfront
}
```

### 3.2. Server-Side Query Optimization

#### 3.2.1. Select Only Required Columns

```sql
-- AVOID: Selecting all columns
SELECT * FROM business_plans WHERE id = :id;

-- BETTER: Select only required columns
SELECT id, name, created_at FROM business_plans WHERE id = :id;
```

#### 3.2.2. Use Appropriate Indexes

Ensure queries use indexed columns in WHERE clauses:

```sql
-- GOOD: Using indexed column
SELECT * FROM sections WHERE business_plan_id = :id;

-- GOOD: Using composite index
SELECT * FROM resource_allocations 
WHERE action_plan_id = :id 
  AND start_date BETWEEN :start AND :end;
```

#### 3.2.3. Pagination for Large Result Sets

```sql
-- GOOD: Using pagination
SELECT * FROM sections 
WHERE business_plan_id = :id
ORDER BY key
LIMIT :page_size OFFSET :offset;
```

## 4. Data Lifecycle Management

This section outlines procedures for managing the lifecycle of data in the DevIndé Tracker application.

### 4.1. Data Creation

#### 4.1.1. Business Plan Creation

```typescript
function createBusinessPlan(name: string, userId?: string): BusinessPlanData {
  const id = generateUUID();
  const timestamp = new Date().toISOString();
  
  const newPlan = {
    id,
    userId,
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
    meta: {
      lastUpdated: timestamp,
      version: 1,
      exportCount: 0
    },
    settings: {
      theme: 'light',
      language: 'en',
      notifications: false
    },
    sections: [
      // Default sections
    ]
  };
  
  // Save to localStorage
  const allPlans = JSON.parse(localStorage.getItem('devinde-tracker-plans') || '[]');
  allPlans.push(newPlan);
  localStorage.setItem('devinde-tracker-plans', JSON.stringify(allPlans));
  
  return newPlan;
}
```

### 4.2. Data Archiving

#### 4.2.1. Business Plan Export and Archiving

```typescript
function exportBusinessPlan(id: string): ExportedBusinessPlan {
  const businessPlan = getBusinessPlan(id);
  if (!businessPlan) throw new Error('Business plan not found');
  
  // Increment export count
  const allPlans = JSON.parse(localStorage.getItem('devinde-tracker-plans') || '[]');
  const planIndex = allPlans.findIndex(p => p.id === id);
  if (planIndex !== -1) {
    allPlans[planIndex].meta.exportCount += 1;
    localStorage.setItem('devinde-tracker-plans', JSON.stringify(allPlans));
  }
  
  // Format for export
  return {
    name: businessPlan.name,
    createdAt: businessPlan.createdAt,
    updatedAt: businessPlan.updatedAt,
    exportedAt: new Date().toISOString(),
    sections: businessPlan.sections.map(section => ({
      title: section.title,
      key: section.key,
      completion: section.completion,
      data: section.data
    }))
  };
}
```

### 4.3. Data Deletion

#### 4.3.1. Business Plan Deletion

```typescript
function deleteBusinessPlan(id: string): boolean {
  const allPlans = JSON.parse(localStorage.getItem('devinde-tracker-plans') || '[]');
  const initialCount = allPlans.length;
  
  const filteredPlans = allPlans.filter(plan => plan.id !== id);
  localStorage.setItem('devinde-tracker-plans', JSON.stringify(filteredPlans));
  
  return filteredPlans.length < initialCount;
}
```

### 4.4. Data Migration

#### 4.4.1. Schema Migration Strategy

For future schema migrations:

1. Define version number in business plan metadata
2. Check version on load and apply migrations if needed
3. Update version number after migration

```typescript
function migrateBusinessPlanData(businessPlan: any): BusinessPlanData {
  const version = businessPlan.meta?.version || 1;
  
  let migratedPlan = { ...businessPlan };
  
  // Apply migrations based on version
  if (version < 2) {
    // Migration to version 2
    migratedPlan = migrateToV2(migratedPlan);
  }
  
  if (version < 3) {
    // Migration to version 3
    migratedPlan = migrateToV3(migratedPlan);
  }
  
  // Update version
  migratedPlan.meta.version = 3; // Current version
  
  return migratedPlan;
}
```

## 5. Maintenance Guidelines

This section provides guidelines for maintaining the data layer of the DevIndé Tracker application.

### 5.1. Performance Monitoring

#### 5.1.1. Client-Side Performance Monitoring

```typescript
// Measure and log operation durations
function measureOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
  const startTime = performance.now();
  
  return operation().then(result => {
    const duration = performance.now() - startTime;
    
    // Log performance metric
    console.log(`Operation ${name} took ${duration.toFixed(2)}ms`);
    
    // In a production app, send to analytics service
    // logPerformanceMetric(name, duration);
    
    return result;
  });
}

// Usage example
await measureOperation('loadDashboard', () => loadDashboardData(businessPlanId));
```

#### 5.1.2. Database Performance Monitoring

For future server-side implementation:

```sql
-- Example for logging slow queries in MySQL
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1; -- Log queries taking longer than 1 second
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow-queries.log';
```

### 5.2. Data Integrity

#### 5.2.1. Validation Rules

Client-side validation:

```typescript
function validateBusinessPlanName(name: string): boolean {
  return name.length >= 3 && name.length <= 100;
}

function validateSectionData(sectionKey: string, data: any): boolean {
  // Validation rules specific to each section type
  switch (sectionKey) {
    case 'businessModel':
      return (
        data.valueProposition &&
        data.customerSegments &&
        data.revenueStreams
      );
    
    case 'financials':
      return (
        data.expenses &&
        data.revenue &&
        data.cashFlow &&
        data.projections &&
        data.pricing
      );
    
    // Other section validations
    
    default:
      return true;
  }
}
```

#### 5.2.2. Data Consistency Checks

```typescript
function checkBusinessPlanConsistency(businessPlan: BusinessPlanData): string[] {
  const issues = [];
  
  // Check if all required fields are present
  if (!businessPlan.id) issues.push('Missing ID');
  if (!businessPlan.name) issues.push('Missing name');
  if (!businessPlan.createdAt) issues.push('Missing creation timestamp');
  
  // Check section consistency
  if (!businessPlan.sections || !Array.isArray(businessPlan.sections)) {
    issues.push('Missing or invalid sections array');
  } else {
    // Check each section
    businessPlan.sections.forEach(section => {
      if (!section.id) issues.push(`Section missing ID: ${section.key || 'unknown'}`);
      if (!section.key) issues.push(`Section missing key: ${section.id || 'unknown'}`);
      
      // Check for duplicate section keys
      const keyCount = businessPlan.sections.filter(s => s.key === section.key).length;
      if (keyCount > 1) issues.push(`Duplicate section key: ${section.key}`);
    });
  }
  
  return issues;
}
```

## 6. Implementation Examples

This section provides complete implementation examples for common operations.

### 6.1. Creating a New Business Plan

```typescript
// src/services/businessPlanService.ts

import { v4 as uuidv4 } from 'uuid';
import { BusinessPlanData, Section } from '../types/database';

// Default sections for a new business plan
const DEFAULT_SECTIONS: Omit<Section, 'id' | 'businessPlanId'>[] = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    icon: 'home',
    color: '#4285F4',
    completion: 0,
    route: '/dashboard'
  },
  {
    key: 'businessModel',
    title: 'Business Model',
    icon: 'briefcase',
    color: '#34A853',
    completion: 0,
    route: '/business-model'
  },
  // Other default sections...
];

export function createBusinessPlan(name: string, userId?: string): BusinessPlanData {
  const now = new Date().toISOString();
  const businessPlanId = uuidv4();
  
  // Create sections with unique IDs
  const sections = DEFAULT_SECTIONS.map(section => ({
    ...section,
    id: uuidv4(),
    businessPlanId,
    data: {}
  }));
  
  const newPlan: BusinessPlanData = {
    id: businessPlanId,
    userId,
    name,
    createdAt: now,
    updatedAt: now,
    meta: {
      lastUpdated: now,
      version: 1,
      exportCount: 0
    },
    settings: {
      theme: 'light',
      language: 'en',
      notifications: false
    },
    sections
  };
  
  // Save to localStorage
  saveBusinessPlan(newPlan);
  
  return newPlan;
}

function saveBusinessPlan(businessPlan: BusinessPlanData): void {
  const STORAGE_KEY = 'devinde-tracker-plans';
  const allPlans = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  // Check if plan already exists
  const existingPlanIndex = allPlans.findIndex(plan => plan.id === businessPlan.id);
  
  if (existingPlanIndex !== -1) {
    // Update existing plan
    allPlans[existingPlanIndex] = businessPlan;
  } else {
    // Add new plan
    allPlans.push(businessPlan);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlans));
}
```

### 6.2. Fetching and Updating Section Data

```typescript
// src/services/sectionService.ts

export function getSectionData(sectionId: string): Record<string, any> {
  const STORAGE_KEY = 'devinde-tracker-plans';
  const allPlans = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  // Find the section
  for (const plan of allPlans) {
    const section = plan.sections.find(s => s.id === sectionId);
    if (section) {
      return section.data || {};
    }
  }
  
  return {};
}

export function updateSectionData(
  sectionId: string, 
  dataUpdates: Record<string, any>
): boolean {
  const STORAGE_KEY = 'devinde-tracker-plans';
  const allPlans = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  let updated = false;
  
  // Find and update the section
  for (const plan of allPlans) {
    const sectionIndex = plan.sections.findIndex(s => s.id === sectionId);
    
    if (sectionIndex !== -1) {
      // Initialize data if it doesn't exist
      if (!plan.sections[sectionIndex].data) {
        plan.sections[sectionIndex].data = {};
      }
      
      // Apply updates
      plan.sections[sectionIndex].data = {
        ...plan.sections[sectionIndex].data,
        ...dataUpdates
      };
      
      // Update timestamps
      const now = new Date().toISOString();
      plan.sections[sectionIndex].updatedAt = now;
      plan.updatedAt = now;
      plan.meta.lastUpdated = now;
      
      // Calculate completion if needed
      updateSectionCompletion(plan, sectionIndex);
      
      updated = true;
      break;
    }
  }
  
  if (updated) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlans));
  }
  
  return updated;
}

// Helper function to update section completion based on its data
function updateSectionCompletion(plan, sectionIndex): void {
  const section = plan.sections[sectionIndex];
  const data = section.data || {};
  
  // Different completion calculation logic for each section type
  switch (section.key) {
    case 'businessModel':
      // Sample logic - customize for each section
      const totalFields = 4;
      const completedFields = [
        data.valueProposition, 
        data.customerSegments,
        data.channels,
        data.revenueStreams
      ].filter(Boolean).length;
      
      section.completion = Math.round((completedFields / totalFields) * 100);
      break;
    
    // Other section types...
    
    default:
      // Default: don't change completion
      break;
  }
}
```

## 7. Conclusion

This document has outlined the comprehensive data access patterns for the DevIndé Tracker application. By following these guidelines and examples, developers can ensure efficient, consistent, and maintainable data operations throughout the application lifecycle.

The patterns and strategies described are designed to work with the current localStorage implementation while providing a clear path for future migration to a server-based database when required. Adhering to these patterns will ensure a smooth transition and consistent application behavior across different data storage technologies.
