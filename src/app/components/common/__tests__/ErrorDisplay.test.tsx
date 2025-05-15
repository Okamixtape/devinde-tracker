import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from '../ErrorDisplay';
import { AppError, ErrorCategory, ErrorSeverity } from '../../../services/utils/errorHandling';

describe('ErrorDisplay', () => {
  it('devrait afficher une erreur standard', () => {
    render(<ErrorDisplay error={new Error('Test error')} />);
    
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
  
  it('devrait afficher une AppError avec la catégorie et la sévérité appropriées', () => {
    const error = new AppError('INVALID_INPUT', {
      message: 'Format de courriel invalide',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.WARNING,
      details: { field: 'email' }
    });
    
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Format de courriel invalide')).toBeInTheDocument();
    expect(screen.getByText('Erreur de validation')).toBeInTheDocument();
  });
  
  it('devrait afficher un bouton de réessai si onRetry est fourni', () => {
    const onRetry = jest.fn();
    
    render(
      <ErrorDisplay 
        error={new Error('Test error')} 
        onRetry={onRetry}
        retryText="Retenter"
      />
    );
    
    const retryButton = screen.getByText('Retenter');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
  
  it('devrait afficher un bouton de fermeture si onDismiss est fourni', () => {
    const onDismiss = jest.fn();
    
    render(
      <ErrorDisplay 
        error={new Error('Test error')} 
        onDismiss={onDismiss}
        dismissText="Fermer"
      />
    );
    
    const dismissButton = screen.getByText('Fermer');
    expect(dismissButton).toBeInTheDocument();
    
    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
  
  it('devrait afficher les détails de l\'erreur si showDetails est true', () => {
    const error = new AppError('INVALID_INPUT', {
      message: 'Format de courriel invalide',
      details: { field: 'email', value: 'test', reason: 'format' }
    });
    
    render(
      <ErrorDisplay 
        error={error} 
        showDetails={true}
      />
    );
    
    // Le bouton "Afficher les détails" devrait être présent
    const detailsButton = screen.getByText('Afficher les détails');
    expect(detailsButton).toBeInTheDocument();
    
    // Ouvrir les détails
    fireEvent.click(detailsButton);
    
    // Le détail devrait contenir des informations sur l'erreur
    expect(screen.getByText(/"field": "email"/)).toBeInTheDocument();
    expect(screen.getByText(/"value": "test"/)).toBeInTheDocument();
  });
  
  describe('Variants', () => {
    it('devrait appliquer le style banner', () => {
      const { container } = render(
        <ErrorDisplay 
          error={new Error('Test error')} 
          variant="banner"
        />
      );
      
      // Vérifier que la classe contient w-full
      expect(container.firstChild).toHaveClass('w-full');
    });
    
    it('devrait appliquer le style card', () => {
      const { container } = render(
        <ErrorDisplay 
          error={new Error('Test error')} 
          variant="card"
        />
      );
      
      // Vérifier que la classe contient rounded-lg
      expect(container.firstChild).toHaveClass('rounded-lg');
    });
    
    it('devrait appliquer le style inline', () => {
      const { container } = render(
        <ErrorDisplay 
          error={new Error('Test error')} 
          variant="inline"
        />
      );
      
      // Vérifier que la classe contient flex items-center
      expect(container.firstChild).toHaveClass('flex');
      expect(container.firstChild).toHaveClass('items-center');
    });
    
    it('devrait appliquer le style toast', () => {
      const { container } = render(
        <ErrorDisplay 
          error={new Error('Test error')} 
          variant="toast"
        />
      );
      
      // Vérifier que la classe contient max-w-md
      expect(container.firstChild).toHaveClass('max-w-md');
    });
  });
  
  it('devrait appliquer des classes additionnelles via className', () => {
    const { container } = render(
      <ErrorDisplay 
        error={new Error('Test error')} 
        className="my-custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});