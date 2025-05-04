# DevIndé Tracker - Indexing and Performance Strategy

## 1. Introduction

This document outlines the indexing and performance strategy for the DevIndé Tracker application's database. While the current implementation uses localStorage for data persistence, this strategy is designed to support future migration to a server-side database system and ensure scalable performance as the application grows.

## 2. Query Pattern Analysis

Before defining the indexing strategy, we've analyzed the expected query patterns based on the application's user flows and requirements:

### 2.1. High-Frequency Queries

| Query Pattern | Description | Access Type | Frequency |
|---------------|-------------|-------------|-----------|
| Business Plan Retrieval | Fetch a business plan by ID | Primary Key Lookup | Very High |
| Section Listing | List all sections for a business plan | Foreign Key Lookup | Very High |
| Section Data Retrieval | Fetch data for a specific section | Composite Lookup | Very High |
| User Business Plan Listing | List all business plans for a user | Secondary Index Lookup | High |
| Section Completion Status | Check completion status across sections | Range Scan | High |
| Resource Allocation Timeline | Fetch resources within a date range | Range Scan | Medium |
| Business Plan Search | Search plans by name | Full-Text Search | Low |

### 2.2. Write-Heavy Operations

| Operation | Description | Frequency |
|-----------|-------------|-----------|
| Section Data Updates | Updates to individual section data fields | Very High |
| Completion Status Updates | Updates to section completion percentages | High |
| Business Plan Metadata Updates | Updates to last updated timestamp, version, etc. | High |
| New Resource Allocations | Creation of new resource allocation records | Medium |
| New Business Plan Creation | Creation of new business plans | Low |

## 3. Indexing Strategy

Based on the query pattern analysis, we have designed the following indexing strategy:

### 3.1. Primary and Unique Indexes

These indexes are already defined in the database schema through primary key and unique constraints:

| Table | Index Type | Columns | Purpose |
|-------|------------|---------|---------|
| All Tables | Primary Key | id | Efficient record lookup |
| business_plans | Unique | user_id, name | Prevent duplicate plan names per user |
| sections | Unique | business_plan_id, key | Ensure section key uniqueness within a plan |
| section_data | Unique | section_id, data_key | Ensure data key uniqueness within a section |
| All specialized section tables | Unique | section_id | One-to-one relationship with sections |
| user_settings | Unique | business_plan_id | One-to-one relationship with business plans |
| user_profiles | Unique | user_id, email | User uniqueness |

### 3.2. Secondary Indexes

These additional indexes optimize specific query patterns:

| Table | Index Type | Columns | Purpose |
|-------|------------|---------|---------|
| business_plans | Secondary | user_id | Fast lookup of user's business plans |
| sections | Secondary | business_plan_id | Quick access to all sections of a plan |
| sections | Secondary | business_plan_id, completion | Filter sections by completion status |
| section_data | Secondary | section_id, updated_at | Find recently updated section data |
| resource_allocations | Secondary | action_plan_id, start_date, end_date | Efficient date range queries |
| resource_allocations | Secondary | resource_type | Filter resources by type |

### 3.3. Composite Indexes

These specialized indexes optimize complex query patterns:

| Table | Index Columns | Query Pattern |
|-------|---------------|---------------|
| sections | (business_plan_id, key, completion) | Filter sections by key and completion status |
| section_data | (section_id, data_key, updated_at) | Find recent updates to specific data fields |
| resource_allocations | (action_plan_id, resource_type, start_date) | Resource timeline filtering |

### 3.4. Index Creation SQL Script

