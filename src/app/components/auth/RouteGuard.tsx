'use client';

import React from 'react';

/**
 * Composant RouteGuard simplifié
 * 
 * IMPORTANT: Ce composant est maintenant un simple wrapper et ne gère plus les redirections.
 * Toutes les protections d'authentification sont gérées par le middleware Next.js côté serveur.
 * 
 * Ce composant est conservé pour la compatibilité avec le code existant, mais pourrait être
 * supprimé dans une refactorisation future.
 */
export const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default RouteGuard;
