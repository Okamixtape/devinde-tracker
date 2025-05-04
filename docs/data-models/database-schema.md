# DevIndé Tracker - Database Schema and Normalization

## 1. Normalized Database Schema

This document defines the normalized database schema for the DevIndé Tracker application. Although the current implementation uses localStorage, this schema follows proper database normalization principles to ensure data integrity and eliminate redundancy, making it suitable for future migration to a server-side database.

### 1.1 Tables and Constraints

#### business_plans

```sql
CREATE TABLE business_plans (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uc_business_plans_user_name UNIQUE (user_id, name)
);
```

#### business_plan_meta

```sql
CREATE TABLE business_plan_meta (
    id VARCHAR(36) PRIMARY KEY,
    business_plan_id VARCHAR(36) NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 1,
    export_count INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_business_plan_meta_business_plan
        FOREIGN KEY (business_plan_id) REFERENCES business_plans(id)
        ON DELETE CASCADE
);
```

#### user_settings

```sql
CREATE TABLE user_settings (
    id VARCHAR(36) PRIMARY KEY,
    business_plan_id VARCHAR(36) NOT NULL,
    theme VARCHAR(20) NOT NULL DEFAULT 'light',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    notifications BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_user_settings_business_plan
        FOREIGN KEY (business_plan_id) REFERENCES business_plans(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_user_settings_business_plan UNIQUE (business_plan_id)
);
```

#### user_profiles

```sql
CREATE TABLE user_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) NULL,
    CONSTRAINT uc_user_profiles_user_id UNIQUE (user_id),
    CONSTRAINT uc_user_profiles_email UNIQUE (email)
);
```

#### sections

```sql
CREATE TABLE sections (
    id VARCHAR(36) PRIMARY KEY,
    business_plan_id VARCHAR(36) NOT NULL,
    key VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    completion TINYINT NOT NULL DEFAULT 0,
    route VARCHAR(100) NOT NULL,
    CONSTRAINT fk_sections_business_plan
        FOREIGN KEY (business_plan_id) REFERENCES business_plans(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_sections_business_plan_key UNIQUE (business_plan_id, key),
    CONSTRAINT chk_sections_completion CHECK (completion BETWEEN 0 AND 100)
);
```

#### section_data

```sql
CREATE TABLE section_data (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    data_key VARCHAR(100) NOT NULL,
    data_value JSON NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_section_data_section
        FOREIGN KEY (section_id) REFERENCES sections(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_section_data_section_key UNIQUE (section_id, data_key)
);
```

#### business_models

```sql
CREATE TABLE business_models (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    value_proposition JSON NOT NULL,
    customer_segments JSON NOT NULL,
    channels JSON NULL,
    revenue_streams JSON NOT NULL,
    CONSTRAINT fk_business_models_section
        FOREIGN KEY (section_id) REFERENCES sections(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_business_models_section UNIQUE (section_id)
);
```

#### market_analysis

```sql
CREATE TABLE market_analysis (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    market_size JSON NOT NULL,
    competitors JSON NOT NULL,
    swot_analysis JSON NOT NULL,
    target_market JSON NOT NULL,
    CONSTRAINT fk_market_analysis_section
        FOREIGN KEY (section_id) REFERENCES sections(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_market_analysis_section UNIQUE (section_id)
);
```

#### action_plans

```sql
CREATE TABLE action_plans (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    timelines JSON NOT NULL,
    milestones JSON NOT NULL,
    tasks JSON NOT NULL,
    assignments JSON NULL,
    CONSTRAINT fk_action_plans_section
        FOREIGN KEY (section_id) REFERENCES sections(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_action_plans_section UNIQUE (section_id)
);
```

#### resource_allocations

```sql
CREATE TABLE resource_allocations (
    id VARCHAR(36) PRIMARY KEY,
    action_plan_id VARCHAR(36) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    CONSTRAINT fk_resource_allocations_action_plan
        FOREIGN KEY (action_plan_id) REFERENCES action_plans(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_resource_allocations_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_resource_allocations_units CHECK (units > 0),
    CONSTRAINT chk_resource_allocations_cost CHECK (cost >= 0)
);
```

#### financials