```sql
-- Primary and Unique indexes are already created with table definitions

-- Secondary indexes for business_plans
CREATE INDEX idx_business_plans_user_id ON business_plans(user_id);
CREATE INDEX idx_business_plans_created_at ON business_plans(created_at);

-- Secondary indexes for sections
CREATE INDEX idx_sections_business_plan_id ON sections(business_plan_id);
CREATE INDEX idx_sections_business_plan_completion ON sections(business_plan_id, completion);

-- Secondary indexes for section_data
CREATE INDEX idx_section_data_section_id ON section_data(section_id);
CREATE INDEX idx_section_data_section_updated ON section_data(section_id, updated_at);

-- Secondary indexes for specialized sections (as needed)
CREATE INDEX idx_action_plans_section_id ON action_plans(section_id);

-- Secondary indexes for resource_allocations
CREATE INDEX idx_resource_allocations_action_plan_id ON resource_allocations(action_plan_id);
CREATE INDEX idx_resource_allocations_date_range ON resource_allocations(start_date, end_date);
CREATE INDEX idx_resource_allocations_resource_type ON resource_allocations(resource_type);

-- Composite indexes for complex queries
CREATE INDEX idx_section_data_key_updated ON section_data(section_id, data_key, updated_at);
CREATE INDEX idx_resource_timeline ON resource_allocations(action_plan_id, resource_type, start_date);
```

## 4. Partitioning Strategy

For the current scale of the DevIndé Tracker application, partitioning is not immediately necessary. However, we've identified potential partition strategies for future scaling:

### 4.1. Horizontal Partitioning (Sharding)

#### 4.1.1. User-Based Sharding

If the application scales to many users, we can horizontally partition data by user_id:

| Partition | Data Range |
|-----------|------------|
| user_shard_1 | user_id range A-E |
| user_shard_2 | user_id range F-K |
| user_shard_3 | user_id range L-P |
| user_shard_4 | user_id range Q-Z |

This approach ensures that all data for a specific user is co-located, optimizing the most common access patterns.

#### 4.1.2. Implementation Example

```sql
-- Example for PostgreSQL using table inheritance
CREATE TABLE business_plans_p1 (
    CHECK (substring(user_id, 1, 1) BETWEEN 'A' AND 'E')
) INHERITS (business_plans);

CREATE TABLE business_plans_p2 (
    CHECK (substring(user_id, 1, 1) BETWEEN 'F' AND 'K')
) INHERITS (business_plans);

-- Additional partitions and trigger function would be needed
```

### 4.2. Vertical Partitioning

For tables that grow significantly larger than others (like section_data), vertical partitioning could be applied to separate frequently accessed columns from rarely accessed ones:

| Table | Frequent Access Columns | Archive Columns |
|-------|-------------------------|-----------------|
| section_data | section_id, data_key, updated_at | historical versions |
| financials | current projections | historical projections |

## 5. Data Caching Strategy

To optimize performance, especially for frequently accessed data, we propose the following caching strategy:

### 5.1. Cache Levels

| Cache Level | Data Stored | TTL | Invalidation Strategy |
|-------------|-------------|-----|------------------------|
| Client-side | Current business plan, sections | Session | On write operations |
| Application-level | User business plans list, reference data | 5 minutes | Time-based + explicit |
| Database-level | Frequent query results | 1 minute | On relevant table updates |

### 5.2. Client-Side Implementation

For the current localStorage-based implementation:

```typescript
// Example caching strategy for client-side
const CACHE_KEYS = {
  BUSINESS_PLAN: 'devinde-tracker-bp-',
  SECTIONS: 'devinde-tracker-sections-',
  USER_PLANS: 'devinde-tracker-user-plans-'
};

const CACHE_TTL = {
  BUSINESS_PLAN: 3600000, // 1 hour
  SECTIONS: 300000,       // 5 minutes
  USER_PLANS: 600000      // 10 minutes
};

// Cache with expiration
function setCacheItem(key: string, data: any, ttl: number): void {
  const item = {
    data,
    expiry: Date.now() + ttl
  };
  localStorage.setItem(key, JSON.stringify(item));
}

// Get cached item with expiration check
function getCacheItem<T>(key: string): T | null {
  const item = localStorage.getItem(key);
  if (!item) return null;
  
  const parsed = JSON.parse(item);
  if (parsed.expiry < Date.now()) {
    localStorage.removeItem(key);
    return null;
  }
  
  return parsed.data as T;
}

// Example usage
function getBusinessPlan(id: string): Promise<BusinessPlan | null> {
  const cacheKey = `${CACHE_KEYS.BUSINESS_PLAN}${id}`;
  const cached = getCacheItem<BusinessPlan>(cacheKey);
  
  if (cached) return Promise.resolve(cached);
  
  return fetchBusinessPlan(id).then(plan => {
    if (plan) {
      setCacheItem(cacheKey, plan, CACHE_TTL.BUSINESS_PLAN);
    }
    return plan;
  });
}
```

