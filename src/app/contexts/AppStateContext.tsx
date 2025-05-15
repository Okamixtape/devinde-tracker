'use client';

import React, { createContext, useContext, useState, useReducer, useEffect, ReactNode } from 'react';
import errorService, { ErrorService } from '@/app/services/core/errorService';
import SectionService, { ISectionService } from '@/app/services/core/sectionService';
import { createLocalStorageService, ILocalStorageService } from '@/app/services/core/localStorageService';
import { AppError } from '@/app/services/utils/errorHandling';
import { Section } from '@/app/services/interfaces/service-interfaces';

// Define interfaces for the app state
export interface AppState {
  // Global app state
  isLoading: boolean;
  error: AppError | null;
  
  // Current user data
  user: {
    id: string | null;
    name: string | null;
    isAuthenticated: boolean;
  };
  
  // UI state
  ui: {
    activeSection: string | null;
    darkMode: boolean;
    navigationCollapsed: boolean;
  };
  
  // Feature data
  businessPlans: Record<string, unknown>[];
  sections: Section[];
  currentPlanId: string | null;
}

// Define actions
type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: AppError | null }
  | { type: 'SET_USER'; payload: { id: string; name: string } }
  | { type: 'LOGOUT_USER' }
  | { type: 'SET_ACTIVE_SECTION'; payload: string }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'TOGGLE_NAVIGATION' }
  | { type: 'SET_BUSINESS_PLANS'; payload: Record<string, unknown>[] }
  | { type: 'SET_SECTIONS'; payload: Section[] }
  | { type: 'SET_CURRENT_PLAN_ID'; payload: string };

// Initial state
const initialState: AppState = {
  isLoading: false,
  error: null,
  user: {
    id: null,
    name: null,
    isAuthenticated: false,
  },
  ui: {
    activeSection: null,
    darkMode: false,
    navigationCollapsed: false,
  },
  businessPlans: [],
  sections: [],
  currentPlanId: null,
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: { 
          id: action.payload.id, 
          name: action.payload.name, 
          isAuthenticated: true 
        } 
      };
    case 'LOGOUT_USER':
      return { 
        ...state, 
        user: { 
          id: null, 
          name: null, 
          isAuthenticated: false 
        } 
      };
    case 'SET_ACTIVE_SECTION':
      return { 
        ...state, 
        ui: { 
          ...state.ui, 
          activeSection: action.payload 
        } 
      };
    case 'TOGGLE_DARK_MODE':
      return { 
        ...state, 
        ui: { 
          ...state.ui, 
          darkMode: !state.ui.darkMode 
        } 
      };
    case 'TOGGLE_NAVIGATION':
      return { 
        ...state, 
        ui: { 
          ...state.ui, 
          navigationCollapsed: !state.ui.navigationCollapsed 
        } 
      };
    case 'SET_BUSINESS_PLANS':
      return { ...state, businessPlans: action.payload };
    case 'SET_SECTIONS':
      return { ...state, sections: action.payload };
    case 'SET_CURRENT_PLAN_ID':
      return { ...state, currentPlanId: action.payload };
    default:
      return state;
  }
}

// Define the context interface
interface AppStateContextType {
  // State
  state: AppState;
  
  // Actions
  dispatch: React.Dispatch<AppAction>;
  
  // Services
  errorService: ErrorService;
  sectionService: ISectionService;
  localStorageService: <T extends { id?: string }>(key: string) => ILocalStorageService<T>;
  
  // Helper methods
  setLoading: (isLoading: boolean) => void;
  setError: (error: AppError | null) => void;
  clearError: () => void;
  handleError: (error: unknown) => void;
  
  // Business logic methods
  loadSections: (businessPlanId: string) => Promise<void>;
  setActivePlan: (planId: string) => Promise<void>;
  updateSectionData: (sectionId: string, data: Record<string, unknown>) => Promise<void>;
}

// Create the context
export const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Provider component
interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize services
  const services = {
    errorService,
    sectionService: SectionService,
    localStorageService: <T extends { id?: string }>(key: string): ILocalStorageService<T> => {
      return createLocalStorageService<T>(key);
    }
  };

  // Setup error handling
  useEffect(() => {
    // Add the global error handler
    const errorHandler = (error: unknown) => {
      dispatch({ type: 'SET_ERROR', payload: error as AppError });
    };
    
    services.errorService.addErrorHandler(errorHandler);
    
    // Cleanup
    return () => {
      services.errorService.removeErrorHandler(errorHandler);
    };
  }, []);

  // Helper methods
  const setLoading = (isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  };

  const setError = (error: AppError | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const handleError = (error: unknown) => {
    services.errorService.handleError(error);
  };

  // Business logic methods
  const loadSections = async (businessPlanId: string) => {
    setLoading(true);
    try {
      const result = await services.sectionService.getSections(businessPlanId);
      
      if (result.success && result.data) {
        dispatch({ type: 'SET_SECTIONS', payload: result.data });
      } else if (result.error) {
        handleError(new AppError('DATA_FETCH_ERROR', { 
          message: `Failed to load sections: ${result.error.message}`,
          details: result.error
        }));
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const setActivePlan = async (planId: string) => {
    dispatch({ type: 'SET_CURRENT_PLAN_ID', payload: planId });
    await loadSections(planId);
  };

  const updateSectionData = async (sectionId: string, data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const result = await services.sectionService.updateItem(sectionId, { data });
      
      if (result.success && result.data && state.currentPlanId) {
        // Reload sections to get the updated data
        await loadSections(state.currentPlanId);
      } else if (result.error) {
        handleError(new AppError('DATA_UPDATE_ERROR', { 
          message: `Failed to update section data: ${result.error.message}`,
          details: result.error
        }));
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Create the context value
  const contextValue: AppStateContextType = {
    state,
    dispatch,
    ...services,
    setLoading,
    setError,
    clearError,
    handleError,
    loadSections,
    setActivePlan,
    updateSectionData
  };

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

// Custom hook to use the app state
export const useAppState = () => {
  const context = useContext(AppStateContext);
  
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  
  return context;
};