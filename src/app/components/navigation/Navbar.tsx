'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { getBusinessPlanService } from '../../services/service-factory';
import { BusinessPlanData } from '../../services/interfaces/data-models';
import { useResponsive } from '../../hooks/useResponsive';
import { useAuth } from '../../hooks/useAuth';
import ProfileNavigation from './ProfileNavigation';
import SectionNavigation from './SectionNavigation';
import { FiSearch } from 'react-icons/fi';

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
  const menuRef = useRef<HTMLDivElement>(null);
  const { screenSize, isAtLeast } = useResponsive();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Fermer le menu mobile lorsque l'écran passe à >= md
  useEffect(() => {
    if (isAtLeast('md') && menuOpen) {
      setMenuOpen(false);
    }
  }, [screenSize, isAtLeast, menuOpen]);
  
  // Gérer la fermeture du menu lors d'un clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && menuOpen) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);
  
  // Désactiver le défilement du body quand le menu mobile est ouvert
  useEffect(() => {
    if (menuOpen && !isAtLeast('md')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, isAtLeast]);
  
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
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 w-full">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                DevIndé Tracker
              </Link>
            </div>
            
            {/* Menu desktop */}
            <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
              <Link 
                href="/plans" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium ${isActive('/plans') ? 'text-blue-600 dark:text-blue-400' : ''}`}
              >
                Mes Plans
              </Link>
              <Link 
                href="/documentation" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium ${isActive('/documentation') ? 'text-blue-600 dark:text-blue-400' : ''}`}
              >
                Documentation
              </Link>
              <Link 
                href="/monitoring" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium ${isActive('/monitoring') ? 'text-blue-600 dark:text-blue-400' : ''}`}
              >
                Monitoring
              </Link>
              <Link 
                href="/search" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive('/search') ? 'text-blue-600 dark:text-blue-400' : ''}`}
              >
                <FiSearch className="mr-1" />
                Recherche
              </Link>
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 sm:ml-4">
                  <ProfileNavigation user={user} onLogout={logout} />
                </div>
              ) : (
                <div className="flex items-center space-x-2 sm:ml-4">
                  <Link
                    href="/login"
                    className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium ${isActive('/login') ? 'text-blue-600 dark:text-blue-400' : ''}`}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
            
            {/* Bouton menu mobile */}
            <div className="sm:hidden flex items-center">
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
          </div>
        </div>
        
        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div className="sm:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-40 flex items-start pt-16">
            <div 
              ref={menuRef}
              className="w-full h-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-y-auto"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link 
                  href="/plans" 
                  className={`px-3 py-2 rounded-md text-base font-medium ${isActive('/plans') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Mes Plans
                </Link>
                <Link 
                  href="/documentation" 
                  className={`px-3 py-2 rounded-md text-base font-medium ${isActive('/documentation') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Documentation
                </Link>
                <Link 
                  href="/monitoring" 
                  className={`px-3 py-2 rounded-md text-base font-medium ${isActive('/monitoring') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Monitoring
                </Link>
                <Link 
                  href="/search" 
                  className={`px-3 py-2 rounded-md text-base font-medium flex items-center ${isActive('/search') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FiSearch className="mr-1" />
                  Recherche
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    );
  }
  
  // Navigation complète quand on est dans un plan
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
              DevIndé Tracker
            </Link>
            
            {/* Nom du plan courant - responsive */}
            {currentPlan && (
              <div className="ml-2 md:ml-4 px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                {currentPlan.name || 'Plan sans nom'}
              </div>
            )}
            
            {/* Menu de navigation large écran avec dropdown */}
            <div className="hidden md:ml-6 md:flex md:space-x-1 lg:space-x-2 items-center">
              {planId && <SectionNavigation planId={planId} />}
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
          <div className="hidden md:flex items-center flex-grow justify-between">
            <div className="flex items-center space-x-2">
              <Link
                href="/plans"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Tous les Plans
              </Link>
              <Link
                href="/monitoring"
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/monitoring') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                Monitoring
              </Link>
              <Link
                href="/search"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive('/search') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <FiSearch className="mr-1" />
                Recherche
              </Link>
            </div>
            
            {isAuthenticated ? (
              <div className="flex items-center border-l pl-4 ml-4 border-gray-300 dark:border-gray-700">
                <ProfileNavigation user={user} onLogout={logout} />
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  href="/login"
                  className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium ${isActive('/login') ? 'text-blue-600 dark:text-blue-400' : ''}`}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Menu mobile déroulant amélioré */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-40 flex items-start pt-16">
          <div 
            ref={menuRef}
            className="w-full h-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-y-auto"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href={`/plans/${planId}/dashboard`}
                className={`px-3 py-3 rounded-md text-base font-medium ${isActive('/dashboard') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                onClick={() => setMenuOpen(false)}
              >
                Tableau de Bord
              </Link>
              <Link 
                href={`/plans/${planId}/business-model`}
                className={`px-3 py-3 rounded-md text-base font-medium ${isActive('/business-model') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                onClick={() => setMenuOpen(false)}
              >
                Modèle Économique
              </Link>
              <Link 
                href={`/plans/${planId}/market-analysis`}
                className={`px-3 py-3 rounded-md text-base font-medium ${isActive('/market-analysis') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                onClick={() => setMenuOpen(false)}
              >
                Analyse Marché
              </Link>
              <Link 
                href={`/plans/${planId}/finances`}
                className={`px-3 py-3 rounded-md text-base font-medium ${isActive('/finances') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                onClick={() => setMenuOpen(false)}
              >
                Finances
              </Link>
              <Link 
                href={`/plans/${planId}/action-plan`}
                className={`px-3 py-3 rounded-md text-base font-medium ${isActive('/action-plan') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                onClick={() => setMenuOpen(false)}
              >
                Plan d&apos;Action
              </Link>
              <Link 
                href={`/plans/${planId}/revenue`}
                className={`px-3 py-3 rounded-md text-base font-medium ${isActive('/revenue') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                onClick={() => setMenuOpen(false)}
              >
                Projections
              </Link>
              
              {/* Liens supplémentaires spécifiques au mobile */}
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  href="/plans"
                  className="px-3 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  Tous les Plans
                </Link>
                <Link 
                  href="/monitoring"
                  className={`px-3 py-3 rounded-md text-base font-medium ${isActive('/monitoring') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Monitoring
                </Link>
                <Link 
                  href="/search"
                  className={`px-3 py-3 rounded-md text-base font-medium flex items-center ${isActive('/search') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FiSearch className="mr-1" />
                  Recherche
                </Link>
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user?.name || user?.email}
                      </span>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="mr-2">👤</span>
                      Profil
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <span className="mr-2">🚪</span>
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/login"
                      className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium ${isActive('/login') ? 'text-blue-600 dark:text-blue-400' : ''}`}
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/register"
                      className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
