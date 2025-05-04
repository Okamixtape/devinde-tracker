# DevIndé Tracker - Entity Relationship Model

## 1. Entity Relationship Diagram

```
┌───────────────────┐             ┌────────────────────┐              ┌───────────────────┐
│                   │             │                    │              │                   │
│   BusinessPlan    │1          1 │  BusinessPlanMeta  │              │     Section       │
│                   ├─────────────┤                    │              │                   │
│ - id              │             │ - id               │              │ - id              │
│ - userId          │             │ - businessPlanId   │              │ - businessPlanId  │
│ - name            │             │ - lastUpdated      │              │ - key             │
│ - createdAt       │             │ - version          │              │ - title           │
│ - updatedAt       │             │ - exportCount      │              │ - icon            │
│                   │             │                    │              │ - color           │
│                   │             │                    │              │ - completion      │
└───────┬───────────┘             └────────────────────┘              │ - route           │
        │                                                             └─────────┬─────────┘
        │                                                                       │
        │ 1                                                                     │ *
        │                                                                       │
        │                                                                       │
┌───────▼───────────┐             ┌────────────────────┐              ┌─────────▼─────────┐
│                   │             │                    │              │                   │
│   UserSettings    │◄────────────┤     UserProfile    │              │   SectionData     │
│                   │1          1 │                    │              │                   │
│ - id              │             │ - id               │              │ - id              │
│ - businessPlanId  │             │ - userId           │              │ - sectionId       │
│ - theme           │             │ - name             │              │ - key             │
│ - language        │             │ - email            │              │ - value           │
│ - notifications   │             │ - avatarUrl        │              │ - updatedAt       │
│                   │             │                    │              │                   │
└───────────────────┘             └────────────────────┘              └───────────────────┘
                                                                                │
                                                                                │ 1..*
                                                                                │
                                                                                │
┌───────────────────┐             ┌────────────────────┐              ┌─────────▼─────────┐
│                   │             │                    │              │                   │
│   MarketAnalysis  │◄────────────┤  BusinessModel     │◄─────────────┤  ActionPlan       │
│                   │1          1 │                    │1           1 │                   │
│ - id              │             │ - id               │              │ - id              │
│ - sectionDataId   │             │ - sectionDataId    │              │ - sectionDataId   │
│ - marketSize      │             │ - valueProposition │              │ - timelines       │
│ - competitors     │             │ - customerSegments │              │ - milestones      │
│ - swotAnalysis    │             │ - channels         │              │ - tasks           │
│ - targetMarket    │             │ - revenue          │              │ - assignments     │
│                   │             │                    │              │                   │
└───────────────────┘             └────────────────────┘              └───────────────────┘
        ▲                                  ▲                                    ▲
        │                                  │                                    │
        │ 1                                │ 1                                  │ 1
        │                                  │                                    │
        │                                  │                                    │
┌───────┴───────────┐             ┌────────┴───────────┐              ┌─────────┴─────────┐
│                   │             │                    │              │                   │
│   Financials      │             │   PitchDeck        │              │ ResourceAllocation│
│                   │             │                    │              │                   │
│ - id              │             │ - id               │              │ - id              │
│ - sectionDataId   │             │ - sectionDataId    │              │ - actionPlanId    │
│ - expenses        │             │ - slides           │              │ - resourceType    │
│ - revenue         │             │ - pitchScript      │              │ - units           │
│ - cashFlow        │             │ - audienceNotes    │              │ - cost            │
│ - projections     │             │ - version          │              │ - startDate       │
│ - pricing         │             │                    │              │ - endDate         │
└───────────────────┘             └────────────────────┘              └───────────────────┘
```

## 2. Entity Descriptions

### Core Entities

#### BusinessPlan
The main container entity that represents a single business plan created by a user.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|------------|
| id | String | Unique identifier for the business plan | Primary Key, UUID |
| userId | String | ID of the user who owns the plan | Optional (for future auth) |
| name | String | Name of the business plan | Required, Max 100 chars |
| createdAt | DateTime | When the plan was created | Required, Auto-generated |
| updatedAt | DateTime | Last update timestamp | Required, Auto-updated |

#### BusinessPlanMeta
Metadata about the business plan.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|------------|
| id | String | Unique identifier | Primary Key, UUID |
| businessPlanId | String | Reference to business plan | Foreign Key |
| lastUpdated | DateTime | Last update timestamp | Required |
| version | Number | Version number | Required, Default 1 |
| exportCount | Number | Number of times exported | Default 0 |

