'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Heart } from 'lucide-react';

/**
 * Footer - Pied de page de l'application
 * 
 * Contient les liens utiles, informations de copyright et autres détails
 * Toujours affiché en bas de l'application
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <span className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold mr-2">DT</span>
              <span className="text-gray-800 dark:text-white font-semibold">DevIndé Tracker</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Simplifiez la gestion de votre activité indépendante
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Navigation</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link 
                    href="/" 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Tableau de bord
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/plans" 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Mes plans
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Ressources</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link 
                    href="/resources" 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Centre de ressources
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/calculator" 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Calculateur
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/documents" 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Documents
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Support</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link 
                    href="/help" 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Aide
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://github.com/votrerepo/devinde-tracker" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
                  >
                    <Github size={14} className="mr-1" />
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            &copy; {currentYear} DevIndé Tracker. Tous droits réservés.
          </p>
          
          <div className="mt-4 md:mt-0 flex items-center text-xs text-gray-600 dark:text-gray-400">
            <Link href="/privacy" className="mr-4 hover:text-blue-600 dark:hover:text-blue-400">
              Confidentialité
            </Link>
            <Link href="/terms" className="mr-4 hover:text-blue-600 dark:hover:text-blue-400">
              Conditions d'utilisation
            </Link>
            <span className="flex items-center">
              Fait avec <Heart size={12} className="mx-1 text-red-500" /> en France
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;