```sql
CREATE TABLE financials (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    expenses JSON NOT NULL,
    revenue JSON NOT NULL,
    cash_flow JSON NOT NULL,
    projections JSON NOT NULL,
    pricing JSON NOT NULL,
    CONSTRAINT fk_financials_section
        FOREIGN KEY (section_id) REFERENCES sections(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_financials_section UNIQUE (section_id)
);
```

#### pitch_decks

```sql
CREATE TABLE pitch_decks (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    slides JSON NOT NULL,
    pitch_script TEXT NULL,
    audience_notes TEXT NULL,
    version INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_pitch_decks_section
        FOREIGN KEY (section_id) REFERENCES sections(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_pitch_decks_section UNIQUE (section_id)
);
```

## 2. Normalization Analysis

The database schema has been designed to follow Third Normal Form (3NF) principles. Here's the normalization analysis:

### 2.1 First Normal Form (1NF)

- All tables have a primary key
- All columns contain atomic values
- No repeating groups within rows
- JSON columns are used for flexible structured data while maintaining atomicity at the schema level

### 2.2 Second Normal Form (2NF)

- All tables are in 1NF
- All non-key attributes are fully functionally dependent on the primary key
- No partial dependencies of non-key attributes on the primary key

### 2.3 Third Normal Form (3NF)

- All tables are in 2NF
- No transitive dependencies of non-key attributes on the primary key
- Each table represents a single entity/concept
- Foreign keys are used to establish relationships between entities

### 2.4 Normalization Decisions

| Entity | Normalization Decision | Justification |
|--------|------------------------|---------------|
| sections | Separated from business_plans | Single responsibility, allows for independent section management |
| section_data | Generic key-value store | Provides flexibility for different data types while maintaining structure |
| Specialized section tables | Separate tables for each section type | Enforces data integrity specific to each section type |
| business_plan_meta | Separated from business_plans | Keeps meta information separate from core data |
| resource_allocations | Separated from action_plans | Allows for multiple resources per action plan |

## 3. Denormalization Decisions

While the schema is primarily normalized to 3NF, some strategic denormalization has been applied to optimize for specific requirements:

| Denormalization | Justification | Trade-offs |
|-----------------|---------------|------------|
| JSON columns for structured data | Flexibility for schema evolution, better suited for client-side storage | Less rigid validation, potential for inconsistent data structure |
| Completion field in sections | Computed value stored for performance, avoids complex joins and calculations | Requires careful updates to maintain consistency |
| Embedding complex structures in JSON | Preserves hierarchical relationships within a section | Less granular querying, potential for data duplication |

## 4. LocalStorage Schema Adaptation

For the current client-side implementation using localStorage, the normalized database schema is adapted as follows:

```typescript
// TypeScript interfaces for localStorage schema

interface BusinessPlanData {
  id: string;
  userId?: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  meta: {
    lastUpdated: string;
    version: number;
    exportCount: number;
  };
  settings: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
  };
  sections: {
    [key: string]: {
      id: string;
      key: string;
      title: string;
      icon: string;
      color: string;
      completion: number;
      route: string;
      data: Record<string, any>;
    };
  };
}

// LocalStorage key
const STORAGE_KEY = 'devinde-tracker-data';

// Example storage/retrieval functions
function saveBusinessPlan(data: BusinessPlanData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getBusinessPlan(): BusinessPlanData | null {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}
```

## 5. SQL DDL Script

The complete SQL DDL script for creating the database schema:

