'use client';

import React, { ReactNode } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

export interface AppLayoutProps {
  /** Contenu principal de la page */
  children: ReactNode;
  /** Titre de la page */
  title?: string;
  /** Contenu de la barre latérale */
  sidebar?: ReactNode;
  /** Contenu de l'en-tête */
  header?: ReactNode;
  /** Contenu du pied de page */
  footer?: ReactNode;
  /** Classe CSS additionnelle du conteneur principal */
  className?: string;
  /** Indique si la barre latérale est ouverte (en mode mobile) */
  isSidebarOpen?: boolean;
  /** Fonction appelée lors du clic sur le bouton de toggle de la barre latérale */
  onSidebarToggle?: () => void;
}

/**
 * Composant de mise en page principal de l'application
 * Implémente un layout moderne avec sidebar, header et content area
 * 
 * Utilise ErrorBoundary pour capturer les erreurs dans chaque section
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  sidebar,
  header,
  footer,
  className = '',
  isSidebarOpen = true,
  onSidebarToggle
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {sidebar && (
        <aside 
          className={`bg-indigo-700 text-white transition-all duration-300 fixed inset-y-0 left-0 z-20 lg:relative lg:z-0 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } w-64 overflow-y-auto`}
        >
          <ErrorBoundary fallback={<div className="p-4 text-white">Erreur dans la barre latérale</div>}>
            {sidebar}
          </ErrorBoundary>
        </aside>
      )}
      
      {/* Main content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${className}`}>
        {/* Header */}
        {header && (
          <header className="bg-white border-b border-gray-200 z-10">
            <ErrorBoundary fallback={<div className="p-4">Erreur dans l'en-tête</div>}>
              <div className="px-4 py-3 flex items-center justify-between">
                {/* Mobile sidebar toggle */}
                {sidebar && (
                  <button
                    onClick={onSidebarToggle}
                    className="lg:hidden mr-2 p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
                    aria-label="Toggle sidebar"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 6h16M4 12h16M4 18h16" 
                      />
                    </svg>
                  </button>
                )}
                
                {/* Page title */}
                {title && (
                  <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
                )}
                
                {header}
              </div>
            </ErrorBoundary>
          </header>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4">
          <ErrorBoundary fallback={<div className="p-4 bg-red-50 border border-red-200 rounded-md">Une erreur est survenue dans le contenu principal</div>}>
            {children}
          </ErrorBoundary>
        </main>
        
        {/* Footer */}
        {footer && (
          <footer className="bg-white border-t border-gray-200">
            <ErrorBoundary fallback={<div className="p-4">Erreur dans le pied de page</div>}>
              {footer}
            </ErrorBoundary>
          </footer>
        )}
      </div>
    </div>
  );
};

export default AppLayout;