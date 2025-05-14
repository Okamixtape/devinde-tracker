/**
 * Service centralisé pour la protection par authentification
 * 
 * Ce service regroupe toutes les fonctionnalités de protection par authentification
 * et de redirection dans une interface cohérente.
 */

// Import commenté car non utilisé pour l'instant mais prévu pour les futures fonctionnalités
// import { UserRole } from './authService';

// Liste des chemins qui nécessitent une authentification
export const PROTECTED_PATHS = [
  '/plans',
  '/dashboard',
  '/finances',
  '/calculator',
  '/businessModel',
  '/marketAnalysis',
  '/actionPlan',
  '/profile',
  '/monitoring',
  '/pitch',
  '/risk-clients',
];

// Liste des chemins publics
export const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/resources',
  '/documentation',
];

// Clé utilisée pour stocker l'URL de redirection
export const REDIRECT_URL_KEY = 'redirectAfterLogin';

/**
 * Service pour gérer la protection par authentification et les redirections
 */
export class AuthProtectionService {
  /**
   * Vérifie si un chemin est protégé et nécessite une authentification
   * @param pathname Chemin à vérifier
   * @returns true si le chemin est protégé, false sinon
   */
  static isProtectedPath(pathname: string): boolean {
    const isProtected = PROTECTED_PATHS.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );
    console.log(`🔍 [AuthProtection] Vérification si chemin protégé: ${pathname} => ${isProtected ? 'PROTÉGÉ' : 'PUBLIC'}`);
    return isProtected;
  }

  /**
   * Vérifie si un chemin est public (accessible sans authentification)
   * @param pathname Chemin à vérifier
   * @returns true si le chemin est public, false sinon
   */
  static isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );
  }

  /**
   * Sauvegarde l'URL vers laquelle rediriger après connexion
   * @param url URL à sauvegarder pour redirection future
   */
  static saveRedirectUrl(url: string): void {
    if (typeof window === 'undefined') return;
    
    // Ne pas sauvegarder les URLs qui pourraient créer des boucles
    if (url === '/login' || url.startsWith('/login?') || url === '/') {
      console.log("⚠️ [AuthProtection] URL de redirection ignorée (risque de boucle):", url);
      return;
    }
    
    sessionStorage.setItem(REDIRECT_URL_KEY, url);
    console.log("💾 [AuthProtection] URL de redirection sauvegardée:", url);
  }
  
  /**
   * Récupère l'URL de redirection sauvegardée
   * @returns URL de redirection ou null si aucune n'est sauvegardée
   */
  static getRedirectUrl(): string | null {
    if (typeof window === 'undefined') return null;
    
    const url = sessionStorage.getItem(REDIRECT_URL_KEY);
    console.log("🔍 [AuthProtection] URL de redirection récupérée:", url);
    return url;
  }
  
  /**
   * Efface l'URL de redirection sauvegardée
   */
  static clearRedirectUrl(): void {
    if (typeof window === 'undefined') return;
    
    sessionStorage.removeItem(REDIRECT_URL_KEY);
    console.log("🧹 [AuthProtection] URL de redirection effacée");
  }
  
  /**
   * Crée une URL de connexion avec paramètre de redirection
   * @param url URL à inclure comme redirection
   * @param message Message optionnel à afficher
   * @returns URL de la page de connexion avec paramètres
   */
  static createLoginUrl(url: string, message?: string): string {
    let loginUrl = `/login?redirect=${encodeURIComponent(url)}`;
    
    if (message) {
      loginUrl += `&message=${encodeURIComponent(message)}`;
    }
    
    return loginUrl;
  }

  /**
   * Effectue une redirection en utilisant la navigation directe du navigateur
   * Cette méthode est plus fiable que le router.push de Next.js dans certains cas
   * @param url URL vers laquelle rediriger
   */
  static redirectTo(url: string): void {
    if (typeof window === 'undefined') return;
    
    // Prévention supplémentaire contre les boucles de redirection
    if ((url === location.pathname) || (url === '/login' && location.pathname === '/login')) {
      console.warn("Redirection évitée pour éviter une boucle:", url);
      return;
    }
    
    console.log("Redirection vers:", url);
    window.location.href = url;
  }
  
  /**
   * Gère la redirection après connexion
   * @param isAuthenticated État d'authentification actuel
   * @param forceRedirect Si true, force la redirection même en cas de doute
   * @returns true si une redirection a été effectuée, false sinon
   */
  static handlePostLoginRedirection(isAuthenticated: boolean, forceRedirect: boolean = false): boolean {
    // Si l'utilisateur n'est pas authentifié, ne rien faire
    if (!isAuthenticated && !forceRedirect) return false;
    
    // Vérifier s'il existe une URL à restaurer après connexion
    const savedPath = this.getRedirectUrl();
    
    if (savedPath) {
      // Nettoyer le sessionStorage
      this.clearRedirectUrl();
      console.log("Redirection post-login vers:", savedPath);
      
      // Rediriger vers l'URL sauvegardée
      this.redirectTo(savedPath);
      return true;
    } else {
      // Rediriger vers le dashboard par défaut
      console.log("Redirection post-login vers dashboard (par défaut)");
      this.redirectTo('/dashboard');
      return true;
    }
  }
}
