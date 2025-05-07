# Plan de renommage des fichiers de services

Ce document détaille le plan de standardisation des noms de fichiers de services pour suivre la convention camelCase conformément à nos standards documentés dans CONVENTIONS.md.

## Fichiers à renommer

| Nom actuel (kebab-case) | Nouveau nom (camelCase) |
|-------------------------|-------------------------|
| analytics-service.ts | analyticsService.ts |
| api-service-adapter.ts | apiServiceAdapter.ts |
| api-service-factory.ts | apiServiceFactory.ts |
| auth-protection.ts | authProtection.ts |
| auth-service.ts | authService.ts |
| business-plan-service.ts | businessPlanService.ts |
| error-service.ts | errorService.ts |
| error-tracking-service.ts | errorTrackingService.ts |
| http-service.ts | httpService.ts |
| i18n-service.ts | i18nService.ts |
| local-storage-service.ts | localStorageService.ts |
| migration-service.ts | migrationService.ts |
| performance-service.ts | performanceService.ts |
| redirect-service.ts | redirectService.ts |
| search-service.ts | searchService.ts |
| section-service.ts | sectionService.ts |

## Procédure de migration

Pour chaque fichier, nous allons :

1. Créer le nouveau fichier avec le nom en camelCase
2. Copier le contenu de l'ancien fichier vers le nouveau
3. Mettre à jour les imports dans tous les fichiers concernés
4. Vérifier que l'application fonctionne correctement
5. Supprimer l'ancien fichier une fois la migration validée

## Impact sur le code existant

Cette migration peut affecter :
- Les imports dans de nombreux fichiers
- Les configurations de build
- Potentiellement des scripts ou des outils de génération de code

## Validation

Pour chaque fichier renommé, nous devrons :
- Compiler le projet pour s'assurer que tous les imports sont correctement mis à jour
- Tester les fonctionnalités qui dépendent du service migré
- Vérifier qu'il n'y a pas d'erreurs dans la console
