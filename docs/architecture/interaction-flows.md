# DevIndé Tracker - System Interaction Flows

This document describes the key interaction flows within the DevIndé Tracker application, illustrating how data and control flow through the system components.

## 1. Sequence Diagrams for Key Workflows

### 1.1 Application Startup Flow

```
┌─────────┐        ┌──────────┐      ┌────────────┐      ┌───────────┐     ┌────────────┐
│  User    │        │  Layout  │      │  Page/     │      │  Custom   │     │ Local      │
│  Browser │        │Component │      │  Dashboard │      │  Hooks    │     │ Storage    │
└────┬────┘        └─────┬────┘      └──────┬─────┘      └─────┬─────┘     └──────┬─────┘
     │                   │                   │                  │                  │
     │    Load App       │                   │                  │                  │
     │─────────────────►│                   │                  │                  │
     │                   │                   │                  │                  │
     │                   │  Initialize App   │                  │                  │
     │                   │────────────────►│                   │                  │
     │                   │                   │                  │                  │
     │                   │                   │ useBusinessPlanData()              │
     │                   │                   │────────────────►│                  │
     │                   │                   │                  │                  │
     │                   │                   │                  │  Get Stored Data │
     │                   │                   │                  │─────────────────►│
     │                   │                   │                  │                  │
     │                   │                   │                  │◄─────────────────│
     │                   │                   │                  │ Return Data      │
     │                   │                   │                  │                  │
     │                   │                   │◄────────────────│                  │
     │                   │                   │ Return Data      │                  │
     │                   │                   │                  │                  │
     │                   │◄────────────────│                   │                  │
     │                   │ Render Components │                  │                  │
     │                   │                   │                  │                  │
     │◄─────────────────│                   │                  │                  │
     │ Display Dashboard │                   │                  │                  │
     │                   │                   │                  │                  │
```

### 1.2 Data Update Flow

```
┌─────────┐     ┌───────────┐      ┌─────────────┐      ┌───────────┐     ┌────────────┐
│  User    │     │ UI        │      │ Business    │      │ Custom    │     │ Local      │
│  Action  │     │ Component │      │ Logic (Hook)│      │ Context   │     │ Storage    │
└────┬────┘     └─────┬─────┘      └──────┬──────┘      └─────┬─────┘     └──────┬─────┘
     │                │                    │                   │                  │
     │ Update Data    │                    │                   │                  │
     │───────────────►│                    │                   │                  │
     │                │                    │                   │                  │
     │                │ Call update method │                   │                  │
     │                │───────────────────►│                   │                  │
     │                │                    │                   │                  │
     │                │                    │ Update context    │                  │
     │                │                    │──────────────────►│                  │
     │                │                    │                   │                  │
     │                │                    │ Persist data      │                  │
     │                │                    │──────────────────────────────────────►
     │                │                    │                   │                  │
     │                │                    │                   │                  │
     │                │ Re-render with     │                   │                  │
     │                │ updated state      │                   │                  │
     │◄───────────────│                    │                   │                  │
     │ View updated UI│                    │                   │                  │
     │                │                    │                   │                  │
```

### 1.3 Section Navigation Flow

```
┌─────────┐     ┌─────────┐      ┌────────────┐     ┌─────────────┐    ┌───────────┐
│  User    │     │ Layout  │      │ Section    │     │ Section     │    │ Section   │
│  Action  │     │ Component│     │ Navigation │     │ Context     │    │ Component │
└────┬────┘     └────┬────┘      └─────┬──────┘     └──────┬──────┘    └─────┬─────┘
     │                │                 │                   │                 │
     │ Select Section │                 │                   │                 │
     │────────────────►                 │                   │                 │
     │                │                 │                   │                 │
     │                │ Click section   │                   │                 │
     │                │─────────────────►                   │                 │
     │                │                 │                   │                 │
     │                │                 │ Update active     │                 │
     │                │                 │ section          │                 │
     │                │                 │──────────────────►                 │
     │                │                 │                   │                 │
     │                │                 │                   │ Notify section  │
     │                │                 │                   │ change          │
     │                │                 │                   │───────────────►│
     │                │                 │                   │                 │
     │                │                 │                   │                 │
     │                │                 │                   │                 │
     │                │ Update UI with  │                   │                 │
     │                │ active section  │                   │                 │
     │◄───────────────┤                 │                   │                 │
     │View new section│                 │                   │                 │
     │                │                 │                   │                 │
```

## 2. Data Flow Diagrams

### 2.1 Overall Application Data Flow

