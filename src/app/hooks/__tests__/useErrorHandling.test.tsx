import { renderHook, act } from '@testing-library/react';
import { useErrorHandling } from '../useErrorHandling';
import { IErrorService } from '../../services/interfaces/IErrorService';

// Mock pour IErrorService
const createMockErrorService = () => ({
  handleError: jest.fn().mockReturnValue({ error: { message: 'Handled error' } }),
  configure: jest.fn(),
  addErrorHandler: jest.fn(),
  removeErrorHandler: jest.fn(),
  createErrorResult: jest.fn().mockReturnValue({ success: false, error: { message: 'Error result' } }),
  createSuccessResult: jest.fn(data => ({ success: true, data })),
  isErrorOfCategory: jest.fn(),
  isErrorOfCode: jest.fn(),
  createValidationError: jest.fn(),
  createAuthError: jest.fn(),
  createNotFoundError: jest.fn(),
  tryOperation: jest.fn(),
  getRecentErrors: jest.fn(),
  setLogLevel: jest.fn()
});

describe('useErrorHandling', () => {
  it('devrait initialiser avec les valeurs par défaut', () => {
    const { result } = renderHook(() => useErrorHandling());
    
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.handleError).toBe('function');
    expect(typeof result.current.withErrorHandling).toBe('function');
    expect(typeof result.current.withServiceResult).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });
  
  it('devrait utiliser le service d\'erreur fourni', () => {
    const mockErrorService = createMockErrorService();
    const { result } = renderHook(() => useErrorHandling(mockErrorService));
    
    act(() => {
      result.current.handleError(new Error('Test error'));
    });
    
    expect(mockErrorService.handleError).toHaveBeenCalled();
    expect(mockErrorService.handleError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.anything()
    );
  });
  
  describe('handleError', () => {
    it('devrait manipuler une erreur et mettre à jour l\'état', () => {
      const { result } = renderHook(() => useErrorHandling());
      
      act(() => {
        result.current.handleError(new Error('Test error'));
      });
      
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe('Test error');
      expect(result.current.isLoading).toBe(false);
    });
    
    it('devrait convertir une non-erreur en erreur', () => {
      const { result } = renderHook(() => useErrorHandling());
      
      act(() => {
        result.current.handleError('This is a string, not an Error');
      });
      
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe('This is a string, not an Error');
    });
  });
  
  describe('withErrorHandling', () => {
    it('devrait encapsuler une fonction asynchrone et gérer son succès', async () => {
      const { result } = renderHook(() => useErrorHandling());
      
      const successFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = result.current.withErrorHandling(successFn);
      
      let returnValue;
      await act(async () => {
        returnValue = await wrappedFn('arg1', 'arg2');
      });
      
      expect(successFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(returnValue).toBe('success');
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
    
    it('devrait encapsuler une fonction asynchrone et gérer son échec', async () => {
      const { result } = renderHook(() => useErrorHandling());
      
      const errorFn = jest.fn().mockRejectedValue(new Error('Async error'));
      const wrappedFn = result.current.withErrorHandling(errorFn);
      
      let returnValue;
      await act(async () => {
        returnValue = await wrappedFn();
      });
      
      expect(errorFn).toHaveBeenCalled();
      expect(returnValue).toBeNull();
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe('Async error');
      expect(result.current.isLoading).toBe(false);
    });
    
    it('devrait définir isLoading pendant l\'exécution', async () => {
      const { result } = renderHook(() => useErrorHandling());
      
      // Fonction async avec délai
      const delayedFn = jest.fn().mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve('success'), 100);
      }));
      
      const wrappedFn = result.current.withErrorHandling(delayedFn);
      
      let isLoadingDuringExecution = false;
      let promise;
      
      act(() => {
        promise = wrappedFn();
        isLoadingDuringExecution = result.current.isLoading;
      });
      
      expect(isLoadingDuringExecution).toBe(true);
      
      await act(async () => {
        await promise;
      });
      
      expect(result.current.isLoading).toBe(false);
    });
  });
  
  describe('withServiceResult', () => {
    it('devrait retourner un ServiceResult réussi', async () => {
      const mockErrorService = createMockErrorService();
      const { result } = renderHook(() => useErrorHandling(mockErrorService));
      
      const successFn = jest.fn().mockResolvedValue('success data');
      const wrappedFn = result.current.withServiceResult(successFn);
      
      let serviceResult;
      await act(async () => {
        serviceResult = await wrappedFn();
      });
      
      expect(mockErrorService.createSuccessResult).toHaveBeenCalledWith('success data');
      expect(serviceResult.success).toBe(true);
      expect(serviceResult.data).toBe('success data');
    });
    
    it('devrait retourner un ServiceResult d\'erreur', async () => {
      const mockErrorService = createMockErrorService();
      const { result } = renderHook(() => useErrorHandling(mockErrorService));
      
      const error = new Error('Service error');
      const errorFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = result.current.withServiceResult(errorFn);
      
      let serviceResult;
      await act(async () => {
        serviceResult = await wrappedFn();
      });
      
      expect(mockErrorService.handleError).toHaveBeenCalledWith(error, expect.anything());
      expect(mockErrorService.createErrorResult).toHaveBeenCalled();
      expect(serviceResult.success).toBe(false);
      expect(serviceResult.error).toBeDefined();
    });
  });
  
  describe('clearError', () => {
    it('devrait effacer l\'erreur actuelle', () => {
      const { result } = renderHook(() => useErrorHandling());
      
      // Définir une erreur
      act(() => {
        result.current.handleError(new Error('Test error'));
      });
      
      expect(result.current.error).not.toBeNull();
      
      // Effacer l'erreur
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBeNull();
    });
  });
  
  describe('isErrorOfType', () => {
    it('devrait vérifier si l\'erreur correspond à un type spécifique', () => {
      const { result } = renderHook(() => useErrorHandling());
      
      // Pas d'erreur initialement
      expect(result.current.isErrorOfType('ValidationError')).toBe(false);
      
      // Définir une erreur
      act(() => {
        const validationError = new Error('Validation failed');
        validationError.name = 'ValidationError';
        result.current.handleError(validationError);
      });
      
      expect(result.current.isErrorOfType('ValidationError')).toBe(true);
      expect(result.current.isErrorOfType('OtherError')).toBe(false);
      
      // Vérifier avec une regex
      expect(result.current.isErrorOfType(/Validation/)).toBe(true);
      expect(result.current.isErrorOfType(/Other/)).toBe(false);
    });
  });
});