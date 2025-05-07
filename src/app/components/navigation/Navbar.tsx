'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';
import { BusinessPlanData } from "../services/interfaces/dataModels";
import LanguageSelector from '../common/LanguageSelector';
import ProfileNavigation from './ProfileNavigation';
import SectionNavigation from './SectionNavigation';
import Breadcrumb from './Breadcrumb';
import { getBusinessPlanService } from '@/app/services/serviceFactory';
import { useResponsive } from '@/app/hooks/useResponsive';
import { useAuth } from '@/app/hooks/useAuth';

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
      <div className="sticky top-0 z-50 w-full">
        {/* Barre principale avec le titre */}
        <nav className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-md">
          <div className="container mx-auto px-4">
            {/* Barre de navigation supérieure */}
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-lg sm:text-xl font-bold text-white">
                  DevIndé Tracker
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Utilities in the top bar */}
                <div className="px-2">
                  <LanguageSelector />
                </div>
                
                <button 
                  className="text-gray-200 hover:text-white transition-colors duration-150 ease-in-out"
                  aria-label="Rechercher"
                >
                  <FiSearch className="h-5 w-5" />
                </button>
                
                <ProfileNavigation user={user} onLogout={logout} />
              </div>
              
              {/* Bouton menu mobile */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-blue-700 focus:outline-none transition-colors duration-150 ease-in-out"
                  aria-expanded={menuOpen}
                >
                  <span className="sr-only">Ouvrir le menu principal</span>
                  {/* Icône hamburger */}
                  <svg className={`${menuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                  {/* Icône X */}
                  <svg className={`${menuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Fil d'Ariane */}
        <Breadcrumb />
        
        {/* Version mobile de SectionNavigation si le menu n'est pas ouvert */}
        <div className="md:hidden pb-2 bg-blue-800 border-t border-blue-700">
          {!menuOpen && <SectionNavigation planId={planId} />}
        </div>
        
        {/* Menu mobile */}
        <div
          ref={menuRef}
          className={`${menuOpen ? 'fixed' : 'hidden'} md:hidden bg-blue-800 inset-0 top-16 pt-2 px-4 pb-3 shadow-lg overflow-y-auto`}
        >
          <div className="space-y-1 mb-3">
            <Link 
              href="/plans" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700 transition-colors duration-150 ease-in-out"
              onClick={() => setMenuOpen(false)}
            >
              Plans
            </Link>
            <Link 
              href="/calculator" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700 transition-colors duration-150 ease-in-out"
              onClick={() => setMenuOpen(false)}
            >
              Calculateur
            </Link>
            <Link 
              href="/resources" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700 transition-colors duration-150 ease-in-out"
              onClick={() => setMenuOpen(false)}
            >
              Ressources
            </Link>
          </div>
          
          {/* Séparateur */}
          <div className="border-t border-blue-700 my-4"></div>
          
          {/* Sélecteur de langue (mobile) */}
          <div className="px-3 py-2">
            <div className="text-sm font-medium text-gray-300 mb-2">Langue</div>
            <LanguageSelector />
          </div>
          
          {/* Recherche (mobile) */}
          <div className="px-3 py-2 flex items-center space-x-2 text-gray-200 hover:text-white">
            <FiSearch className="h-5 w-5" />
            <span className="text-sm font-medium">Rechercher</span>
          </div>
          
          {/* Profil utilisateur (mobile) */}
          <div className="mt-3 pt-3 border-t border-blue-700">
            {isAuthenticated ? (
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-gray-300 mb-2">Compte</div>
                <div className="flex items-center mb-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user?.name || user?.email}</div>
                    <div className="text-sm font-medium text-gray-300">{user?.email}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link 
                    href="/profile" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700 transition-colors duration-150 ease-in-out"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700 transition-colors duration-150 ease-in-out"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1 px-3">
                <Link 
                  href="/login" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700 transition-colors duration-150 ease-in-out"
                  onClick={() => setMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700 transition-colors duration-150 ease-in-out"
                  onClick={() => setMenuOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sinon, nous affichons le menu contextuel avec les sections du plan d'affaires
  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Barre principale avec le titre */}
      <nav className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-md">
        <div className="container mx-auto px-4">
          {/* Barre de navigation supérieure */}
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-lg sm:text-xl font-bold text-white">
                DevIndé Tracker
              </Link>
              
              {/* Fil d'Ariane */}
              <div className="hidden md:flex items-center">
                <span className="mx-1 text-gray-400">/</span>
                <span className="text-gray-200 font-medium truncate max-w-[200px]">
                  {currentPlan?.name}
                </span>
              </div>
              
              {/* SectionNavigation intégré dans le header principal */}
              <div className="hidden md:block ml-4">
                <SectionNavigation planId={planId} />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Utilities in the top bar */}
              <div className="px-2">
                <LanguageSelector />
              </div>
              
              <button 
                className="text-gray-200 hover:text-white transition-colors duration-150 ease-in-out"
                aria-label="Rechercher"
              >
                <FiSearch className="h-5 w-5" />
              </button>
              
              <ProfileNavigation user={user} onLogout={logout} />
            </div>
            
            {/* Bouton menu mobile */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-blue-700 focus:outline-none transition-colors duration-150 ease-in-out"
                aria-expanded={menuOpen}
              >
                <span className="sr-only">Ouvrir le menu principal</span>
                {/* Icône hamburger */}
                <svg className={`${menuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                {/* Icône X */}
                <svg className={`${menuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Fil d'Ariane */}
      <Breadcrumb currentPlanName={currentPlan?.name} />
      
      {/* Version mobile de SectionNavigation si le menu n'est pas ouvert */}
      <div className="md:hidden pb-2 bg-blue-800 border-t border-blue-700">
        {!menuOpen && <SectionNavigation planId={planId} />}
      </div>
      
      {/* Menu mobile */}
      <div
        ref={menuRef}
        className={`${menuOpen ? 'fixed' : 'hidden'} md:hidden bg-blue-800 inset-0 top-16 pt-2 px-4 pb-3 shadow-lg overflow-y-auto`}
      >
        {currentPlan && (
          <div className="py-2 mb-2">
            <h2 className="text-lg font-semibold text-white">{currentPlan?.name}</h2>
          </div>
        )}
        
        {/* Sélecteur de langue (mobile) */}
        <div className="px-3 py-2">
          <div className="text-sm font-medium text-gray-300 mb-2">Langue</div>
          <LanguageSelector />
        </div>
        
        {/* Recherche (mobile) */}
        <div className="px-3 py-2 flex items-center space-x-2 text-gray-200 hover:text-white">
          <FiSearch className="h-5 w-5" />
          <span className="text-sm font-medium">Rechercher</span>
        </div>
        
        {/* Navigation principale (mobile) */}
        <div className="border-t border-blue-700 my-2 pt-2">
          <Link 
            href="/plans" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700 transition-colors duration-150 ease-in-out"
            onClick={() => setMenuOpen(false)}
          >
            Tous les plans
          </Link>
          <Link 
            href="/calculator" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700 transition-colors duration-150 ease-in-out"
            onClick={() => setMenuOpen(false)}
          >
            Calculateur
          </Link>
          
          {/* Sections du plan (mobile) */}
          {planId && (
            <div className="mt-2 pt-2 border-t border-blue-700">
              <div className="px-3 pb-1 text-sm font-medium text-gray-300">
                Sections du plan
              </div>
              <Link 
                href={`/plans/${planId}/dashboard`} 
                className={`block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700/70 transition-colors duration-150 ease-in-out ${isActive(`/plans/${planId}/dashboard`) ? 'bg-blue-700' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Tableau de bord
              </Link>
              <Link 
                href={`/plans/${planId}/business-model`} 
                className={`block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700/70 transition-colors duration-150 ease-in-out ${isActive(`/plans/${planId}/business-model`) ? 'bg-blue-700' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Modèle économique
              </Link>
              <Link 
                href={`/plans/${planId}/market-analysis`} 
                className={`block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700/70 transition-colors duration-150 ease-in-out ${isActive(`/plans/${planId}/market-analysis`) ? 'bg-blue-700' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Analyse marché
              </Link>
              <Link 
                href={`/plans/${planId}/finances`} 
                className={`block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700/70 transition-colors duration-150 ease-in-out ${isActive(`/plans/${planId}/finances`) ? 'bg-blue-700' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Finances
              </Link>
              <Link 
                href={`/plans/${planId}/action-plan`} 
                className={`block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700/70 transition-colors duration-150 ease-in-out ${isActive(`/plans/${planId}/action-plan`) ? 'bg-blue-700' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Plan d&apos;action
              </Link>
            </div>
          )}
        </div>
        
        {/* Profil utilisateur (mobile) */}
        <div className="border-t border-blue-700 mt-2 pt-2">
          {isAuthenticated ? (
            <div className="px-3 py-2">
              <div className="text-sm font-medium text-gray-300 mb-2">Compte</div>
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user?.name || user?.email?.split('@')[0]}</div>
                  <div className="text-sm font-medium text-gray-300">{user?.email}</div>
                </div>
              </div>
              <div className="space-y-1">
                <Link 
                  href="/profile" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700 transition-colors duration-150 ease-in-out"
                  onClick={() => setMenuOpen(false)}
                >
                  Profil
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700 transition-colors duration-150 ease-in-out"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1 px-3">
              <Link 
                href="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700 transition-colors duration-150 ease-in-out"
                onClick={() => setMenuOpen(false)}
              >
                Connexion
              </Link>
              <Link 
                href="/register" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-blue-700 transition-colors duration-150 ease-in-out"
                onClick={() => setMenuOpen(false)}
              >
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