## 6. Query Optimization Guidelines

To ensure consistent performance, we've established the following query optimization guidelines:

### 6.1. SQL Query Best Practices

1. Use prepared statements to avoid SQL injection and allow query plan caching
2. Select only required columns, avoiding `SELECT *`
3. Use JOINs efficiently, minimizing the number of tables joined
4. Use WHERE clauses that leverage indexes
5. Be cautious with wildcard searches that prevent index usage
6. Properly parameterize IN clauses
7. Use query pagination for large result sets

### 6.2. ORM/Query Builder Guidelines

When using an ORM or query builder:

```typescript
// Example query optimization with an ORM (TypeORM example)

// GOOD: Selective column fetching
const sections = await sectionRepository
  .createQueryBuilder("section")
  .select(["section.id", "section.title", "section.completion"])
  .where("section.businessPlanId = :id", { id: businessPlanId })
  .getMany();

// GOOD: Eager loading related records to avoid N+1 queries
const businessPlan = await businessPlanRepository
  .createQueryBuilder("businessPlan")
  .leftJoinAndSelect("businessPlan.sections", "section")
  .where("businessPlan.id = :id", { id: businessPlanId })
  .getOne();

// GOOD: Pagination implementation
const [resources, total] = await resourceRepository
  .createQueryBuilder("resource")
  .where("resource.actionPlanId = :id", { id: actionPlanId })
  .orderBy("resource.startDate", "ASC")
  .skip(pageSize * (page - 1))
  .take(pageSize)
  .getManyAndCount();
```

## 7. Performance Benchmarks and SLAs

Performance benchmarks are established to ensure the application meets user expectations:

### 7.1. Query Performance Targets

| Operation | Target Response Time | Maximum Response Time |
|-----------|----------------------|-----------------------|
| Dashboard load | < 200ms | 500ms |
| Section data load | < 150ms | 300ms |
| Business plan list | < 100ms | 250ms |
| Data save operation | < 200ms | 500ms |
| Report generation | < 1s | 3s |

### 7.2. Client-Side Performance Metrics

For the localStorage implementation:

```typescript
// Performance monitoring example
function measurePerformance<T>(
  operation: string, 
  callback: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  
  // Handle both synchronous and asynchronous operations
  const result = callback();
  const processResult = (value: T) => {
    const duration = performance.now() - start;
    console.log(`Operation '${operation}' took ${duration.toFixed(2)}ms`);
    
    // Record metrics (to be implemented)
    recordPerformanceMetric(operation, duration);
    
    return value;
  };
  
  if (result instanceof Promise) {
    return result.then(processResult);
  } else {
    return Promise.resolve(processResult(result));
  }
}

// Usage example
measurePerformance('loadDashboard', () => {
  return fetchBusinessPlanWithSections(activePlanId);
});
```

### 7.3. Performance Testing Strategy

For each major release:

1. Run performance unit tests for critical operations
2. Benchmark database operations with simulated load
3. Compare results against established SLAs
4. Identify performance regressions early

## 8. Implementation for localStorage

While the full indexing strategy is designed for a SQL database, we can adapt key principles for the current localStorage implementation:

### 8.1. In-Memory Indexing

