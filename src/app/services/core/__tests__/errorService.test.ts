import { ErrorServiceImpl } from '../errorService.ts.new';
import { AppError, ErrorCategory, ErrorSeverity } from '../../utils/errorHandling';
import { LogLevel } from '../../interfaces/IErrorService';

describe('ErrorService', () => {
  let errorService: ErrorServiceImpl;
  
  beforeEach(() => {
    // Créer une nouvelle instance pour chaque test
    errorService = new ErrorServiceImpl({
      includeDebugInfo: true,
      logErrorsToConsole: false, // Désactiver les logs pendant les tests
      logErrorsToServer: false,
      maxErrorHistorySize: 5
    });
    
    // Mock de console.error pour éviter de polluer la sortie des tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('handleError', () => {
    it('devrait transformer une erreur standard en ErrorResponse', () => {
      const error = new Error('Test error');
      const response = errorService.handleError(error);
      
      expect(response.success).toBe(false);
      expect(response.error.message).toBe('Test error');
      expect(response.error.code).toBeDefined();
    });
    
    it('devrait conserver les détails d\'une AppError', () => {
      const error = new AppError('INVALID_INPUT', {
        message: 'Données invalides',
        category: ErrorCategory.VALIDATION,
        details: { field: 'email' }
      });
      
      const response = errorService.handleError(error);
      
      expect(response.success).toBe(false);
      expect(response.error.message).toBe('Données invalides');
      expect(response.error.category).toBe(ErrorCategory.VALIDATION);
      expect(response.error.details).toEqual({ field: 'email' });
    });
    
    it('devrait ajouter l\'erreur à l\'historique', () => {
      const error = new Error('Test error');
      errorService.handleError(error);
      
      const history = errorService.getRecentErrors();
      expect(history.length).toBe(1);
      expect(history[0].error.error.message).toBe('Test error');
    });
    
    it('devrait limiter la taille de l\'historique', () => {
      // Ajouter plus d'erreurs que la limite
      for (let i = 0; i < 10; i++) {
        errorService.handleError(new Error(`Error ${i}`));
      }
      
      const history = errorService.getRecentErrors();
      expect(history.length).toBe(5); // La limite configurée
      expect(history[0].error.error.message).toBe('Error 9'); // La plus récente d'abord
    });
    
    it('devrait notifier les gestionnaires d\'erreur enregistrés', () => {
      const handler = jest.fn();
      errorService.addErrorHandler(handler);
      
      const error = new Error('Test error');
      errorService.handleError(error);
      
      expect(handler).toHaveBeenCalledWith(error, {});
    });
  });
  
  describe('errorHandlers', () => {
    it('devrait ajouter et supprimer des gestionnaires d\'erreur', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      errorService.addErrorHandler(handler1);
      errorService.addErrorHandler(handler2);
      
      const error = new Error('Test error');
      errorService.handleError(error);
      
      expect(handler1).toHaveBeenCalledWith(error, {});
      expect(handler2).toHaveBeenCalledWith(error, {});
      
      // Supprimer un handler
      errorService.removeErrorHandler(handler1);
      
      errorService.handleError(error);
      expect(handler1).toHaveBeenCalledTimes(1); // Pas d'appel supplémentaire
      expect(handler2).toHaveBeenCalledTimes(2); // Un appel supplémentaire
    });
    
    it('ne devrait pas ajouter deux fois le même gestionnaire', () => {
      const handler = jest.fn();
      
      errorService.addErrorHandler(handler);
      errorService.addErrorHandler(handler); // Tentative d'ajout du même handler
      
      const error = new Error('Test error');
      errorService.handleError(error);
      
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('tryOperation', () => {
    it('devrait retourner un ServiceResult réussi en cas de succès', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await errorService.tryOperation(operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
    });
    
    it('devrait retourner un ServiceResult d\'erreur en cas d\'échec', async () => {
      const error = new Error('Test error');
      const operation = jest.fn().mockRejectedValue(error);
      
      const result = await errorService.tryOperation(operation);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Test error');
    });
    
    it('devrait utiliser un message personnalisé si fourni', async () => {
      const error = new Error('Test error');
      const operation = jest.fn().mockRejectedValue(error);
      
      const result = await errorService.tryOperation(operation, {
        errorMessage: 'Message personnalisé'
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Message personnalisé');
    });
  });
  
  describe('logLevel', () => {
    it('devrait respecter le niveau de journalisation configuré', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      
      // Configurer un niveau qui ne journalise pas les warnings
      errorService.setLogLevel(LogLevel.ERROR);
      
      // Erreur de type WARNING qui ne devrait pas être loggée
      errorService.handleError(new AppError('INVALID_INPUT', {
        message: 'Warning',
        severity: ErrorSeverity.WARNING
      }), { logError: true });
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      // Erreur de type ERROR qui devrait être loggée
      errorService.handleError(new AppError('INTERNAL_ERROR', {
        message: 'Error',
        severity: ErrorSeverity.ERROR
      }), { logError: true });
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
  
  describe('serviceResult helpers', () => {
    it('createSuccessResult devrait générer un résultat réussi', () => {
      const result = errorService.createSuccessResult('data');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('data');
      expect(result.error).toBeUndefined();
    });
    
    it('createErrorResult devrait générer un résultat d\'erreur', () => {
      const error = new Error('Test error');
      const result = errorService.createErrorResult(error);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Test error');
    });
  });
  
  describe('error creation helpers', () => {
    it('createValidationError devrait créer une erreur de validation', () => {
      const error = errorService.createValidationError('Champ invalide', { field: 'email' });
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Champ invalide');
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.details).toEqual({ field: 'email' });
    });
    
    it('createAuthError devrait créer une erreur d\'authentification', () => {
      const error = errorService.createAuthError('AUTH_REQUIRED', 'Connexion requise');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Connexion requise');
      expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
    });
    
    it('createNotFoundError devrait créer une erreur de ressource non trouvée', () => {
      const error = errorService.createNotFoundError('User', '123');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toContain('User');
      expect(error.message).toContain('123');
      expect(error.category).toBe(ErrorCategory.DATA);
    });
  });
  
  describe('utility methods', () => {
    it('isErrorOfCategory devrait identifier correctement la catégorie', () => {
      const error = new AppError('INVALID_INPUT', {
        category: ErrorCategory.VALIDATION
      });
      
      expect(errorService.isErrorOfCategory(error, ErrorCategory.VALIDATION)).toBe(true);
      expect(errorService.isErrorOfCategory(error, ErrorCategory.NETWORK)).toBe(false);
      expect(errorService.isErrorOfCategory(new Error('test'), ErrorCategory.VALIDATION)).toBe(false);
    });
    
    it('isErrorOfCode devrait identifier correctement le code', () => {
      const error = new AppError('INVALID_INPUT', {});
      
      expect(errorService.isErrorOfCode(error, 'INVALID_INPUT')).toBe(true);
      expect(errorService.isErrorOfCode(error, 'NOT_FOUND')).toBe(false);
      expect(errorService.isErrorOfCode(new Error('test'), 'INVALID_INPUT')).toBe(false);
    });
  });
});