```sql
-- Drop tables if they exist (for clean recreation)
DROP TABLE IF EXISTS resource_allocations;
DROP TABLE IF EXISTS pitch_decks;
DROP TABLE IF EXISTS financials;
DROP TABLE IF EXISTS action_plans;
DROP TABLE IF EXISTS market_analysis;
DROP TABLE IF EXISTS business_models;
DROP TABLE IF EXISTS section_data;
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS business_plan_meta;
DROP TABLE IF EXISTS business_plans;

-- Create tables
CREATE TABLE business_plans (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uc_business_plans_user_name UNIQUE (user_id, name)
);

CREATE TABLE business_plan_meta (
    id VARCHAR(36) PRIMARY KEY,
    business_plan_id VARCHAR(36) NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 1,
    export_count INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_business_plan_meta_business_plan
        FOREIGN KEY (business_plan_id) REFERENCES business_plans(id)
        ON DELETE CASCADE
);

CREATE TABLE user_settings (
    id VARCHAR(36) PRIMARY KEY,
    business_plan_id VARCHAR(36) NOT NULL,
    theme VARCHAR(20) NOT NULL DEFAULT 'light',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    notifications BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_user_settings_business_plan
        FOREIGN KEY (business_plan_id) REFERENCES business_plans(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_user_settings_business_plan UNIQUE (business_plan_id)
);

CREATE TABLE user_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) NULL,
    CONSTRAINT uc_user_profiles_user_id UNIQUE (user_id),
    CONSTRAINT uc_user_profiles_email UNIQUE (email)
);

CREATE TABLE sections (
    id VARCHAR(36) PRIMARY KEY,
    business_plan_id VARCHAR(36) NOT NULL,
    key VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    completion TINYINT NOT NULL DEFAULT 0,
    route VARCHAR(100) NOT NULL,
    CONSTRAINT fk_sections_business_plan
        FOREIGN KEY (business_plan_id) REFERENCES business_plans(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_sections_business_plan_key UNIQUE (business_plan_id, key),
    CONSTRAINT chk_sections_completion CHECK (completion BETWEEN 0 AND 100)
);

CREATE TABLE section_data (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    data_key VARCHAR(100) NOT NULL,
    data_value JSON NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_section_data_section
        FOREIGN KEY (section_id) REFERENCES sections(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_section_data_section_key UNIQUE (section_id, data_key)
);

CREATE TABLE business_models (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    value_proposition JSON NOT NULL,
    customer_segments JSON NOT NULL,
    channels JSON NULL,
    revenue_streams JSON NOT NULL,
    CONSTRAINT fk_business_models_section
        FOREIGN KEY (section_id) REFERENCES sections(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_business_models_section UNIQUE (section_id)
);

CREATE TABLE market_analysis (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    market_size JSON NOT NULL,
    competitors JSON NOT NULL,
    swot_analysis JSON NOT NULL,
    target_market JSON NOT NULL,
    CONSTRAINT fk_market_analysis_section
        FOREIGN KEY (section_id) REFERENCES sections(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_market_analysis_section UNIQUE (section_id)
);

CREATE TABLE action_plans (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    timelines JSON NOT NULL,
    milestones JSON NOT NULL,
    tasks JSON NOT NULL,
    assignments JSON NULL,
    CONSTRAINT fk_action_plans_section
        FOREIGN KEY (section_id) REFERENCES sections(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_action_plans_section UNIQUE (section_id)
);

CREATE TABLE resource_allocations (
    id VARCHAR(36) PRIMARY KEY,
    action_plan_id VARCHAR(36) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    CONSTRAINT fk_resource_allocations_action_plan
        FOREIGN KEY (action_plan_id) REFERENCES action_plans(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_resource_allocations_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_resource_allocations_units CHECK (units > 0),
    CONSTRAINT chk_resource_allocations_cost CHECK (cost >= 0)
);

CREATE TABLE financials (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    expenses JSON NOT NULL,
    revenue JSON NOT NULL,
    cash_flow JSON NOT NULL,
    projections JSON NOT NULL,
    pricing JSON NOT NULL,
    CONSTRAINT fk_financials_section
        FOREIGN KEY (section_id) REFERENCES sections(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_financials_section UNIQUE (section_id)
);

CREATE TABLE pitch_decks (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    slides JSON NOT NULL,
    pitch_script TEXT NULL,
    audience_notes TEXT NULL,
    version INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_pitch_decks_section
        FOREIGN KEY (section_id) REFERENCES sections(id)
        ON DELETE CASCADE,
    CONSTRAINT uc_pitch_decks_section UNIQUE (section_id)
);

-- Add indexes for performance
CREATE INDEX idx_business_plans_user_id ON business_plans(user_id);
CREATE INDEX idx_sections_business_plan_id ON sections(business_plan_id);
CREATE INDEX idx_section_data_section_id ON section_data(section_id);
CREATE INDEX idx_resource_allocations_action_plan_id ON resource_allocations(action_plan_id);
```

## 6. TypeScript Implementation for Client-Side

