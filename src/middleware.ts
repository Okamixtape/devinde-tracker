/**
 * MIDDLEWARE TEMPORAIREMENT DÉSACTIVÉ
 * 
 * Ce middleware a été désactivé pour résoudre le problème de conflit entre
 * l'authentification côté client (localStorage) et côté serveur (cookies).
 * 
 * Une fois que la synchronisation des mécanismes d'authentification sera implémentée,
 * ce middleware pourra être réactivé pour assurer une protection côté serveur.
 */

// NextRequest est conservé pour référence et sera utilisé quand le middleware sera réactivé
import { /* NextRequest kept for future use */ NextResponse } from 'next/server';

// Liste des chemins qui nécessitent une authentification
// Commenté car temporairement inutilisé - Sera réactivé avec le middleware
/*const protectedPaths = [
  '/plans',
  '/dashboard',
  '/financials',
  '/calculator',
  '/businessModel',
  '/marketAnalysis',
  '/actionPlan',
  '/profile',
  '/monitoring',
  '/pitch',
];*/

// Liste des chemins publics (ne nécessitent pas d'authentification)
// Commenté car temporairement inutilisé - Sera réactivé avec le middleware
/*const publicPaths = [
  '/',
  '/login',
  '/register',
  '/resources',
  '/documentation',
];*/

// Nom du cookie d'authentification
// Commenté car temporairement inutilisé - Sera réactivé avec le middleware
// const AUTH_COOKIE = 'auth_token';

/**
 * Middleware Next.js pour la protection des routes - TEMPORAIREMENT DÉSACTIVÉ
 * 
 * Pour éviter tout conflit avec l'authentification côté client,
 * ce middleware est désactivé et retourne NextResponse.next() systématiquement.
 */
// Le paramètre request est intentionnellement omis car le middleware est désactivé
export function middleware(/* request: NextRequest */) {
  // DÉSACTIVÉ TEMPORAIREMENT - Retourner NextResponse.next() dans tous les cas
  return NextResponse.next();
  
  /* 
  CODE ORIGINAL COMMENTÉ :
  
  const { pathname } = request.nextUrl;
  
  // Vérifier si le chemin est public (toujours accessible)
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Si c'est un chemin public, autoriser l'accès sans vérification
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Vérifier si le chemin demandé est protégé
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Si ce n'est pas un chemin protégé et pas un chemin public, autoriser l'accès
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  // Vérifier si l'utilisateur est authentifié (via un cookie de session)
  const authToken = request.cookies.get(AUTH_COOKIE)?.value;
  
  // Si l'utilisateur n'est pas authentifié et tente d'accéder à un chemin protégé
  if (!authToken) {
    // Éviter une redirection si déjà sur la page de connexion (anti-boucle)
    if (pathname === '/login') {
      return NextResponse.next();
    }
    
    // Construire l'URL de redirection vers la page de connexion
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    // Rediriger vers la page de connexion
    return NextResponse.redirect(loginUrl);
  }
  
  // Si l'utilisateur est authentifié, permettre l'accès
  return NextResponse.next();
  */
}

// Configuration pour appliquer le middleware à toutes les routes
export const config = {
  matcher: [
    /*
     * Match toutes les routes requêtes, sauf:
     * 1. Tous les fichiers statiques (_next/static, favicon, images, etc.)
     * 2. Les routes API et webhooks (/api/*)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
