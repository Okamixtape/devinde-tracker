# Architecture de redirection après authentification

## Vue d'ensemble

Ce document décrit l'architecture de redirection après authentification du DevIndé Tracker, qui assure une expérience utilisateur fluide et sécurisée en redirigeant les utilisateurs vers la page demandée après une connexion réussie.

## Principes fondamentaux

1. **Séparation des responsabilités** : Chaque composant a un rôle clair dans le processus de redirection
2. **Centralisation de la logique** : Utilisation d'un service dédié pour toutes les opérations de redirection
3. **Cohérence** : Approche uniformisée pour la protection des routes et la redirection
4. **Flexibilité** : Support pour différents types de protection (globale ou par composant)

## Composants principaux

### RedirectService

Service central responsable de la gestion des redirections :

- Stockage et récupération de l'URL de redirection dans `sessionStorage`
- Création d'URLs de connexion avec paramètres de redirection
- Interface cohérente pour tous les composants impliqués dans la redirection

```typescript
// Exemple d'utilisation
RedirectService.saveRedirectUrl('/plans');
const url = RedirectService.getRedirectUrl();
RedirectService.clearRedirectUrl();
```

### RouteGuard

Composant global pour protéger toutes les routes sensibles :

- Intégré au layout principal de l'application
- Vérifie si l'utilisateur est authentifié pour accéder aux routes protégées
- Utilise `RedirectService` pour sauvegarder l'URL demandée et rediriger vers la connexion

### AuthRedirect

Composant de protection au niveau des pages individuelles :

- Utilisé pour protéger des composants spécifiques
- Complémentaire à `RouteGuard` pour des cas d'utilisation spécifiques
- Utilise également `RedirectService` pour la cohérence

### LoginPage

Page de connexion qui gère la redirection après authentification réussie :

- Récupère le paramètre `redirect` de l'URL
- Utilise `RedirectService` pour stocker et récupérer l'URL de redirection
- Redirige vers l'URL sauvegardée après connexion réussie

## Flux de redirection

1. **Demande d'accès à une page protégée** :
   - `RouteGuard` détecte une tentative d'accès non autorisée
   - L'URL demandée est sauvegardée via `RedirectService`
   - L'utilisateur est redirigé vers la page de connexion avec un paramètre `redirect`

2. **Page de connexion** :
   - Récupère le paramètre `redirect` de l'URL
   - Le stocke via `RedirectService`

3. **Après connexion réussie** :
   - Récupère l'URL sauvegardée via `RedirectService`
   - Redirige l'utilisateur vers cette URL
   - Nettoie l'URL sauvegardée

## Stockage des données

- **sessionStorage** est utilisé pour les redirections car les informations ne sont pertinentes que pour la session en cours
- **localStorage** est utilisé pour l'authentification persistante (jetons JWT, données utilisateur)

## Bonnes pratiques

1. Toujours utiliser `RedirectService` pour toute opération liée à la redirection
2. Ne pas mélanger `localStorage` et `sessionStorage` pour la même fonctionnalité
3. Utiliser `RouteGuard` pour la protection globale et `AuthRedirect` uniquement pour des cas spécifiques
4. Toujours nettoyer l'URL de redirection après utilisation

## Évolution future

Cette architecture est conçue pour évoluer vers :

1. Une protection côté serveur avec des middlewares Next.js
2. L'utilisation de cookies sécurisés au lieu de localStorage pour l'authentification
3. L'ajout de mécanismes de délai d'expiration de session
