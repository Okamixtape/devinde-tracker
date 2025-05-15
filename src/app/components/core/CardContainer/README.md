# CardContainer Component

The `CardContainer` component is a foundational UI element used throughout the DevIndé Tracker application. It provides a consistent, visually appealing container for various types of content, with built-in support for loading, empty, and error states.

## Features

- **Consistent styling** based on the design system
- **Error handling** via IErrorService integration
- **Loading, empty, and error states** out of the box
- **Status variations** (default, success, warning, error, info)
- **Customizable sections** (header, content, footer)
- **Accessibility** focused design

## Integration with Architecture

The CardContainer component follows our standardized architecture:

1. **Core UI Component**: It's a foundational building block for other components
2. **Uses IErrorService**: Integrates with the error handling service
3. **Presentation Component**: Focuses on UI with minimal business logic
4. **Composable**: Supports composition through children and props

## Basic Usage

```tsx
import { CardContainer } from '../core/CardContainer';

// Simple card with title and content
<CardContainer title="User Profile">
  <div>
    <p>Name: John Doe</p>
    <p>Email: john@example.com</p>
  </div>
</CardContainer>

// Card with actions
<CardContainer 
  title="Settings"
  actions={
    <button className="bg-blue-600 px-4 py-2 rounded-md">
      Save Changes
    </button>
  }
>
  <form>
    {/* Form fields */}
  </form>
</CardContainer>

// Card with footer
<CardContainer 
  title="Recent Activity"
  footer={
    <div className="flex justify-between">
      <span>Last updated: 2 hours ago</span>
      <button className="text-blue-400">View all</button>
    </div>
  }
>
  <ul>
    {/* Activity items */}
  </ul>
</CardContainer>
```

## State Management Examples

### Loading State

```tsx
<CardContainer
  title="Customer Data"
  isLoading={isLoading}
>
  <CustomerDetails customer={customer} />
</CardContainer>
```

### Empty State

```tsx
<CardContainer
  title="Projects"
  isEmpty={projects.length === 0}
  emptyMessage="No projects found. Create your first project to get started."
>
  <ProjectList projects={projects} />
</CardContainer>
```

### Error State

```tsx
<CardContainer
  title="Financial Summary"
  error={error}
  onRetry={fetchFinancialData}
>
  <FinancialChart data={financialData} />
</CardContainer>
```

## Integration with Hooks and Services

The CardContainer works seamlessly with our hooks for data fetching:

```tsx
import { useBusinessModel } from '../../../hooks/useBusinessModel';
import { CardContainer } from '../../core/CardContainer';

const BusinessModelSection = ({ businessPlanId }) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useBusinessModel(businessPlanId);

  return (
    <CardContainer
      title="Business Model"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      isEmpty={!data || Object.keys(data).length === 0}
      emptyMessage="No business model data available."
    >
      {data && <BusinessModelContent data={data} />}
    </CardContainer>
  );
};
```

## Advanced Usage: Custom Error Handling

You can provide a custom error service or modify error handling behavior:

```tsx
import errorService from '../../../services/core/errorService';
import { CardContainer } from '../../core/CardContainer';

// Create custom error handler
const customErrorHandler = (error) => {
  console.warn('Custom error handling:', error);
  // Additional logging, tracking, etc.
};

// Add the custom handler to the error service
errorService.addErrorHandler(customErrorHandler);

// Use in component
<CardContainer
  title="Custom Error Handling"
  error={someError}
  errorService={errorService}
  showInlineError={true}
  onRetry={retryFunction}
>
  <ComponentContent />
</CardContainer>
```

## Integration with Matrix Design-Implementation

The CardContainer component is a foundational element in our design-to-implementation matrix. It implements the card pattern used consistently throughout the design mockups:

- **Dashboard.tsx**: Used for metric cards, section navigation cards, and activity summaries
- **BusinessModel.tsx**: Used for canvas sections, pricing models, and projections
- **FinancialDashboard.tsx**: Used for financial metrics, charts, and project details
- **ActionPlanTimeline.tsx**: Used for milestones, tasks, and timeline segments
- **MarketAnalysis.tsx**: Used for segments, competitors, trends, and opportunities

## Best Practices

1. **Use appropriate status variants** to communicate information effectively:
   - `success` for completed operations or positive information
   - `warning` for potential issues or items needing attention
   - `error` for error conditions or critical information
   - `info` for general information or tips

2. **Provide meaningful error messages** to help users understand and resolve issues

3. **Include retry functionality** when appropriate to allow users to recover from errors

4. **Use consistent action patterns** in the actions slot to maintain UX consistency

5. **Keep card content focused** - each card should represent a single cohesive piece of information or functionality