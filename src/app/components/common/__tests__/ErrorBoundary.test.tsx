import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { IErrorService } from '../../../services/interfaces/IErrorService';

// Composant qui génère une erreur sur demande
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock pour IErrorService
const createMockErrorService = (): IErrorService => ({
  handleError: jest.fn(),
  configure: jest.fn(),
  addErrorHandler: jest.fn(),
  removeErrorHandler: jest.fn(),
  createErrorResult: jest.fn(),
  createSuccessResult: jest.fn(),
  isErrorOfCategory: jest.fn(),
  isErrorOfCode: jest.fn(),
  createValidationError: jest.fn(),
  createAuthError: jest.fn(),
  createNotFoundError: jest.fn(),
  tryOperation: jest.fn(),
  getRecentErrors: jest.fn(),
  setLogLevel: jest.fn()
});

// Ignorer les erreurs de console pendant les tests
// Car ErrorBoundary génère des errors dans la console, ce qui est normal
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('devrait rendre les enfants quand il n\'y a pas d\'erreur', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Test Child</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
  
  it('devrait afficher le fallback par défaut quand une erreur est levée', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Vérifier que le message d'erreur est affiché
    expect(screen.getByText(/Une erreur est survenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
    
    // Vérifier que le bouton de réinitialisation est présent
    const resetButton = screen.getByText(/Réessayer/i);
    expect(resetButton).toBeInTheDocument();
  });
  
  it('devrait afficher un fallback personnalisé si fourni', () => {
    render(
      <ErrorBoundary 
        fallback={<div data-testid="custom-fallback">Custom Error UI</div>}
      >
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });
  
  it('devrait appeler la fonction fallback avec l\'erreur et la fonction de réinitialisation', () => {
    const mockFallback = jest.fn().mockReturnValue(
      <div data-testid="functional-fallback">Functional Fallback</div>
    );
    
    render(
      <ErrorBoundary fallback={mockFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Vérifier que le fallback a été appelé avec les bons arguments
    expect(mockFallback).toHaveBeenCalledTimes(1);
    expect(mockFallback.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(mockFallback.mock.calls[0][0].message).toBe('Test error');
    expect(typeof mockFallback.mock.calls[0][1]).toBe('function'); // resetError function
    
    // Vérifier que le rendu du fallback est correct
    expect(screen.getByTestId('functional-fallback')).toBeInTheDocument();
  });
  
  it('devrait appeler le service d\'erreur fourni', () => {
    const mockErrorService = createMockErrorService();
    
    render(
      <ErrorBoundary errorService={mockErrorService}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Vérifier que handleError a été appelé
    expect(mockErrorService.handleError).toHaveBeenCalledTimes(1);
    expect(mockErrorService.handleError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.objectContaining({ 
        context: expect.objectContaining({ component: 'ErrorBoundary' }) 
      })
    );
  });
  
  it('devrait réinitialiser l\'erreur lorsqu\'on clique sur le bouton', () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      return (
        <ErrorBoundary>
          {shouldThrow ? (
            // Cette ligne va lever une erreur et afficher le fallback
            <ThrowError shouldThrow={true} />
          ) : (
            <div data-testid="recovered">Recovered</div>
          )}
          {/* Un bouton externe pour changer l'état */}
          <button 
            onClick={() => setShouldThrow(false)}
            data-testid="external-fix"
          >
            Fix
          </button>
        </ErrorBoundary>
      );
    };
    
    render(<TestComponent />);
    
    // Initialement, l'erreur est affichée
    expect(screen.getByText(/Une erreur est survenue/i)).toBeInTheDocument();
    
    // Cliquer sur le bouton de réinitialisation
    fireEvent.click(screen.getByText(/Réessayer/i));
    
    // Le composant est réinitialisé et va à nouveau lever l'erreur
    expect(screen.getByText(/Une erreur est survenue/i)).toBeInTheDocument();
    
    // Maintenant, fixons l'erreur avant de réessayer
    fireEvent.click(screen.getByTestId('external-fix'));
    fireEvent.click(screen.getByText(/Réessayer/i));
    
    // Le composant devrait maintenant être affiché sans erreur
    expect(screen.getByTestId('recovered')).toBeInTheDocument();
  });
  
  it('devrait appeler onError si fourni', () => {
    const onErrorMock = jest.fn();
    
    render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onErrorMock.mock.calls[0][0].message).toBe('Test error');
    expect(onErrorMock.mock.calls[0][1]).toBeDefined(); // errorInfo
  });
});