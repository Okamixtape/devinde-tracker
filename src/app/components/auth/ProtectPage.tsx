'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

/**
 * ProtectPage - Composant ultra-simple pour protéger une page spécifique
 * 
 * Utilisation : Ajouter ce composant en haut de chaque page qui nécessite une authentification
 * Exemple:
 * ```
 * export default function PlansPage() {
 *   // Si l'utilisateur n'est pas authentifié, ce composant le redirigera automatiquement
 *   return (
 *     <>
 *       <ProtectPage />
 *       <div>Contenu de la page protégée</div>
 *     </>
 *   );
 * }
 * ```
 */
export default function ProtectPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // Effet pour rediriger si non authentifié
  useEffect(() => {
    // Attendre que l'authentification soit chargée
    if (isLoading) return;
    
    // Si l'utilisateur n'est pas authentifié, rediriger vers la connexion
    if (!isAuthenticated) {
      // Rediriger directement vers la page de connexion
      router.push(`/login`);
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Ce composant ne rend rien, il effectue seulement la redirection si nécessaire
  return null;
}
