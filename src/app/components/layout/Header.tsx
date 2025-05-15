'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Search, Bell, Sun, Moon, User } from 'lucide-react';
import { useAppUI } from '@/app/hooks/useAppUI';
import { useAppState } from '@/app/contexts/AppStateContext';
import Breadcrumb from './Breadcrumb';

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

/**
 * Header - En-tête principal de l'application
 * 
 * Contient la barre de navigation principale, le logo, la barre de recherche,
 * les notifications, les actions utilisateur et le fil d'Ariane
 */
const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { darkMode, toggleDarkMode } = useAppUI();
  const { state } = useAppState();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Focus sur la barre de recherche quand elle s'ouvre
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Fermer les menus en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gérer la recherche
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchInputRef.current?.value;
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto">
        {/* Barre de navigation principale */}
        <div className="flex justify-between items-center h-16 px-4">
          {/* Partie gauche: Logo et bouton menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <Link 
              href="/" 
              className="flex items-center space-x-2"
            >
              <span className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">DT</span>
              <span className="font-semibold text-lg hidden sm:inline-block">DevIndé Tracker</span>
            </Link>
          </div>
          
          {/* Partie droite: Recherche, notifications, thème, profil */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Recherche */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="absolute right-0 top-0 w-screen max-w-xs">
                  <div className="flex items-center">
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      placeholder="Rechercher..."
                      aria-label="Rechercher"
                    />
                    <button
                      type="button"
                      className="absolute left-3 text-gray-400"
                      aria-label="Rechercher"
                    >
                      <Search size={16} />
                    </button>
                    <button
                      type="button"
                      className="absolute right-3 text-gray-400"
                      onClick={() => setIsSearchOpen(false)}
                      aria-label="Fermer la recherche"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Ouvrir la recherche"
                >
                  <Search size={20} />
                </button>
              )}
            </div>
            
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 relative"
                aria-label="Notifications"
                aria-expanded={isNotificationsOpen}
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  3
                </span>
              </button>
              
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">Mise à jour disponible pour votre plan d'affaires</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Il y a 5 minutes</p>
                    </div>
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">Échéance de facture à venir</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Il y a 3 heures</p>
                    </div>
                    <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">Nouvelle ressource disponible</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hier</p>
                    </div>
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Toggle thème clair/sombre */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={darkMode ? "Passer au mode clair" : "Passer au mode sombre"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Menu utilisateur */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Menu utilisateur"
                aria-expanded={isUserMenuOpen}
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {state.user.name?.charAt(0) || state.user.id?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium hidden sm:inline-block">
                  {state.user.name || "Utilisateur"}
                </span>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium">{state.user.name || "Utilisateur"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{state.user.id}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="flex items-center p-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Mon profil
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center p-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Paramètres
                    </Link>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      className="w-full text-left flex items-center p-2 rounded-md text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        // Logique de déconnexion
                        setIsUserMenuOpen(false);
                      }}
                    >
                      <User size={16} className="mr-2" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Breadcrumb */}
      <Breadcrumb />
    </header>
  );
};

export default Header;