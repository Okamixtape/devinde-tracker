// Exportation centralisée du système de gestion d'erreurs

// Composants de base
export { default as ErrorBoundary, type ErrorFallbackProps } from './ErrorBoundary';
export { default as UIErrorBoundary } from './UIErrorBoundary';
export { default as ErrorNotification } from './ErrorNotification';
export { default as Toast, type ToastProps, type ToastType, type ToastPosition } from './Toast';
export { default as ToastContext, ToastProvider, useToast } from './ToastManager';
export { default as withLoading, LoadingIndicator, type WithLoadingOptions } from './WithLoading';

// Hook pour les opérations asynchrones
export { useAsyncHandler } from '@/app/hooks/useAsyncHandler';
