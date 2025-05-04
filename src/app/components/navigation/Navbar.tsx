'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { getBusinessPlanService } from '../../services/service-factory';
import { BusinessPlanData } from '../../services/interfaces/data-models';

/**
 * Navbar Component
 * 
 * Composant de navigation globale qui s'adapte au contexte :
 * - Navigation de base quand on n'est pas dans le contexte d'un plan d'affaires
 * - Navigation complète avec toutes les sections lorsqu'on est dans un plan
 */
export function Navbar() {
  const params = useParams();
  const pathname = usePathname();
  const planId = params?.id as string;
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<BusinessPlanData | null>(null);
  
  useEffect(() => {
    const loadPlanDetails = async () => {
      if (planId) {
        const businessPlanService = getBusinessPlanService();
        const result = await businessPlanService.getItem(planId);
        
        if (result.success && result.data) {
          setCurrentPlan(result.data);
        }
      }
    };
    
    loadPlanDetails();
  }, [planId]);
  
  const isActive = (path: string): boolean => {
    if (!pathname) return false;
    return pathname.includes(path);
  };
  
  // Si nous ne sommes pas dans un plan, affichons juste le menu basique
  if (!planId) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center text-xl font-bold text-blue-600 dark:text-blue-400">
                DevIndé Tracker
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/plans" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${isActive('/plans') ? 'text-blue-600 dark:text-blue-400' : ''}`}
              >
                Mes Plans
              </Link>
              <Link 
                href="/documentation" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${isActive('/documentation') ? 'text-blue-600 dark:text-blue-400' : ''}`}
              >
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  
  // Navigation complète quand on est dans un plan
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center text-xl font-bold text-blue-600 dark:text-blue-400">
              DevIndé Tracker
            </Link>
            
            {/* Nom du plan courant */}
            {currentPlan && (
              <div className="ml-4 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm">
                {currentPlan.name || 'Plan sans nom'}
              </div>
            )}
            
            {/* Menu de navigation large écran */}
            <div className="hidden md:ml-6 md:flex md:space-x-2 items-center">
              <Link 
                href={`/plans/${planId}/dashboard`}
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                Tableau de Bord
              </Link>
              <Link 
                href={`/plans/${planId}/business-model`}
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/business-model') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                Modèle Économique
              </Link>
              <Link 
                href={`/plans/${planId}/market-analysis`}
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/market-analysis') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                Analyse Marché
              </Link>
              <Link 
                href={`/plans/${planId}/finances`}
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/finances') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                Finances
              </Link>
              <Link 
                href={`/plans/${planId}/action-plan`}
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/action-plan') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                Plan d&apos;Action
              </Link>
              <Link 
                href={`/plans/${planId}/revenue`}
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/revenue') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                Projections
              </Link>
            </div>
          </div>
          
          {/* Bouton menu mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
              aria-expanded={menuOpen}
            >
              <span className="sr-only">{menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Liens vers tous les plans - visible seulement sur grands écrans */}
          <div className="hidden md:flex items-center">
            <Link
              href="/plans"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Tous les Plans
            </Link>
          </div>
        </div>
      </div>
      
      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800">
            <Link 
              href={`/plans/${planId}/dashboard`}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              onClick={() => setMenuOpen(false)}
            >
              Tableau de Bord
            </Link>
            <Link 
              href={`/plans/${planId}/business-model`}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/business-model') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              onClick={() => setMenuOpen(false)}
            >
              Modèle Économique
            </Link>
            <Link 
              href={`/plans/${planId}/market-analysis`}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/market-analysis') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              onClick={() => setMenuOpen(false)}
            >
              Analyse Marché
            </Link>
            <Link 
              href={`/plans/${planId}/finances`}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/finances') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              onClick={() => setMenuOpen(false)}
            >
              Finances
            </Link>
            <Link 
              href={`/plans/${planId}/action-plan`}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/action-plan') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              onClick={() => setMenuOpen(false)}
            >
              Plan d&apos;Action
            </Link>
            <Link 
              href={`/plans/${planId}/revenue`}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/revenue') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              onClick={() => setMenuOpen(false)}
            >
              Projections
            </Link>
            <Link 
              href="/plans"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              Tous les Plans
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
