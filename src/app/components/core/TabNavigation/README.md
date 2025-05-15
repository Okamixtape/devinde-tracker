# TabNavigation Component

The `TabNavigation` component is a versatile UI element for creating tabbed interfaces. It follows the design patterns established in the application mockups and provides consistent styling with multiple variants and options.

## Features

- **Multiple visual variants**: underline, filled, and minimal
- **Flexible orientation**: horizontal or vertical
- **Size variants**: sm, md, lg
- **Icon support**: display icons alongside tab labels
- **Badge support**: show count or status badges
- **Disabled state**: disable specific tabs
- **Error handling**: integrated with IErrorService
- **Accessibility**: proper ARIA attributes for tab navigation

## Integration with Architecture

The TabNavigation component follows our standardized architecture:

1. **Core UI Component**: A foundational building block for tabbed interfaces
2. **Uses IErrorService**: Integrates with our error handling service
3. **Follows Design Patterns**: Implements consistent styling from mockups
4. **Accessibility Focused**: Proper ARIA roles and keyboard navigation

## Basic Usage

```tsx
import { TabNavigation } from '../../core/TabNavigation';

// Define your tabs
const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
  { id: 'settings', label: 'Settings' },
];

// Use in a component
const MyTabComponent = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div>
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      
      {activeTab === 'overview' && <OverviewContent />}
      {activeTab === 'details' && <DetailsContent />}
      {activeTab === 'settings' && <SettingsContent />}
    </div>
  );
};
```

## Tabs with Icons

```tsx
const tabsWithIcons = [
  { 
    id: 'dashboard', 
    label: 'Dashboard',
    icon: <DashboardIcon />
  },
  { 
    id: 'profile', 
    label: 'Profile',
    icon: <UserIcon />
  },
  { 
    id: 'settings', 
    label: 'Settings',
    icon: <SettingsIcon />
  },
];

<TabNavigation
  tabs={tabsWithIcons}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

## Tabs with Badges

```tsx
const tabsWithBadges = [
  { id: 'inbox', label: 'Inbox', badge: 4, badgeColor: 'red' },
  { id: 'sent', label: 'Sent' },
  { id: 'drafts', label: 'Drafts', badge: 2, badgeColor: 'yellow' },
  { id: 'trash', label: 'Trash' },
];

<TabNavigation
  tabs={tabsWithBadges}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

## Different Variants

```tsx
// Underline variant (default)
<TabNavigation
  tabs={tabs}
  activeTab={activeTab}
  variant="underline"
  onChange={setActiveTab}
/>

// Filled variant
<TabNavigation
  tabs={tabs}
  activeTab={activeTab}
  variant="filled"
  onChange={setActiveTab}
/>

// Minimal variant
<TabNavigation
  tabs={tabs}
  activeTab={activeTab}
  variant="minimal"
  onChange={setActiveTab}
/>
```

## Vertical Orientation

```tsx
<TabNavigation
  tabs={tabs}
  activeTab={activeTab}
  orientation="vertical"
  onChange={setActiveTab}
/>
```

## Integration with Error Handling

```tsx
import errorService from '../../../services/core/errorService';

// With error handling and custom error service
<TabNavigation
  tabs={tabs}
  activeTab={activeTab}
  onChange={setActiveTab}
  error={errorFromApi}
  errorService={errorService}
/>
```

## Integration with Business Components

The TabNavigation component is designed to work seamlessly with business components. Here's an example of integrating it with the `BusinessModelCanvas` component:

```tsx
import { TabNavigation } from '../../core/TabNavigation';
import { useBusinessModel } from '../../../hooks/useBusinessModel';

const BusinessModelEditor = ({ businessPlanId }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const { data, isLoading, error } = useBusinessModel(businessPlanId);
  
  // Define tabs for the business model sections
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'value-proposition', label: 'Value Proposition' },
    { id: 'customer-segments', label: 'Customer Segments' },
    { id: 'revenue-streams', label: 'Revenue Streams' },
    { id: 'key-resources', label: 'Key Resources' },
  ];
  
  return (
    <div className="space-y-4">
      <TabNavigation
        tabs={tabs}
        activeTab={activeSection}
        onChange={setActiveSection}
        error={error}
      />
      
      <div className="tab-content bg-gray-800 p-4 rounded-lg">
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <>
            {activeSection === 'overview' && <BusinessModelOverview data={data} />}
            {activeSection === 'value-proposition' && <ValuePropositionEditor data={data} />}
            {activeSection === 'customer-segments' && <CustomerSegmentsEditor data={data} />}
            {activeSection === 'revenue-streams' && <RevenueStreamsEditor data={data} />}
            {activeSection === 'key-resources' && <KeyResourcesEditor data={data} />}
          </>
        )}
      </div>
    </div>
  );
};
```

## Integration with Matrix Design-Implementation

The TabNavigation component implements the tab navigation pattern found in the design mockups:

- **BusinessModel.tsx**: Used for switching between Canvas, Impact, and Overview views
- **FinancialDashboard.tsx**: Used for navigating between financial sections
- **ActionPlanTimeline.tsx**: Used for switching between Milestones, Tasks, and Timeline views
- **MarketAnalysis.tsx**: Used for navigating between Segments, Competitors, and Trends

## Accessibility Considerations

The TabNavigation component follows WAI-ARIA best practices for tab interfaces:

- Uses proper `role="tablist"`, `role="tab"`, and `aria-selected` attributes
- Supports keyboard navigation (implemented by the browser's native button focus handling)
- Includes `aria-controls` to establish relationship between tabs and their content
- Properly handles disabled states

## Best Practices

1. **Keep tab labels concise** - Use short, descriptive labels that clearly indicate the content
2. **Use consistent tab patterns** across the application
3. **Consider tab hierarchy** - Don't nest tab interfaces too deeply
4. **Provide visual feedback** - The active tab should be clearly distinguishable
5. **Use appropriate variants** - Choose the variant that best fits the UI context:
   - `underline` for main page navigation
   - `filled` for content area navigation
   - `minimal` for secondary navigation areas