#### Section
Represents a major section of the business plan (Dashboard, Business Model, Market Analysis, etc.).

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|------------|
| id | String | Unique identifier for the section | Primary Key, UUID |
| businessPlanId | String | Reference to business plan | Foreign Key |
| key | String | Section identifier key | Required, Unique per plan |
| title | String | Display title | Required |
| icon | String | Icon identifier | Required |
| color | String | Theme color | Required, HEX/RGB format |
| completion | Number | Completion percentage | 0-100 |
| route | String | UI route path | Required |

#### SectionData
Stores the actual data content for each section, using a flexible key-value approach.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|------------|
| id | String | Unique identifier | Primary Key, UUID |
| sectionId | String | Reference to section | Foreign Key |
| key | String | Data field identifier | Required |
| value | JSON | Actual data value | Required, JSON serialized |
| updatedAt | DateTime | Last update timestamp | Required, Auto-updated |

#### UserSettings
User-specific application settings.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|------------|
| id | String | Unique identifier | Primary Key, UUID |
| businessPlanId | String | Reference to business plan | Foreign Key |
| theme | String | UI theme preference | Enum: "light", "dark", "system" |
| language | String | Preferred language | ISO language code |
| notifications | Boolean | Notification preferences | Default false |

### Section-Specific Entities

#### BusinessModel
Contains the business model specific data, linked to the SectionData.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|------------|
| id | String | Unique identifier | Primary Key, UUID |
| sectionDataId | String | Reference to section data | Foreign Key |
| valueProposition | JSON | Value proposition details | Required |
| customerSegments | JSON | Customer segment details | Required |
| channels | JSON | Channel information | Optional |
| revenue | JSON | Revenue stream details | Required |

#### MarketAnalysis
Market research and analysis data.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|------------|
| id | String | Unique identifier | Primary Key, UUID |
| sectionDataId | String | Reference to section data | Foreign Key |
| marketSize | JSON | Market size data | Required |
| competitors | JSON | Competitor analysis | Required |
| swotAnalysis | JSON | SWOT analysis data | Required |
| targetMarket | JSON | Target market details | Required |

#### ActionPlan
Project planning and timeline information.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|------------|
| id | String | Unique identifier | Primary Key, UUID |
| sectionDataId | String | Reference to section data | Foreign Key |
| timelines | JSON | Project timelines | Required |
| milestones | JSON | Project milestones | Required |
| tasks | JSON | Task breakdown | Required |
| assignments | JSON | Resource assignments | Optional |

#### Financials
Financial planning and projections.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|------------|
| id | String | Unique identifier | Primary Key, UUID |
| sectionDataId | String | Reference to section data | Foreign Key |
| expenses | JSON | Expense details | Required |
| revenue | JSON | Revenue projections | Required |
| cashFlow | JSON | Cash flow analysis | Required |
| projections | JSON | Financial projections | Required |
| pricing | JSON | Pricing models | Required |

#### PitchDeck
Presentation and pitch materials.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|------------|
| id | String | Unique identifier | Primary Key, UUID |
| sectionDataId | String | Reference to section data | Foreign Key |
| slides | JSON | Slide content | Required |
| pitchScript | Text | Presentation script | Optional |
| audienceNotes | Text | Notes about target audience | Optional |
| version | Number | Version number | Default 1 |

#### ResourceAllocation
Resource planning for action plan implementation.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|------------|
| id | String | Unique identifier | Primary Key, UUID |
| actionPlanId | String | Reference to action plan | Foreign Key |
| resourceType | String | Type of resource | Required, Enum |
| units | Number | Quantity of resource | Required |
| cost | Number | Cost per unit | Required |
| startDate | Date | Resource start date | Required |
| endDate | Date | Resource end date | Required |

#### UserProfile
User information (for future authentication implementation).

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|------------|
| id | String | Unique identifier | Primary Key, UUID |
| userId | String | User's authentication ID | Required |
| name | String | User's display name | Required |
| email | String | User's email | Required, Valid email |
| avatarUrl | String | Profile image URL | Optional |

## 3. Relationships and Cardinality

