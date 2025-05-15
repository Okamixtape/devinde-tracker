/**
 * Core UI Components
 * 
 * This barrel file exports all core UI components that form the foundation
 * of the DevIndé Tracker application interface. These components are designed
 * to be reusable, consistent with the design system, and serve as building
 * blocks for business and page components.
 */

// Containers and layout components
export { default as CardContainer } from './CardContainer';
export { ErrorBoundary } from './ErrorBoundary';
export { default as TabNavigation } from './TabNavigation';
export { default as DataVisualization } from './DataVisualization';

// To be implemented based on the design-to-implementation matrix:
// export { AppLayout } from './Layout';
// export { Button } from './Button';
// export { Input } from './FormControls';
// export { Modal } from './Modal';
// export { Table } from './Table';
// export { Tabs } from './Tabs'; // Implemented as TabNavigation
// export { ProgressBar } from './ProgressBar'; // Implemented in DataVisualization
// export { Badge } from './Badge';
// export { Chart } from './Chart'; // Implemented in DataVisualization
// export { MetricDisplay } from './MetricDisplay'; // Implemented as MetricCard in DataVisualization
// export { Timeline } from './Timeline';