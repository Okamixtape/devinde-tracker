'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAppUI } from '@/app/hooks/useAppUI';
import { useAppState } from '@/app/contexts/AppStateContext';
import { UIErrorBoundary } from '@/app/components/error';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import SkipLink from './SkipLink';
import { AnimatePresence, motion } from 'framer-motion';

export interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * AppLayout - Layout principal de l'application
 * 
 * Composant qui définit la structure principale de toute l'application
 * Inclut la sidebar, le header, la zone de contenu principale et le footer
 * Gère la navigation et les états d'interface (sidebar ouverte/fermée, dark mode)
 */
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { navigationCollapsed, toggleNavigation } = useAppUI();
  const { state } = useAppState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Fermer le menu mobile lors d'un changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Gérer les clics en dehors de la sidebar pour la fermer sur mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Désactiver le scroll du body quand menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Gérer les événements clavier pour l'accessibilité
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  return (
    <UIErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <SkipLink />
        
        <Header 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <div className="flex flex-1 relative">
          {/* Overlay pour mobile quand la sidebar est ouverte */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-20 md:hidden" 
              aria-hidden="true" 
            />
          )}
          
          {/* Sidebar - mobile (fixed) et desktop (static) */}
          <div 
            ref={sidebarRef}
            className={`
              fixed md:static inset-y-0 left-0 z-30 
              md:z-auto transform transition-transform duration-300 ease-in-out
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
              flex-shrink-0
            `}
            aria-hidden={!isMobileMenuOpen && window.innerWidth < 768}
          >
            <Sidebar 
              collapsed={navigationCollapsed} 
              onToggleCollapse={toggleNavigation}
              onNavItemClick={() => setIsMobileMenuOpen(false)}
              loading={state.isLoading}
            />
          </div>
          
          {/* Main content area */}
          <main 
            id="main-content" 
            className="flex-1 overflow-hidden"
            tabIndex={-1}
          >
            <div className={`
              container mx-auto px-4 py-6 transition-all duration-300 ease-in-out
              ${navigationCollapsed ? 'md:ml-20' : 'md:ml-0'} 
            `}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.20))]"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
        
        <Footer />
      </div>
    </UIErrorBoundary>
  );
};

export default AppLayout;