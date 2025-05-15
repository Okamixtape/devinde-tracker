'use client';

import React, { ReactNode } from 'react';
import { AppStateProvider } from '@/app/contexts/AppStateContext';
import { UIErrorBoundary } from '@/app/components/error';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App providers component that wraps the entire application
 * Provides global state, error handling, and other context providers
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <UIErrorBoundary>
      <AppStateProvider>
        {children}
      </AppStateProvider>
    </UIErrorBoundary>
  );
}

export default AppProviders;