The normalized schema is adapted for client-side implementation in TypeScript:

```typescript
// src/types/database.ts

export interface BusinessPlan {
  id: string;
  userId?: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessPlanMeta {
  id: string;
  businessPlanId: string;
  lastUpdated: string;
  version: number;
  exportCount: number;
}

export interface UserSettings {
  id: string;
  businessPlanId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
}

export interface Section {
  id: string;
  businessPlanId: string;
  key: string;
  title: string;
  icon: string;
  color: string;
  completion: number;
  route: string;
}

export interface SectionData {
  id: string;
  sectionId: string;
  dataKey: string;
  dataValue: any;
  updatedAt: string;
}

// Specialized section interfaces
export interface BusinessModel {
  id: string;
  sectionId: string;
  valueProposition: any;
  customerSegments: any;
  channels?: any;
  revenueStreams: any;
}

export interface MarketAnalysis {
  id: string;
  sectionId: string;
  marketSize: any;
  competitors: any;
  swotAnalysis: any;
  targetMarket: any;
}

export interface ActionPlan {
  id: string;
  sectionId: string;
  timelines: any;
  milestones: any;
  tasks: any;
  assignments?: any;
}

export interface ResourceAllocation {
  id: string;
  actionPlanId: string;
  resourceType: string;
  units: number;
  cost: number;
  startDate: string;
  endDate: string;
}

export interface Financials {
  id: string;
  sectionId: string;
  expenses: any;
  revenue: any;
  cashFlow: any;
  projections: any;
  pricing: any;
}

export interface PitchDeck {
  id: string;
  sectionId: string;
  slides: any;
  pitchScript?: string;
  audienceNotes?: string;
  version: number;
}

// Composite type for localStorage
export interface BusinessPlanStorage {
  businessPlan: BusinessPlan;
  meta: BusinessPlanMeta;
  settings: UserSettings;
  sections: Section[];
  sectionData: Record<string, SectionData[]>;
  specializedSections: {
    businessModels: BusinessModel[];
    marketAnalysis: MarketAnalysis[];
    actionPlans: ActionPlan[];
    resourceAllocations: ResourceAllocation[];
    financials: Financials[];
    pitchDecks: PitchDeck[];
  };
}
```

## 7. Implementation Notes

### 7.1 Mapping to Client-Side Storage

For the localStorage implementation:

1. The database schema is conceptually preserved but denormalized for storage efficiency
2. Nested JSON structures are used to maintain relationships
3. TypeScript interfaces enforce type safety across the application
4. Custom serialization/deserialization functions handle the mapping between normalized and denormalized forms

### 7.2 Initialization Code

```typescript
// Example initialization code for a new business plan

function createNewBusinessPlan(name: string, userId?: string): BusinessPlanStorage {
  const now = new Date().toISOString();
  const businessPlanId = generateUUID();
  
  return {
    businessPlan: {
      id: businessPlanId,
      userId,
      name,
      createdAt: now,
      updatedAt: now
    },
    meta: {
      id: generateUUID(),
      businessPlanId,
      lastUpdated: now,
      version: 1,
      exportCount: 0
    },
    settings: {
      id: generateUUID(),
      businessPlanId,
      theme: 'light',
      language: 'en',
      notifications: false
    },
    sections: [
      {
        id: generateUUID(),
        businessPlanId,
        key: 'dashboard',
        title: 'Dashboard',
        icon: 'dashboard',
        color: '#4285F4',
        completion: 0,
        route: '/dashboard'
      },
      // Additional default sections...
    ],
    sectionData: {},
    specializedSections: {
      businessModels: [],
      marketAnalysis: [],
      actionPlans: [],
      resourceAllocations: [],
      financials: [],
      pitchDecks: []
    }
  };
}
```

## 8. Future Database Migration Path

The normalized database schema design provides a clear migration path when transitioning from localStorage to a server-based database:

1. Map the current localStorage structure to the normalized database tables
2. Create migration scripts to transform client-side data to the server schema
3. Implement API endpoints that mirror the current data access patterns
4. Gradually transition client-side logic to use the API endpoints
5. Add server-side validation that matches the schema constraints

This approach ensures a smooth transition while maintaining data integrity and application functionality.
