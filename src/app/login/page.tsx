'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthForm from '@/app/components/auth/AuthForm';
import { useAuth } from '@/app/hooks/useAuth';

/**
 * Page de connexion simplifiée
 * Compatible avec la nouvelle architecture d'authentification centralisée
 */
export default function LoginPage() {
  const { isAuthenticated, saveRedirectPath } = useAuth();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const message = searchParams.get('message');
  
  // État local pour prévenir les multiples rendus causant des boucles
  const [redirectionHandled, setRedirectionHandled] = useState(false);
  
  // Enregistrer l'URL de redirection si présente dans les paramètres
  useEffect(() => {
    if (redirectUrl && !redirectionHandled) {
      console.log(' Enregistrement de l\'URL de redirection:', redirectUrl);
      saveRedirectPath(redirectUrl);
    }
  }, [redirectUrl, saveRedirectPath, redirectionHandled]);
  
  // Gérer la redirection après connexion réussie
  useEffect(() => {
    // Si pas authentifié, ne rien faire
    if (!isAuthenticated) return;
    
    // Éviter les boucles infinies
    if (redirectionHandled) return;
    
    // Marquer comme traité immédiatement
    setRedirectionHandled(true);
    
    // Utiliser l'URL de redirection si disponible, sinon le dashboard
    const targetPath = redirectUrl || '/dashboard';
    console.log(` [LoginPage] Utilisateur authentifié, redirection vers ${targetPath}`);
    
    // Redirection vers la destination appropriée
    window.location.replace(targetPath);
  }, [isAuthenticated, redirectionHandled, redirectUrl]);
  
  // Afficher un écran de chargement pendant la redirection
  if (isAuthenticated && redirectionHandled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-500 to-blue-700">
        <div className="text-white text-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          Redirection en cours...
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-500 to-blue-700">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
          
        {message && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
            {message}
          </div>
        )}
        
        <AuthForm />
      </div>
    </div>
  );
}
