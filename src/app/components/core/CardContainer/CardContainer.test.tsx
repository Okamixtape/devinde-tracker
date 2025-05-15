import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardContainer } from './index';
import { AppError, ErrorCategory } from '../../../services/utils/errorHandling';

describe('CardContainer', () => {
  // Basic rendering tests
  test('renders with title and content', () => {
    render(
      <CardContainer title="Test Title">
        <p>Test Content</p>
      </CardContainer>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  test('renders with subtitle', () => {
    render(
      <CardContainer 
        title="Test Title" 
        subtitle="Test Subtitle"
      >
        <p>Test Content</p>
      </CardContainer>
    );
    
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });
  
  test('renders with footer', () => {
    render(
      <CardContainer 
        title="Test Title" 
        footer={<div>Footer Content</div>}
      >
        <p>Test Content</p>
      </CardContainer>
    );
    
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });
  
  test('renders with action buttons', () => {
    render(
      <CardContainer 
        title="Test Title" 
        actions={<button>Action Button</button>}
      >
        <p>Test Content</p>
      </CardContainer>
    );
    
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  // Status styling tests
  test('renders with success status', () => {
    const { container } = render(
      <CardContainer 
        title="Success Card" 
        status="success"
      >
        <p>Test Content</p>
      </CardContainer>
    );
    
    expect(container.firstChild).toHaveClass('border-green-500');
  });
  
  test('renders with warning status', () => {
    const { container } = render(
      <CardContainer 
        title="Warning Card" 
        status="warning"
      >
        <p>Test Content</p>
      </CardContainer>
    );
    
    expect(container.firstChild).toHaveClass('border-yellow-500');
  });
  
  test('renders with error status', () => {
    const { container } = render(
      <CardContainer 
        title="Error Card" 
        status="error"
      >
        <p>Test Content</p>
      </CardContainer>
    );
    
    expect(container.firstChild).toHaveClass('border-red-500');
  });
  
  test('renders with info status', () => {
    const { container } = render(
      <CardContainer 
        title="Info Card" 
        status="info"
      >
        <p>Test Content</p>
      </CardContainer>
    );
    
    expect(container.firstChild).toHaveClass('border-blue-500');
  });

  // State handling tests
  test('renders loading state', () => {
    render(
      <CardContainer 
        title="Loading Card" 
        isLoading={true}
      >
        <p>This content should not be visible</p>
      </CardContainer>
    );
    
    expect(screen.getByText('Chargement en cours...')).toBeInTheDocument();
    expect(screen.queryByText('This content should not be visible')).not.toBeInTheDocument();
  });
  
  test('renders empty state with default message', () => {
    render(
      <CardContainer 
        title="Empty Card" 
        isEmpty={true}
      >
        <p>This content should not be visible</p>
      </CardContainer>
    );
    
    expect(screen.getByText('Aucun élément à afficher')).toBeInTheDocument();
    expect(screen.queryByText('This content should not be visible')).not.toBeInTheDocument();
  });
  
  test('renders empty state with custom message', () => {
    render(
      <CardContainer 
        title="Empty Card" 
        isEmpty={true}
        emptyMessage="Custom empty message"
      >
        <p>This content should not be visible</p>
      </CardContainer>
    );
    
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });
  
  test('renders custom empty component', () => {
    render(
      <CardContainer 
        title="Empty Card" 
        isEmpty={true}
        emptyComponent={<div>Custom empty component</div>}
      >
        <p>This content should not be visible</p>
      </CardContainer>
    );
    
    expect(screen.getByText('Custom empty component')).toBeInTheDocument();
  });
  
  test('renders error state', () => {
    const testError = new Error('Test error message');
    
    render(
      <CardContainer 
        title="Error Card" 
        error={testError}
      >
        <p>This content should not be visible</p>
      </CardContainer>
    );
    
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.queryByText('This content should not be visible')).not.toBeInTheDocument();
  });
  
  test('renders error state with AppError', () => {
    const appError = new AppError('NETWORK_ERROR', {
      message: 'Network connection failed',
      category: ErrorCategory.NETWORK
    });
    
    render(
      <CardContainer 
        title="Network Error Card" 
        error={appError}
      >
        <p>This content should not be visible</p>
      </CardContainer>
    );
    
    expect(screen.getByText('Network connection failed')).toBeInTheDocument();
  });
  
  test('calls onRetry when retry button is clicked', () => {
    const mockRetry = jest.fn();
    
    render(
      <CardContainer 
        title="Error Card" 
        error={new Error('Test error')}
        onRetry={mockRetry}
      >
        <p>This content should not be visible</p>
      </CardContainer>
    );
    
    fireEvent.click(screen.getByText('Réessayer'));
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
  
  test('does not show error when showInlineError is false', () => {
    render(
      <CardContainer 
        title="Error Card" 
        error={new Error('Test error')}
        showInlineError={false}
      >
        <p>This content should be visible</p>
      </CardContainer>
    );
    
    expect(screen.queryByText('Une erreur est survenue')).not.toBeInTheDocument();
    expect(screen.getByText('This content should be visible')).toBeInTheDocument();
  });
});