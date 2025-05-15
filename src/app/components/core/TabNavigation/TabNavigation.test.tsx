import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabNavigation, TabItem } from './index';
import { AppError, ErrorCategory } from '../../../services/utils/errorHandling';

describe('TabNavigation', () => {
  // Sample tabs for testing
  const sampleTabs: TabItem[] = [
    { id: 'tab1', label: 'First Tab' },
    { id: 'tab2', label: 'Second Tab' },
    { id: 'tab3', label: 'Third Tab' },
  ];

  // Basic rendering tests
  test('renders all tabs', () => {
    const handleChange = jest.fn();
    render(
      <TabNavigation
        tabs={sampleTabs}
        onChange={handleChange}
      />
    );
    
    expect(screen.getByText('First Tab')).toBeInTheDocument();
    expect(screen.getByText('Second Tab')).toBeInTheDocument();
    expect(screen.getByText('Third Tab')).toBeInTheDocument();
  });
  
  test('renders active tab based on activeTab prop', () => {
    const handleChange = jest.fn();
    render(
      <TabNavigation
        tabs={sampleTabs}
        activeTab="tab2"
        onChange={handleChange}
      />
    );
    
    const tab2 = screen.getByRole('tab', { name: 'Second Tab' });
    expect(tab2).toHaveAttribute('aria-selected', 'true');
  });
  
  test('defaults to first tab as active if activeTab not provided', () => {
    const handleChange = jest.fn();
    render(
      <TabNavigation
        tabs={sampleTabs}
        onChange={handleChange}
      />
    );
    
    const tab1 = screen.getByRole('tab', { name: 'First Tab' });
    expect(tab1).toHaveAttribute('aria-selected', 'true');
  });

  // Interaction tests
  test('calls onChange when tab is clicked', () => {
    const handleChange = jest.fn();
    render(
      <TabNavigation
        tabs={sampleTabs}
        onChange={handleChange}
      />
    );
    
    fireEvent.click(screen.getByText('Second Tab'));
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });
  
  test('updates active tab when clicked', () => {
    const handleChange = jest.fn();
    render(
      <TabNavigation
        tabs={sampleTabs}
        onChange={handleChange}
      />
    );
    
    // Initially the first tab should be active
    expect(screen.getByRole('tab', { name: 'First Tab' })).toHaveAttribute('aria-selected', 'true');
    
    // Click the second tab
    fireEvent.click(screen.getByText('Second Tab'));
    
    // Second tab should now be active
    expect(screen.getByRole('tab', { name: 'Second Tab' })).toHaveAttribute('aria-selected', 'true');
  });
  
  test('does not call onChange when disabled tab is clicked', () => {
    const handleChange = jest.fn();
    const tabsWithDisabled = [
      ...sampleTabs,
      { id: 'tab4', label: 'Disabled Tab', disabled: true }
    ];
    
    render(
      <TabNavigation
        tabs={tabsWithDisabled}
        onChange={handleChange}
      />
    );
    
    fireEvent.click(screen.getByText('Disabled Tab'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  // Variant tests
  test('renders with underline variant by default', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <TabNavigation
        tabs={sampleTabs}
        onChange={handleChange}
      />
    );
    
    // Should have border-b class on container
    expect(container.firstChild).toHaveClass('border-b');
  });
  
  test('renders with filled variant', () => {
    const handleChange = jest.fn();
    render(
      <TabNavigation
        tabs={sampleTabs}
        variant="filled"
        onChange={handleChange}
      />
    );
    
    // Active tab should have bg-gray-700 class
    const activeTab = screen.getByRole('tab', { selected: true });
    expect(activeTab).toHaveClass('bg-gray-700');
  });
  
  test('renders with minimal variant', () => {
    const handleChange = jest.fn();
    render(
      <TabNavigation
        tabs={sampleTabs}
        variant="minimal"
        onChange={handleChange}
      />
    );
    
    // Active tab should not have border or background classes
    const activeTab = screen.getByRole('tab', { selected: true });
    expect(activeTab).not.toHaveClass('border-b-2');
    expect(activeTab).not.toHaveClass('bg-gray-700');
  });

  // Size tests
  test('renders with small size', () => {
    const handleChange = jest.fn();
    render(
      <TabNavigation
        tabs={sampleTabs}
        size="sm"
        onChange={handleChange}
      />
    );
    
    const tab = screen.getByRole('tab', { name: 'First Tab' });
    expect(tab).toHaveClass('text-xs');
  });
  
  test('renders with large size', () => {
    const handleChange = jest.fn();
    render(
      <TabNavigation
        tabs={sampleTabs}
        size="lg"
        onChange={handleChange}
      />
    );
    
    const tab = screen.getByRole('tab', { name: 'First Tab' });
    expect(tab).toHaveClass('text-base');
  });

  // Orientation tests
  test('renders with vertical orientation', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <TabNavigation
        tabs={sampleTabs}
        orientation="vertical"
        onChange={handleChange}
      />
    );
    
    expect(container.firstChild).toHaveClass('flex-col');
  });

  // Badge tests
  test('renders tabs with badges', () => {
    const handleChange = jest.fn();
    const tabsWithBadges = [
      { id: 'tab1', label: 'First Tab', badge: 5, badgeColor: 'red' as const },
      { id: 'tab2', label: 'Second Tab', badge: 'New', badgeColor: 'green' as const },
      { id: 'tab3', label: 'Third Tab' },
    ];
    
    render(
      <TabNavigation
        tabs={tabsWithBadges}
        onChange={handleChange}
      />
    );
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    
    // Check badge colors
    const badge1 = screen.getByText('5');
    const badge2 = screen.getByText('New');
    
    expect(badge1.parentElement).toHaveClass('bg-red-600');
    expect(badge2.parentElement).toHaveClass('bg-green-600');
  });

  // Icon tests
  test('renders tabs with icons', () => {
    const handleChange = jest.fn();
    const tabsWithIcons = [
      { 
        id: 'tab1', 
        label: 'First Tab', 
        icon: <svg data-testid="icon1" /> 
      },
      { 
        id: 'tab2', 
        label: 'Second Tab', 
        icon: <svg data-testid="icon2" /> 
      },
      { id: 'tab3', label: 'Third Tab' },
    ];
    
    render(
      <TabNavigation
        tabs={tabsWithIcons}
        onChange={handleChange}
      />
    );
    
    expect(screen.getByTestId('icon1')).toBeInTheDocument();
    expect(screen.getByTestId('icon2')).toBeInTheDocument();
  });

  // Error handling tests
  test('handles errors in onChange callback gracefully', () => {
    // Mock the error service
    const mockErrorService = {
      handleError: jest.fn()
    };
    
    // Create a handler that throws an error
    const handleChange = jest.fn().mockImplementation(() => {
      throw new Error('Test error in onChange');
    });
    
    // Should not throw but should call error service
    render(
      <TabNavigation
        tabs={sampleTabs}
        onChange={handleChange}
        errorService={mockErrorService as any}
      />
    );
    
    // Click a tab to trigger the error
    fireEvent.click(screen.getByText('Second Tab'));
    
    // Error handler should have been called
    expect(mockErrorService.handleError).toHaveBeenCalled();
  });
  
  test('processes error prop through error service', () => {
    // Mock the error service
    const mockErrorService = {
      handleError: jest.fn()
    };
    
    const testError = new AppError('VALIDATION_ERROR', {
      message: 'Test error via prop',
      category: ErrorCategory.VALIDATION
    });
    
    render(
      <TabNavigation
        tabs={sampleTabs}
        onChange={jest.fn()}
        errorService={mockErrorService as any}
        error={testError}
      />
    );
    
    // Error handler should have been called with the error
    expect(mockErrorService.handleError).toHaveBeenCalledWith(testError, {
      context: { component: 'TabNavigation' }
    });
  });
});