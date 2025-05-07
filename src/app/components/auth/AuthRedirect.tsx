'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { RedirectService } from '@/app/services/core/redirectService';

/**
 * Composant pour rediriger les utilisateurs non authentifiés vers la page de connexion
 * Utilise le RedirectService pour gérer la redirection après connexion
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
      RedirectService.saveRedirectUrl(pathname);
      
      // Rediriger vers la page de connexion avec message
      const loginUrl = RedirectService.createLoginUrl(pathname, message);
      router.push(loginUrl);
    }
  }, [isAuthenticated, isLoading, router, pathname, message]);

  // Si l'utilisateur est authentifié, afficher le contenu
  // Sinon, ne rien afficher (la redirection sera effectuée)
  return isAuthenticated ? <>{children}</> : null;
}
