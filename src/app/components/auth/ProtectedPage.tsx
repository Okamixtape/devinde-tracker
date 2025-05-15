'use client';

import React, { ReactNode } from 'react';
import RouteGuard from './RouteGuard';
import { AppLayout } from '@/app/components/layout';

interface ProtectedPageProps {
  children: ReactNode;
  requiredRoles?: string[];
  title?: string;
  description?: string;
}

/**
 * ProtectedPage - Composant qui combine la protection des routes et le layout
 * 
 * Ce composant facilite la création de pages protégées en intégrant
 * le système d'authentification (RouteGuard) et le layout principal (AppLayout).
 */
const ProtectedPage: React.FC<ProtectedPageProps> = ({ 
  children, 
  requiredRoles = [],
  title,
  description
}) => {
  return (
    <RouteGuard requiredAuth={true} requiredRoles={requiredRoles}>
      <AppLayout>
        <div>
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </AppLayout>
    </RouteGuard>
  );
};

export default ProtectedPage;