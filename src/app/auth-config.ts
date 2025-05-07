/**
 * Configuration globale d'authentification pour l'application
 * 
 * Ce fichier définit les constantes et les règles d'authentification
 * utilisées dans toute l'application, centralisées en un seul endroit.
 */

// Liste des routes qui nécessitent une authentification
export const PROTECTED_ROUTES = [
  '/plans',
  '/dashboard',
  '/calculator',
  '/profile',
  '/finances',
  '/monitoring'
];

// Routes publiques (accessible sans connexion)
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/resources'
];

// Clé de stockage pour la redirection post-login
export const REDIRECT_KEY = 'nextPath';

// Page par défaut après connexion
export const DEFAULT_AUTH_ROUTE = '/dashboard';

// Page de connexion
export const LOGIN_ROUTE = '/login';

/**
 * Vérifie si un chemin est protégé
 * @param path Chemin à vérifier
 * @returns true si le chemin est protégé, false sinon
 */
export function isProtectedRoute(path: string): boolean {
  // Vérifier si le chemin exact correspond à une route protégée
  if (PROTECTED_ROUTES.includes(path)) return true;
  
  // Vérifier si le chemin commence par une route protégée
  return PROTECTED_ROUTES.some(route => 
    path.startsWith(`${route}/`)
  );
}

/**
 * Vérifie si un chemin est public
 * @param path Chemin à vérifier
 * @returns true si le chemin est public, false sinon
 */
export function isPublicRoute(path: string): boolean {
  // Vérifier si le chemin exact correspond à une route publique
  if (PUBLIC_ROUTES.includes(path)) return true;
  
  // Vérifier si le chemin commence par une route publique
  return PUBLIC_ROUTES.some(route => 
    path.startsWith(`${route}/`)
  );
}
