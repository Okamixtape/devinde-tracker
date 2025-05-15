'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppState } from '@/app/contexts/AppStateContext';
import { useAuth } from '@/app/hooks/useAuth';

interface RouteGuardProps {
  children: ReactNode;
  requiredAuth?: boolean;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * RouteGuard - Protège les routes nécessitant une authentification
 * 
 * Ce composant vérifie si l'utilisateur est authentifié et a les rôles requis
 * pour accéder à une route. Si ce n'est pas le cas, il redirige vers la page
 * de connexion ou une autre page spécifiée.
 * 
 * Note: Cette implémentation est hybride, complémentaire au middleware Next.js.
 * Elle ajoute des vérifications côté client pour une meilleure expérience utilisateur.
 */
const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredAuth = true,
  requiredRoles = [],
  redirectTo = '/login'
}) => {
  const { state } = useAppState();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Vérifier l'autorisation
    const checkAuth = () => {
      // Si aucune authentification n'est requise
      if (!requiredAuth) {
        setAuthorized(true);
        return;
      }
      
      // Si l'utilisateur n'est pas connecté
      if (!isAuthenticated) {
        setAuthorized(false);
        
        // Enregistrer l'URL de redirection (pour revenir après connexion)
        sessionStorage.setItem('redirectAfterLogin', pathname || '/');
        
        // Rediriger vers la page de connexion
        router.push(redirectTo);
        return;
      }
      
      // Si des rôles spécifiques sont requis mais que l'utilisateur ne les a pas
      if (requiredRoles.length > 0 && user) {
        // Logique de vérification des rôles (à adapter selon votre modèle de données)
        const userRoles = user.role ? [user.role] : ['user']; 
        
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
        
        if (!hasRequiredRole) {
          setAuthorized(false);
          router.push('/unauthorized');
          return;
        }
      }
      
      // Si toutes les vérifications sont passées
      setAuthorized(true);
    };
    
    // Vérifier l'autorisation lors du chargement initial
    checkAuth();
    
    // Vérifier également lors des changements d'URL ou d'état d'authentification
  }, [pathname, isAuthenticated, user, requiredAuth, requiredRoles, redirectTo, router]);

  // Afficher un indicateur de chargement pendant la vérification
  if (!authorized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si autorisé, afficher le contenu de la page
  return <>{children}</>;
};

export default RouteGuard;
