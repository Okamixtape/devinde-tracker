'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

/**
 * Composant pour rediriger les utilisateurs non authentifiés vers la page de connexion
 * Stocke l'URL demandée dans localStorage pour rediriger l'utilisateur après connexion
 */
export default function AuthRedirect({
  children,
  message = "Vous devez être connecté pour accéder à cette page."
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Attendre que le chargement de l'authentification soit terminé
    if (!isLoading && !isAuthenticated) {
      // Stocker l'URL actuelle pour rediriger l'utilisateur après connexion
      localStorage.setItem('redirectAfterLogin', pathname);
      
      // Rediriger vers la page de connexion
      router.push(`/login?message=${encodeURIComponent(message)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname, message]);

  // Si l'utilisateur est authentifié, afficher le contenu
  // Sinon, ne rien afficher (la redirection sera effectuée)
  return isAuthenticated ? <>{children}</> : null;
}
