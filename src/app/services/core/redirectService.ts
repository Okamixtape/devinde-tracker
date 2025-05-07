/**
 * RedirectService - Service pour gérer les redirections après authentification
 * 
 * Ce service centralise la logique de redirection pour assurer une gestion cohérente
 * à travers l'application.
 */

// Clé utilisée pour stocker l'URL de redirection
export const REDIRECT_URL_KEY = 'redirectAfterLogin';

/**
 * Service de redirection
 * Gère le stockage et la récupération des URLs de redirection après authentification
 */
export class RedirectService {
  /**
   * Sauvegarde l'URL vers laquelle rediriger après connexion
   * @param url URL à sauvegarder pour redirection future
   */
  static saveRedirectUrl(url: string): void {
    if (typeof window === 'undefined') return;
    
    sessionStorage.setItem(REDIRECT_URL_KEY, url);
  }
  
  /**
   * Récupère l'URL de redirection sauvegardée
   * @returns URL de redirection ou null si aucune n'est sauvegardée
   */
  static getRedirectUrl(): string | null {
    if (typeof window === 'undefined') return null;
    
    return sessionStorage.getItem(REDIRECT_URL_KEY);
  }
  
  /**
   * Efface l'URL de redirection sauvegardée
   */
  static clearRedirectUrl(): void {
    if (typeof window === 'undefined') return;
    
    sessionStorage.removeItem(REDIRECT_URL_KEY);
  }
  
  /**
   * Récupère et efface l'URL de redirection en une seule opération
   * Utile lors de la redirection effective
   * @returns URL de redirection ou null si aucune n'est sauvegardée
   */
  static consumeRedirectUrl(): string | null {
    const url = RedirectService.getRedirectUrl();
    RedirectService.clearRedirectUrl();
    return url;
  }
  
  /**
   * Détermine si une URL est une URL de redirection valide
   * Filtres les URLs externes, les fragments et certains chemins spécifiques
   * @param url URL à valider
   * @returns true si l'URL est valide pour redirection, false sinon
   */
  static isValidRedirectUrl(url: string): boolean {
    // Ne pas rediriger vers des URLs externes
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return false;
    }
    
    // Ne pas rediriger vers des fragments d'URL seuls
    if (url.startsWith('#')) {
      return false;
    }
    
    // Liste de chemins interdits pour redirection (ex: pages d'auth)
    const invalidPaths = ['/login', '/register', '/logout', '/reset-password'];
    
    // Vérifier si l'URL commence par un chemin invalide
    return !invalidPaths.some(path => url === path || url.startsWith(`${path}/`));
  }
  
  /**
   * Crée une URL vers la page de connexion, avec un message optionnel et info de redirection
   * @param redirectPath Chemin vers lequel rediriger après connexion
   * @param message Message à afficher sur la page de connexion
   * @returns URL formatée pour la page de connexion
   */
  static createLoginUrl(redirectPath?: string, message?: string): string {
    // Sauvegarder le chemin de redirection si fourni et valide
    if (redirectPath && this.isValidRedirectUrl(redirectPath)) {
      this.saveRedirectUrl(redirectPath);
    }
    
    // Construire l'URL avec les paramètres de requête si nécessaire
    let loginUrl = '/login';
    
    if (message) {
      // Encoder le message pour éviter les problèmes de caractères spéciaux
      const encodedMessage = encodeURIComponent(message);
      loginUrl += `?message=${encodedMessage}`;
    }
    
    return loginUrl;
  }
}
