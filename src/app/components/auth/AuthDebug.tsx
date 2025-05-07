'use client';

import React from 'react';
import { useAuth } from '@/app/hooks/useAuth';

/**
 * Composant de débogage pour l'authentification
 * À utiliser temporairement pour diagnostiquer les problèmes d'authentification
 */
export const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Récupérer le token du localStorage
  const authToken = typeof window !== 'undefined' 
    ? localStorage.getItem('devinde-tracker-auth-token') 
    : null;

  // Récupérer l'utilisateur actuel du localStorage
  const currentUser = typeof window !== 'undefined'
    ? localStorage.getItem('devinde-tracker-current-user')
    : null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-3 shadow-lg rounded-lg max-w-md z-50 text-xs">
      <h3 className="font-bold mb-2 text-blue-600 dark:text-blue-400">Auth Debug Info</h3>
      <div className="space-y-1">
        <p><strong>isAuthenticated:</strong> {String(isAuthenticated)}</p>
        <p><strong>isLoading:</strong> {String(isLoading)}</p>
        <p><strong>user:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        <p><strong>authToken:</strong> {authToken ? '✓ Present' : '✗ Missing'}</p>
        <p><strong>currentUser:</strong> {currentUser ? '✓ Present' : '✗ Missing'}</p>
      </div>
    </div>
  );
};

export default AuthDebug;
