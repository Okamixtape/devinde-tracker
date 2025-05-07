#!/bin/bash
# Script pour vérifier qu'il ne reste plus de références aux anciens noms de fichiers

echo "Vérification des imports en kebab-case restants..."

# Patterns à rechercher (fichiers kebab-case)
patterns=(
  "service-factory"
  "error-handling"
  "data-models"
  "service-interfaces"
  "migration-init"
  "migration-manager"
  "api-service"
  "data-operations"
  "jwt-helper"
  "error-tracking"
  "analytics-service"
)

# Parcourir tous les patterns et vérifier s'ils existent encore dans les imports
for pattern in "${patterns[@]}"; do
  echo "Recherche des références à $pattern..."
  result=$(grep -r "from.*$pattern" --include="*.ts" --include="*.tsx" src | wc -l)
  if [ "$result" -gt 0 ]; then
    echo "⚠️ Trouvé $result références à $pattern"
    grep -r "from.*$pattern" --include="*.ts" --include="*.tsx" src
  else
    echo "✓ Aucune référence à $pattern"
  fi
done

echo "Vérification terminée !"
