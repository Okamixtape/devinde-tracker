# Composants inutilisés supprimés

Ce document garde une trace des composants qui ont été supprimés car identifiés comme code mort par l'outil ts-prune.

Date de suppression : 2025-05-05

## Liste des fichiers supprimés

1. `src/app/components/BusinessModelSection.tsx` - Composant inutilisé, l'interface est toujours utilisée dans types.ts
2. `src/app/components/ExportBusinessPlan.tsx` - Fonctionnalité non intégrée
3. `src/app/components/FinancialsSection.tsx` - Composant inutilisé, l'interface est toujours utilisée dans types.ts
4. `src/app/components/HomePage.tsx` - Version obsolète, remplacée par la page principale
5. `src/app/components/PricingEditor.tsx` - Éditeur non utilisé, fonctionnalité incorporée ailleurs
6. `src/app/components/SmartSuggestions.tsx` - Fonctionnalité non intégrée

## Comment restaurer

Si vous avez besoin de restaurer l'un de ces composants, utilisez Git pour le récupérer :

```bash
git checkout <commit-id> -- src/app/components/NomDuComposant.tsx
```

Ou examinez l'historique Git pour voir le contenu :

```bash
git log -p -- src/app/components/NomDuComposant.tsx
```
