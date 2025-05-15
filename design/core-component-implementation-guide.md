# Core Component Implementation Guide

This guide provides implementation specifications for core UI components based on the patterns identified in the design mockups.

## Layout Components

### AppLayout

Based on MainLayout.tsx design, this component should provide:

```tsx
interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  errorBoundary?: boolean;
}
```

Key features:
- Responsive sidebar with toggle functionality
- Header with title and action area
- Main content area with appropriate padding
- Error boundary wrapping (optional)
- Footer area (optional)

### PageHeader

Present in all mockups as the top section of the page:

```tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  tabs?: Array<{id: string; label: string}>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}
```

## UI Components

### Card

Used extensively across all designs:

```tsx
interface CardProps {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  status?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}
```

Variants:
- Standard card (with padding)
- Outline card (for add new items)
- Status card (with colored border)
- Metric card (for KPI display)

### Button

Consistent button styling across all designs:

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  isLoading?: boolean;
}
```

### Tabs

Used for navigation in all major components:

```tsx
interface TabsProps {
  tabs: Array<{id: string; label: string; icon?: React.ReactNode}>;
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pill';
}
```

### Badge

Status indicators throughout the interfaces:

```tsx
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  rounded?: boolean;
}
```

### ProgressBar

Used for completion tracking:

```tsx
interface ProgressBarProps {
  value: number; // 0-100
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  label?: string;
}
```

### Input

Form controls with consistent styling:

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftIconClick?: () => void;
  onRightIconClick?: () => void;
}
```

### Select

Dropdown selectors:

```tsx
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
}
```

### Modal

For forms and dialogs:

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

## Data Display Components

### MetricDisplay

For KPI visualization:

```tsx
interface MetricDisplayProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  helpText?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}
```

### Chart

For data visualization:

```tsx
interface ChartProps {
  type: 'bar' | 'line' | 'pie' | 'donut';
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  height?: number | string;
  width?: number | string;
  showLegend?: boolean;
  showLabels?: boolean;
}
```

### Timeline

For action plan visualization:

```tsx
interface TimelineItemProps {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: 'completed' | 'in-progress' | 'planned';
  category?: string;
  tasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}

interface TimelineProps {
  items: TimelineItemProps[];
  view?: 'list' | 'calendar' | 'gantt';
}
```

### Table

For structured data display:

```tsx
interface TableColumn<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  width?: string | number;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  pagination?: {
    pageSize: number;
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
}
```

## Implementation Guidelines

### Styling Approach

Use Tailwind CSS classes with consistent patterns:

1. **Colors**:
   - Primary: blue-600
   - Secondary: gray-700
   - Success: green-500
   - Warning: yellow-500
   - Error: red-500
   - Info: purple-500

2. **Spacing**:
   - Card padding: p-5 or p-6
   - Content gap: gap-4 or gap-6
   - Section margins: space-y-6

3. **Typography**:
   - Headings: text-2xl font-bold (h1), text-lg font-medium (h2)
   - Body text: text-sm
   - Subtle text: text-xs text-gray-400

4. **Shapes**:
   - Border radius: rounded-lg (cards, buttons), rounded-md (inputs, smaller elements)
   - Button padding: px-4 py-2 (default), px-3 py-2 (small)

### Component Architecture

Follow these principles:

1. **Composition over inheritance**
   - Create small, focused components
   - Combine them to build more complex ones

2. **Forward refs for form elements**
   - Use React.forwardRef for all form components

3. **Controlled components**
   - Implement controlled patterns for all inputs
   - Provide uncontrolled fallback with useRef where needed

4. **Error handling**
   - Include error states in all components
   - Provide clear visual feedback for errors

5. **Accessibility**
   - Follow WCAG 2.1 AA standards
   - Use semantic HTML and ARIA attributes
   - Ensure keyboard navigation

6. **Responsive design**
   - Design mobile-first
   - Use responsive utilities for larger screens
   - Test across breakpoints

## Example Implementation Pattern

Example for the Card component:

```tsx
import React from 'react';
import { cn } from '../../utils/cn'; // utility for merging classNames

interface CardProps {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  status?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const getStatusClasses = (status: CardProps['status']) => {
  switch (status) {
    case 'success': return 'border-l-4 border-green-500';
    case 'warning': return 'border-l-4 border-yellow-500';
    case 'error': return 'border-l-4 border-red-500';
    case 'info': return 'border-l-4 border-blue-500';
    default: return '';
  }
};

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  footer,
  status = 'default',
  className,
}) => {
  return (
    <div 
      className={cn(
        'bg-gray-800 rounded-lg shadow-md overflow-hidden',
        getStatusClasses(status),
        className
      )}
    >
      {(title || actions) && (
        <div className="p-5 flex justify-between items-start">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-lg font-medium">{title}</h3>
            ) : title}
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      
      <div className="p-5 pt-0">
        {children}
      </div>
      
      {footer && (
        <div className="bg-gray-700 bg-opacity-50 p-4">
          {footer}
        </div>
      )}
    </div>
  );
};
```