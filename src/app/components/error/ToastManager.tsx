'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ErrorResponse, ErrorSeverity } from "@/app/services/utils/errorHandling";
import Toast, { ToastProps, ToastPosition, getSeverityAsToastType } from './Toast';

// Interface pour un toast avec ID
export interface ToastItem extends Omit<ToastProps, 'onClose'> {
  id: string;
}

// Interface pour le contexte
interface ToastContextType {
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  toasts: ToastItem[];
  showError: (error: ErrorResponse | Error | string) => string;
  showSuccess: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
}

// Options du gestionnaire de toasts
export interface ToastManagerProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

// Création du contexte avec valeur par défaut undefined
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Provider pour le gestionnaire de toasts
export const ToastProvider: React.FC<ToastManagerProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
  autoClose = true,
  autoCloseDelay = 5000,
}) => {
  // État pour stocker les toasts actifs
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Ajouter un nouveau toast
  const addToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = uuidv4();
    
    setToasts(prevToasts => {
      // Limiter le nombre de toasts affichés simultanément
      const newToasts = [
        { 
          ...toast, 
          id, 
          position: toast.position || position,
          autoClose: toast.autoClose !== undefined ? toast.autoClose : autoClose,
          autoCloseDelay: toast.autoCloseDelay || autoCloseDelay
        },
        ...prevToasts
      ];
      
      // Ne garder que les maxToasts premiers
      return newToasts.slice(0, maxToasts);
    });
    
    return id;
  }, [position, autoClose, autoCloseDelay, maxToasts]);

  // Supprimer un toast par son ID
  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Supprimer tous les toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Afficher un toast d'erreur à partir d'une ErrorResponse, Error ou message string
  const showError = useCallback((error: ErrorResponse | Error | string) => {
    let message: string;
    let details: string | Record<string, unknown> | undefined;
    let title: string | undefined;
    let severity: ErrorSeverity | undefined;
    
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
      details = error.stack;
    } else if (error && 'error' in error) {
      message = error.error.message;
      details = error.error.details as string | Record<string, unknown> | undefined;
      title = error.error.code ? `Erreur ${error.error.code}` : undefined;
      severity = error.error.severity;
    } else {
      message = "Une erreur inconnue s'est produite";
      details = JSON.stringify(error);
    }
    
    return addToast({
      type: severity ? getSeverityAsToastType(severity) : 'error',
      title,
      message,
      details,
      showDetails: process.env.NODE_ENV === 'development'
    });
  }, [addToast]);

  // Afficher un toast de succès
  const showSuccess = useCallback((message: string, title?: string) => {
    return addToast({
      type: 'success',
      title,
      message
    });
  }, [addToast]);

  // Afficher un toast d'information
  const showInfo = useCallback((message: string, title?: string) => {
    return addToast({
      type: 'info',
      title,
      message
    });
  }, [addToast]);

  // Afficher un toast d'avertissement
  const showWarning = useCallback((message: string, title?: string) => {
    return addToast({
      type: 'warning',
      title,
      message
    });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{
      addToast,
      removeToast,
      clearAllToasts,
      toasts,
      showError,
      showSuccess,
      showInfo,
      showWarning
    }}>
      {children}
      
      {/* Rendu des toasts actifs */}
      <div aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook pour utiliser le contexte de toast
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