| Relationship | Entities | Cardinality | Description |
|--------------|----------|-------------|-------------|
| owns | BusinessPlan to BusinessPlanMeta | 1:1 | Each business plan has exactly one metadata record |
| contains | BusinessPlan to Section | 1:* | A business plan contains multiple sections |
| has | BusinessPlan to UserSettings | 1:1 | Each business plan has one set of user settings |
| belongs_to | UserSettings to UserProfile | *:1 | User settings belong to a user profile (future) |
| contains | Section to SectionData | 1:* | A section contains multiple data entries |
| specializes | SectionData to BusinessModel | 1:1 | Section data specializes into business model |
| specializes | SectionData to MarketAnalysis | 1:1 | Section data specializes into market analysis |
| specializes | SectionData to ActionPlan | 1:1 | Section data specializes into action plan |
| specializes | SectionData to Financials | 1:1 | Section data specializes into financials |
| specializes | SectionData to PitchDeck | 1:1 | Section data specializes into pitch deck |
| allocates | ActionPlan to ResourceAllocation | 1:* | Action plan can have multiple resource allocations |

## 4. Data Type Definitions

### Simple Types

| Type | Format | Description |
|------|--------|-------------|
| String | Text | Standard text data |
| Number | Numeric | Integer or decimal numeric values |
| Boolean | true/false | Binary true/false values |
| Date | YYYY-MM-DD | Date without time |
| DateTime | ISO 8601 | Date and time with timezone |
| JSON | JSON object | Flexible structured data |
| Text | Long text | Extended text content |

### Complex Types (JSON Structures)

#### Value Proposition (JSON)
```json
{
  "mainValue": "string",
  "keyBenefits": ["string"],
  "painPoints": ["string"],
  "differentiators": ["string"]
}
```

#### Customer Segments (JSON)
```json
{
  "segments": [
    {
      "name": "string",
      "description": "string",
      "size": "number",
      "characteristics": ["string"]
    }
  ],
  "targetSegment": "string"
}
```

#### SWOT Analysis (JSON)
```json
{
  "strengths": ["string"],
  "weaknesses": ["string"],
  "opportunities": ["string"],
  "threats": ["string"]
}
```

#### Timeline (JSON)
```json
{
  "milestones": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "startDate": "date",
      "endDate": "date",
      "completion": "number"
    }
  ]
}
```

#### Financial Projection (JSON)
```json
{
  "periods": [
    {
      "period": "string",
      "revenue": "number",
      "expenses": "number",
      "profit": "number",
      "cashFlow": "number"
    }
  ],
  "assumptions": ["string"]
}
```

## 5. Data Validation Rules

### General Validation Rules

1. **Required Fields**: Fields marked as Required must not be null or empty.
2. **String Length**: Text fields have appropriate max length constraints.
3. **Numeric Ranges**: Percentage fields (like completion) must be between 0-100.
4. **Date Validity**: Dates must be valid and end dates must be after start dates.
5. **JSON Structure**: JSON fields must conform to their defined structure.
6. **Relationship Integrity**: Foreign keys must reference valid existing entities.
7. **Unique Constraints**: Fields marked as unique must not have duplicate values.

### Entity-Specific Validation Rules

1. **BusinessPlan**:
   - Name must be unique per user
   - CreatedAt must be before or equal to updatedAt

2. **Section**:
   - Key must be unique within a business plan
   - Color must be a valid hex or RGB format

3. **SectionData**:
   - Key must be unique within a section
   - Value must be valid JSON

4. **Financials**:
   - Revenue and expense values must be numeric
   - Projections must include at least one period

5. **ActionPlan**:
   - Start dates must be before end dates for all timeline items
   - Completion percentages must be between 0-100

6. **ResourceAllocation**:
   - Cost must be a positive number
   - Units must be a positive integer

## 6. Future Extensions

The data model is designed to be extensible for future enhancements:

1. **Multi-User Collaboration**:
   - Add collaboration permissions table
   - Extend UserProfile with collaboration settings

2. **Version History**:
   - Add versioning tables to track changes
   - Implement change history for each section

3. **Templates and Sharing**:
   - Add template entity
   - Add sharing permissions

4. **Analytics and Insights**:
   - Add analytics data collection
   - Create insight recommendations model

This Entity Relationship Model provides a comprehensive foundation for the DevIndé Tracker application while maintaining flexibility for future growth and enhancements.