```typescript
// Example in-memory indexing for localStorage data
class LocalStorageIndex<T> {
  private indices: Record<string, Record<string, string[]>> = {};
  
  // Create an index on a specific field
  createIndex(indexName: string, keyExtractor: (item: T) => string): void {
    this.indices[indexName] = {};
    
    // Build initial index from localStorage
    const items = this.getAllItems();
    items.forEach(item => {
      const key = keyExtractor(item);
      const id = (item as any).id;
      
      if (!this.indices[indexName][key]) {
        this.indices[indexName][key] = [];
      }
      
      this.indices[indexName][key].push(id);
    });
  }
  
  // Find items by indexed field
  findByIndex(indexName: string, value: string): T[] {
    if (!this.indices[indexName] || !this.indices[indexName][value]) {
      return [];
    }
    
    const ids = this.indices[indexName][value];
    return ids.map(id => this.getItemById(id)).filter(Boolean) as T[];
  }
  
  // Update index when item changes
  updateIndex(item: T): void {
    const id = (item as any).id;
    
    // Update each defined index
    Object.entries(this.indices).forEach(([indexName, index]) => {
      // Remove old references
      Object.values(index).forEach(ids => {
        const idx = ids.indexOf(id);
        if (idx !== -1) {
          ids.splice(idx, 1);
        }
      });
      
      // Add new reference
      const keyExtractor = this.getKeyExtractor(indexName);
      const key = keyExtractor(item);
      
      if (!index[key]) {
        index[key] = [];
      }
      
      index[key].push(id);
    });
  }
  
  // Implementation details omitted for brevity
  private getAllItems(): T[] { /* ... */ }
  private getItemById(id: string): T | null { /* ... */ }
  private getKeyExtractor(indexName: string): (item: T) => string { /* ... */ }
}

// Usage example
const businessPlanIndex = new LocalStorageIndex<BusinessPlan>();
businessPlanIndex.createIndex('byUserId', plan => plan.userId || 'anonymous');

// Find all business plans for a user
const userPlans = businessPlanIndex.findByIndex('byUserId', currentUserId);
```

### 8.2. Lazy Loading and Data Pagination

```typescript
// Example lazy loading implementation
function lazyLoadSectionData(
  sectionId: string, 
  page = 1, 
  pageSize = 10
): SectionData[] {
  // Get all data for this section from localStorage
  const allData = getAllSectionData(sectionId);
  
  // Apply pagination
  return allData.slice((page - 1) * pageSize, page * pageSize);
}

// Interface for paginated results
interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Generalized pagination function
function paginateResults<T>(
  items: T[], 
  page: number, 
  pageSize: number
): PaginatedResult<T> {
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);
  
  return {
    items: paginatedItems,
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize)
  };
}
```

## 9. Monitoring and Optimization Plan

To ensure the indexing and performance strategy remains effective:

1. Implement performance logging for critical operations
2. Monitor cache hit/miss ratios
3. Review performance metrics monthly
4. Revisit and update the indexing strategy quarterly
5. Plan for performance optimization based on actual usage patterns

## 10. Future Database Selection Considerations

When migrating from localStorage to a server-side database, the following factors should be considered:

| Database Type | Pros | Cons | Best For |
|--------------|------|------|----------|
| PostgreSQL | Advanced indexing, JSON support, reliability | Setup complexity | Long-term, complex applications |
| MySQL | Widespread adoption, solid performance | Limited JSON capabilities | Traditional structured data |
| MongoDB | Schema flexibility, easy scaling | Transaction limitations | Evolving schema, document-centric apps |
| DynamoDB | Auto-scaling, serverless friendly | Query limitations | High-scale serverless applications |

Our recommendation for DevIndé Tracker would be PostgreSQL, due to its:
- Strong support for JSON/JSONB data types (aligns with our current schema)
- Advanced indexing capabilities (GIN/GiST indexes for JSON data)
- Robust transaction support
- Excellent partitioning options for future growth

## 11. Conclusion

This indexing and performance strategy:
1. Addresses current localStorage performance using client-side techniques
2. Provides a clear path for future database migration
3. Ensures the application remains performant as it scales
4. Establishes benchmarks and monitoring for ongoing optimization

The strategy will be revisited quarterly or when significant changes occur in the application's data access patterns.