```
                 ┌────────────────────────────────────────────┐
                 │               User Browser                 │
                 └───────────────────┬────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  ┌────────────────┐         ┌────────────────┐        ┌────────────────┐  │
│  │                │         │                │        │                │  │
│  │  UI Layer      │◄───────►│  Business      │◄──────►│  Services      │  │
│  │  Components    │         │  Logic Layer   │        │  Layer         │  │
│  │                │         │                │        │                │  │
│  └────────────────┘         └────────────────┘        └───────┬────────┘  │
│                                                              │           │
│                                                              │           │
│  ┌────────────────┐                                          │           │
│  │                │                                          │           │
│  │  Browser       │◄─────────────────────────────────────────┘           │
│  │  Storage       │                                                      │
│  │                │                                                      │
│  └────────────────┘                                                      │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Business Plan Data Flow

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│ User Interface  │     │  Business Logic   │     │  Data Storage   │
│ Components      │     │  Layer (Hooks)    │     │  (localStorage) │
│                 │     │                   │     │                 │
└────────┬────────┘     └─────────┬─────────┘     └────────┬────────┘
         │                        │                        │
         │                        │                        │
         │      Read Data         │                        │
         │◄───────────────────────┤                        │
         │                        │                        │
         │                        │      Load Data         │
         │                        │◄───────────────────────│
         │                        │                        │
         │                        │                        │
         │      Update Data       │                        │
         │─────────────────────────►                       │
         │                        │                        │
         │                        │      Save Data         │
         │                        │───────────────────────►│
         │                        │                        │
         │                        │                        │
```

## 3. API Specifications

The DevIndé Tracker primarily uses internal hooks and context APIs rather than external REST APIs. Below are the key internal APIs:

### 3.1 Business Plan Data Hook API

```typescript
interface BusinessPlanDataAPI {
  // Core data structure
  businessPlanData: BusinessPlanData;
  
  // Data import/export
  exportData: () => void;
  importData: () => void;
  
  // Data manipulation methods
  updateSection: (sectionKey: string, data: any) => void;
  resetSection: (sectionKey: string) => void;
}
```

### 3.2 Sections Data Hook API

```typescript
interface SectionsDataAPI {
  // Section state
  sections: BusinessPlanSection[];
  activeSection: string;
  
  // Section navigation
  setActiveSection: (section: string) => void;
  
  // Theme management
  toggleTheme: () => void;
}
```

### 3.3 LocalStorage API Usage

```typescript
// Key used for storing business plan data
const STORAGE_KEY = 'devinde-tracker-data';

// Save data
const saveData = (data: BusinessPlanData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Load data
const loadData = (): BusinessPlanData | null => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  return savedData ? JSON.parse(savedData) : null;
};
```

## 4. Event Models

### 4.1 UI Events

| Event | Source | Handler | Description |
|-------|--------|---------|-------------|
| Section Change | Navigation UI | setActiveSection() | User changes the active section of the business plan |
| Theme Toggle | UI Controls | toggleTheme() | User toggles between light and dark themes |
| Data Edit | Form Components | updateSection() | User edits data in a business plan section |
| Data Export | UI Controls | exportData() | User exports their business plan data |
| Data Import | UI Controls | importData() | User imports business plan data |

### 4.2 Data Change Events

| Event | Trigger | Effect | Description |
|-------|---------|--------|-------------|
| Data Updated | updateSection() | UI re-render + localStorage update | Business plan data is updated and persisted |
| Data Imported | importData() | Context update + UI reset | Imported data replaces current app state |
| Section Completion Change | Progress calculations | UI update (progress bars) | Section completion percentage is recalculated |

### 4.3 React Component Lifecycle Events

| Lifecycle Event | Components | Action | Description |
|----------------|------------|--------|-------------|
| Component Mount | Page/Dashboard | Load data from localStorage | Initial data load on application start |
| Context Change | Data-bound components | Re-render | Components update when context data changes |
| Router Change | Layout | Section component swap | Navigation between different sections |

## 5. Error Handling Flows

```
┌─────────────┐     ┌───────────────┐     ┌─────────────┐     ┌───────────────┐
│             │     │               │     │             │     │               │
│  UI Action  │     │  Component    │     │  Hook/      │     │  Error        │
│             │     │               │     │  Context    │     │  Handler      │
│             │     │               │     │             │     │               │
└──────┬─────┘     └───────┬───────┘     └──────┬──────┘     └───────┬───────┘
       │                   │                    │                    │
       │ User Action       │                    │                    │
       │───────────────────►                    │                    │
       │                   │                    │                    │
       │                   │ Call Method        │                    │
       │                   │────────────────────►                    │
       │                   │                    │                    │
       │                   │                    │ Error Occurs       │
       │                   │                    │────────────────────►
       │                   │                    │                    │
       │                   │                    │                    │
       │                   │◄────────────────────────────────────────│
       │                   │ Return Error State │                    │
       │                   │                    │                    │
       │◄───────────────────                    │                    │
       │ Show Error UI     │                    │                    │
       │                   │                    │                    │
```

## 6. Key System Interaction Scenarios

### 6.1 New User First-time Experience
1. User loads application
2. Application initializes with empty business plan data
3. Dashboard displays initial state with empty sections
4. User navigates through sections using navigation menu
5. User begins filling in business plan details
6. Data is automatically saved to localStorage as changes are made

### 6.2 Data Import Scenario
1. User clicks Import button
2. Import function triggers file selection dialog
3. User selects JSON file
4. System validates file format
5. If valid, data replaces current business plan data
6. UI updates to reflect imported data
7. New data is persisted to localStorage

### 6.3 Data Export Scenario
1. User clicks Export button
2. Business plan data is formatted for export
3. System generates downloadable JSON file
4. File is offered to user for download
5. User saves file to local system

### 6.4 Theme Switching
1. User clicks theme toggle button
2. Theme context is updated with new theme value
3. ThemeProvider updates CSS classes across application
4. UI components re-render with new theme styling
5. Theme preference is saved to localStorage
