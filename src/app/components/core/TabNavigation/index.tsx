import React, { useState, useEffect } from 'react';
import errorService, { ErrorService } from '../../../services/core/errorService';
import { ErrorCategory } from '../../../services/utils/errorHandling';

export type TabItem = {
  /**
   * Unique identifier for the tab
   */
  id: string;
  
  /**
   * Display label for the tab
   */
  label: string;
  
  /**
   * Optional icon component to display with the label
   */
  icon?: React.ReactNode;
  
  /**
   * Optional badge count or text to display
   */
  badge?: string | number;
  
  /**
   * Optional color for the badge
   */
  badgeColor?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  
  /**
   * Optional disabled state
   */
  disabled?: boolean;
};

export interface TabNavigationProps {
  /**
   * Array of tab items to display
   */
  tabs: TabItem[];
  
  /**
   * ID of the currently active tab
   */
  activeTab?: string;
  
  /**
   * Function called when a tab is clicked
   */
  onChange: (tabId: string) => void;
  
  /**
   * Visual variant of the tab navigation
   */
  variant?: 'underline' | 'filled' | 'minimal';
  
  /**
   * Orientation of the tabs
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Size of the tabs
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Allow tabs to scroll horizontally if they overflow
   */
  scrollable?: boolean;
  
  /**
   * Custom CSS class for the container
   */
  className?: string;
  
  /**
   * Optional error service instance for error handling
   */
  errorService?: ErrorService;
  
  /**
   * Error state
   */
  error?: Error | unknown;
}

/**
 * TabNavigation - A versatile tabbed navigation component
 * 
 * This component implements the standardized tab navigation pattern found
 * throughout the application design mockups. It provides consistent styling
 * for tab navigation with support for icons, badges, and different visual variants.
 */
export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  orientation = 'horizontal',
  size = 'md',
  scrollable = false,
  className = '',
  errorService: providedErrorService,
  error
}) => {
  // Use the first tab as default active tab if none provided
  const [activeTabId, setActiveTabId] = useState<string>(activeTab || (tabs.length > 0 ? tabs[0].id : ''));
  
  // Use the provided errorService or the default instance
  const errService = providedErrorService || errorService;
  
  // Update active tab if the prop changes
  useEffect(() => {
    if (activeTab) {
      setActiveTabId(activeTab);
    }
  }, [activeTab]);
  
  // Handle tab click
  const handleTabClick = (tabId: string, disabled: boolean = false) => {
    if (disabled) return;
    
    try {
      setActiveTabId(tabId);
      onChange(tabId);
    } catch (err) {
      errService.handleError(err, {
        context: { component: 'TabNavigation', action: 'handleTabClick', tabId }
      });
    }
  };
  
  // Process any errors
  useEffect(() => {
    if (error) {
      errService.handleError(error, {
        context: { component: 'TabNavigation' }
      });
    }
  }, [error, errService]);
  
  // Get size-specific classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs py-2 px-2';
      case 'lg': return 'text-base py-4 px-4';
      default: return 'text-sm py-3 px-3'; // md size
    }
  };
  
  // Get badge color classes
  const getBadgeColorClasses = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-600 text-white';
      case 'green': return 'bg-green-600 text-white';
      case 'yellow': return 'bg-yellow-600 text-white';
      case 'red': return 'bg-red-600 text-white';
      case 'purple': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };
  
  // Get tab classes based on variant, state, etc.
  const getTabClasses = (tab: TabItem) => {
    const isActive = tab.id === activeTabId;
    const baseClasses = `
      flex items-center font-medium transition-colors
      ${getSizeClasses()}
      ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;
    
    // Variant-specific classes
    let variantClasses = '';
    switch (variant) {
      case 'filled':
        variantClasses = isActive
          ? 'bg-gray-700 text-white rounded-md'
          : 'text-gray-400 hover:text-white hover:bg-gray-700 bg-opacity-50 rounded-md';
        break;
      case 'minimal':
        variantClasses = isActive
          ? 'text-white'
          : 'text-gray-400 hover:text-white';
        break;
      case 'underline':
      default:
        variantClasses = isActive
          ? 'border-b-2 border-blue-500 text-blue-500'
          : 'border-b-2 border-transparent hover:border-gray-600 text-gray-400 hover:text-gray-300';
        break;
    }
    
    return `${baseClasses} ${variantClasses}`;
  };
  
  // Get container classes based on orientation and scrollable
  const getContainerClasses = () => {
    let containerClasses = '';
    
    if (orientation === 'vertical') {
      containerClasses = 'flex flex-col space-y-1';
    } else {
      containerClasses = scrollable
        ? 'flex overflow-x-auto hide-scrollbar'
        : 'flex space-x-6';
    }
    
    // Add variant-specific container classes
    if (variant === 'underline' && orientation === 'horizontal') {
      containerClasses += ' border-b border-gray-700';
    }
    
    return `${containerClasses} ${className}`;
  };
  
  return (
    <nav className={getContainerClasses()} role="tablist" aria-orientation={orientation}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeTabId}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
          className={getTabClasses(tab)}
          onClick={() => handleTabClick(tab.id, tab.disabled)}
          disabled={tab.disabled}
          data-testid={`tab-${tab.id}`}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.badge !== undefined && (
            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${getBadgeColorClasses(tab.badgeColor)}`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation;